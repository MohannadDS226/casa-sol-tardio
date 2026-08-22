const root=document.documentElement;
const loader=document.querySelector('[data-loader]');
const hero=document.querySelector('[data-hero]');
const threshold=document.querySelector('[data-threshold]');
const atlas=document.querySelector('[data-atlas]');
const atlasPortals=document.querySelector('[data-atlas-portals]');
const atlasWord=document.querySelector('[data-atlas-word]');
const atlasTime=document.querySelector('[data-atlas-time]');
const atlasPhase=document.querySelector('[data-atlas-phase]');
const atlasCount=document.querySelector('[data-atlas-count]');
const atlasQuote=document.querySelector('[data-atlas-quote]');
const atlasEclipseTitle=document.querySelector('[data-atlas-e-title]');
const film=document.querySelector('[data-film]');
const bts=document.querySelector('[data-bts]');
const magazine=document.querySelector('[data-magazine]');
const gate=document.querySelector('[data-gate]');
const gateOpeners=[...document.querySelectorAll('[data-open-gate]')];
const gateClose=document.querySelector('[data-close-gate]');
const gateForm=document.querySelector('[data-gate-form]');

const scenes=[
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319165/first-glimpse.webp',title:'The First Glimpse',meta:'CAM 01 · Arrival',time:'06:42',phase:'Dawn',word:'ARRIVAL',quote:'The house appears before the day fully does.',w:66,wm:92,aspect:'1.61/1',rot:-1.2},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319213/the-arrival.webp',title:'The Arrival',meta:'CAM 20 · Threshold',time:'07:18',phase:'Morning',word:'ENTER',quote:'Every story needs a threshold.',w:34,wm:68,aspect:'2/3',rot:-2.1},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319221/bougainvillea-courtyard.webp',title:'The Bougainvillea Courtyard',meta:'CAM 18 · Garden',time:'08:06',phase:'Morning',word:'BLOOM',quote:'The garden begins speaking in color.',w:36,wm:72,aspect:'3/4',rot:1.8},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319237/the-passage.webp',title:'The Passage',meta:'CAM 07 · Interior',time:'09:12',phase:'Morning',word:'PASSAGE',quote:'Inside, the light becomes architecture.',w:32,wm:70,aspect:'3/4',rot:-2.4},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319229/morning-beyond.webp',title:'The Morning Beyond',meta:'CAM 06 · Morning',time:'10:04',phase:'Late morning',word:'BEYOND',quote:'The rooms keep borrowing the garden.',w:34,wm:72,aspect:'3/4',rot:1.4},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319249/sun-was-waiting.webp',title:'The Sun Was Waiting',meta:'CAM 03 · Afternoon',time:'12:37',phase:'Noon',word:'SUN',quote:'At noon, every surface becomes a clock.',w:68,wm:92,aspect:'16/9',rot:0},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319325/fountain-keeps-time.webp',title:'The Fountain Keeps Time',meta:'DETAIL 06 · Texture',time:'14:08',phase:'Afternoon',word:'RIPPLE',quote:'Some hours are measured in water.',w:27,wm:64,aspect:'4/5',rot:-2.6},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319300/golden-company.webp',title:'Golden Company',meta:'DETAIL 20 · Ritual',time:'15:26',phase:'Afternoon',word:'RITUAL',quote:'The house is most alive in the small rituals.',w:34,wm:72,aspect:'4/5',rot:2.1},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319334/between-the-pages.webp',title:'Between the Pages',meta:'DETAIL 07 · Still life',time:'16:31',phase:'Afternoon',word:'PAUSE',quote:'A room can ask you to stay a little longer.',w:29,wm:66,aspect:'4/5',rot:-1.7},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319258/petals-afloat.webp',title:'Petals Afloat',meta:'CAM 17 · Water',time:'17:42',phase:'Golden hour',word:'FLOAT',quote:'Then the afternoon begins to loosen.',w:67,wm:92,aspect:'16/9',rot:.6},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319308/petals-on-water.webp',title:'Petals on Water',meta:'DETAIL 22 · Detail',time:'18:17',phase:'Golden hour',word:'GOLD',quote:'Light touches the water one last time.',w:31,wm:68,aspect:'4/5',rot:-2.2},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319293/view-she-carries.webp',title:'The View She Carries',meta:'CAM 16 · Life at Casa',time:'18:49',phase:'Dusk',word:'DUSK',quote:'And suddenly the house belongs to evening.',w:28,wm:58,aspect:'9/16',rot:1.9},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319270/after-lights.webp',title:'After the Lights Come On',meta:'CAM 23 · Night',time:'19:36',phase:'Blue hour',word:'AFTERGLOW',quote:'When daylight leaves, Casa answers with its own.',w:34,wm:72,aspect:'3/4',rot:-1.5},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319277/moonlit-threshold.webp',title:'Moonlit Threshold',meta:'CAM 13 · Nocturne',time:'21:12',phase:'Night',word:'MOON',quote:'The thresholds become lanterns.',w:34,wm:72,aspect:'3/4',rot:1.6},
{src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319284/eclipse-witness.webp',title:'Eclipse Witness',meta:'CAM 29 · Special study',time:'12:11',phase:'Eclipse',word:'ECLIPSE',quote:'And once, even the sun disappeared.',w:38,wm:72,aspect:'2/3',rot:0}
];

