// Records the running site frame by frame on a virtual clock, so the intro, 3D product and
// scroll story come out perfectly smooth at 30 fps regardless of machine speed.
// Usage (with `npm run dev` running): node reel/capture-site.cjs <outDir> <desktop|mobile>
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const FPS = 30;
const [outDir = 'reel/.frames', mode = 'desktop'] = process.argv.slice(2);
const views = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5 },
};
// Scroll legs: target is evaluated in the page from real section sizes; ms = leg duration, hold = still time after.
const legs = {
  desktop: [
    { hold: 3700 },
    { target: 'hero.offsetHeight * .5', ms: 1500, hold: 200 },
    { target: 'ritual.offsetTop + 260', ms: 1300, hold: 150 },
    { target: 'benefits.offsetTop + stage * .12', ms: 1400, hold: 250 },
    { target: 'benefits.offsetTop + stage * .64', ms: 2600, hold: 100 },
    { target: 'benefits.offsetTop + stage', ms: 1700, hold: 800 },
  ],
  mobile: [
    { hold: 3600 },
    { target: 'hero.offsetHeight * .55', ms: 1600, hold: 150 },
    { target: 'benefits.offsetTop + stage * .2', ms: 2200, hold: 100 },
    { target: 'benefits.offsetTop + stage', ms: 2400, hold: 700 },
  ],
};

(async () => {
  const dir = path.join(outDir, mode);
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: (process.env.GL_ARGS || '--use-angle=d3d11 --ignore-gpu-blocklist --enable-gpu').split(' ') });
  const page = await browser.newPage(views[mode]);
  await page.clock.install({ time: new Date('2026-01-01T09:00:00') });
  await page.clock.pauseAt(new Date('2026-01-01T09:00:01'));
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500); // real time for product textures to load; the virtual clock stays at zero
  let frame = 0;
  let elapsed = 0;
  const shoot = async ms => {
    const frames = Math.round(ms / 1000 * FPS);
    for (let i = 0; i < frames; i++) {
      const next = Math.round((frame + 1) * 1000 / FPS);
      await page.clock.runFor(next - elapsed);
      elapsed = next;
      await page.screenshot({ path: path.join(dir, `f_${String(frame).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 90 });
      frame++;
    }
  };
  for (const leg of legs[mode]) {
    if (leg.target) {
      const y = await page.evaluate(expr => {
        const hero = document.querySelector('.hero'), ritual = document.querySelector('.ritual'), benefits = document.querySelector('.benefits-scroll');
        const stage = benefits.offsetHeight - innerHeight;
        return Math.round(eval(expr));
      }, leg.target);
      await page.evaluate(([y, d]) => window.__moreLenis.scrollTo(y, { duration: d, force: true, easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }), [y, leg.ms / 1000]);
      await shoot(leg.ms);
    }
    if (leg.hold) await shoot(leg.hold);
    console.log(mode, 'frames', frame);
  }
  await browser.close();
})();
