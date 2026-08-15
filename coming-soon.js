(() => {
  const video = document.querySelector('.hero-video');
  const loader = document.querySelector('.poster-loader');
  const poster = document.querySelector('.poster-sheet');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tryPlay = () => {
    if (!video || reduceMotion) return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (video) {
    if (reduceMotion) {
      video.pause();
    } else if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else tryPlay();
    });
  }

  if (!loader) return;

  let seen = false;
  try {
    seen = sessionStorage.getItem('casaSolPosterIntroSeen') === '1';
  } catch (_) {}

  const dismissLoader = (delay = 0) => {
    window.setTimeout(() => {
      loader.classList.add('is-leaving');
      window.setTimeout(() => loader.remove(), 850);
    }, delay);
  };

  if (seen) {
    loader.remove();
    return;
  }

  try {
    sessionStorage.setItem('casaSolPosterIntroSeen', '1');
  } catch (_) {}

  const startIntro = () => {
    if (reduceMotion) dismissLoader(1150);
    else dismissLoader(3150);
  };

  if (poster && !poster.complete) {
    let started = false;
    const startOnce = () => {
      if (started) return;
      started = true;
      startIntro();
    };
    poster.addEventListener('load', startOnce, { once: true });
    poster.addEventListener('error', startOnce, { once: true });
    window.setTimeout(startOnce, 1800);
  } else {
    startIntro();
  }
})();
