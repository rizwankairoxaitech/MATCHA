import { gsap } from 'gsap';

// One paused master timeline; reel/render.cjs seeks it frame by frame, so every frame is exact.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const FPS = 30;
const END = 48;
const PROMPT = 'Build an animated landing page for my matcha protein latte. A logo that draws itself in, a 3D tub that spins as you scroll, a curved “It’s a match(a)” ribbon and a flavour reveal. Colours: sage #b5c99b, forest #123f17, cream.';
const REPLY = 'Love this brief. Building your matcha site now:';

// [in, out, slot, text] — *word* is the italic serif accent, / breaks the line.
const CAPTIONS = [
  [0.25, 1.62, 'hook', 'I built *this*'],
  [1.95, 2.72, 'top', 'animated website'],
  [2.72, 3.34, 'top', 'just by *talking*'],
  [3.34, 3.98, 'top', 'to Claude.'],
  [7.0, 8.65, 'low', 'open *Claude*'],
  [8.65, 10.9, 'low', 'and start a/*new chat*'],
  [11.15, 12.9, 'low', 'write your/*prompt*'],
  [12.9, 14.6, 'low', 'the vibe,/the *colours*'],
  [14.6, 16.2, 'low', 'and the *motion*'],
  [16.2, 17.95, 'low', 'you want.'],
  [18.1, 19.8, 'low', 'add your/*assets*'],
  [19.8, 21.4, 'low', 'logo, product/shots'],
  [21.4, 23.3, 'low', 'and a *reference*/video'],
  [23.45, 24.85, 'low', 'hit *send*'],
  [24.85, 26.3, 'low', 'and Claude/builds'],
  [26.3, 27.95, 'low', 'the *whole*/site.'],
  [28.3, 31.3, 'top', 'a logo that/*draws* itself'],
  [31.45, 34.2, 'top', 'a 3D tub that/*spins* on scroll'],
  [34.3, 36.35, 'top', 'every section/on *brand*'],
  [36.45, 38.5, 'top', 'flavours/that *pop*'],
  [38.75, 40.75, 'sticker', 'and it’s *responsive*'],
  [40.95, 41.95, 'top', 'spot a/*mistake?*'],
  [41.95, 43.0, 'top', 'just *tell*/Claude'],
  [43.0, 44.15, 'top', 'fixed in/*minutes*'],
];

// Site footage: [reelStart, reelEnd, firstFrame, lastFrame] per recorded clip.
const FEEDS = [
  { el: '#footHook', dir: 'mobile', segs: [[0, 4.0, 0, 120]] },
  { el: '#footSite', dir: 'desktop', segs: [[28.0, 31.4, 0, 102], [31.4, 33.0, 111, 159], [33.0, 36.4, 206, 337], [36.4, 38.6, 337, 403]] },
  { el: '#footMobile', dir: 'mobile', segs: [[38.6, 40.8, 274, 322]] },
];

function captionEl([tIn, tOut, slot, text]) {
  const el = document.createElement('div');
  el.className = `cap slot-${slot}`;
  el.innerHTML = text.split('/').map(line => {
    let em = false;
    return line.split(' ').map(word => {
      const opens = word.startsWith('*'); const closes = word.slice(opens ? 1 : 0).includes('*');
      if (opens) em = true;
      const clean = word.replaceAll('*', '');
      const html = `<span class="w">${em ? `<em>${clean}</em>` : clean}</span>`;
      if (closes) em = false;
      return html;
    }).join(' ');
  }).join('<br>');
  $('#caps').append(el);
  return el;
}

function centerOf(sel) {
  const r = $(sel).getBoundingClientRect(); const s = $('#stage').getBoundingClientRect();
  return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
}

