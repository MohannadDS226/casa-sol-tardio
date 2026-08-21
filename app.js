const loader = document.querySelector('[data-loader]');
const header = document.querySelector('[data-header]');
const hero = document.querySelector('[data-hero]');
const gate = document.querySelector('[data-gate]');
const openGate = document.querySelector('[data-open-gate]');
const closeGate = document.querySelector('[data-close-gate]');
const gateForm = document.querySelector('[data-gate-form]');
const heroVideo = document.querySelector('.hero-video');
const motionSections = [...document.querySelectorAll('[data-motion-section]')];

let readyShown = false;

const revealSite = () => {
  if (readyShown) return;
  readyShown = true;
  loader?.classList.add('is-hidden');
  document.body.classList.add('is-ready');
};

window.addEventListener('load', () => {
  window.setTimeout(revealSite, 320);
}, { once: true });

window.setTimeout(revealSite, 2400);

heroVideo?.play().catch(() => {
  // The poster frame remains visible if autoplay is blocked.
});

const wrapWords = (element) => {
  if (!element || element.dataset.wordsReady === 'true') return;

  const words = element.textContent.trim().split(/\s+/);
  element.textContent = '';

  words.forEach((word, index) => {
    const mask = document.createElement('span');
    mask.className = 'word-reveal';

    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.setProperty('--word-index', index);

    mask.appendChild(inner);
    element.appendChild(mask);
  });

  element.dataset.wordsReady = 'true';
};

document.querySelectorAll('[data-word-reveal]').forEach(wrapWords);

const revealTargets = document.querySelectorAll('[data-word-reveal], [data-meta-reveal], [data-copy-reveal], [data-image-reveal]');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -6% 0px'
  });

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}

const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 32);

  if (hero) {
    const height = Math.max(hero.offsetHeight, 1);
    const progress = Math.min(Math.max(y / height, 0), 1);
    hero.style.setProperty('--hero-progress', progress.toFixed(3));
  }

  motionSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const travel = rect.height + viewport;
    const progress = Math.min(Math.max((viewport - rect.top) / travel, 0), 1);
    const ghost = section.querySelector('[data-ghost-word]');

    if (ghost) {
      const direction = ghost.classList.contains('ghost-word-right') ? -1 : 1;
      const shift = (progress - .5) * 120 * direction;
      ghost.style.setProperty('--ghost-shift', `${shift.toFixed(1)}px`);
    }
  });
};

let scrollTicking = false;
const requestScrollUpdate = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    onScroll();
    scrollTicking = false;
  });
};

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
onScroll();

openGate?.addEventListener('click', () => {
  if (typeof gate?.showModal === 'function') gate.showModal();
});

closeGate?.addEventListener('click', () => gate?.close());

gate?.addEventListener('click', (event) => {
  const rect = gate.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) gate.close();
});

gateForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const note = gateForm.querySelector('.gate-note');
  if (note) note.textContent = 'The private villa-door experience will open from this gate.';
});

/* -------------------------------------------------------------------------- */
/* Cinematic render viewer                                                     */
/* -------------------------------------------------------------------------- */

