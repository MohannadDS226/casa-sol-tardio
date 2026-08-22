(() => {
  const trigger = document.querySelector('.studio-door');
  const gate = document.querySelector('[data-studio-gate]');
  const close = document.querySelector('[data-studio-close]');
  const form = document.querySelector('[data-studio-form]');
  const input = gate?.querySelector('input');
  const note = gate?.querySelector('[data-studio-note]');

  if (!trigger || !gate) return;

  trigger.addEventListener('click', () => {
    if (typeof gate.showModal === 'function') {
      gate.showModal();
      requestAnimationFrame(() => input?.focus({ preventScroll: true }));
    }
  });

  close?.addEventListener('click', () => gate.close());

  gate.addEventListener('click', (event) => {
    if (event.target === gate) gate.close();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input?.value.trim()) {
      if (note) note.textContent = 'Enter an access key.';
      input?.focus();
      return;
    }
    if (note) note.textContent = 'Access key received. Private room connection pending.';
  });
})();
