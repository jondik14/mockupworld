import { writeFileSync } from "node:fs";

const dashboard = `
<div class="s" id="dashboard" style="background:#f5f6f8;color:#12161c;display:flex">
  <div style="width:220px;background:#12161c;color:#e7eaef;padding:28px 18px;display:flex;flex-direction:column;gap:4px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:26px;padding:0 8px">
      <div style="width:26px;height:26px;border-radius:8px;background:#5ee0a8"></div>
      <span style="font-weight:700;font-size:15px;letter-spacing:-.01em">Northwind</span>
    </div>
    ${["Overview", "Revenue", "Customers", "Pipeline", "Reports", "Settings"]
      .map(
        (t, i) =>
          `<div style="padding:10px 12px;border-radius:9px;font-size:14px;${
            i === 0 ? "background:#1e2530;color:#fff;font-weight:600" : "color:#9aa4b0"
          }">${t}</div>`,
      )
      .join("")}
    <div style="margin-top:auto;padding:12px;border-radius:12px;background:#1e2530;font-size:12px;color:#9aa4b0">Workspace<br><b style="color:#fff;font-size:14px">Northwind Retail</b></div>
  </div>
  <div style="flex:1;padding:32px 40px;overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
      <div style="font-size:26px;font-weight:700;letter-spacing:-.01em">Overview</div>
      <div style="display:flex;gap:10px">
        <div style="padding:9px 16px;border-radius:10px;border:1px solid #dfe2e8;font-size:13px;color:#5a6270">Last 30 days</div>
        <div style="padding:9px 16px;border-radius:10px;background:#12161c;color:#fff;font-size:13px;font-weight:600">Export</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px">
      ${[
        ["Revenue", "$482,940", "+18.2%", "#1f7a5a"],
        ["Orders", "12,840", "+6.4%", "#1f7a5a"],
        ["Refunds", "1.8%", "-0.4%", "#c0392b"],
        ["AOV", "$96.10", "+2.1%", "#1f7a5a"],
      ]
        .map(
          ([l, v, d, c]) => `
      <div style="background:#fff;border:1px solid #e7e9ee;border-radius:16px;padding:18px 20px">
        <div style="font-size:12.5px;color:#7a828f">${l}</div>
        <div style="font-size:25px;font-weight:700;margin-top:6px;letter-spacing:-.01em">${v}</div>
        <div style="font-size:12.5px;color:${c};margin-top:4px;font-weight:600">${d}</div>
      </div>`,
        )
        .join("")}
    </div>
    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:16px">
      <div style="background:#fff;border:1px solid #e7e9ee;border-radius:16px;padding:22px">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px"><b style="font-size:14px">Revenue trend</b><span style="font-size:12px;color:#7a828f">Daily</span></div>
        <svg width="100%" height="220" viewBox="0 0 700 220" preserveAspectRatio="none">
          <polyline points="0,170 60,150 120,160 180,120 240,130 300,90 360,100 420,70 480,85 540,50 600,60 660,30 700,25" fill="none" stroke="#1f7a5a" stroke-width="3"/>
          <polygon points="0,170 60,150 120,160 180,120 240,130 300,90 360,100 420,70 480,85 540,50 600,60 660,30 700,25 700,220 0,220" fill="#1f7a5a" opacity="0.08"/>
          <g stroke="#eef0f3"><line x1="0" y1="55" x2="700" y2="55"/><line x1="0" y1="110" x2="700" y2="110"/><line x1="0" y1="165" x2="700" y2="165"/></g>
        </svg>
      </div>
      <div style="background:#fff;border:1px solid #e7e9ee;border-radius:16px;padding:22px">
        <b style="font-size:14px">Top channels</b>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:16px">
          ${[
            ["Organic search", 62, "#1f7a5a"],
            ["Email", 21, "#5ee0a8"],
            ["Paid social", 11, "#a9e6c8"],
            ["Direct", 6, "#dff3e8"],
          ]
            .map(
              ([l, pct, c]) => `
          <div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span>${l}</span><b>${pct}%</b></div>
          <div style="height:7px;border-radius:4px;background:#eef0f3"><div style="width:${pct}%;height:100%;border-radius:4px;background:${c}"></div></div></div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </div>
</div>`;

const shopfront = `
<div class="s" id="shopfront" style="background:#fbfaf7;color:#141311">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:0 56px;height:88px;border-bottom:1px solid #ece9e2">
    <div class="serif" style="font-size:24px;letter-spacing:-.01em">Fernweh &amp; Co.</div>
    <div style="display:flex;gap:36px;font-size:14px;color:#4a463f">
      <span>New</span><span>Outerwear</span><span>Accessories</span><span>Journal</span>
    </div>
    <div style="display:flex;gap:20px;font-size:13px;color:#4a463f;align-items:center">
      <span>Search</span><span>Account</span>
      <span style="background:#141311;color:#fbfaf7;padding:8px 16px;border-radius:100px;font-weight:600">Cart · 2</span>
    </div>
  </div>
  <div style="display:flex;height:560px">
    <div style="flex:1.3;position:relative;background:linear-gradient(155deg,#cdbfa4,#8d7150 60%,#4a3a26)">
      <div class="serif" style="position:absolute;left:56px;bottom:56px;color:#fbf6ec;font-size:48px;line-height:1.05;max-width:480px">Made for<br>the long way home.</div>
      <div style="position:absolute;left:56px;bottom:24px;color:#f1e6d3;font-size:13px;letter-spacing:.08em;text-transform:uppercase">Autumn / Winter — Field collection</div>
    </div>
    <div style="flex:1;display:grid;grid-template-rows:1fr 1fr">
      <div style="background:linear-gradient(160deg,#e7dcc7,#b79f7c)"></div>
      <div style="background:linear-gradient(160deg,#3c3630,#1c1916)"></div>
    </div>
  </div>
  <div style="padding:44px 56px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px">
      <div class="serif" style="font-size:22px">Best sellers</div>
      <span style="font-size:13px;color:#8a8577">View all →</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
      ${[
        ["#c9a876,#8a6b41", "Ridge Field Jacket", "$248"],
        ["#a8bcae,#5c7566", "Trail Overshirt", "$168"],
        ["#8f96a3,#454d5c", "Slate Half-Zip", "$142"],
        ["#c7ac93,#8a6a4e", "Waxed Tote", "$96"],
      ]
        .map(
          ([g, n, p]) => `
      <div>
        <div style="aspect-ratio:1;border-radius:14px;background:linear-gradient(160deg,${g})"></div>
        <div style="margin-top:10px;font-size:14px;font-weight:600">${n}</div>
        <div style="font-size:13px;color:#8a8577;margin-top:2px">${p}</div>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</div>`;

const editor = `
<div class="s" id="editor" style="background:#1b1c1f;color:#d7d8db;display:flex;font-family:Inter,sans-serif">
  <div style="width:52px;background:#161719;display:flex;flex-direction:column;align-items:center;gap:22px;padding-top:22px">
    ${["#5ee0a8", "#7c93ff", "#ff9f6b", "#c98bd8"].map((c) => `<div style="width:26px;height:26px;border-radius:8px;background:${c};opacity:.85"></div>`).join("")}
  </div>
  <div style="width:240px;background:#1f2023;padding:18px 14px;font-size:13px;border-right:1px solid #2c2d31">
    <div style="color:#7a7c82;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Project</div>
    ${["components/", "  Button.tsx", "  Card.tsx", "  Nav.tsx", "lib/", "  utils.ts", "app/", "  page.tsx", "  layout.tsx"]
      .map(
        (f, i) =>
          `<div style="padding:5px 8px;border-radius:6px;color:${i === 7 ? "#fff" : "#a9abb1"};background:${
            i === 7 ? "#33343a" : "transparent"
          };white-space:pre">${f}</div>`,
      )
      .join("")}
  </div>
  <div style="flex:1;display:flex;flex-direction:column">
    <div style="display:flex;gap:2px;background:#1f2023;padding:0 8px">
      ${["page.tsx", "layout.tsx", "globals.css"]
        .map(
          (t, i) =>
            `<div style="padding:11px 18px;font-size:12.5px;background:${i === 0 ? "#1b1c1f" : "transparent"};color:${
              i === 0 ? "#fff" : "#8a8c92"
            };border-top:2px solid ${i === 0 ? "#5ee0a8" : "transparent"}">${t}</div>`,
        )
        .join("")}
    </div>
    <div style="flex:1;padding:26px 32px;font-family:'IBM Plex Mono',monospace;font-size:14px;line-height:1.7">
      <div><span style="color:#7c93ff">export default function</span> <span style="color:#f4c869">Page</span>() {</div>
      <div style="padding-left:24px"><span style="color:#7c93ff">return</span> (</div>
      <div style="padding-left:48px">&lt;<span style="color:#5ee0a8">main</span> <span style="color:#ff9f6b">className</span>=<span style="color:#a9d97c">"grid gap-6"</span>&gt;</div>
      <div style="padding-left:72px">&lt;<span style="color:#5ee0a8">Hero</span> <span style="color:#ff9f6b">title</span>=<span style="color:#a9d97c">"Northwind"</span> /&gt;</div>
      <div style="padding-left:72px">&lt;<span style="color:#5ee0a8">Grid</span>&gt;{items.map(renderCard)}&lt;/<span style="color:#5ee0a8">Grid</span>&gt;</div>
      <div style="padding-left:48px">&lt;/<span style="color:#5ee0a8">main</span>&gt;</div>
      <div style="padding-left:24px">);</div>
      <div>}</div>
    </div>
  </div>
  <div style="width:260px;background:#1f2023;padding:18px;font-size:12.5px;color:#a9abb1;border-left:1px solid #2c2d31">
    <div style="color:#7a7c82;text-transform:uppercase;letter-spacing:.08em;font-size:11px;margin-bottom:12px">Preview</div>
    <div style="background:#101113;border-radius:10px;height:340px;padding:16px">
      <div style="height:60px;border-radius:8px;background:linear-gradient(160deg,#2a2c31,#1b1c1f);margin-bottom:10px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="height:70px;border-radius:8px;background:#25262a"></div>
        <div style="height:70px;border-radius:8px;background:#25262a"></div>
      </div>
    </div>
  </div>
</div>`;

const page = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face{font-family:Inter;src:url(inter.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:Fraunces;src:url(fraunces.woff2) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#888;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{width:1512px;height:1012px;position:relative;overflow:hidden;margin:0 0 20px}
.serif{font-family:Fraunces,serif}
</style></head><body>
${dashboard}
${shopfront}
${editor}
</body></html>
`;

writeFileSync(new URL("./screens-desktop.html", import.meta.url), page);
console.log("wrote screens-desktop.html", page.length, "bytes");
