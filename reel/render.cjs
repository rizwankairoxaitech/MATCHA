// Renders reel/index.html to an MP4 by seeking its timeline frame by frame.
// Usage (with `npm run dev` running): node reel/render.cjs <footageDir> <framesDir> [out.mp4]
//   footageDir: output of capture-site.cjs (desktop/, mobile/) plus fix/before.png, fix/after.png, fix/ref.jpg
//   ONLY=0,5.5,30 renders just those seconds as stills (for checking layout); no video is encoded.
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const [footDir, framesDir, out = 'reel/out/matcha-reel.mp4'] = process.argv.slice(2);
const ffmpeg = () => process.env.FFMPEG || execFileSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();

(async () => {
  fs.mkdirSync(framesDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.route('**/reel-footage/**', route => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.replace('/reel-footage/', ''));
    route.fulfill({ path: path.join(footDir, rel) });
  });
  await page.goto('http://127.0.0.1:5173/reel/index.html');
  await page.evaluate(() => window.reelReady);
  const { fps, duration } = await page.evaluate(() => ({ fps: window.reel.fps, duration: window.reel.duration }));
  const stills = process.env.ONLY?.split(',').map(Number);
  const times = stills || Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
  for (const [i, t] of times.entries()) {
    await page.evaluate(t => window.reel.seek(t), t);
    const name = stills ? `still_${t.toFixed(2).padStart(5, '0')}.jpg` : `r_${String(i).padStart(5, '0')}.jpg`;
    await page.screenshot({ path: path.join(framesDir, name), type: 'jpeg', quality: 94 });
    if (!stills && i % 150 === 0) console.log(`frame ${i}/${times.length}`);
  }
  await browser.close();
  if (stills) return;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(ffmpeg(), ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(framesDir, 'r_%05d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
    // JPEG frames are full range; convert to standard (tv) range BT.709 so social apps show the colours correctly.
    '-vf', 'scale=out_range=tv:out_color_matrix=bt709,format=yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '128k', out], { stdio: 'inherit' });
  console.log('wrote', out);
})();
