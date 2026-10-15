(() => {
  'use strict';
  const image = document.querySelector('.chapter--intro .human-journey');
  if (!image || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    image.classList.toggle('is-visible', entries[0].isIntersecting);
  }, { threshold: .05 });
  observer.observe(image);
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
})();
