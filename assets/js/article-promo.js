// Article promo card: shows 1 random service, revealed after scrolling
// past a percentage of the page, hidden again near the article footer.
(function() {
  const container = document.getElementById('article-promo');
  if (!container) return;

  const items = Array.from(container.querySelectorAll('.js-promo-item'));
  if (items.length === 0) return;

  const STORAGE_KEY = 'article-promo-dismissed';
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Pick one service at random and reveal only that one.
  // Note: uses the Tailwind `hidden` class rather than the `hidden` HTML
  // attribute, because Tailwind's `.block` utility (same specificity, but
  // an author style) would otherwise beat the UA's `[hidden]` rule and
  // keep the element visible.
  const chosen = items[Math.floor(Math.random() * items.length)];
  chosen.classList.remove('hidden');

  const REVEAL_THRESHOLD = 0.25;
  let revealed = false;
  let footerVisible = false;

  const applyVisibility = () => {
    const shouldShow = revealed && !footerVisible;
    container.classList.toggle('opacity-0', !shouldShow);
    container.classList.toggle('translate-y-4', !shouldShow);
    container.classList.toggle('pointer-events-none', !shouldShow);
  };

  const checkScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (progress >= REVEAL_THRESHOLD) {
      revealed = true;
      applyVisibility();
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      checkScrollProgress();
      ticking = false;
    });
  }, { passive: true });

  // Cover the case of a reload mid-scroll or a direct anchor link.
  checkScrollProgress();

  const footerEl = document.getElementById('article-footer');
  if (footerEl && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        footerVisible = entry.isIntersecting;
        applyVisibility();
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    observer.observe(footerEl);
  }

  const dismissBtn = container.querySelector('.js-promo-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, '1');
      container.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    });
  }
})();
