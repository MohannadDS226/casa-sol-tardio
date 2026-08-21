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
