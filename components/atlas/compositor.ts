import { AtlasItem, Point, SCREEN_ASPECT, assetPath } from "@/lib/atlas";

export type Drawable = HTMLImageElement | HTMLCanvasElement;

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }";
const FRAG = `precision highp float;
uniform sampler2D base, mask, ui; uniform vec2 size; uniform mat3 inv; uniform vec4 fit;
void main(){
  vec2 px = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 bUV = px / size;
  vec3 q = inv * vec3(px, 1.0);
  vec2 f = fit.xy + (q.xy / q.z) * fit.zw;
  vec3 b = texture2D(base, bUV).rgb;
  float m = texture2D(mask, bUV).r;
  vec3 u = texture2D(ui, clamp(f, 0.0, 1.0)).rgb;
  gl_FragColor = vec4(mix(b, u, m), 1.0);
}`;

/**
 * Inverse of the unit-square -> quad homography (Heckbert), as a column-major
 * mat3 for GLSL. It maps an output pixel back to UI (u, v). Returns the
 * adjugate; the projective divide cancels the determinant.
 */
export function squareToQuadInverse(quad: [Point, Point, Point, Point]): Float32Array {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det, h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
  return new Float32Array([
    e - f * h, f * g - d, d * h - e * g,
    c * h - b, a - c * g, b * g - a * h,
    b * f - c * e, c * d - a * f, a * e - b * d,
  ]);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

const size = (s: Drawable) =>
  s instanceof HTMLImageElement ? [s.naturalWidth, s.naturalHeight] : [s.width, s.height];

// Halve in steps down to ~the screen's on-image height: WebGL1 can't mipmap
// non-power-of-two textures, so this is what keeps small type from aliasing.
function downscaleForQuad(src: Drawable, quad: AtlasItem["quad"]): Drawable {
  const edge = Math.max(
    Math.hypot(quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]),
    Math.hypot(quad[2][0] - quad[1][0], quad[2][1] - quad[1][1]),
  );
  let [w, h] = size(src);
  const target = Math.min(h, Math.ceil(edge * 1.4));
  let out = src;
  while (h / 2 > target) {
    const c = document.createElement("canvas");
    c.width = Math.round(w / 2);
    c.height = Math.round(h / 2);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(out, 0, 0, c.width, c.height);
    out = c;
    [w, h] = [c.width, c.height];
  }
  return out;
}

export class Compositor {
  private canvas = document.createElement("canvas");
  private gl: WebGLRenderingContext | null;
  private prog: WebGLProgram | null = null;
  private assets = new Map<string, Promise<[HTMLImageElement, HTMLImageElement]>>();

  constructor() {
    this.gl = this.canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false });
    const gl = this.gl;
    if (!gl) return;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.prog = prog;
  }

  get supported() {
    return this.prog !== null;
  }

  assetsFor(item: AtlasItem) {
    let p = this.assets.get(item.id);
    if (!p) {
      p = Promise.all([loadImage(assetPath.full(item.id)), loadImage(assetPath.mask(item.id))]);
      this.assets.set(item.id, p);
    }
    return p;
  }

  private texture(unit: number, source: Drawable) {
    const gl = this.gl!;
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /** Places `screen` onto the mockup's screen and resolves to a PNG blob. */
  async render(item: AtlasItem, screen: Drawable): Promise<Blob> {
    const gl = this.gl, prog = this.prog;
    if (!gl || !prog) throw new Error("WebGL is unavailable in this browser.");
    const [base, mask] = await this.assetsFor(item);
    const ui = downscaleForQuad(screen, item.quad);

    this.canvas.width = item.w;
    this.canvas.height = item.h;
    gl.viewport(0, 0, item.w, item.h);
    const textures = [this.texture(0, base), this.texture(1, mask), this.texture(2, ui)];
    const u = (name: string) => gl.getUniformLocation(prog, name);
    gl.uniform1i(u("base"), 0);
    gl.uniform1i(u("mask"), 1);
    gl.uniform1i(u("ui"), 2);
    gl.uniform2f(u("size"), item.w, item.h);
    gl.uniformMatrix3fv(u("inv"), false, squareToQuadInverse(item.quad));
    // Cover-fit: crop the sides of wide images, keep the top of long scrolling screenshots.
    const [uw, uh] = size(ui);
    const aspect = uw / uh;
    const fit = aspect > SCREEN_ASPECT
      ? [0.5 - SCREEN_ASPECT / aspect / 2, 0, SCREEN_ASPECT / aspect, 1]
      : [0, 0, 1, aspect / SCREEN_ASPECT];
    gl.uniform4f(u("fit"), fit[0], fit[1], fit[2], fit[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    for (const t of textures) gl.deleteTexture(t);

    return new Promise((resolve, reject) =>
      this.canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed."))), "image/png"),
    );
  }
}
