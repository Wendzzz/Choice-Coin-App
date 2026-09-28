// Frame-accurate renderer: seeks the timeline in index.html and pipes every frame into ffmpeg.
// Usage: NODE_PATH=$(npm root -g) FFMPEG=/path/to/ffmpeg node render.cjs [out.mp4]
//        STILLS=1.2,3.8 node render.cjs   -> writes still-<t>.png for quick review
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const FPS = +(process.env.FPS || 60);
  const out = path.resolve(process.argv[2] || 'nexa-showreel.mp4');
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--hide-scrollbars', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'index.html') + '?capture=1');
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const dur = await page.evaluate(() => window.__dur);

  if (process.env.STILLS) {
    for (const t of process.env.STILLS.split(',').map(Number)) {
      await page.evaluate(t => window.__seek(t), t);
      await page.screenshot({ path: path.resolve(process.env.STILL_DIR || '.', `still-${t.toFixed(2)}.png`) });
    }
    await browser.close();
    return;
  }

  const ff = spawn(process.env.FFMPEG || 'ffmpeg', [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = Math.round(dur * FPS);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.__seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.error(`frame ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.error('done ->', out);
})();
