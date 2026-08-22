const root = document.documentElement;
const journey = document.querySelector('[data-journey]');
const stage = document.querySelector('[data-stage]');
const portalLayer = document.querySelector('[data-portals]');
const opening = document.querySelector('[data-opening]');
const worldWord = document.querySelector('[data-world-word]');
const quote = document.querySelector('[data-quote]');
const quoteSmall = quote?.querySelector('small');
const quoteStrong = quote?.querySelector('strong');
const sun = document.querySelector('[data-sun]');
const moon = document.querySelector('[data-moon]');
const timeEl = document.querySelector('[data-time]');
const timePhase = document.querySelector('[data-time-phase]');
const chapterSmall = document.querySelector('[data-chapter-small]');
const chapterStrong = document.querySelector('[data-chapter-strong]');
const eclipseTitle = document.querySelector('[data-eclipse-title]');
const loader = document.querySelector('[data-loader]');
const gate = document.querySelector('[data-gate]');
const openGate = document.querySelectorAll('[data-open-gate]');
const closeGate = document.querySelector('[data-close-gate]');
const gateForm = document.querySelector('[data-gate-form]');

const scenes = [
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319165/first-glimpse.webp',title:'The First Glimpse',meta:'CAM 01 · Arrival',time:'06:42',phase:'Dawn',word:'ARRIVAL',quote:'The house appears before the day fully does.',x:50,y:50,w:62,aspect:'1.61/1',rot:-1.5},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319213/the-arrival.webp',title:'The Arrival',meta:'CAM 20 · Threshold',time:'07:18',phase:'Morning',word:'ENTER',quote:'Every story needs a threshold.',x:35,y:48,w:34,aspect:'2/3',rot:-2.2},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319221/bougainvillea-courtyard.webp',title:'The Bougainvillea Courtyard',meta:'CAM 18 · Garden',time:'08:06',phase:'Morning',word:'BLOOM',quote:'The garden begins speaking in color.',x:66,y:52,w:36,aspect:'3/4',rot:1.8},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319237/the-passage.webp',title:'The Passage',meta:'CAM 07 · Interior',time:'09:12',phase:'Morning',word:'PASSAGE',quote:'Inside, the light becomes architecture.',x:38,y:49,w:32,aspect:'3/4',rot:-2.5},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319229/morning-beyond.webp',title:'The Morning Beyond',meta:'CAM 06 · Morning',time:'10:04',phase:'Late morning',word:'BEYOND',quote:'The rooms keep borrowing the garden.',x:63,y:47,w:34,aspect:'3/4',rot:1.4},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319249/sun-was-waiting.webp',title:'The Sun Was Waiting',meta:'CAM 03 · Afternoon',time:'12:37',phase:'Noon',word:'SUN',quote:'At noon, every surface becomes a clock.',x:50,y:50,w:67,aspect:'16/9',rot:0},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319325/fountain-keeps-time.webp',title:'The Fountain Keeps Time',meta:'DETAIL 06 · Texture',time:'14:08',phase:'Afternoon',word:'RIPPLE',quote:'Some hours are measured in water.',x:31,y:49,w:27,aspect:'4/5',rot:-3},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319300/golden-company.webp',title:'Golden Company',meta:'DETAIL 20 · Ritual',time:'15:26',phase:'Afternoon',word:'RITUAL',quote:'The house is most alive in the small rituals.',x:68,y:50,w:34,aspect:'4/5',rot:2.2},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319334/between-the-pages.webp',title:'Between the Pages',meta:'DETAIL 07 · Still life',time:'16:31',phase:'Afternoon',word:'PAUSE',quote:'A room can ask you to stay a little longer.',x:39,y:51,w:29,aspect:'4/5',rot:-1.8},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319258/petals-afloat.webp',title:'Petals Afloat',meta:'CAM 17 · Water',time:'17:42',phase:'Golden hour',word:'FLOAT',quote:'Then the afternoon begins to loosen.',x:50,y:50,w:66,aspect:'16/9',rot:.7},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319308/petals-on-water.webp',title:'Petals on Water',meta:'DETAIL 22 · Detail',time:'18:17',phase:'Golden hour',word:'GOLD',quote:'Light touches the water one last time.',x:32,y:49,w:31,aspect:'4/5',rot:-2.5},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319293/view-she-carries.webp',title:'The View She Carries',meta:'CAM 16 · Life at Casa',time:'18:49',phase:'Dusk',word:'DUSK',quote:'And suddenly the house belongs to evening.',x:68,y:49,w:28,aspect:'9/16',rot:2},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319270/after-lights.webp',title:'After the Lights Come On',meta:'CAM 23 · Night',time:'19:36',phase:'Blue hour',word:'AFTERGLOW',quote:'When daylight leaves, Casa answers with its own.',x:36,y:50,w:34,aspect:'3/4',rot:-1.7},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319277/moonlit-threshold.webp',title:'Moonlit Threshold',meta:'CAM 13 · Nocturne',time:'21:12',phase:'Night',word:'MOON',quote:'The thresholds become lanterns.',x:65,y:50,w:34,aspect:'3/4',rot:1.8},
  {src:'https://res.cloudinary.com/vysyrabp/image/upload/v1787319284/eclipse-witness.webp',title:'Eclipse Witness',meta:'CAM 29 · Special study',time:'12:11',phase:'Eclipse',word:'ECLIPSE',quote:'And once, even the sun disappeared.',x:50,y:50,w:38,aspect:'2/3',rot:0}
];

