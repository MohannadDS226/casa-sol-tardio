(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const lerp = (a,b,t)=>a+(b-a)*t;
  const root = document.documentElement;
  const boot = $('[data-boot]');
  window.addEventListener('load',()=>setTimeout(()=>boot?.classList.add('done'),450));

  const index = $('[data-index]');
  $('[data-index-open]')?.addEventListener('click',()=>{ index?.classList.add('open'); document.body.classList.add('index-open'); });
  $('[data-index-close]')?.addEventListener('click',()=>{ index?.classList.remove('open'); document.body.classList.remove('index-open'); });
  $$('[data-index] a').forEach(a=>a.addEventListener('click',()=>{ index?.classList.remove('open'); document.body.classList.remove('index-open'); }));

  window.addEventListener('pointermove', e=>{
    root.style.setProperty('--mx', `${e.clientX}px`);
    root.style.setProperty('--my', `${e.clientY}px`);
  }, {passive:true});

  const progress = $('[data-progress]');
  const status = $('[data-status]');
  const zones = $$('[data-zone]');
  const statusMap = {
    opening:'RECOVERED MATERIAL', declaration:'CASE NOTES', evidence:'IMAGE SET / 55 FILES', motion:'RECORDED MOVEMENT', production:'PRODUCTION MATERIAL', anomaly:'ANOMALY / 12:11', issue:'PRINTED MATERIAL', truth:'ARCHIVE STATEMENT', memory:'SESSION OUTPUT', ending:'END OF FILE'
  };
  let lastY = scrollY, lastT = performance.now(), velocity = 0;
  function updateGlobal(){
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? scrollY / h : 0;
    if(progress) progress.style.width = `${p*100}%`;
    const now = performance.now();
    const dt = Math.max(16, now-lastT);
    velocity = lerp(velocity, (scrollY-lastY)/dt, .15);
    lastY = scrollY; lastT = now;
    let active = zones[0]; let best = Infinity;
    zones.forEach(z=>{
      const r=z.getBoundingClientRect();
      const d=Math.abs(r.top+r.height*.5-innerHeight*.5);
      if(d<best){best=d;active=z;}
    });
    if(active && status) status.textContent = statusMap[active.dataset.zone] || 'ARCHIVE';
  }

  const time = $('[data-time]');
  const start = performance.now();
  setInterval(()=>{
    const s=Math.floor((performance.now()-start)/1000);
    const m=String(Math.floor(s/60)).padStart(2,'0');
    const ss=String(s%60).padStart(2,'0');
    if(time) time.textContent=`${m}:${ss}`;
  },500);

  // Evidence parallax + dwell memory
  const evidenceCards = $$('[data-memory]');
  const dwell = new Map(evidenceCards.map(el=>[el,0]));
  let lastFrame = performance.now();
  function updateCards(now){
    const dt = now-lastFrame; lastFrame=now;
    evidenceCards.forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      const vis=Math.max(0, Math.min(r.bottom,innerHeight)-Math.max(r.top,0));
      if(vis>Math.min(r.height,innerHeight)*.35) dwell.set(card,(dwell.get(card)||0)+dt);
      const center=(r.top+r.height*.5-innerHeight*.5)/innerHeight;
      card.style.translate=`0 ${center * -16}px`;
    });
  }

  // Motion still quietly becomes video
  const motionBox = $('[data-motion-still]');
  const motionVideo = $('[data-motion-video]');
  const motionObs = new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){ motionBox?.classList.add('active'); motionVideo?.play().catch(()=>{}); }
    else { motionBox?.classList.remove('active'); }
  }),{threshold:.58});
  if(motionBox) motionObs.observe(motionBox);

  // Anomaly state
  const anomaly = $('#anomaly');
  const anomalyObs = new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting && e.intersectionRatio>.32){ anomaly?.classList.add('active'); petalMode='anomaly'; }
    else { anomaly?.classList.remove('active'); if(petalMode==='anomaly') petalMode='normal'; }
  }),{threshold:[0,.32,.7]});
  if(anomaly) anomalyObs.observe(anomaly);

  // Memory output generated from dwell time
  const memoryStage=$('[data-memory-stage]');
  const memoryEmpty=$('[data-memory-empty]');
  let memoryBuilt=false;
  const memObs=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting && !memoryBuilt){ buildMemory(); memoryBuilt=true; }
  }),{threshold:.1});
  if(memoryStage) memObs.observe(memoryStage);
  function buildMemory(){
    const ranked=[...dwell.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
    if(!ranked.length || ranked.every(x=>x[1]<300)){ if(memoryEmpty) memoryEmpty.style.display='block'; return; }
    if(memoryEmpty) memoryEmpty.style.display='none';
    ranked.forEach(([el],i)=>{
      const f=document.createElement('figure'); f.className='memory-card';
      const img=document.createElement('img'); img.src=el.dataset.src; img.alt=el.dataset.memory;
      const cap=document.createElement('figcaption'); cap.textContent=el.dataset.memory;
      f.append(img,cap); memoryStage.appendChild(f);
      f.addEventListener('click',()=>{ $('.flash')?.classList.remove('hit'); requestAnimationFrame(()=>$('.flash')?.classList.add('hit')); });
    });
  }

  // Petal engine
  const canvas=$('#petals');
  const ctx=canvas?.getContext('2d',{alpha:true});
  let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2),petalMode='normal';
  let petals=[];
  const palette=['#e15f92','#f0a6bd','#c64072','#ef7cab','#f3c0d0','#aa315f'];
  function resize(){
    if(!canvas||!ctx)return; W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
    canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
    const target=W<700?26:58; while(petals.length<target) petals.push(makePetal(false)); while(petals.length>target)petals.pop();
  }
  function makePetal(top=true){
    const s=6+Math.random()*18;
    return {x:Math.random()*W,y:top?-(20+Math.random()*H*.2):Math.random()*H,w:s,h:s*(1.05+Math.random()*.65),r:Math.random()*6.28,rs:(Math.random()-.5)*.035,v:.4+Math.random()*1.15,dx:(Math.random()-.5)*.4,z:.5+Math.random()*1.5,phase:Math.random()*6.28,alpha:.45+Math.random()*.5,c:palette[(Math.random()*palette.length)|0]};
  }
  function petalPath(p){
    ctx.beginPath(); ctx.moveTo(0,-p.h*.5);
    ctx.bezierCurveTo(p.w*.62,-p.h*.4,p.w*.55,p.h*.25,0,p.h*.48);
    ctx.bezierCurveTo(-p.w*.55,p.h*.25,-p.w*.62,-p.h*.4,0,-p.h*.5);ctx.closePath();
  }
  function drawPetal(p){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=p.alpha;
    petalPath(p); const g=ctx.createLinearGradient(-p.w*.4,-p.h*.4,p.w*.4,p.h*.5);g.addColorStop(0,'#ffd4df');g.addColorStop(.35,p.c);g.addColorStop(1,'#81264d');ctx.fillStyle=g;ctx.fill();ctx.restore();
  }
  function updatePetals(t){
    if(!ctx)return;ctx.clearRect(0,0,W,H);
    const anomalyOn=petalMode==='anomaly';
    petals.forEach((p,i)=>{
      const sway=Math.sin(t*.0012+p.phase)*.35;
      const gust=clamp(velocity*18,-2.5,2.5);
      p.x += (p.dx+sway+gust*.22)*p.z;
      p.y += (anomalyOn?-p.v*.12:p.v)*(anomalyOn?.35:1)*p.z;
      p.r += p.rs*(anomalyOn?.25:1);
      if(!anomalyOn && (p.y>H+35||p.x<-60||p.x>W+60)) petals[i]=makePetal(true);
      if(anomalyOn && p.y<-70) {p.y=H+40;p.x=Math.random()*W;}
      drawPetal(p);
    });
  }

  // Camera flash on evidence clicks
  evidenceCards.forEach(card=>card.addEventListener('click',()=>{
    const fl=$('.flash'); fl?.classList.remove('hit'); requestAnimationFrame(()=>fl?.classList.add('hit'));
  }));

  function frame(t){ updateGlobal(); updateCards(t); updatePetals(t); requestAnimationFrame(frame); }
  resize(); window.addEventListener('resize',resize,{passive:true}); requestAnimationFrame(frame);
})();