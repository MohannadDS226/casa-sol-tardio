const loader = document.querySelector('[data-loader]');
const header = document.querySelector('[data-header]');
const hero = document.querySelector('[data-hero]');
const gate = document.querySelector('[data-gate]');
const openGate = document.querySelector('[data-open-gate]');
const closeGate = document.querySelector('[data-close-gate]');
const gateForm = document.querySelector('[data-gate-form]');
const heroVideo = document.querySelector('.hero-video');

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

const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 32);

  if (hero) {
    const height = Math.max(hero.offsetHeight, 1);
    const progress = Math.min(Math.max(y / height, 0), 1);
    hero.style.setProperty('--hero-progress', progress.toFixed(3));
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
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
