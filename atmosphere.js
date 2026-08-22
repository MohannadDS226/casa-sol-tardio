(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shell = document.createElement('div');
  shell.id = 'casa-atmosphere';
  shell.setAttribute('aria-hidden', 'true');
  shell.innerHTML = '<div class="casa-atmo-haze"></div><div class="casa-atmo-glow"></div><div class="casa-atmo-cursor"></div><canvas></canvas><div class="casa-atmo-vignette"></div>';
  document.body.appendChild(shell);

  const canvas = shell.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const root = document.documentElement;

  const moods = {
    hero:     { density: .62, fall: .72, wind: .05, sway: .54, alpha: .82, palette: ['#f5bfd1','#ed8fb1','#df6b98','#f8cfdb'] },
    story:    { density: .38, fall: .54, wind: .02, sway: .35, alpha: .62, palette: ['#f4c7d5','#eaa1ba','#d9799e','#f7d6df'] },
    stills:   { density: 1.00, fall: .88, wind: .10, sway: .95, alpha: .96, palette: ['#f7bfd2','#ed84aa','#dc5b8d','#f4a8c1','#cf477e'] },
    night:    { density: .74, fall: .48, wind: .14, sway: .62, alpha: .72, palette: ['#bd7f9d','#9b668c','#d59ab5','#7d5679'] },
    eclipse:  { density: .46, fall: .10, wind: -.02, sway: .08, alpha: .58, palette: ['#b58a9d','#8c6f83','#d3a9b6','#6f596d'] },
    film:     { density: .48, fall: .44, wind: .03, sway: .34, alpha: .68, palette: ['#edafc3','#d989a8','#f3c5d3','#cf739a'] },
    bts:      { density: .82, fall: .90, wind: .24, sway: 1.18, alpha: .88, palette: ['#ef9db8','#d96391','#f2bfd0','#c95082'] },
    magazine: { density: .30, fall: .30, wind: .01, sway: .18, alpha: .54, palette: ['#efc4d0','#dda6b8','#f6d8df','#c98a9f'] },
    credits:  { density: .44, fall: -.18, wind: .02, sway: .30, alpha: .60, palette: ['#efb7c8','#d98aa6','#f4d0da','#c57595'] },
    default:  { density: .55, fall: .62, wind: .06, sway: .50, alpha: .72, palette: ['#efafc2','#dd799c','#f3c7d4','#c95f8b'] }
  };

  let width = innerWidth;
  let height = innerHeight;
  let dpr = Math.min(devicePixelRatio || 1, 2);
  let mood = 'hero';
  let previousMood = mood;
  let pointerX = width * .5;
  let pointerY = height * .5;
  let smoothPointerX = pointerX;
  let smoothPointerY = pointerY;
  let pointerActive = false;
  let hoverAttractor = null;
  let scrollVelocity = 0;
  let lastScrollY = scrollY;
  let lastScrollTime = performance.now();
  let wind = 0;
  let gust = 0;
  let eclipseIntensity = 0;
  let running = true;
  let petals = [];
  let burstPetals = [];

  const isMobile = () => innerWidth < 760;
  const maxBase = () => isMobile() ? 34 : 76;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const random = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function resize() {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncCount(true);
  }

  function currentConfig() {
    return moods[mood] || moods.default;
  }

  function targetCount() {
    return Math.max(8, Math.round(maxBase() * currentConfig().density));
  }

  function makePetal(spawnEdge = true) {
    const z = random(.35, 1.7);
    const base = random(7, 19) * z;
    const reverse = currentConfig().fall < 0;
    const y = spawnEdge
      ? (reverse ? random(height + 10, height + 100) : random(-120, -12))
      : random(-height * .05, height * 1.05);

    return {
      x: random(-width * .06, width * 1.06),
      y,
      vx: random(-.18, .18),
      vy: random(.35, 1.10),
      z,
      w: base * random(.62, 1.0),
      h: base * random(1.05, 1.48),
      rot: random(0, Math.PI * 2),
      rotSpeed: random(-.018, .018),
      flip: random(0, Math.PI * 2),
      flipSpeed: random(.018, .052),
      sway: random(0, Math.PI * 2),
      swaySpeed: random(.004, .012),
      alpha: random(.42, .96),
      blur: z > 1.35 ? random(.4, 1.5) : z < .55 ? random(.2, .8) : 0,
      tintBias: Math.random(),
      life: 1,
      burst: false
    };
  }

  function makeBurst(x, y, amount = 20) {
    const cfg = currentConfig();
    for (let i = 0; i < amount; i += 1) {
      const p = makePetal(false);
      const angle = random(0, Math.PI * 2);
      const speed = random(1.2, 5.8);
      p.x = x + random(-18, 18);
      p.y = y + random(-18, 18);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - random(.2, 1.6);
      p.rotSpeed *= 3;
      p.w *= random(.8, 1.35);
      p.h *= random(.8, 1.35);
      p.alpha = random(.6, 1);
      p.burst = true;
      p.life = 1;
      p.palette = pick(cfg.palette);
      burstPetals.push(p);
    }
  }

  function syncCount(force = false) {
    const target = targetCount();
    if (force && petals.length === 0) {
      while (petals.length < target) petals.push(makePetal(false));
      return;
    }
    while (petals.length < target) petals.push(makePetal(true));
    while (petals.length > target) petals.pop();
  }

  function petalPath(w, h) {
    ctx.beginPath();
    ctx.moveTo(0, -h * .52);
    ctx.bezierCurveTo(w * .62, -h * .42, w * .64, h * .18, 0, h * .50);
    ctx.bezierCurveTo(-w * .56, h * .24, -w * .66, -h * .38, 0, -h * .52);
    ctx.closePath();
  }

  function drawPetal(p, cfg, index) {
    const palette = p.palette ? [p.palette] : cfg.palette;
    const tint = palette[Math.floor((p.tintBias || .5) * palette.length) % palette.length];
    const flipScale = Math.max(.10, Math.abs(Math.cos(p.flip)));

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(flipScale, 1);
    if (p.blur > .05) ctx.filter = `blur(${p.blur}px)`;

    const depthFade = clamp(.42 + p.z * .42, .45, 1);
    ctx.globalAlpha = p.alpha * cfg.alpha * depthFade * p.life;
    ctx.shadowColor = 'rgba(109,35,65,.15)';
    ctx.shadowBlur = p.z > 1.15 ? 7 : 2;

    const g = ctx.createLinearGradient(-p.w * .35, -p.h * .45, p.w * .4, p.h * .5);
    g.addColorStop(0, 'rgba(255,239,245,.98)');
    g.addColorStop(.28, tint);
    g.addColorStop(1, 'rgba(135,38,78,.92)');

    petalPath(p.w, p.h);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.globalAlpha *= .18;
    ctx.strokeStyle = '#fff7fa';
    ctx.lineWidth = .55;
    ctx.beginPath();
    ctx.moveTo(0, -p.h * .30);
    ctx.quadraticCurveTo(p.w * .06, 0, 0, p.h * .36);
    ctx.stroke();

    if (Math.abs(scrollVelocity) > .018 && index % 7 === 0) {
      ctx.globalAlpha *= .18;
      ctx.translate(-p.vx * 5, -Math.sign(p.vy || 1) * 9);
      petalPath(p.w, p.h);
      ctx.fillStyle = tint;
      ctx.fill();
    }
    ctx.restore();
  }

  function updateMood() {
    const center = height * .50;
    const stills = document.querySelector('#stills');
    const nightIntro = document.querySelector('.gallery-night-intro');
    const finale = document.querySelector('.shot-finale');

    eclipseIntensity = 0;
    if (finale) {
      const r = finale.getBoundingClientRect();
      const c = r.top + r.height * .5;
      eclipseIntensity = clamp(1 - Math.abs(c - center) / (height * .78));
      if (eclipseIntensity > .40) mood = 'eclipse';
    }

    if (mood !== 'eclipse' && stills) {
      const sr = stills.getBoundingClientRect();
      if (sr.top < center && sr.bottom > center) {
        mood = 'stills';
        if (nightIntro) {
          const nr = nightIntro.getBoundingClientRect();
          if (nr.top < height * .58) mood = 'night';
        }
      } else {
        const candidates = [
          ['hero', document.querySelector('[data-hero]')],
          ['story', document.querySelector('#story')],
          ['film', document.querySelector('#film')],
          ['bts', document.querySelector('#bts')],
          ['magazine', document.querySelector('#magazine')],
          ['credits', document.querySelector('#credits')]
        ];
        let best = ['default', Infinity];
        candidates.forEach(([name, el]) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top <= center && r.bottom >= center) best = [name, 0];
          else {
            const d = Math.min(Math.abs(r.top - center), Math.abs(r.bottom - center));
            if (d < best[1]) best = [name, d];
          }
        });
        mood = best[0];
      }
    }

    if (mood !== previousMood) {
      previousMood = mood;
      document.body.dataset.casaMood = mood;
      syncCount();
      if (mood === 'bts') gust += .75;
      if (mood === 'eclipse') makeBurst(width * .5, height * .18, isMobile() ? 6 : 10);
    }

    shell.style.setProperty('--casa-eclipse', eclipseIntensity.toFixed(3));
    root.style.setProperty('--casa-eclipse', eclipseIntensity.toFixed(3));
  }

  function updateScroll(now) {
    const y = scrollY;
    const dy = y - lastScrollY;
    const dt = Math.max(16, now - lastScrollTime);
    const raw = dy / dt;
    scrollVelocity = lerp(scrollVelocity, raw, .16);
    lastScrollY = y;
    lastScrollTime = now;
    gust = lerp(gust, clamp(Math.abs(scrollVelocity) * 13, 0, 1.5), .08);
    shell.style.setProperty('--casa-gust', gust.toFixed(3));
  }

  function updatePointer() {
    smoothPointerX = lerp(smoothPointerX, pointerX, .08);
    smoothPointerY = lerp(smoothPointerY, pointerY, .08);
    shell.style.setProperty('--casa-pointer-x', `${smoothPointerX}px`);
    shell.style.setProperty('--casa-pointer-y', `${smoothPointerY}px`);
    shell.style.setProperty('--casa-light-x', `${(smoothPointerX / Math.max(width, 1) * 100).toFixed(1)}%`);
    shell.style.setProperty('--casa-light-y', `${(smoothPointerY / Math.max(height, 1) * 100).toFixed(1)}%`);
  }

  function applyForces(p, cfg, now, index) {
    const sway = Math.sin(now * p.swaySpeed + p.sway) * cfg.sway;
    let targetVy = p.vy * cfg.fall * (.55 + p.z * .55);
    let targetVx = cfg.wind * 1.7 + sway * .15 + scrollVelocity * 11;

    if (mood === 'eclipse') {
      const e = eclipseIntensity;
      if (e > .45) targetVy *= (1 - e * 1.4);
      if (e > .72) targetVy = -Math.abs(targetVy) * (e - .68) * 2.3;
      targetVx *= .18;
    }

    if (mood === 'credits') targetVy = -Math.abs(targetVy) * .7;
    if (mood === 'bts') targetVx += Math.sin(now * .002 + index) * .34;

    targetVx += Math.sign(scrollVelocity || 1) * gust * (.18 + p.z * .15);

    if (pointerActive) {
      const dx = p.x - smoothPointerX;
      const dy = p.y - smoothPointerY;
      const d2 = dx * dx + dy * dy;
      const radius = 170 * 170;
      if (d2 < radius && d2 > 1) {
        const force = (1 - d2 / radius) * .42;
        const inv = 1 / Math.sqrt(d2);
        targetVx += dx * inv * force;
        targetVy += dy * inv * force * .45;
      }
    }

    if (hoverAttractor && mood !== 'eclipse') {
      const dx = hoverAttractor.x - p.x;
      const dy = hoverAttractor.y - p.y;
      const dist = Math.max(80, Math.hypot(dx, dy));
      const force = Math.min(.018, 1.4 / dist);
      targetVx += dx * force * .022;
      targetVy += dy * force * .010;
    }

    p.x += targetVx;
    p.y += targetVy;
    p.rot += p.rotSpeed * (1 + gust * .8);
    p.flip += p.flipSpeed * (1 + gust * .55);
  }

  function recycle(p) {
    const reverse = currentConfig().fall < 0 || (mood === 'eclipse' && eclipseIntensity > .72);
    if (!reverse && (p.y > height + 130 || p.x < -180 || p.x > width + 180)) return makePetal(true);
    if (reverse && (p.y < -140 || p.x < -180 || p.x > width + 180)) {
      const n = makePetal(true);
      n.y = random(height + 20, height + 120);
      return n;
    }
    return p;
  }

  function animate(now) {
    if (!running) return;
    updateMood();
    updateScroll(now);
    updatePointer();
    syncCount();

    ctx.clearRect(0, 0, width, height);
    const cfg = currentConfig();

    for (let i = 0; i < petals.length; i += 1) {
      const p = petals[i];
      applyForces(p, cfg, now, i);
      drawPetal(p, cfg, i);
      petals[i] = recycle(p);
    }

    for (let i = burstPetals.length - 1; i >= 0; i -= 1) {
      const p = burstPetals[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .025;
      p.vx *= .992;
      p.rot += p.rotSpeed;
      p.flip += p.flipSpeed;
      p.life -= .009;
      drawPetal(p, cfg, i);
      if (p.life <= 0 || p.y > height + 160 || p.x < -160 || p.x > width + 160) burstPetals.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }

  document.body.dataset.casaMood = mood;

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointerActive = false; }, { passive: true });

  document.querySelectorAll('.gallery-shot').forEach(shot => {
    shot.addEventListener('pointerenter', () => {
      const r = shot.getBoundingClientRect();
      hoverAttractor = { x: r.left + r.width * .5, y: r.top + r.height * .5 };
    });
    shot.addEventListener('pointerleave', () => { hoverAttractor = null; });
    shot.addEventListener('click', event => {
      makeBurst(event.clientX || width * .5, event.clientY || height * .5, isMobile() ? 10 : 22);
    });
  });

  document.querySelector('.hero-logo-reveal')?.addEventListener('pointerenter', () => {
    makeBurst(width * .5, height * .42, isMobile() ? 8 : 14);
  });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduceMotion) requestAnimationFrame(animate);
  });

  const lightboxObserver = new MutationObserver(() => {
    shell.classList.toggle('is-lightbox', document.body.classList.contains('has-lightbox'));
  });
  lightboxObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  resize();
  if (!reduceMotion) requestAnimationFrame(animate);
})();