import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const textureCache = new Map();
const images = new Map();
function packshot(flavor) {
  if (!images.has(flavor)) { const image = new Image(); image.src = `/more-${flavor}.webp`; images.set(flavor, image); }
  return images.get(flavor);
}
packshot('original');

export function labelTexture(color, text = 'ICED MATCHA LATTE') {
  const flavor = /STRAWBERRY/.test(text) ? 'strawberry' : /VANILLA/.test(text) ? 'vanilla' : 'original';
  if (textureCache.has(flavor)) return textureCache.get(flavor);
  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 2048;
  const c = canvas.getContext('2d', { willReadFrequently: true });
  const base = flavor === 'original' ? [109, 123, 67] : [120, 133, 79];
  c.fillStyle = `rgb(${base})`; c.fillRect(0, 0, 2048, 2048);
  // Realistic reverse-side printing remains attached to the cylindrical surface.
  const back = document.createElement('canvas'); back.width = 650; back.height = 1750;
  const b = back.getContext('2d'); b.fillStyle = `rgb(${base})`; b.fillRect(0, 0, 650, 1750);
  b.fillStyle = '#eef0df'; b.font = 'bold 54px Arial'; b.fillText('more', 45, 95);
  b.font = 'bold 25px Arial'; b.fillText('PROTEIN ICED MATCHA LATTE', 45, 170);
  b.font = '21px Arial';
  ['Original Taste', 'Mix with an unsweetened oat drink', 'or a milk of your choice.', '', 'NUTRITION INFORMATION', 'Per serving / pro Portion', '', 'Protein                          18 g', 'Caffeine                       85 mg', '', 'Preparation', 'Add powder to your drink.', 'Shake well and serve over ice.', '', 'Store in a cool, dry place.', 'Keep the lid closed after opening.'].forEach((line, i) => b.fillText(line, 45, 230 + i * 58));
  b.strokeStyle = '#c2cba9'; for (let y = 520; y < 800; y += 58) { b.beginPath(); b.moveTo(40, y); b.lineTo(610, y); b.stroke(); }
  b.fillStyle = '#f1f0df'; b.fillRect(48,1374,550,193);
  b.fillStyle = '#2d3322'; for (let i = 0; i < 135; i++) b.fillRect(65 + i * 3.8, 1390, i % 4 ? 1.5 : 3, 160);
  b.font = '20px Arial'; b.fillText('500 g  |  MORE NUTRITION', 60, 1640);
  c.drawImage(back, -325, 140); c.drawImage(back, 1723, 140);
  c.fillStyle='#f3f2e8';c.fillRect(180,0,42,2048);c.fillRect(1826,0,42,2048);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.userData.shared = true;
  textureCache.set(flavor, texture);
  const image = packshot(flavor);
  const print = () => {
    const photo = document.createElement('canvas'); photo.width = image.naturalWidth; photo.height = image.naturalHeight;
    const p = photo.getContext('2d', { willReadFrequently: true }); p.drawImage(image, 0, 0);
    const pixels = p.getImageData(0, 0, photo.width, photo.height);
    let left = photo.width, right = 0, top = photo.height, bottom = 0;
    for (let y = 0; y < photo.height; y += 2) for (let x = 0; x < photo.width; x += 2) if (pixels.data[(y * photo.width + x) * 4 + 3] > 180) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
    const center = (left + right) / 2, radius = (right - left) / 2 - 2, height = bottom - top;
    // Inverse cylindrical projection: unwrap the authentic photographed label,
    // then Three.js wraps it back onto real geometry. No flat image rotation.
    for (let x = 512; x < 1536; x++) {
      const angle = ((x + .5) / 2048 - .5) * Math.PI * 2;
      const edge = 1 - Math.cos(angle);
      const sourceX = center + Math.sin(angle) * radius;
      const sourceTop = top + height * .137 + edge * height * .015;
      const sourceBottom = top + height * .958 - edge * height * .018;
      c.drawImage(photo, sourceX, sourceTop, 1.2, sourceBottom - sourceTop, x, 0, 1, 2048);
    }
    const front = c.getImageData(512, 0, 1024, 2048), data = front.data;
    // Remove the photograph's baked cylinder lighting; studio light now supplies
    // the changing highlights and shading while the original artwork stays crisp.
    for (let x = 0; x < 1024; x++) {
      const sample = (45 * 1024 + x) * 4;
      const background = [data[sample], data[sample + 1], data[sample + 2]];
      for (let y = 0; y < 2048; y++) {
        const i = (y * 1024 + x) * 4;
        const minimum = Math.min(data[i], data[i + 1], data[i + 2]);
        const whiteness = Math.max(0, Math.min(1, (minimum - 175) / 45));
        for (let channel = 0; channel < 3; channel++) {
          const normalized = data[i + channel] * base[channel] / Math.max(background[channel], 65);
          data[i + channel] = Math.min(255, normalized * (1 - whiteness) + data[i + channel] * whiteness);
        }
        data[i + 3] = 255;
      }
    }
    c.putImageData(front, 512, 0);
    texture.needsUpdate = true;
    window.dispatchEvent(new Event('more-texture-ready'));
  };
  if (image.complete && image.naturalWidth) print(); else image.addEventListener('load', print, { once: true });
  return texture;
}