const clamp = (v,a=0,b=1)=>Math.min(Math.max(v,a),b);
const lerp = (a,b,t)=>a+(b-a)*t;
const smooth = (t)=>t*t*(3-2*t);

function buildPortals(){
  scenes.forEach((scene,index)=>{
    const figure=document.createElement('figure');
    figure.className='portal';
    figure.tabIndex=-1;
    figure.dataset.index=index;
    figure.style.setProperty('--px',`${scene.x}%`);
    figure.style.setProperty('--py',`${scene.y}%`);
    figure.style.setProperty('--pw',`${scene.w}vw`);
    figure.style.setProperty('--rot',`${scene.rot}deg`);
    figure.style.setProperty('--aspect',scene.aspect);
    figure.innerHTML=`<div class="portal-window"><img src="${scene.src}" alt="Casa Sol Tardío — ${scene.title}" loading="${index<2?'eager':'lazy'}" decoding="async"></div><figcaption class="portal-meta"><span>${scene.meta.split(' · ')[0]}</span><strong>${scene.title}</strong><em>${scene.meta.split(' · ')[1]||''}</em></figcaption>`;
    figure.addEventListener('click',()=>openLightbox(index));
    figure.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openLightbox(index);}});
    portalLayer.appendChild(figure);
  });
}

buildPortals();
const portals=[...document.querySelectorAll('.portal')];

let lastWord='';
function setWord(word){
  if(!worldWord||word===lastWord)return;
  lastWord=word;
  worldWord.classList.add('is-changing');
  setTimeout(()=>{worldWord.textContent=word;worldWord.classList.remove('is-changing');},170);
}

function setQuote(scene,opacity){
  if(!quote)return;
  quote.style.setProperty('--quote-opacity',opacity.toFixed(3));
  if(quoteStrong.textContent!==scene.quote){quoteSmall.textContent=scene.phase;quoteStrong.textContent=scene.quote;}
}

let mouseX=0,mouseY=0,targetMouseX=0,targetMouseY=0;
window.addEventListener('pointermove',(e)=>{targetMouseX=(e.clientX/window.innerWidth-.5)*2;targetMouseY=(e.clientY/window.innerHeight-.5)*2},{passive:true});

function updateJourney(){
  if(!journey)return;
  const rect=journey.getBoundingClientRect();
  const total=Math.max(journey.offsetHeight-window.innerHeight,1);
  const p=clamp(-rect.top/total);
  root.style.setProperty('--progress',p.toFixed(4));

  mouseX=lerp(mouseX,targetMouseX,.055); mouseY=lerp(mouseY,targetMouseY,.055);
  root.style.setProperty('--mx',mouseX.toFixed(3)); root.style.setProperty('--my',mouseY.toFixed(3));

  const openingEnd=.065;
  const sceneStart=.055;
  const sceneEnd=.885;
  const eclipseStart=.865;
  const eclipseEnd=.965;

  const op=clamp(1-p/openingEnd);
  opening?.style.setProperty('--opening-opacity',smooth(op).toFixed(3));
  opening?.style.setProperty('--opening-scale',(1+(.035*(1-op))).toFixed(3));
  opening?.style.setProperty('--opening-blur',`${((1-op)*10).toFixed(1)}px`);

  const dayP=clamp(p/.84);
  const sunX=lerp(7,91,dayP);
  const sunY=80-Math.sin(dayP*Math.PI)*69;
  root.style.setProperty('--sun-x',`${sunX.toFixed(2)}vw`);
  root.style.setProperty('--sun-y',`${sunY.toFixed(2)}vh`);

  const night=clamp((p-.69)/.17);
  root.style.setProperty('--night',smooth(night).toFixed(3));

  const ecl=smooth(clamp((p-eclipseStart)/(eclipseEnd-eclipseStart)));
  root.style.setProperty('--eclipse',ecl.toFixed(3));
  const titlePulse=smooth(clamp((p-.9)/.025))*smooth(clamp((.97-p)/.025));
  eclipseTitle?.style.setProperty('--eclipse-title',titlePulse.toFixed(3));

  const shadowAngle=dayP*Math.PI;
  root.style.setProperty('--shadow-x',`${(Math.cos(shadowAngle)*-3.6).toFixed(2)}rem`);
  root.style.setProperty('--shadow-y',`${(Math.sin(shadowAngle)*2.1+.7).toFixed(2)}rem`);

  const sf=clamp((p-sceneStart)/(sceneEnd-sceneStart))* (scenes.length-1);
  const current=Math.round(sf);
  const currentScene=scenes[current];

  portals.forEach((portal,i)=>{
    const d=i-sf;
    const ad=Math.abs(d);
    const opacity=clamp(1-ad*.86);
    const direction=d===0?0:Math.sign(d);
    const tx=d*32;
    const ty=ad*9 + Math.sin((i+1)*1.7)*1.7;
    const scale=1-Math.min(ad,1.4)*.11;
    const blur=Math.max(0,(ad-.25)*9);
    const rot=scenes[i].rot + direction*Math.min(ad,1)*2.2;

    portal.style.setProperty('--travel-x',`${tx.toFixed(2)}vw`);
    portal.style.setProperty('--travel-y',`${ty.toFixed(2)}vh`);
    portal.style.setProperty('--travel-scale',scale.toFixed(3));
    portal.style.setProperty('--portal-opacity',opacity.toFixed(3));
    portal.style.setProperty('--portal-blur',`${blur.toFixed(1)}px`);
    portal.style.setProperty('--travel-rot',`${rot.toFixed(2)}deg`);
    portal.style.setProperty('--depth',clamp(ad/1.5).toFixed(3));
    const active=i===current && p>sceneStart*.8 && p<sceneEnd+.03;
    portal.classList.toggle('is-current',active);
    portal.tabIndex=active?0:-1;
    portal.setAttribute('aria-hidden',active?'false':'true');
  });

  if(currentScene){
    setWord(currentScene.word);
    const qOpacity=clamp(1-Math.abs(current-sf)*2.2)*clamp((p-sceneStart)/.02)*clamp((sceneEnd+.02-p)/.03);
    setQuote(currentScene,qOpacity);
    if(timeEl)timeEl.textContent=currentScene.time;
    if(timePhase)timePhase.textContent=currentScene.phase;
    if(chapterSmall)chapterSmall.textContent=currentScene.meta;
    if(chapterStrong)chapterStrong.textContent=currentScene.title;
  }

  ticking=false;
}

