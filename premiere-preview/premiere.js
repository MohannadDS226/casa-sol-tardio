const clamp=(v,a=0,b=1)=>Math.min(Math.max(v,a),b);const smooth=t=>t*t*(3-2*t);const loader=document.querySelector('[data-loader]');const masthead=document.querySelector('[data-masthead]');const hero=document.querySelector('[data-hero]');const prologue=document.querySelector('[data-prologue]');const horizontal=document.querySelector('[data-horizontal]');const track=document.querySelector('[data-track]');const eclipse=document.querySelector('[data-eclipse]');const film=document.querySelector('[data-film]');const issue=document.querySelector('[data-issue]');const magazine=document.querySelector('[data-magazine]');

const reveal=()=>loader?.classList.add('is-gone');window.addEventListener('load',()=>setTimeout(reveal,260),{once:true});setTimeout(reveal,2200);

document.querySelectorAll('video').forEach(v=>v.play().catch(()=>{}));

const sectionProgress=(el)=>{if(!el)return 0;const r=el.getBoundingClientRect();const total=Math.max(el.offsetHeight-window.innerHeight,1);return clamp(-r.top/total)};

let ticking=false;function update(){const y=window.scrollY;masthead?.classList.toggle('is-scrolled',y>30);
  if(hero){const p=clamp(y/Math.max(hero.offsetHeight,1));hero.style.setProperty('--hero-p',p.toFixed(3));}
  if(prologue){const p=sectionProgress(prologue);prologue.style.setProperty('--prologue-p',smooth(p).toFixed(3));}
  if(horizontal&&track){const p=sectionProgress(horizontal);const max=Math.max(track.scrollWidth-window.innerWidth*.62,0);track.style.transform=`translate3d(${-max*smooth(p)}px,0,0)`;}
  if(eclipse){const p=sectionProgress(eclipse);eclipse.style.setProperty('--eclipse-p',smooth(p).toFixed(3));const c=smooth(clamp((p-.18)/.22))*smooth(clamp((.82-p)/.22));eclipse.style.setProperty('--eclipse-copy',c.toFixed(3));}
  if(film){const p=sectionProgress(film);film.style.setProperty('--film-p',smooth(p).toFixed(3));}
  if(issue){const p=sectionProgress(issue);issue.style.setProperty('--issue-p',smooth(p).toFixed(3));issue.style.setProperty('--issue-open',smooth(clamp((p-.48)/.42)).toFixed(3));}
  document.querySelectorAll('[data-parallax]').forEach(el=>{const r=el.getBoundingClientRect();const speed=parseFloat(el.dataset.parallax||0);const center=(r.top+r.height/2)-window.innerHeight/2;el.style.transform=`translate3d(0,${center*speed}px,0)`;});
  ticking=false;}
function requestUpdate(){if(ticking)return;ticking=true;requestAnimationFrame(update)}window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',requestUpdate,{passive:true});update();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('[data-reveal-section]').forEach(el=>observer.observe(el));

const viewItems=[...document.querySelectorAll('[data-view]')].map(el=>({el,img:el.querySelector('img'),title:el.dataset.view||el.querySelector('img')?.alt||'',meta:el.dataset.meta||''})).filter(x=>x.img);const lightbox=document.querySelector('[data-lightbox]');const lbImg=lightbox?.querySelector('.lb-stage img');const lbSmall=lightbox?.querySelector('.lb-meta small');const lbTitle=lightbox?.querySelector('.lb-meta strong');const lbCount=lightbox?.querySelector('.lb-count');let current=0;
function renderLb(i){if(!lightbox||!viewItems.length)return;current=(i+viewItems.length)%viewItems.length;const item=viewItems[current];lbImg.src=item.img.currentSrc||item.img.src;lbImg.alt=item.title;lbSmall.textContent=item.meta;lbTitle.textContent=item.title;lbCount.textContent=`${String(current+1).padStart(2,'0')} / ${String(viewItems.length).padStart(2,'0')}`;}
function openLb(i){renderLb(i);lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');lightbox.querySelector('.lb-close')?.focus({preventScroll:true})}function closeLb(){lightbox?.classList.remove('is-open');lightbox?.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open')}
viewItems.forEach((item,i)=>item.el.addEventListener('click',()=>openLb(i)));lightbox?.querySelector('.lb-close')?.addEventListener('click',closeLb);lightbox?.querySelector('.lb-prev')?.addEventListener('click',()=>renderLb(current-1));lightbox?.querySelector('.lb-next')?.addEventListener('click',()=>renderLb(current+1));lightbox?.querySelector('.lb-stage')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeLb()});document.addEventListener('keydown',e=>{if(!lightbox?.classList.contains('is-open'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')renderLb(current-1);if(e.key==='ArrowRight')renderLb(current+1)});
let tx=0,ty=0;lightbox?.addEventListener('touchstart',e=>{tx=e.changedTouches[0].clientX;ty=e.changedTouches[0].clientY},{passive:true});lightbox?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))renderLb(current+(dx<0?1:-1))},{passive:true});

document.querySelector('.studio-door')?.addEventListener('click',()=>{window.location.href='../';});