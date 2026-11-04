import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import { createBottle, createStudio as setup } from './ProductModel';
export { createBottle } from './ProductModel';

export default function ProductScene() {
  const host = useRef();
  useEffect(() => {
    let context; let system; let raf; let alive = true;
    const init = async () => {
      await document.fonts.ready; if (!alive) return;
      try { system = setup(host.current); } catch { host.current.classList.add('webgl-unavailable'); return; }
      const { scene, renderer, camera } = system; const bottle = createBottle(); scene.add(bottle);
      const companions=[createBottle({text:"VANILLA MATCHA LATTE"}),createBottle({text:"STRAWBERRY MATCHA"})];
      companions.forEach(model=>{model.visible=false;scene.add(model);});
      const pose = { x: .37, y: .88, scale: 1.08, rx: .08, ry: -.13, rz: -.2, companions:0, opacity: 1 };
      let dirty = true;
      context = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add({ mobile:'(max-width:699px)', desktop:'(min-width:700px)', motion:'(prefers-reduced-motion: no-preference)' }, ({conditions}) => {
          const mobile=conditions.mobile;
          Object.assign(pose,{x:mobile ? .28 : .37,y:mobile ? .66 : .88,scale:mobile ? (innerWidth<360 ? .53 : .6) : 1.08,rx:.08,ry:-.13,rz:-.2,companions:0});dirty=true;
          if(!conditions.motion){host.current.classList.add('reduced-canvas');return;}
          host.current.classList.remove('reduced-canvas');
          const benefitSection=document.querySelector('.benefits-scroll');
          const stageDistance=benefitSection.offsetHeight-innerHeight;
          const heroTravel=document.querySelector('.hero').offsetHeight*.88;
          const hold=Math.max(0,benefitSection.offsetTop-heroTravel);
          const master = gsap.timeline({ scrollTrigger: { id: 'product-journey', trigger: '.journey', start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true, onUpdate: () => {dirty = true;} } });
          master.to(pose, { x: mobile ? .4 : .36, y: -.4, rz: -.13, ry: .12, scale: .82, duration: heroTravel, ease: 'none' })
            .to(pose, { x: .5, y: -.4, duration: hold, ease: 'none' })
            .set(pose, { y:1.35,scale:mobile ? .82:1.12,rx:.3,rz:.12,ry:0 })
            .to(pose, { x:.5,y:mobile ? .65:.56,scale:mobile ? .61:.82,rx:.06,rz:0,duration:stageDistance*.17,ease:'power1.inOut' })
            .to(pose, { y:mobile ? .65:.56,scale:mobile ? .59:.77,duration:stageDistance*.17,ease:'none' })
            .to(pose, { ry:Math.PI,y:mobile ? .64:.52,scale:mobile ? .58:.75,rz:-.055,duration:stageDistance*.23,ease:'none' })
            .to(pose, { ry:Math.PI*2,y:mobile ? .64:.53,scale:mobile ? .6:.77,rz:.055,duration:stageDistance*.21,ease:'none' })
            .to(pose, { y:mobile ? .65:.59,scale:mobile ? .61:.8,rz:0,duration:stageDistance*.09,ease:'power1.inOut' })
            .to(pose, { y:mobile ? .73:.75,scale:mobile ? .56:.72,companions:1,duration:stageDistance*.13,ease:'power1.inOut' });
          const elements=gsap.utils.toArray('.benefit-panel');
          gsap.set(elements,{autoAlpha:0,y:innerHeight});
          gsap.set('.benefit-finale, .flavor-preview',{autoAlpha:0});
          const panels=gsap.timeline({scrollTrigger:{trigger:'.benefits-scroll',start:'top top',end:'bottom bottom',scrub:.65}});
          elements.forEach((panel,index)=>{
            const start=index*.18;
            // The first card is already in place, so it scrolls in with the stage instead of leaving an empty screen.
            if(index===0) gsap.set(panel,{autoAlpha:1,y:innerHeight*(mobile ? .13:.24)});
            else panels.fromTo(panel,{autoAlpha:1,y:innerHeight*.88},{autoAlpha:1,y:innerHeight*(mobile ? .13:.24),duration:.08,ease:'none',immediateRender:false},start);
            panels.to(panel,{autoAlpha:0,y:-panel.offsetHeight*.8,duration:.09,ease:'none'},start+.16);
          });
          panels.fromTo('.benefit-finale',{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.08,ease:'none'},.76)
            .to('.benefit-orbit',{autoAlpha:0,duration:.12},.78)
            .to('.flavor-preview',{autoAlpha:1,duration:.08},.87)
            .to({}, {duration:.05},.95);
          gsap.to('.benefit-orbit',{xPercent:15,yPercent:-15,rotation:32,ease:'none',scrollTrigger:{trigger:'.benefits-scroll',start:'top top',end:'bottom bottom',scrub:.8}});
          return () => { master.kill(); panels.kill(); };
        });
        mm.add('(prefers-reduced-motion: reduce)', () => { host.current.classList.add('reduced-canvas'); });
      });
      let last = '';
      const journey=document.querySelector('.journey');
      const render = () => {
        const bounds = host.current?.getBoundingClientRect();
        if (bounds && bounds.bottom > 0 && bounds.top < innerHeight) {
          // A negative sticky margin must not keep the model over later sections.
          // Move the existing canvas with the actual story boundary on exit.
          const storyBottom=journey.getBoundingClientRect().bottom;
          const exitOffset=storyBottom<bounds.height?Math.min(0,storyBottom-bounds.height)-bounds.top:0;
          renderer.domElement.style.transform=`translateY(${exitOffset}px)`;
          renderer.domElement.style.visibility=storyBottom<=0?'hidden':'visible';
          const state = `${pose.x},${pose.y},${pose.scale},${pose.ry},${pose.rz},${pose.companions},${innerWidth},${innerHeight}`;
          if (dirty || state !== last) {
            const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 13;
            bottle.position.set((pose.x - .5) * h * camera.aspect, (.5 - pose.y) * h, 0);
            bottle.scale.setScalar(pose.scale); bottle.rotation.set(pose.rx, pose.ry, pose.rz);
            // Reference flavour line-up: the side containers rise from below and tuck in
            // shoulder-to-shoulder behind the centre one, independent of screen width.
            companions.forEach((model,index)=>{
              const progress=pose.companions||0;model.visible=progress>.001;
              const side=index===0?-1:1;const sideScale=.86;
              const offset=pose.scale*.9*(1+sideScale)*.94;
              model.position.set(bottle.position.x+side*offset,bottle.position.y-h*.07-(1-progress)*h*.75,-.6);
              model.scale.setScalar(pose.scale*sideScale);model.rotation.set(.04,side*-.12,side*-.025);
            });
            renderer.render(scene, camera); last = state; dirty = false;
            // Exposed as read-only diagnostics for scroll regression checks.
            host.current.dataset.rotation = pose.ry.toFixed(4); host.current.dataset.position = pose.y.toFixed(4);
          }
        }
        raf = requestAnimationFrame(render);
      }; render();
      const markDirty = () => {dirty=true;}; window.addEventListener('resize',markDirty);window.addEventListener('more-texture-ready',markDirty); system.removeListener=()=>{window.removeEventListener('resize',markDirty);window.removeEventListener('more-texture-ready',markDirty);};
      ScrollTrigger.refresh();
    }; init();
    return () => { alive = false; cancelAnimationFrame(raf); context?.revert(); system?.removeListener?.(); system?.dispose(); };
  }, []);
  return <div ref={host} className="product-canvas" role="img" aria-label="Olive green More matcha protein container with a white lid, rotating through a full turn as you scroll"><div className="product-fallback fallback-photo"><img src="/more-original.webp" alt="More Protein Iced Matcha Latte product container"/></div></div>;
}