const clamp=(v,a=0,b=1)=>Math.min(Math.max(v,a),b);
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const progressOf=section=>{if(!section)return 0;const r=section.getBoundingClientRect();const total=Math.max(section.offsetHeight-innerHeight,1);return clamp(-r.top/total)};

window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('is-gone'),250),{once:true});
setTimeout(()=>loader?.classList.add('is-gone'),2200);

document.querySelectorAll('video[autoplay]').forEach(v=>v.play().catch(()=>{}));

let mx=0,my=0,tmx=0,tmy=0;
window.addEventListener('pointermove',e=>{tmx=(e.clientX/innerWidth-.5)*2;tmy=(e.clientY/innerHeight-.5)*2},{passive:true});

function buildAtlas(){
 scenes.forEach((s,i)=>{
  const f=document.createElement('figure');f.className='atlas-portal';f.dataset.index=i;f.tabIndex=-1;
  f.style.setProperty('--portal-w',`${s.w}vw`);f.style.setProperty('--portal-w-mobile',`${s.wm}vw`);f.style.setProperty('--aspect',s.aspect);
  const [code,kind='']=s.meta.split(' · ');
  f.innerHTML=`<div class="atlas-media"><img src="${s.src}" alt="Casa Sol Tardío — ${s.title}" loading="${i<2?'eager':'lazy'}" decoding="async"></div><figcaption><span>${code}</span><strong>${s.title}</strong><em>${kind}</em></figcaption>`;
  f.addEventListener('click',()=>openLightbox(i));
  f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(i)}});
  atlasPortals?.appendChild(f);
 });
}
buildAtlas();
const portals=[...document.querySelectorAll('.atlas-portal')];
let lastWord='';
function setAtlasWord(word){if(!atlasWord||word===lastWord)return;lastWord=word;atlasWord.animate([{opacity:.05,filter:'blur(0)'},{opacity:0,filter:'blur(16px)'},{opacity:.05,filter:'blur(0)'}],{duration:420,easing:'ease'});setTimeout(()=>atlasWord.textContent=word,190)}

