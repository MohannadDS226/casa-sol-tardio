const progress = document.querySelector('.progress span');
const reveals = document.querySelectorAll('.reveal');

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
let menuReturnFocus = null;

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuReturnFocus = open ? document.activeElement : menuReturnFocus;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
  if (!open) menuReturnFocus?.focus?.({ preventScroll: true });
}

menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

reveals.forEach((element) => revealObserver.observe(element));

const typeTargets = document.querySelectorAll('h1, h2, .quote-band p');
typeTargets.forEach((target) => {
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);
  }
  let wordIndex = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const mask = document.createElement('span');
      const inner = document.createElement('span');
      mask.className = 'word-mask';
      inner.className = 'word-inner';
      inner.style.transitionDelay = `${Math.min(wordIndex * 55, 440)}ms`;
      inner.textContent = part;
      mask.appendChild(inner);
      fragment.appendChild(mask);
      wordIndex += 1;
    });
    node.replaceWith(fragment);
  });
});

const typeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('type-visible');
    typeObserver.unobserve(entry.target);
  });
}, { threshold: 0.18 });
typeTargets.forEach((target) => typeObserver.observe(target));

const locationSection = document.querySelector('.location-section');
const locationObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  locationSection.classList.add('active');
  locationObserver.disconnect();
}, { threshold: 0.22 });
locationObserver.observe(locationSection);

const metrics = document.querySelector('.house-metrics');
const counters = metrics.querySelectorAll('[data-count]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(element, delay) {
  const finalValue = Number(element.dataset.count);
  if (reducedMotion) {
    element.textContent = finalValue.toLocaleString('en-US');
    return;
  }
  setTimeout(() => {
    const duration = 1550;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(finalValue * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, delay);
}

const metricsObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  metrics.classList.add('active');
  counters.forEach((counter, index) => animateCounter(counter, index * 110));
  metricsObserver.disconnect();
}, { threshold: 0.35 });
metricsObserver.observe(metrics);

