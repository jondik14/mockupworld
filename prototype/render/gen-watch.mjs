import { writeFileSync } from "node:fs";

const watchface = `
<div class="s" id="watchface" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center">
  <div style="position:relative;width:100%;height:100%;padding:28px 20px">
    <div style="font-size:22px;color:#ff9f0a;font-weight:600">Tue 24</div>
    <div style="font-family:Inter,sans-serif;font-weight:800;font-size:118px;letter-spacing:-.03em;line-height:.95;margin-top:6px">9:41</div>
    <div style="position:absolute;top:130px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" stroke="#1c1c1e" stroke-width="12" fill="none"/>
        <circle cx="60" cy="60" r="52" stroke="#ff2d55" stroke-width="12" fill="none" stroke-dasharray="280 327" stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <circle cx="60" cy="60" r="38" stroke="#1c1c1e" stroke-width="12" fill="none"/>
        <circle cx="60" cy="60" r="38" stroke="#2dd936" stroke-width="12" fill="none" stroke-dasharray="180 239" stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <circle cx="60" cy="60" r="24" stroke="#1c1c1e" stroke-width="12" fill="none"/>
        <circle cx="60" cy="60" r="24" stroke="#0af0d8" stroke-width="12" fill="none" stroke-dasharray="110 151" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      </svg>
      <div style="display:flex;flex-direction:column;gap:16px;font-size:13px;color:#9a9a9e">
        <div><div style="color:#ff9f0a;font-weight:700;font-size:20px">62°</div>SUNNY</div>
        <div><div style="color:#0af0d8;font-weight:700;font-size:20px">42</div>MIN EX.</div>
      </div>
    </div>
  </div>
</div>`;

const workout = `
<div class="s" id="workout" style="background:#050506;color:#fff">
  <div style="padding:26px 20px 0;font-size:14px;color:#8a8a8e;display:flex;justify-content:space-between">
    <span>OUTDOOR RUN</span><span>32:04</span>
  </div>
  <div style="display:flex;justify-content:center;margin-top:8px">
    <svg width="180" height="180" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="52" stroke="#1c1c1e" stroke-width="11" fill="none"/>
      <circle cx="60" cy="60" r="52" stroke="#2dd936" stroke-width="11" fill="none" stroke-dasharray="248 327" stroke-linecap="round" transform="rotate(-90 60 60)"/>
    </svg>
  </div>
  <div style="text-align:center;margin-top:-118px">
    <div style="font-weight:800;font-size:40px;letter-spacing:-.02em">5.42</div>
    <div style="font-size:12px;color:#9a9a9e;letter-spacing:.08em">KILOMETERS</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:150px;text-align:center;font-size:12px;color:#9a9a9e">
    <div style="padding:10px 0"><div style="font-size:20px;font-weight:700;color:#fff">5'55"</div>AVG PACE</div>
    <div style="padding:10px 0"><div style="font-size:20px;font-weight:700;color:#fff">162</div>AVG BPM</div>
  </div>
</div>`;

const page = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face{font-family:Inter;src:url(inter.woff2) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#888;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{width:410px;height:482px;position:relative;overflow:hidden;margin:0 0 20px;border-radius:60px}
</style></head><body>
${watchface}
${workout}
</body></html>
`;

writeFileSync(new URL("./screens-watch.html", import.meta.url), page);
console.log("wrote screens-watch.html", page.length, "bytes");
