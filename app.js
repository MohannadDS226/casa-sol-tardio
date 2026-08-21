const loader = document.querySelector('[data-loader]');
const header = document.querySelector('[data-header]');
const gate = document.querySelector('[data-gate]');
const openGate = document.querySelector('[data-open-gate]');
const closeGate = document.querySelector('[data-close-gate]');
const gateForm = document.querySelector('[data-gate-form]');
const heroVideo = document.querySelector('.hero-video');

const hideLoader = () => {
  window.setTimeout(() => loader?.classList.add('is-hidden'), 350);
};

window.addEventListener('load', hideLoader, { once: true });
window.setTimeout(hideLoader, 2400);

heroVideo?.play().catch(() => {
  // The poster frame remains visible if autoplay is blocked.
});

const onScroll = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 32);
};
window.addEventListener('scroll', onScroll, { passive: true });
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
