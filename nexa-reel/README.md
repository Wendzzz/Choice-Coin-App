# Nexa — Motion Reel

A 15-second, 1920×1080 @ 60fps motion-graphics showreel built from the Nexa UI design.

**Output:** `nexa-showreel.mp4`

| Time | Chapter | What happens |
|---|---|---|
| 0.0–2.3s | Identity | A light line collapses into the Nexa mark, followed by a shockwave, a particle burst and the wordmark reveal. The camera then zooms through the tile. |
| 2.3–4.4s | Hero | The headline rises word by word with a gradient shine sweep. The CTAs pop in, and a cursor clicks "Start for free". |
| 4.4–8.3s | Product | The dashboard tilts up in 3D. A prompt types itself, the AI plan checks off, counters and sparklines animate and the bars grow. The camera pushes in, then a whip-pan with motion blur moves to the next scene. |
| 8.3–11.4s | Workspace | The bento grid assembles in 3D. The assistant chat, line chart, 84% ring, moodboard with a selection box, live cursors and calendar all animate. |
| 11.4–13.5s | Proof | "Plan. / Create. / Ship." hard cuts play over a testimonial marquee. The pricing cards flip in with price counters. |
| 13.5–15.0s | Momentum | Flash, logo burst and the end card: "Your next great idea deserves momentum." |

## How it's built

- `index.html` holds the whole piece as one deterministic timeline. It uses Web Animations with JS hooks for the counters, typing, particles, grain and blur, and every animation can be seeked. Open it in a browser to watch a live looping preview.
- `render.cjs` seeks the timeline frame by frame in headless Chromium (Playwright) and pipes the frames to ffmpeg (H.264).

```bash
NODE_PATH=$(npm root -g) FFMPEG=ffmpeg node render.cjs nexa-showreel.mp4
# quick stills for review:
NODE_PATH=$(npm root -g) STILLS=1.0,6.0,10.5 node render.cjs
```