let ticking=false;
function requestUpdate(){if(ticking)return;ticking=true;requestAnimationFrame(updateJourney)}
window.addEventListener('scroll',requestUpdate,{passive:true});
window.addEventListener('resize',requestUpdate,{passive:true});
(function animationLoop(){requestUpdate();requestAnimationFrame(animationLoop)})();

function buildLightbox(){
  const box=document.createElement('div');
  box.className='world-lightbox';
  box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-hidden','true');
  box.innerHTML=`<button class="lb-close" aria-label="Close"></button><button class="lb-prev" aria-label="Previous">‹</button><div class="world-lightbox-stage"><img alt=""></div><button class="lb-next" aria-label="Next">›</button><div class="world-lightbox-meta"><div><small></small><strong></strong></div><span class="world-lightbox-count"></span></div>`;
  document.body.appendChild(box);return box;
}
const lightbox=buildLightbox();
const lbImg=lightbox.querySelector('img');
const lbMeta=lightbox.querySelector('small');
const lbTitle=lightbox.querySelector('strong');
const lbCount=lightbox.querySelector('.world-lightbox-count');
let lbIndex=0,touchX=0,touchY=0;

async function renderLightbox(index){
  lbIndex=(index+scenes.length)%scenes.length;const s=scenes[lbIndex];
  lightbox.classList.remove('is-ready');lbImg.src=s.src;lbImg.alt=`Casa Sol Tardío — ${s.title}`;lbMeta.textContent=s.meta;lbTitle.textContent=s.title;lbCount.textContent=`${String(lbIndex+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;
  try{await lbImg.decode()}catch(_){}
  requestAnimationFrame(()=>lightbox.classList.add('is-ready'));
}
function openLightbox(index){renderLightbox(index);lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');lightbox.querySelector('.lb-close').focus({preventScroll:true});}
function closeLightbox(){lightbox.classList.remove('is-open','is-ready');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');}
lightbox.querySelector('.lb-close').addEventListener('click',closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click',()=>renderLightbox(lbIndex-1));
lightbox.querySelector('.lb-next').addEventListener('click',()=>renderLightbox(lbIndex+1));
lightbox.querySelector('.world-lightbox-stage').addEventListener('click',(e)=>{if(e.target===e.currentTarget)closeLightbox()});
lightbox.addEventListener('touchstart',(e)=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
lightbox.addEventListener('touchend',(e)=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))renderLightbox(lbIndex+(dx<0?1:-1))},{passive:true});
document.addEventListener('keydown',(e)=>{if(!lightbox.classList.contains('is-open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')renderLightbox(lbIndex-1);if(e.key==='ArrowRight')renderLightbox(lbIndex+1)});

openGate.forEach(btn=>btn.addEventListener('click',()=>gate?.showModal?.()));
closeGate?.addEventListener('click',()=>gate?.close());
gate?.addEventListener('click',(e)=>{const r=gate.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)gate.close()});
gateForm?.addEventListener('submit',(e)=>{e.preventDefault();const note=gateForm.querySelector('.gate-note');if(note)note.textContent='The private villa-door experience will connect here.'});

window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('is-gone'),420),{once:true});
setTimeout(()=>loader?.classList.add('is-gone'),2300);
updateJourney();
