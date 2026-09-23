import { chromium } from "playwright";
import fs from "node:fs";
const scenes = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const outDir = process.argv[3]; fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("pageerror", e.message));
p.on("console", (m) => m.type() === "error" && console.log("console", m.text()));
await p.goto("http://127.0.0.1:8765/render.html");
await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const meta = {};
for (const s of scenes) {
  const t = Date.now();
  const r = await p.evaluate((cfg) => window.renderScene(cfg), s);
  fs.writeFileSync(outDir + "/" + s.id + ".png", Buffer.from(r.image.split(",")[1], "base64"));
  fs.writeFileSync(outDir + "/" + s.id + "-mask.png", Buffer.from(r.mask.split(",")[1], "base64"));
  meta[s.id] = { quad: r.quad, width: s.width, height: s.height };
  console.log(s.id, Date.now() - t, "ms", JSON.stringify(r.quad));
}
fs.writeFileSync(outDir + "/meta.json", JSON.stringify(meta, null, 1));
await b.close();
