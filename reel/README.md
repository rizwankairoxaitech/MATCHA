# Matcha site reel

48-second vertical reel (1080 × 1920, 30 fps): `out/matcha-reel.mp4`.
The audio track is silent. Add a trending sound in Instagram/TikTok, or record a voiceover using the script below.

## Script (timed to the captions)

| Time | On screen | Say |
|---|---|---|
| 0:00 | Site intro, zooms into a phone | "I built this animated website just by talking to Claude." |
| 0:04 | 3 simple steps | "Here's how. Three simple steps, zero code." |
| 0:07 | Step 01: claude.ai opens | "Step one: open Claude and start a new chat." |
| 0:11 | Step 02: prompt types itself | "Step two: write your prompt. The vibe, the colours, and the motion you want." |
| 0:18 | Step 03: assets attach | "Step three: add your assets. Logo, product shots, and a reference video." |
| 0:23 | Send → Claude builds | "Hit send, and Claude builds the whole site." |
| 0:28 | The real site | "A logo that draws itself, a 3D tub that spins on scroll, every section on brand." |
| 0:38 | Mobile | "And it's responsive." |
| 0:41 | Before / after | "Spot a mistake? Just tell Claude. Fixed in minutes." |
| 0:44 | CTA | "Comment MATCHA and I'll send you the prompt." |

Suggested post caption: *Built this animated matcha site by talking to Claude. 3 steps, zero code. Comment MATCHA for the prompt.*

## Re-render

With `npm run dev` running:

```sh
node reel/capture-site.cjs reel/.frames desktop
node reel/capture-site.cjs reel/.frames mobile
node reel/render.cjs reel/.frames reel/.render reel/out/matcha-reel.mp4
```

`render.cjs` also expects `reel/.frames/fix/before.png`, `after.png` (the before/after screenshots) and `ref.jpg` (a reference-video frame).
Edit captions and timing in `reel.js` (`CAPTIONS`, `FEEDS`), and layout in `reel.css`. `ONLY=5,12.5 node reel/render.cjs …` renders single stills for checking.