let grain;
function surfaceGrain() {
  if (grain) return grain;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d'); const pixels = context.createImageData(128, 128);
  for (let i = 0; i < pixels.data.length; i += 4) { const n = 122 + Math.floor(Math.random() * 12); pixels.data.set([n, n, n, 255], i); }
  context.putImageData(pixels, 0, 0); grain = new THREE.CanvasTexture(canvas); grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(8, 6); grain.userData.shared = true; return grain;
}

export function createBottle({ color, text, short = false } = {}) {
  const group = new THREE.Group();
  const shape = [[0,-1.91],[.77,-1.91],[.85,-1.88],[.873,-1.82],[.873,1.43],[.851,1.49],[.815,1.5],[.815,1.67],[0,1.67]];
  const body = new THREE.Mesh(new THREE.LatheGeometry(shape.map(p => new THREE.Vector2(...p)), 96), new THREE.MeshPhysicalMaterial({ color: '#f6f4eb', roughness: .38, clearcoat: .18, bumpMap: surfaceGrain(), bumpScale: .002 })); group.add(body);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(.876, .876, 3.28, 128, 1, true), new THREE.MeshPhysicalMaterial({ map: labelTexture(color, text), roughness: .49, metalness: .015, clearcoat: .13, clearcoatRoughness: .42, bumpMap: surfaceGrain(), bumpScale: .0012 }));
  label.position.y = -.17; label.rotation.y = Math.PI; group.add(label);
  const lidShape = [[0,1.62],[.837,1.62],[.892,1.65],[.902,1.68],[.902,1.88],[.891,1.923],[.85,1.94],[0,1.94]];
  const lidMaterial = new THREE.MeshPhysicalMaterial({ color: '#f7f6f0', roughness: .32, clearcoat: .27, clearcoatRoughness: .35, bumpMap: surfaceGrain(), bumpScale: .001 });
  const lid=new THREE.Mesh(new THREE.LatheGeometry(lidShape.map(p => new THREE.Vector2(...p)), 128), lidMaterial);lid.position.y=-.1;group.add(lid);
  const inset = new THREE.Mesh(new THREE.CylinderGeometry(.845,.845,.005,96),new THREE.MeshPhysicalMaterial({color:'#f1f0e9',roughness:.41,clearcoat:.15}));inset.position.y=1.842;group.add(inset);
  for (const [y,radius] of [[1.557,.889],[1.599,.902],[-1.85,.861]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius,.009,8,96),new THREE.MeshStandardMaterial({color:y<0?'#e2e1d7':'#deded7',roughness:.38}));ring.rotation.x=Math.PI/2;ring.position.y=y;group.add(ring); }
  if(short) group.scale.y=.65;
  group.userData.label=label;
  return group;
}

export function createStudio(host) {
  const scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(29,1,.1,100);camera.position.set(0,0,13);
  const environment=new RoomEnvironment();const generator=new THREE.PMREMGenerator(renderer);const target=generator.fromScene(environment,.04);scene.environment=target.texture;scene.environmentIntensity=.65;environment.dispose();generator.dispose();
  scene.add(new THREE.AmbientLight('#f8f9ee',.45));
  const key=new THREE.DirectionalLight('#fffdf6',2.7);key.position.set(-4,5,8);scene.add(key);
  const fill=new THREE.DirectionalLight('#dce9d4',.6);fill.position.set(6,1,3);scene.add(fill);
  const rim=new THREE.DirectionalLight('#ffffff',1.2);rim.position.set(3,5,-4);scene.add(rim);
  const resize=()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  return{scene,renderer,camera,dispose:()=>{observer.disconnect();scene.traverse(object=>{object.geometry?.dispose();if(object.material){if(object.material.map&&!object.material.map.userData.shared)object.material.map.dispose();object.material.dispose();}});target.dispose();renderer.dispose();renderer.domElement.remove();}};
}