const mediaCursor = document.querySelector('.media-cursor');
if (matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.media-placeholder').forEach((media) => {
    media.addEventListener('pointerenter', () => mediaCursor.classList.add('active'));
    media.addEventListener('pointerleave', () => mediaCursor.classList.remove('active'));
  });
  addEventListener('pointermove', (event) => {
    mediaCursor.style.setProperty('--cursor-x', `${event.clientX}px`);
    mediaCursor.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? scrollY / max : 0;
  progress.style.transform = `scaleX(${value})`;
}

addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const casaFilm = document.querySelector('#casa-film');
const filmPlayButton = document.querySelector('.film-play-button');
const filmPlayerShell = document.querySelector('.film-player-shell');
const filmAmbilight = document.querySelector('.film-ambilight');
const filmAmbilightContext = filmAmbilight?.getContext('2d', { alpha: false, desynchronized: true });
let filmAmbilightFrame;
let filmVideoFrame;

function queueFilmAmbilightFrame() {
  if (!casaFilm || casaFilm.paused || casaFilm.ended) return;
  if ('requestVideoFrameCallback' in casaFilm) {
    filmVideoFrame = casaFilm.requestVideoFrameCallback(renderFilmAmbilight);
  } else {
    filmAmbilightFrame = requestAnimationFrame(renderFilmAmbilight);
  }
}

function renderFilmAmbilight() {
  if (!casaFilm || !filmAmbilightContext || casaFilm.readyState < 2) {
    queueFilmAmbilightFrame();
    return;
  }

  try {
    filmAmbilightContext.drawImage(casaFilm, 0, 0, filmAmbilight.width, filmAmbilight.height);
    filmPlayerShell?.classList.add('is-reacting');
  } catch (error) {
    filmPlayerShell?.classList.remove('is-reacting');
    return;
  }
  queueFilmAmbilightFrame();
}

function stopFilmAmbilight(dim = true) {
  cancelAnimationFrame(filmAmbilightFrame);
  if (filmVideoFrame && casaFilm?.cancelVideoFrameCallback) casaFilm.cancelVideoFrameCallback(filmVideoFrame);
  filmAmbilightFrame = undefined;
  filmVideoFrame = undefined;
  if (dim) filmPlayerShell?.classList.remove('is-reacting');
}

function startFilmAmbilight() {
  if (!filmAmbilightContext) return;
  stopFilmAmbilight(false);
  queueFilmAmbilightFrame();
}

filmPlayButton?.addEventListener('click', async () => {
  try {
    await casaFilm.play();
  } catch (error) {
    casaFilm.controls = true;
  }
});

casaFilm?.addEventListener('play', () => {
  filmPlayButton?.classList.add('is-hidden');
  startFilmAmbilight();
});

casaFilm?.addEventListener('pause', () => stopFilmAmbilight());

casaFilm?.addEventListener('ended', () => {
  filmPlayButton?.classList.remove('is-hidden');
  stopFilmAmbilight();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


const lightboxTriggers = [...document.querySelectorAll('.media-placeholder.has-image img')];
const lightboxCandidates = [
  ...document.querySelectorAll('.collection-set:not(.gallery-clone) .collection-card img'),
  ...document.querySelectorAll('.media-placeholder.has-image:not(.collection-card) img')
];
const lightboxItems = [];
const lightboxIndexBySource = new Map();
lightboxCandidates.forEach((image) => {
  const sourceKey = new URL(image.getAttribute('src'), document.baseURI).pathname;
  if (lightboxIndexBySource.has(sourceKey)) return;
  lightboxIndexBySource.set(sourceKey, lightboxItems.length);
  lightboxItems.push(image);
});
if (lightboxItems.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image viewer');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close image viewer">Close <span>×</span></button>
    <button class="lightbox-arrow lightbox-prev" type="button" aria-label="Previous image">←</button>
    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>
    <button class="lightbox-arrow lightbox-next" type="button" aria-label="Next image">→</button>
    <span class="lightbox-count" aria-live="polite"></span>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('figure img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const lightboxCount = lightbox.querySelector('.lightbox-count');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let activeIndex = 0;
  let returnFocus = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function showImage(index) {
    activeIndex = (index + lightboxItems.length) % lightboxItems.length;
    const source = lightboxItems[activeIndex];
    const authoredCaption = source.closest('figure')?.querySelector(':scope > figcaption')?.textContent.trim();
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightboxCaption.textContent = authoredCaption || source.alt;
    lightboxCount.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(lightboxItems.length).padStart(2, '0')}`;
  }

  function openLightbox(index, trigger) {
    returnFocus = trigger;
    showImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    mediaCursor?.classList.remove('active');
    requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    returnFocus?.focus?.({ preventScroll: true });
  }

  lightboxTriggers.forEach((image) => {
    const sourceKey = new URL(image.getAttribute('src'), document.baseURI).pathname;
    const index = lightboxIndexBySource.get(sourceKey);
    const trigger = image.closest('.media-placeholder');
    const isClone = Boolean(image.closest('.gallery-clone'));
    const authoredAlt = lightboxItems[index]?.alt || `Casa Sol Tardío frame ${index + 1}`;
    if (!isClone) {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-label', `View full screen: ${authoredAlt}`);
    }
    trigger.addEventListener('click', () => openLightbox(index, trigger));
    if (!isClone) trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index, trigger);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    showImage(activeIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });
}

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  if (document.hidden) casaSoundtrack?.pause();
  else if (soundEnabled && flipbookReader && !flipbookReader.hidden) startReaderAudio();
});

document.querySelectorAll('.media-placeholder.has-image img').forEach((image) => {
  image.addEventListener('error', () => image.closest('.media-placeholder')?.classList.add('image-failed'));
});

const flipbookReader = document.querySelector('.flipbook-reader');
const flipbookOpen = document.querySelector('[data-flipbook-open]');
const flipbookClose = document.querySelector('[data-flipbook-close]');
const flipbookFullscreen = document.querySelector('[data-flipbook-fullscreen]');
const flipbookSound = document.querySelector('[data-flipbook-sound]');
const flipbookSoundState = flipbookSound?.querySelector('.sound-state');
const flipbookPrev = document.querySelector('[data-flipbook-prev]');
const flipbookNext = document.querySelector('[data-flipbook-next]');
const flipbookRange = document.querySelector('[data-flipbook-range]');
const flipbookCount = document.querySelector('.flipbook-page-count');
const flipbookBook = document.querySelector('#issue-flipbook');
const casaSoundtrack = document.querySelector('#casa-soundtrack');
const soundtrackSegments = Array.from({ length: 8 }, (_, index) =>
  `assets/audio/casa-track-${String(index).padStart(2, '0')}.mp3`
);
const flipbookPages = Array.from({ length: 32 }, (_, index) =>
  `assets/issue-pages/page-${String(index + 1).padStart(2, '0')}.webp`
);
let flipbook = null;
let flipbookReturnFocus = null;
let soundEnabled = true;
let audioContext = null;
let pageTurnBuffer = null;
let lastPageTurnSound = 0;
let pageTurnSoundActive = false;
let backCoverClosingActive = false;
let musicFadeFrame = null;
let soundtrackSegment = 0;
let nextSoundtrackPreload = null;

function setSoundtrackSegment(index) {
  if (!casaSoundtrack) return;
  soundtrackSegment = (index + soundtrackSegments.length) % soundtrackSegments.length;
  casaSoundtrack.src = soundtrackSegments[soundtrackSegment];
  casaSoundtrack.load();
  nextSoundtrackPreload = new Audio();
  nextSoundtrackPreload.preload = 'auto';
  nextSoundtrackPreload.src = soundtrackSegments[(soundtrackSegment + 1) % soundtrackSegments.length];
}

function ensureAudioEngine() {
  if (audioContext) return audioContext;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext = new AudioContext();
  const duration = .48;
  const length = Math.floor(audioContext.sampleRate * duration);
  pageTurnBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const channel = pageTurnBuffer.getChannelData(0);
  let smoothed = 0;
  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    smoothed = smoothed * .58 + (Math.random() * 2 - 1) * .42;
    channel[index] = smoothed * Math.sin(Math.PI * progress) * (1 - progress * .32);
  }
  return audioContext;
}

function playPageTurnSound() {
  if (!soundEnabled) return;
  const now = performance.now();
  if (now - lastPageTurnSound < 320) return;
  lastPageTurnSound = now;
  const context = ensureAudioEngine();
  if (!context || !pageTurnBuffer) return;
  context.resume?.();
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = pageTurnBuffer;
  source.playbackRate.value = .9 + Math.random() * .16;
  filter.type = 'bandpass';
  filter.Q.value = .72;
  filter.frequency.setValueAtTime(1750, context.currentTime);
  filter.frequency.exponentialRampToValueAtTime(620, context.currentTime + .46);
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.11, context.currentTime + .035);
  gain.gain.exponentialRampToValueAtTime(.035, context.currentTime + .27);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .48);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
}

function fadeSoundtrack(target, duration = 500, pauseAfter = false) {
  if (!casaSoundtrack) return;
  cancelAnimationFrame(musicFadeFrame);
  const from = casaSoundtrack.volume;
  const started = performance.now();
  function frame(now) {
    const progress = Math.min(1, (now - started) / duration);
    casaSoundtrack.volume = from + (target - from) * (1 - Math.pow(1 - progress, 3));
    if (progress < 1) musicFadeFrame = requestAnimationFrame(frame);
    else if (pauseAfter) casaSoundtrack.pause();
  }
  musicFadeFrame = requestAnimationFrame(frame);
}

async function startReaderAudio() {
  if (!soundEnabled || !casaSoundtrack) return;
  const context = ensureAudioEngine();
  context?.resume?.();
  if (!casaSoundtrack.getAttribute('src')) setSoundtrackSegment(soundtrackSegment);
  casaSoundtrack.volume = 0;
  try {
    await casaSoundtrack.play();
    fadeSoundtrack(.13, 900);
  } catch {
    soundEnabled = false;
    updateSoundControl();
  }
}

function stopReaderAudio() {
  if (!casaSoundtrack || casaSoundtrack.paused) return;
  fadeSoundtrack(0, 320, true);
}

function updateSoundControl() {
  flipbookSound?.setAttribute('aria-pressed', String(soundEnabled));
  if (flipbookSoundState) flipbookSoundState.textContent = soundEnabled ? 'On' : 'Off';
}

casaSoundtrack?.addEventListener('ended', async () => {
  if (!soundEnabled || !flipbookReader || flipbookReader.hidden) return;
  setSoundtrackSegment(soundtrackSegment + 1);
  casaSoundtrack.volume = .13;
  try { await casaSoundtrack.play(); } catch { /* Sound control remains available. */ }
});

function updateClosedCoverState(pageIndex = 0) {
  const page = Math.min(32, Math.max(1, pageIndex + 1));
  const isLandscape = flipbook?.getOrientation?.() === 'landscape';
  flipbookBook?.classList.toggle('is-closed-front', isLandscape && page === 1);
  flipbookBook?.classList.toggle('is-closed-back', isLandscape && page === 32);
}

function updateFlipbookStatus(pageIndex = 0) {
  const page = Math.min(32, Math.max(1, pageIndex + 1));
  if (flipbookRange) flipbookRange.value = String(page);
  if (flipbookCount) {
    flipbookCount.textContent = page === 1
      ? 'Cover · 01 / 32'
      : `Page ${String(page).padStart(2, '0')} / 32`;
  }
  if (flipbookPrev) flipbookPrev.disabled = page <= 1;
  if (flipbookNext) flipbookNext.disabled = page >= 32;
}

function initFlipbook() {
  if (flipbook || !flipbookBook || !window.St?.PageFlip) return;
  const readerMaxHeight = Math.min(874, Math.max(430, window.innerHeight - 190));
  const readerMaxWidth = Math.min(650, Math.round(readerMaxHeight * 576 / 774));
  flipbook = new window.St.PageFlip(flipbookBook, {
    width: 576,
    height: 774,
    size: 'stretch',
    minWidth: 270,
    maxWidth: readerMaxWidth,
    minHeight: 363,
    maxHeight: readerMaxHeight,
    maxShadowOpacity: 0.38,
    showCover: true,
    mobileScrollSupport: false,
    swipeDistance: 26,
    flippingTime: 880,
    usePortrait: true,
    autoSize: true,
    drawShadow: true,
    showPageCorners: true
  });
  flipbook.loadFromImages(flipbookPages);
  flipbook.on('flip', (event) => updateFlipbookStatus(Number(event.data)));
  flipbook.on('init', (event) => {
    const pageIndex = Number(event.data.page || 0);
    updateFlipbookStatus(pageIndex);
    updateClosedCoverState(pageIndex);
  });
  flipbook.on('changeOrientation', () => {
    const pageIndex = flipbook.getCurrentPageIndex();
    updateFlipbookStatus(pageIndex);
    updateClosedCoverState(pageIndex);
  });
  flipbook.on('changeState', (event) => {
    if (event.data === 'flipping' || event.data === 'user_fold') {
      flipbookBook.classList.remove('is-closed-front', 'is-closed-back');
      const render = flipbook.getRender();
      backCoverClosingActive = flipbook.getCurrentPageIndex() === 29 && render.getDirection() === 0;
      if (backCoverClosingActive) {
        render.setLeftPage(null);
        render.setRightPage(null);
      }
      if (!pageTurnSoundActive) {
        pageTurnSoundActive = true;
        playPageTurnSound();
      }
    } else if (event.data === 'read') {
      pageTurnSoundActive = false;
      const pageIndex = flipbook.getCurrentPageIndex();
      if (backCoverClosingActive) {
        flipbook.turnToPage(pageIndex);
        backCoverClosingActive = false;
      }
      updateFlipbookStatus(pageIndex);
      updateClosedCoverState(pageIndex);
    }
  });
}

function openFlipbook(trigger) {
  if (!flipbookReader) return;
  flipbookReturnFocus = trigger;
  flipbookReader.hidden = false;
  flipbookReader.setAttribute('aria-hidden', 'false');
  document.body.classList.add('flipbook-open');
  startReaderAudio();
  requestAnimationFrame(() => {
    initFlipbook();
    flipbook?.update();
    flipbookClose?.focus({ preventScroll: true });
  });
}

function closeFlipbook() {
  if (!flipbookReader || flipbookReader.hidden) return;
  if (document.fullscreenElement) document.exitFullscreen?.();
  flipbookReader.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('flipbook-open');
  stopReaderAudio();
  flipbookReader.hidden = true;
  flipbookReturnFocus?.focus?.({ preventScroll: true });
}

flipbookOpen?.addEventListener('click', () => openFlipbook(flipbookOpen));
flipbookClose?.addEventListener('click', closeFlipbook);
flipbookSound?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  updateSoundControl();
  if (soundEnabled) startReaderAudio();
  else stopReaderAudio();
});
flipbookPrev?.addEventListener('click', () => flipbook?.flipPrev('top'));
flipbookNext?.addEventListener('click', () => flipbook?.flipNext('top'));
flipbookRange?.addEventListener('input', () => flipbook?.turnToPage(Number(flipbookRange.value) - 1));
flipbookFullscreen?.addEventListener('click', async () => {
  if (!flipbookReader) return;
  if (document.fullscreenElement) await document.exitFullscreen?.();
  else await flipbookReader.requestFullscreen?.();
});
document.addEventListener('fullscreenchange', () => {
  if (!flipbookFullscreen) return;
  flipbookFullscreen.firstChild.textContent = document.fullscreenElement ? 'Exit full screen ' : 'Full screen ';
  requestAnimationFrame(() => flipbook?.update());
});
flipbookReader?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.fullscreenElement) closeFlipbook();
  if (event.key === 'ArrowLeft') flipbook?.flipPrev('top');
  if (event.key === 'ArrowRight') flipbook?.flipNext('top');
});

const completeCollection = document.querySelector('.complete-collection');
if (completeCollection && !reducedMotion) {
  let collectionResumeTimer;
  completeCollection.addEventListener('touchstart', () => {
    completeCollection.classList.add('is-paused');
    clearTimeout(collectionResumeTimer);
    collectionResumeTimer = setTimeout(() => completeCollection.classList.remove('is-paused'), 3200);
  }, { passive: true });
}


const siennaInterlude = document.querySelector('.sienna-interlude');
if (siennaInterlude && !reducedMotion) {
  function updateSiennaParallax() {
    const rect = siennaInterlude.getBoundingClientRect();
    const travel = innerHeight + rect.height;
    const position = Math.max(0, Math.min(1, (innerHeight - rect.top) / travel));
    const y = 0;
    const tilt = .35 - position * .7;
    siennaInterlude.style.setProperty('--sienna-y', `${y}vh`);
    siennaInterlude.style.setProperty('--sienna-tilt', `${tilt}deg`);
  }
  addEventListener('scroll', updateSiennaParallax, { passive: true });
  addEventListener('resize', updateSiennaParallax, { passive: true });
  updateSiennaParallax();
}


const siteLoader = document.querySelector('.site-loader');
const loaderStartedAt = performance.now();
let loaderReleased = false;

function releaseSiteLoader() {
  if (loaderReleased) return;
  loaderReleased = true;
  document.documentElement.classList.remove('loading');
  document.documentElement.classList.add('site-ready');
  if (!siteLoader) return;
  siteLoader.classList.add('is-leaving');
  window.setTimeout(() => siteLoader.remove(), 980);
}

function scheduleSiteReveal() {
  const minimumDisplay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 1320;
  window.setTimeout(releaseSiteLoader, Math.max(0, minimumDisplay - (performance.now() - loaderStartedAt)));
}

if (document.readyState === 'complete') scheduleSiteReveal();
else window.addEventListener('load', scheduleSiteReveal, { once: true });
window.setTimeout(releaseSiteLoader, 3200);
