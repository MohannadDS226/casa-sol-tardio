(() => {
  const media = document.querySelector('.hero-image-wrap');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (!media || reduceMotion || !finePointer) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('pointermove', (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 10;
    targetY = (event.clientY / window.innerHeight - 0.5) * 7;
  }, { passive: true });

  const tick = () => {
    currentX += (targetX - currentX) * 0.045;
    currentY += (targetY - currentY) * 0.045;
    media.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.035)`;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
})();
