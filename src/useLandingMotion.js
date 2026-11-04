import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function useLandingMotion() {
  useLayoutEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const playIntro = !reduced && !location.hash;
    const previousRestoration = history.scrollRestoration;
    if (playIntro) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }
    let disposed = false;
    let intro;
    let interrupted = false;
    let lenis;
    let tick;
    if (!reduced) {
      lenis = new Lenis({ duration: 1.25, smoothWheel: true, anchors: true });
      window.__moreLenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tick = time => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const finishIntro = () => {
      if (playIntro && !interrupted) {
        ScrollTrigger.clearScrollMemory('manual');
        lenis?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
      }
      document.documentElement.dataset.intro = 'complete';
      lenis?.start();
      ScrollTrigger.refresh();
    };
    const context = gsap.context(() => {
      if (!playIntro) { finishIntro(); return; }
      lenis?.stop();
      document.documentElement.dataset.intro = 'playing';
      const logo = document.querySelector('.hero-wordmark');
      const logoBounds = logo.getBoundingClientRect();
      const centerOffset = (Math.min(innerHeight, document.querySelector('.hero').offsetHeight) - logoBounds.height) / 2 - logoBounds.top;
      const mark = logo.querySelector('.brand-reveal-stroke');
      const length = mark.getTotalLength();
      gsap.set(logo, { y: centerOffset, autoAlpha: 1 });
      gsap.set(mark, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set('.hero-wordmark .brand-letter', { y: 250 });
      gsap.set('.hero-wordmark .brand-reveal-finish', { opacity: 0 });
      gsap.set('.header, .hero-shop, .hero-copy, .hero-note, .hero-orbit-wrap', { autoAlpha: 0, y: 28 });
      gsap.set('.product-canvas', { autoAlpha: 0, y: 180 });
    });
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (disposed) return;
      context.add(() => {
        if (playIntro) {
          ScrollTrigger.clearScrollMemory('manual');
          lenis?.scrollTo(0, { immediate: true, force: true });
          window.scrollTo(0, 0);
          intro = gsap.timeline({ onComplete: finishIntro });
          intro.to('.hero-wordmark .brand-reveal-stroke', { strokeDashoffset: 0, duration: .75, ease: 'power2.inOut' }, 0)
            .to('.hero-wordmark .brand-reveal-finish', { opacity: 1, duration: .15 }, .7)
            .to('.hero-wordmark .brand-letter', { y: 0, duration: .7, stagger: .11, ease: 'power3.out' }, .4)
            .to('.hero-wordmark', { y: 0, duration: 1.1, ease: 'power3.inOut' }, 1.3)
            .to('.header, .hero-shop', { autoAlpha: 1, y: 0, duration: .75, stagger: .08, ease: 'power2.out' }, 1.85)
            .to('.hero-copy, .hero-note, .hero-orbit-wrap', { autoAlpha: 1, y: 0, duration: 1, stagger: .08, ease: 'power2.out' }, 2)
            .to('.product-canvas', { autoAlpha: 1, y: 0, duration: 1.15, ease: 'power3.out' }, 2.05);
        }
        if (!reduced) {
          gsap.utils.toArray('[data-reveal]').forEach(element => gsap.from(element, { y: 32, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }));
          gsap.from('.comparison-table tr', { opacity: 0, y: 15, stagger: .12, duration: .6, scrollTrigger: { trigger: '.comparison-table', start: 'top 85%', once: true } });
          gsap.to('.ribbon textPath', { attr: { startOffset: '-10%' }, ease: 'none', scrollTrigger: { trigger: '.ritual', start: 'top bottom', end: 'top top', scrub: .8 } });
          gsap.fromTo('.payment-orbit',{y:45},{y:-35,ease:'none',scrollTrigger:{trigger:'.closing-statement',start:'top bottom',end:'bottom top',scrub:.8}});
        }
        ScrollTrigger.refresh();
      });
    }));
    // A visitor may scroll or tab immediately; finish the introduction without delaying their action.
    const interrupt = event => {
      if (event.type === 'keydown' && !['Tab', 'ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) return;
      if (intro && intro.progress() < 1) { interrupted = true; intro.progress(1); }
    };
    window.addEventListener('wheel', interrupt, { capture: true, passive: true });
    window.addEventListener('touchstart', interrupt, { capture: true, passive: true });
    window.addEventListener('keydown', interrupt, true);
    return () => {
      disposed = true;
      context.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__moreLenis;
      history.scrollRestoration = previousRestoration;
      window.removeEventListener('wheel', interrupt, true);
      window.removeEventListener('touchstart', interrupt, true);
      window.removeEventListener('keydown', interrupt, true);
    };
  }, []);
}
