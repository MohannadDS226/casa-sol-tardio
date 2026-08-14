const loader = document.querySelector('[data-loader]');
const header = document.querySelector('[data-header]');
const gate = document.querySelector('[data-gate]');
const openGate = document.querySelector('[data-open-gate]');
const closeGate = document.querySelector('[data-close-gate]');
const gateForm = document.querySelector('[data-gate-form]');

window.addEventListener('load', () => {
  window.setTimeout(() => loader?.classList.add('is-hidden'), 500);
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
  if (note) note.textContent = 'Private pitch authentication and villa-gate transition will be connected before launch.';
});
