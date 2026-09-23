import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await p.goto("http://127.0.0.1:8765/screens.html");
await p.evaluate(() => document.fonts.ready);
for (const id of ["onboarding","feed","paywall","home","player","wallet","settings"]) {
  await p.locator("#" + id).screenshot({ path: "screens/" + id + ".png" });
}
await b.close(); console.log("ok");
