(() => {
  const video = document.querySelector('.hero-video');
  const loader = document.querySelector('.poster-loader');
  const poster = document.querySelector('.poster-sheet');
  const posterRoll = document.querySelector('.poster-roll');
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

  let windFrame = 0;
  let windStart = 0;

  const stopWind = () => {
    if (windFrame) cancelAnimationFrame(windFrame);
    windFrame = 0;
  };

  const startWind = () => {
    if (!posterRoll || reduceMotion) return;

    posterRoll.style.animation = 'none';
    windStart = performance.now();

    const tick = (now) => {
      const t = (now - windStart) / 1000;
      const decay = Math.exp(-t * .8);
      const gust = Math.sin(t * 5.1) * .75 + Math.sin(t * 8.4 + .8) * .28;
      const slow = Math.sin(t * 2.1 + .3);

      const yaw = (gust * 1.45 + slow * .45) * decay;
      const pitch = (Math.sin(t * 4.2 + 1.1) * .72) * decay;
      const roll = (Math.sin(t * 3.4) * .28) * decay;
      const shift = (Math.sin(t * 3.1 + .6) * 3.2) * decay;

      posterRoll.style.setProperty('--wind-x', `${yaw.toFixed(3)}deg`);
      posterRoll.style.setProperty('--wind-y', `${pitch.toFixed(3)}deg`);
      posterRoll.style.setProperty('--wind-z', `${roll.toFixed(3)}deg`);
      posterRoll.style.setProperty('--wind-shift', `${shift.toFixed(2)}px`);

      if (loader.isConnected && t < 1.55) {
        windFrame = requestAnimationFrame(tick);
      }
    };

    windFrame = requestAnimationFrame(tick);
  };

  const dismissLoader = (delay = 0) => {
    window.setTimeout(() => {
      stopWind();
      loader.classList.add('is-leaving');
      window.setTimeout(() => loader.remove(), 1050);
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
    if (reduceMotion) {
      dismissLoader(1250);
      return;
    }

    if (posterRoll) {
      const onSettle = (event) => {
        if (event.animationName !== 'poster-body-settle') return;
        posterRoll.removeEventListener('animationend', onSettle);
        startWind();
      };
      posterRoll.addEventListener('animationend', onSettle);
      window.setTimeout(startWind, 3225);
    }

    dismissLoader(4650);
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
    window.setTimeout(startOnce, 1600);
  } else {
    startIntro();
  }
})();
