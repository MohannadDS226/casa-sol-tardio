const progress = document.querySelector('.progress span');
const reveals = document.querySelectorAll('.reveal');

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

document.querySelector('.film-placeholder').addEventListener('click', () => {
  const note = document.querySelector('.film-note');
  note.textContent = 'Final film will premiere here';
  setTimeout(() => { note.textContent = 'Film placeholder · final master to be added'; }, 2200);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


const lightboxItems = [...document.querySelectorAll('.media-placeholder.has-image img')];
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

  lightboxItems.forEach((image, index) => {
    const trigger = image.closest('.media-placeholder');
    trigger.tabIndex = 0;
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', `View full screen: ${image.alt}`);
    trigger.addEventListener('click', () => openLightbox(index, trigger));
    trigger.addEventListener('keydown', (event) => {
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
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });
}