const ensureLightboxStyles = () => {
  if (document.querySelector('link[data-casa-lightbox-styles]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'lightbox.css';
  link.dataset.casaLightboxStyles = 'true';
  document.head.appendChild(link);
};

const buildLightbox = () => {
  const viewer = document.createElement('div');
  viewer.className = 'casa-lightbox';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Casa Sol Tardío render viewer');
  viewer.setAttribute('aria-hidden', 'true');

  viewer.innerHTML = `
    <button class="casa-lightbox-close" type="button" aria-label="Close render viewer"></button>
    <button class="casa-lightbox-nav casa-lightbox-prev" type="button" aria-label="Previous render">‹</button>
    <div class="casa-lightbox-stage">
      <img class="casa-lightbox-image" alt="" decoding="async" />
    </div>
    <button class="casa-lightbox-nav casa-lightbox-next" type="button" aria-label="Next render">›</button>
    <div class="casa-lightbox-meta">
      <div class="casa-lightbox-copy">
        <p class="casa-lightbox-kicker"></p>
        <p class="casa-lightbox-title"></p>
      </div>
      <p class="casa-lightbox-count"></p>
    </div>
  `;

  document.body.appendChild(viewer);
  return viewer;
};

const initRenderLightbox = () => {
  const shots = [...document.querySelectorAll('#stills .gallery-shot')];
  if (!shots.length) return;

  ensureLightboxStyles();

  const items = shots.map((shot, index) => {
    const image = shot.querySelector('.shot-media img');
    const camera = shot.querySelector('figcaption span')?.textContent.trim() || '';
    const title = shot.querySelector('figcaption strong')?.textContent.trim() || image?.alt || `Render ${index + 1}`;
    const category = shot.querySelector('figcaption em')?.textContent.trim() || '';

    shot.dataset.lightboxReady = 'true';
    shot.dataset.lightboxIndex = String(index);
    shot.tabIndex = 0;
    shot.setAttribute('role', 'button');
    shot.setAttribute('aria-label', `View ${title} fullscreen`);

    return {
      shot,
      image,
      src: image?.currentSrc || image?.src || '',
      alt: image?.alt || title,
      camera,
      title,
      category
    };
  }).filter((item) => item.image && item.src);

  if (!items.length) return;

  const viewer = buildLightbox();
  const stage = viewer.querySelector('.casa-lightbox-stage');
  const viewerImage = viewer.querySelector('.casa-lightbox-image');
  const kicker = viewer.querySelector('.casa-lightbox-kicker');
  const title = viewer.querySelector('.casa-lightbox-title');
  const count = viewer.querySelector('.casa-lightbox-count');
  const closeButton = viewer.querySelector('.casa-lightbox-close');
  const prevButton = viewer.querySelector('.casa-lightbox-prev');
  const nextButton = viewer.querySelector('.casa-lightbox-next');

  let currentIndex = 0;
  let previousFocus = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isAnimating = false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const normalizeIndex = (index) => (index + items.length) % items.length;

  const preloadNeighbors = (index) => {
    [index - 1, index + 1].forEach((candidate) => {
      const item = items[normalizeIndex(candidate)];
      if (!item?.src) return;
      const preload = new Image();
      preload.src = item.src;
    });
  };

  const updateMeta = (item, index) => {
    kicker.textContent = [item.camera, item.category].filter(Boolean).join(' · ');
    title.textContent = item.title;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };

  const loadViewerImage = async (item) => {
    viewerImage.src = item.src;
    viewerImage.alt = item.alt;

    try {
      if (viewerImage.decode) await viewerImage.decode();
    } catch (_) {
      // A rendered image can still be shown even when decode() rejects.
    }
  };

  const animateFromShot = async (item) => {
    if (prefersReducedMotion || !item.image?.animate) {
      viewer.classList.add('is-settled');
      return;
    }

    const sourceRect = item.image.getBoundingClientRect();
    const targetRect = viewerImage.getBoundingClientRect();
    if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) {
      viewer.classList.add('is-settled');
      return;
    }

    const clone = item.image.cloneNode(true);
    clone.removeAttribute('loading');
    clone.className = 'casa-lightbox-clone';
    Object.assign(clone.style, {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      borderRadius: '0px'
    });
    document.body.appendChild(clone);

    const animation = clone.animate([
      {
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        opacity: 1
      },
      {
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        opacity: 1
      }
    ], {
      duration: 520,
      easing: 'cubic-bezier(.2,.7,.2,1)',
      fill: 'forwards'
    });

    try {
      await animation.finished;
    } catch (_) {
      // Ignore cancelled animations.
    }

    viewer.classList.add('is-settled');
    clone.remove();
  };

  const openViewer = async (index) => {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = normalizeIndex(index);
    const item = items[currentIndex];

    previousFocus = document.activeElement;
    viewer.classList.remove('is-settled', 'is-switching');
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-lightbox');

    updateMeta(item, currentIndex);
    await loadViewerImage(item);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await animateFromShot(item);
    preloadNeighbors(currentIndex);
    closeButton.focus({ preventScroll: true });
    isAnimating = false;
  };

  const switchTo = async (index) => {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = normalizeIndex(index);
    const item = items[currentIndex];

    viewer.classList.add('is-switching');
    viewer.classList.remove('is-settled');
    updateMeta(item, currentIndex);

    await new Promise((resolve) => window.setTimeout(resolve, prefersReducedMotion ? 0 : 130));
    await loadViewerImage(item);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    viewer.classList.remove('is-switching');
    viewer.classList.add('is-settled');
    preloadNeighbors(currentIndex);
    isAnimating = false;
  };

  const animateBackToShot = async (item) => {
    if (prefersReducedMotion || !viewerImage.animate || !item.image) return;

    const targetRect = item.image.getBoundingClientRect();
    const sourceRect = viewerImage.getBoundingClientRect();
    const isTargetNearViewport = targetRect.bottom > -120 && targetRect.top < window.innerHeight + 120;
    if (!isTargetNearViewport || !sourceRect.width || !targetRect.width) return;

    const clone = viewerImage.cloneNode(true);
    clone.className = 'casa-lightbox-clone';
    Object.assign(clone.style, {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`
    });
    document.body.appendChild(clone);
    viewerImage.style.opacity = '0';

    const animation = clone.animate([
      {
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        opacity: 1
      },
      {
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        opacity: .96
      }
    ], {
      duration: 440,
      easing: 'cubic-bezier(.2,.7,.2,1)',
      fill: 'forwards'
    });

    try {
      await animation.finished;
    } catch (_) {
      // Ignore cancelled animations.
    }

    clone.remove();
    viewerImage.style.opacity = '';
  };

  const closeViewer = async () => {
    if (!viewer.classList.contains('is-open') || isAnimating) return;
    isAnimating = true;
    const item = items[currentIndex];

    viewer.classList.remove('is-settled');
    await animateBackToShot(item);

    viewer.classList.remove('is-open', 'is-switching');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-lightbox');
    viewerImage.removeAttribute('src');

    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    isAnimating = false;
  };

  shots.forEach((shot) => {
    const activate = () => {
      const index = Number(shot.dataset.lightboxIndex);
      if (Number.isFinite(index)) openViewer(index);
    };

    shot.addEventListener('click', activate);
    shot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });

  closeButton.addEventListener('click', closeViewer);
  prevButton.addEventListener('click', () => switchTo(currentIndex - 1));
  nextButton.addEventListener('click', () => switchTo(currentIndex + 1));

  stage.addEventListener('click', (event) => {
    if (event.target === stage) closeViewer();
  });

  document.addEventListener('keydown', (event) => {
    if (!viewer.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeViewer();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      switchTo(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      switchTo(currentIndex + 1);
    } else if (event.key === 'Tab') {
      const focusable = [closeButton, prevButton, nextButton];
      const current = focusable.indexOf(document.activeElement);
      if (event.shiftKey && current <= 0) {
        event.preventDefault();
        nextButton.focus();
      } else if (!event.shiftKey && current === focusable.length - 1) {
        event.preventDefault();
        closeButton.focus();
      }
    }
  });

  viewer.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  viewer.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) switchTo(currentIndex + 1);
    else switchTo(currentIndex - 1);
  }, { passive: true });
};

initRenderLightbox();