function build() {
  // Measure click targets in their final layout before any transforms are applied.
  const plus = centerOf('#plusBtn'); const send = centerOf('#sendBtn');
  $('#replyText').textContent = REPLY; $('#chat').style.visibility = 'visible';
  $$('.checks li, #preview').forEach(e => e.style.visibility = 'visible');
  const open = centerOf('#openBtn');
  $('#replyText').textContent = ''; $('#chat').style.visibility = '';
  $$('.checks li, #preview').forEach(e => e.style.visibility = '');

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  const show = (sel, t) => tl.set(sel, { autoAlpha: 1 }, t);
  const hide = (sel, t) => tl.set(sel, { autoAlpha: 0 }, t);
  const pop = (sel, t, extra = {}) => tl.fromTo(sel, { autoAlpha: 0, scale: .6, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: .42, ease: 'back.out(1.8)', ...extra }, t);
  const cursorTo = (p, t, d = .5) => tl.to('#cursor', { x: p.x - 6, y: p.y - 3, duration: d, ease: 'power2.inOut' }, t);
  const click = (p, t, target) => {
    tl.to('#cursor', { scale: .82, duration: .08, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '10% 5%' }, t)
      .fromTo('#ripple', { x: p.x, y: p.y, scale: .2, autoAlpha: .9 }, { scale: 1.4, autoAlpha: 0, duration: .45, ease: 'power2.out' }, t);
    if (target) tl.to(target, { scale: .9, duration: .08, yoyo: true, repeat: 1 }, t);
  };

  // 1 · Hook — the finished site, then it zooms out into a phone.
  show('#hook', 0);
  tl.to('.phone', { scale: .6, y: 640, borderRadius: 110, boxShadow: '0 0 0 22px #0f3313, 0 70px 120px 0 rgba(18,63,23,.45)', duration: .75, ease: 'power3.inOut' }, 1.68)
    .fromTo('.hook-ring', { scale: .7, autoAlpha: 0 }, { scale: 1, autoAlpha: .7, duration: .8 }, 2.0);
  ['.st1', '.st2', '.st3'].forEach((s, i) => pop(s, 2.3 + i * .16));
  tl.to('.st1, .st2, .st3', { y: '-=26', duration: 1.4, ease: 'sine.inOut', stagger: .2 }, 2.7);

  // 2 · "3 simple steps" wipes up over the hook.
  tl.set('#steps', { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' }, 3.95)
    .to('#steps', { clipPath: 'inset(0% 0% 0% 0%)', duration: .4, ease: 'power3.inOut' }, 3.95);
  hide('#hook', 4.4);
  tl.fromTo('.squiggle path', { strokeDasharray: 2600, strokeDashoffset: 2600 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 4.1)
    .fromTo('.s3-kicker', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .35 }, 4.15)
    .fromTo('.s3-num', { autoAlpha: 0, scale: .55, rotation: -12, filter: 'blur(20px)' }, { autoAlpha: 1, scale: 1, rotation: 0, filter: 'blur(0px)', duration: .55, ease: 'back.out(1.6)' }, 4.4)
    .fromTo('.s3-a', { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .4 }, 4.8)
    .fromTo('.s3-b', { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .4 }, 5.0)
    .fromTo('.s3-note', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .4 }, 5.45)
    .fromTo('.s3-note path', { strokeDasharray: 320, strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: .5, ease: 'power2.out' }, 5.6);

  // 3 · Claude walkthrough slides up.
  tl.fromTo('#studio', { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, duration: .55, ease: 'power3.inOut' }, 6.4);
  hide('#steps', 7.0);
  tl.fromTo('#claudeWin', { y: 120, scale: .94 }, { y: 0, scale: 1, duration: .8 }, 6.55)
    .fromTo('.home', { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }, 7.35)
    .fromTo('.studio-ring', { scale: .7, autoAlpha: 0 }, { scale: 1, autoAlpha: .6, duration: 1 }, 6.9)
    .fromTo('.deco-tub', { x: 260, rotation: 30 }, { x: 0, rotation: 12, duration: 1, ease: 'power3.out' }, 7.0)
    .to('.deco-tub', { y: -22, rotation: 9, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: 9 }, 8.0);
  pop('#p1', 6.95); hide('#p1', 11.0);
  pop('#p2', 11.0); hide('#p2', 18.0);
  pop('#p3', 18.0); hide('#p3', 23.35);
  pop('#p4', 23.35);
  // Step 3: attach assets.
  tl.fromTo('#cursor', { autoAlpha: 0, x: 640, y: 1500 }, { autoAlpha: 1, duration: .2 }, 17.85);
  cursorTo(plus, 18.05, .6); click(plus, 18.7, '#plusBtn');
  $$('.att').forEach((a, i) => pop(a, 18.9 + i * .34, { y: 0 }));
  // Then: send.
  cursorTo(send, 23.25, .55); click(send, 23.9, '#sendBtn');
  tl.to('#cursor', { autoAlpha: 0, duration: .2 }, 24.25)
    .to('#home', { autoAlpha: 0, y: -30, duration: .25, ease: 'power2.in' }, 24.0)
    .set('#chat', { autoAlpha: 1 }, 24.1);
  pop('#umsg', 24.12, { transformOrigin: '100% 0%' });
  tl.fromTo('#cmsg', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .3 }, 24.42);
  $$('.checks li').forEach((li, i) => {
    tl.fromTo(li, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: .25 }, 25.25 + i * .34)
      .fromTo(li.querySelector('svg'), { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 25.45 + i * .34);
  });
  pop('#preview', 27.0, { transformOrigin: '0% 50%' });
  tl.to('#cursor', { autoAlpha: 1, duration: .15 }, 26.95);
  cursorTo(open, 27.0, .5); click(open, 27.55, '#openBtn');

  // 4 · Payoff: the real site opens out of the "Open" button.
  tl.set('#payoff', { autoAlpha: 1, clipPath: `circle(0px at ${open.x}px ${open.y}px)` }, 27.75)
    .to('#payoff', { clipPath: `circle(2300px at ${open.x}px ${open.y}px)`, duration: .65, ease: 'power3.in' }, 27.75)
    .set('#cursor', { autoAlpha: 0 }, 27.75);
  hide('#studio', 28.45);
  tl.fromTo('#siteWin', { scale: .9, y: 60 }, { scale: 1, y: 0, duration: .8 }, 27.8)
    .fromTo('.payoff-ring', { scale: .8, rotation: -20 }, { scale: 1, rotation: 0, duration: 1.4 }, 27.8);
  [31.4, 33.0, 36.4].forEach(t => tl.fromTo('#siteWin', { scale: 1.035 }, { scale: 1, duration: .3, ease: 'power2.out', immediateRender: false }, t));
  $$('.chips span').forEach((c, i) => pop(c, 29.4 + i * .18));
  tl.fromTo('.payoff-note', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .4 }, 30.3);

  // 5 · Mobile cut.
  tl.set('#mobile', { autoAlpha: 1 }, 38.6).fromTo('#footMobile', { scale: 1.1 }, { scale: 1, duration: .45, ease: 'power3.out' }, 38.6);
  hide('#payoff', 38.6);

  // 6 · Fix it by asking.
  tl.fromTo('#fix', { autoAlpha: 1, xPercent: 100 }, { xPercent: 0, duration: .45, ease: 'power3.inOut' }, 40.75);
  hide('#mobile', 41.25);
  pop('.tb', 41.1);
  pop('#fixU', 41.35, { transformOrigin: '100% 100%' });
  tl.set('.wipe', { visibility: 'visible' }, 42.2)
    .fromTo('.ba .after', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power2.inOut' }, 42.2)
    .fromTo('.wipe', { x: 0 }, { x: 1000, duration: .8, ease: 'power2.inOut' }, 42.2)
    .to('.tb', { autoAlpha: 0, duration: .2 }, 42.5);
  pop('.ta', 42.95);
  pop('#fixC', 42.55, { transformOrigin: '0% 100%' });

  // 7 · Call to action.
  tl.set('#cta', { autoAlpha: 1, clipPath: 'circle(0px at 540px 960px)' }, 44.1)
    .to('#cta', { clipPath: 'circle(1200px at 540px 960px)', duration: .6, ease: 'power3.in' }, 44.1);
  hide('#fix', 44.75);
  tl.fromTo('.cta-1', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .45 }, 44.4)
    .fromTo('.cta-pill', { autoAlpha: 0, scale: .4, rotation: -8 }, { autoAlpha: 1, scale: 1, rotation: -3, duration: .6, ease: 'back.out(2)' }, 44.65)
    .fromTo('.cta-2', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .4 }, 45.1)
    .fromTo('.cta-3', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .4 }, 45.35)
    .fromTo('.cta-ring', { scale: .6, autoAlpha: 0 }, { scale: 1, autoAlpha: .8, duration: .9 }, 44.5)
    .fromTo('.cta-tub', { y: 500, rotation: 18 }, { y: 0, rotation: -6, duration: 1, ease: 'power3.out' }, 44.55)
    .to('.cta-tub', { y: -24, rotation: -3, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 45.55)
    .fromTo('.cta-note', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .4 }, 45.9)
    .to('.cta-pill', { scale: 1.06, duration: .35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 46.3);

  CAPTIONS.forEach(c => {
    const el = captionEl(c); const [tIn, tOut] = c;
    tl.set(el, { autoAlpha: 1 }, tIn)
      .fromTo(el.querySelectorAll('.w'), { yPercent: 80, autoAlpha: 0, filter: 'blur(14px)', rotation: 5 }, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', rotation: 0, duration: .36, stagger: .07, ease: 'back.out(1.8)' }, tIn)
      .to(el, { autoAlpha: 0, y: -30, filter: 'blur(10px)', duration: .16, ease: 'power1.in' }, tOut - .16);
  });
  tl.set({}, {}, END);
  return tl;
}

const typed = (text, t, t0, t1) => text.slice(0, Math.round(gsap.utils.clamp(0, 1, (t - t0) / (t1 - t0)) * text.length));
function frameFor(segs, t) {
  let seg = segs.find(([a, b]) => t >= a && t <= b);
  if (!seg) seg = t < segs[0][0] ? segs[0] : [...segs].reverse().find(([, b]) => t > b);
  const [a, b, f0, f1] = seg;
  return Math.round(f0 + (f1 - f0) * gsap.utils.clamp(0, 1, (t - a) / (b - a)));
}

async function ready() {
  await Promise.all(['800 100px "Inter Tight"', '700 100px "Inter Tight"', 'italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"', '600 60px Caveat', '700 60px "Barlow Condensed"', '400 30px "DM Sans"', '500 30px "DM Sans"', '600 30px "DM Sans"'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all($$('img').filter(i => i.src).map(i => i.decode().catch(() => {})));
  const tl = build();
  window.reel = {
    fps: FPS, duration: tl.duration(),
    async seek(t) {
      tl.time(t, false);
      $('#urlText').textContent = typed('claude.ai', t, 6.85, 7.3);
      $('#ph').style.display = t >= 11.4 ? 'none' : '';
      $('#promptText').textContent = typed(PROMPT, t, 11.4, 16.8);
      $('#tcaret').style.opacity = t < 7.4 ? 0 : (t > 11.4 && t < 16.9) ? 1 : (Math.floor(t * 2.2) % 2 ? 0 : 1);
      $('#replyText').textContent = typed(REPLY, t, 24.5, 25.3);
      await Promise.all(FEEDS.map(async f => {
        const img = $(f.el); const src = `/reel-footage/${f.dir}/f_${String(frameFor(f.segs, t)).padStart(4, '0')}.jpg`;
        if (img.dataset.src !== src) { img.dataset.src = src; img.src = src; await img.decode().catch(() => {}); }
      }));
    },
  };
  await window.reel.seek(0);
}
window.reelReady = ready();
