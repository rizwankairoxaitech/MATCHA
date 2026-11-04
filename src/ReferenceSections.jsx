import { ArrowLeft, ArrowRight, ArrowUpRight, Package, ShoppingBag } from 'lucide-react';
import { flavors, product } from './content';

const boxes = {
  original:[1600,1600,504,196,576,1213], vanilla:[1600,1600,504,196,576,1213], strawberry:[1600,1600,516,221,568,1208], sachet:[1600,1600,422,233,736,1166],
  'chunky-strawberry':[1200,1200,225,305,737,638], 'chunky-vanilla':[1200,1200,225,305,737,638],
  'chunky-strawberry-sachet':[1200,1200,164,295,858,653], 'chunky-vanilla-sachet':[1200,1200,164,295,858,653],
};
export function Packshot({ name='original', className='', alt='' }) {
  const [w,h,x,y,bw,bh]=boxes[name];
  const source=name.startsWith('chunky')?`/${name}.webp`:`/more-${name}.webp`;
  return <div className={`packshot ${className}`} style={{aspectRatio:`${bw}/${bh}`}}><img src={source} loading="lazy" alt={alt} style={{width:`${w/bw*100}%`,height:`${h/bh*100}%`,left:`${-x/bw*100}%`,top:`${-y/bh*100}%`}}/></div>;
}
export function FlavorPreview(){
  return <div className="flavor-preview" aria-label="Explore matcha flavors"><h3>What&#8217;s your flavour?</h3><img className="preview-cutout preview-cookie-large" src="/vanilla-biscuit-cutout.webp" alt="" loading="lazy"/><img className="preview-cutout preview-cookie-small" src="/vanilla-biscuit-cutout.webp" alt="Vanilla cream biscuit" loading="lazy"/><img className="preview-cutout preview-berry-small" src="/strawberry-cutout.webp" alt="Fresh strawberry" loading="lazy"/><img className="preview-cutout preview-berry-large" src="/strawberry-cutout.webp" alt="" loading="lazy"/><span className="handwritten preview-vanilla">Vanilla<br/>Crumble <span>↘</span></span><span className="handwritten preview-strawberry">Strawberry<br/>Cheesecake <span>↙</span></span></div>;
}
export function ChunkyFlavors({flavor,flavorIndex,setFlavorIndex,moveFlavor,addToCart,Pill}){
  const pink=flavor.id==='strawberry';const chunky=pink?'chunky-strawberry':'chunky-vanilla';
  return <section className="flavors chunky-section" id="shop" aria-labelledby="chunky-heading">
    <header className="chunky-heading" data-reveal><h2 id="chunky-heading">Chunky Flavour</h2><h3>New Taste, Low Sugar</h3><p>Mix your favourite Chunky Flavour with your<br/>Matcha Latte for a sweeter flavour sensation.</p></header>
    <div className="chunky-composition">
      <span className="handwritten chunky-note">More Flavour<br/>Combinations <span>↘</span></span>
      <div className="chunky-matcha" data-reveal><Packshot name="sachet" className="matcha-sachet sachet-left"/><Packshot name="sachet" className="matcha-sachet sachet-middle"/><Packshot name="original" className="matcha-main" alt="More Protein Iced Matcha Latte, Original Taste"/></div>
      <span className="chunky-plus" aria-hidden="true">+</span>
      <div className="chunky-pair" key={chunky}><Packshot name={`${chunky}-sachet`} className="chunky-sachet chunky-sachet-one"/><Packshot name={`${chunky}-sachet`} className="chunky-sachet chunky-sachet-two"/><Packshot name={chunky} className="chunky-main" alt={`More Chunky Flavour ${pink?'Strawberry':'Vanilla'} Perfection`}/></div>
      <div className="chunky-choice"><span>Chunky Flavour</span><h3 id="flavor-title" aria-live="polite">{pink?'STRAWBERRY':'VANILLA'}<br/>PERFECTION</h3><Pill onClick={addToCart}>Buy now</Pill><span className="chunky-price">Matcha {new Intl.NumberFormat('en-IE',{style:'currency',currency:product.currency}).format(product.price)}</span></div>
      <div className="chunky-controls"><button className="circle-button" onClick={()=>moveFlavor(-1)} aria-label="Previous flavor"><ArrowLeft size={16}/></button><button className="circle-button" onClick={()=>moveFlavor(1)} aria-label="Next flavor"><ArrowRight size={16}/></button></div>
      <div className="chunky-swatches" aria-label="Select flavor">{flavors.map((f,i)=><button key={f.id} aria-pressed={flavorIndex===i} aria-label={f.title} style={{background:f.color}} onClick={()=>setFlavorIndex(i)}/>)}</div>
    </div>
  </section>;
}
export function ClosingStatement({Pill,scrollToShop}){
  return <section className="closing-statement" aria-labelledby="closing-statement-title"><span className="handwritten delivery-note">Your next<br/>green ritual.</span><h2 id="closing-statement-title" data-reveal>Don&#8217;t just crave it.<br/><span>Get it.</span></h2><Pill onClick={scrollToShop}>Find your matcha</Pill><div className="payment-orbit" aria-label="Payment branding shown as a design reference">{[['american_express','American Express'],['master','Mastercard'],['paypal','PayPal'],['apple_pay','Apple Pay'],['google_pay','Google Pay'],['visa','Visa'],['klarna','Klarna']].map(([name,label])=><span key={name} className="payment-bubble"><img src={`/payment-${name}.svg`} alt={label} loading="lazy"/></span>)}</div><span className="handwritten shipping-note">A little scoop.<br/>A whole lot more.</span><small className="payment-preview-note">Design preview · payment processing is not connected</small></section>;
}
export function ReferenceFooter({Pill,addToCart,scrollToShop,showInfo,Socials}){
  return <section className="closing reference-closing"><div className="closing-product"><h2>MATCHA<br/>MEETS<br/>PROTEIN</h2><div className="footer-packshots"><Packshot name="original" className="footer-tall" alt="More Protein Iced Matcha Latte"/><Packshot name="original" className="footer-short" alt="More matcha container"/></div><Pill light onClick={addToCart}>Buy now</Pill></div><div className="closing-copy"><div className="footer-shop-tiles"><button onClick={scrollToShop}><ShoppingBag size={30} strokeWidth={1}/><span>SHOP ALL<br/>PRODUCTS</span></button><button onClick={()=>showInfo('Samples & singles')}><Package size={30} strokeWidth={1}/><span>SAMPLES<br/>&amp; SINGLES</span></button></div><div className="footer-details"><h2><span>More Nutrition</span><br/>Iced Matcha Latte</h2><button onClick={()=>showInfo('Shipping & delivery')}>Shipping and Delivery <ArrowUpRight size={12}/></button><button onClick={()=>showInfo('Returns & exchanges')}>Returns and Exchanges <ArrowUpRight size={12}/></button><Socials onSocial={()=>showInfo('A little more community')}/></div></div></section>;
}