function update(){
 mx=lerp(mx,tmx,.06);my=lerp(my,tmy,.06);root.style.setProperty('--mx',mx.toFixed(3));root.style.setProperty('--my',my.toFixed(3));
 const hp=progressOf(hero);root.style.setProperty('--hero-p',hp.toFixed(4));
 const tp=progressOf(threshold);root.style.setProperty('--threshold-p',tp.toFixed(4));
 const ap=progressOf(atlas);root.style.setProperty('--atlas-p',ap.toFixed(4));
 const fp=progressOf(film);root.style.setProperty('--film-p',fp.toFixed(4));
 const bp=progressOf(bts);root.style.setProperty('--bts-p',bp.toFixed(4));
 const mp=progressOf(magazine);root.style.setProperty('--mag-p',mp.toFixed(4));

 const day=clamp(ap/.86);const sx=lerp(6,94,day);const sy=80-Math.sin(day*Math.PI)*68;root.style.setProperty('--atlas-sun-x',`${sx.toFixed(2)}vw`);root.style.setProperty('--atlas-sun-y',`${sy.toFixed(2)}vh`);
 const night=smooth(clamp((ap-.70)/.16));root.style.setProperty('--atlas-night',night.toFixed(3));
 const eclipse=smooth(clamp((ap-.89)/.09));root.style.setProperty('--atlas-eclipse',eclipse.toFixed(3));
 const et=smooth(clamp((ap-.91)/.025))*smooth(clamp((.985-ap)/.025));root.style.setProperty('--atlas-e-title',et.toFixed(3));

 const sf=clamp(ap/.9)*(scenes.length-1);const current=Math.round(sf);const s=scenes[current];
 portals.forEach((p,i)=>{const d=i-sf;const ad=Math.abs(d);const op=clamp(1-ad*.92);const tx=d*36;const ty=ad*10+Math.sin((i+1)*1.8)*1.4;const scale=1-Math.min(ad,1.3)*.12;const blur=Math.max(0,(ad-.18)*9);const rot=scenes[i].rot+Math.sign(d||0)*Math.min(ad,1)*2.1;p.style.setProperty('--tx',`${tx.toFixed(2)}vw`);p.style.setProperty('--ty',`${ty.toFixed(2)}vh`);p.style.setProperty('--scale',scale.toFixed(3));p.style.setProperty('--op',op.toFixed(3));p.style.setProperty('--blur',`${blur.toFixed(1)}px`);p.style.setProperty('--rot',`${rot.toFixed(2)}deg`);const active=i===current&&ap<.94;p.classList.toggle('is-current',active);p.tabIndex=active?0:-1});
 if(s){setAtlasWord(s.word);if(atlasTime)atlasTime.textContent=s.time;if(atlasPhase)atlasPhase.textContent=s.phase;if(atlasCount)atlasCount.textContent=`${String(current+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;if(atlasQuote){atlasQuote.querySelector('small').textContent=s.phase;atlasQuote.querySelector('strong').textContent=s.quote;}}
 requestAnimationFrame(update);
}
requestAnimationFrame(update);

function buildLightbox(){const box=document.createElement('div');box.className='lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-hidden','true');box.innerHTML=`<button class="lb-close" aria-label="Close"></button><button class="lb-prev" aria-label="Previous">‹</button><div class="lb-stage"><img alt=""></div><button class="lb-next" aria-label="Next">›</button><div class="lb-meta"><div><small></small><strong></strong></div><span></span></div>`;document.body.appendChild(box);return box}
const lightbox=buildLightbox();const lbImg=lightbox.querySelector('img');const lbSmall=lightbox.querySelector('.lb-meta small');const lbTitle=lightbox.querySelector('.lb-meta strong');const lbCount=lightbox.querySelector('.lb-meta>span');let lbIndex=0,touchX=0,touchY=0;
async function renderLightbox(i){lbIndex=(i+scenes.length)%scenes.length;const s=scenes[lbIndex];lightbox.classList.remove('is-ready');lbImg.src=s.src;lbImg.alt=`Casa Sol Tardío — ${s.title}`;lbSmall.textContent=s.meta;lbTitle.textContent=s.title;lbCount.textContent=`${String(lbIndex+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;try{await lbImg.decode()}catch(_){}requestAnimationFrame(()=>lightbox.classList.add('is-ready'))}
function openLightbox(i){renderLightbox(i);lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');lightbox.querySelector('.lb-close').focus({preventScroll:true})}
function closeLightbox(){lightbox.classList.remove('is-open','is-ready');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
lightbox.querySelector('.lb-close').addEventListener('click',closeLightbox);lightbox.querySelector('.lb-prev').addEventListener('click',()=>renderLightbox(lbIndex-1));lightbox.querySelector('.lb-next').addEventListener('click',()=>renderLightbox(lbIndex+1));lightbox.querySelector('.lb-stage').addEventListener('click',e=>{if(e.target===e.currentTarget)closeLightbox()});
lightbox.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});lightbox.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))renderLightbox(lbIndex+(dx<0?1:-1))},{passive:true});
document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('is-open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')renderLightbox(lbIndex-1);if(e.key==='ArrowRight')renderLightbox(lbIndex+1)});

gateOpeners.forEach(btn=>btn.addEventListener('click',()=>{if(typeof gate?.showModal==='function')gate.showModal()}));gateClose?.addEventListener('click',()=>gate?.close());gate?.addEventListener('click',e=>{const r=gate.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)gate.close()});gateForm?.addEventListener('submit',e=>{e.preventDefault();const note=gateForm.querySelector('.gate-note');if(note)note.textContent='The private villa-door experience connects here.'});
