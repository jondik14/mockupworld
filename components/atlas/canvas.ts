import { AtlasItem, assetPath } from "@/lib/atlas";

interface Classes {
  tile: string;
  cap: string;
  dim: string;
  current: string;
  dragging: string;
}

interface Column {
  items: { d: AtlasItem; y: number; h: number }[];
  period: number;
  offset: number;
}

const COLUMNS = 7;
const MIN_PERIOD = 1500;

/**
 * Infinite, pannable tile field. Each of 7 columns repeats vertically on its
 * own period and the column set repeats horizontally, so the field never
 * ends. Only tiles in view (plus a margin) exist in the DOM.
 */
export class InfiniteCanvas {
  private cols: Column[] = [];
  private live = new Map<string, HTMLDivElement>();
  private cx = 0;
  private cy = 0;
  private vx = 0;
  private vy = 0;
  private colW = 232;
  private gap = 12;
  private raf = 0;
  private highlight: Set<string> | null = null;
  private currentId: string | null = null;
  private items: AtlasItem[] = [];
  private cleanup: (() => void)[] = [];

  constructor(
    private stage: HTMLElement,
    private cls: Classes,
    private onSelect: (id: string) => void,
  ) {
    this.bindInput();
    const onResize = () => this.setItems(this.items);
    addEventListener("resize", onResize);
    this.cleanup.push(() => removeEventListener("resize", onResize));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((f) => f());
    this.live.forEach((el) => el.remove());
    this.live.clear();
  }

  private get pitch() {
    return this.colW + this.gap;
  }

  setItems(items: AtlasItem[]) {
    this.items = items;
    const narrow = innerWidth < 640;
    this.colW = narrow ? 148 : 232;
    this.gap = narrow ? 8 : 12;
    this.live.forEach((el) => el.remove());
    this.live.clear();
    this.cols = [];
    if (!items.length) return;

    // Seeded shuffle so the layout is stable between visits.
    let seed = 7;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const order = items.map((_, i) => i).sort(() => rand() - 0.5);
    const n = order.length;
    for (let c = 0; c < COLUMNS; c++) {
      const col: Column = { items: [], period: 0, offset: (c * 137) % 190 };
      let y = 0;
      for (let k = (c * 3) % n; y < MIN_PERIOD || col.items.length < Math.min(n, 3); k++) {
        const d = items[order[k % n]];
        const h = Math.round((this.colW * d.h) / d.w);
        col.items.push({ d, y, h });
        y += h + this.gap;
      }
      col.period = y;
      this.cols.push(col);
    }
    this.frame();
  }

  centerOn(columnsVisible = 4) {
    this.cx = -Math.max(0, (innerWidth - columnsVisible * this.pitch) / 2);
    this.cy = -150;
    this.frame();
  }

  setHighlight(ids: Set<string> | null, currentId: string | null) {
    this.highlight = ids;
    this.currentId = currentId;
    this.live.forEach((el) => this.styleTile(el));
  }

  pan(dx: number, dy: number) {
    this.cx += dx;
    this.cy += dy;
    this.frame();
  }

  private styleTile(el: HTMLDivElement) {
    const id = el.dataset.id!;
    el.classList.toggle(this.cls.dim, !!this.highlight && !this.highlight.has(id));
    el.classList.toggle(this.cls.current, id === this.currentId);
  }

  private makeTile(d: AtlasItem, h: number) {
    const el = document.createElement("div");
    el.className = this.cls.tile;
    el.dataset.id = d.id;
    el.style.width = `${this.colW}px`;
    el.style.height = `${h}px`;
    el.style.background = d.bg;
    const img = document.createElement("img");
    img.alt = d.title;
    img.src = assetPath.thumb(d.id);
    img.decoding = "async";
    img.draggable = false;
    const cap = document.createElement("span");
    cap.className = this.cls.cap;
    cap.textContent = d.title;
    el.append(img, cap);
    this.styleTile(el);
    return el;
  }

  private frame() {
    if (!this.cols.length) return;
    const W = innerWidth, H = innerHeight, seen = new Set<string>();
    const pitch = this.pitch;
    const g0 = Math.floor(this.cx / pitch) - 1, g1 = Math.floor((this.cx + W) / pitch) + 1;
    for (let gc = g0; gc <= g1; gc++) {
      const col = this.cols[((gc % COLUMNS) + COLUMNS) % COLUMNS];
      const sx = gc * pitch - this.cx;
      const r0 = Math.floor((this.cy - col.offset - 400) / col.period);
      const r1 = Math.floor((this.cy + H - col.offset) / col.period);
      for (let r = r0; r <= r1; r++) {
        col.items.forEach((it, k) => {
          const sy = r * col.period + col.offset + it.y - this.cy;
          if (sy > H + 40 || sy + it.h < -40) return;
          const key = `${gc}:${r}:${k}`;
          seen.add(key);
          let el = this.live.get(key);
          if (!el) {
            el = this.makeTile(it.d, it.h);
            this.stage.appendChild(el);
            this.live.set(key, el);
          }
          el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
        });
      }
    }
    for (const [key, el] of this.live) {
      if (!seen.has(key)) {
        el.remove();
        this.live.delete(key);
      }
    }
  }

  private bindInput() {
    const s = this.stage;
    let dragging = false, moved = 0, lastX = 0, lastY = 0, lastT = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      this.vx = this.vy = 0;
      s.setPointerCapture(e.pointerId);
      s.classList.add(this.cls.dragging);
      cancelAnimationFrame(this.raf);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const now = performance.now(), dt = Math.max(1, now - lastT);
      this.cx -= dx;
      this.cy -= dy;
      moved += Math.abs(dx) + Math.abs(dy);
      this.vx = (-dx / dt) * 16;
      this.vy = (-dy / dt) * 16;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      this.frame();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      s.classList.remove(this.cls.dragging);
      if (moved < 6) {
        const hit = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find((n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains(this.cls.tile));
        if (hit?.dataset.id) this.onSelect(hit.dataset.id);
        return;
      }
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const glide = () => {
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.pan(this.vx, this.vy);
        if (Math.abs(this.vx) + Math.abs(this.vy) > 0.3) this.raf = requestAnimationFrame(glide);
      };
      this.raf = requestAnimationFrame(glide);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      this.pan(e.deltaX, e.deltaY);
    };

    s.addEventListener("pointerdown", down);
    s.addEventListener("pointermove", move);
    s.addEventListener("pointerup", up);
    s.addEventListener("pointercancel", up);
    s.addEventListener("wheel", wheel, { passive: false });
    this.cleanup.push(() => {
      s.removeEventListener("pointerdown", down);
      s.removeEventListener("pointermove", move);
      s.removeEventListener("pointerup", up);
      s.removeEventListener("pointercancel", up);
      s.removeEventListener("wheel", wheel);
    });
  }
}
