const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.section-heading, .section-copy, .portrait-placeholder, .service-card, .step, .contact-banner > *'
  );

  revealTargets.forEach((element) => element.classList.add('reveal-on-scroll'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

// Avanço sereno pelas setas, sem encaixe automático no fim da animação.
let sectionScrollFrame = 0;
let restoreScrollStyles = null;
const cancelSectionScroll = () => {
  if (sectionScrollFrame) cancelAnimationFrame(sectionScrollFrame);
  sectionScrollFrame = 0;
  restoreScrollStyles?.();
  restoreScrollStyles = null;
};
['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((eventName) => {
  window.addEventListener(eventName, cancelSectionScroll, { passive: true });
});

document.querySelectorAll('.section-next').forEach((link) => {
  link.addEventListener('click', (event) => {
    const destination = document.querySelector(link.getAttribute('href'));
    if (!destination) return;
    event.preventDefault();
    cancelSectionScroll();
    history.pushState(null, '', link.getAttribute('href'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }

    const root = document.documentElement;
    const originalScrollBehavior = root.style.scrollBehavior;
    const originalSnapType = root.style.scrollSnapType;
    root.style.scrollBehavior = 'auto';
    root.style.scrollSnapType = 'none';
    restoreScrollStyles = () => {
      root.style.scrollBehavior = originalScrollBehavior;
      root.style.scrollSnapType = originalSnapType;
    };

    const headerHeight = document.querySelector('.site-header')?.offsetHeight ?? 0;
    const startY = window.scrollY;
    const endY = Math.max(0, destination.getBoundingClientRect().top + startY - headerHeight);
    const distance = endY - startY;
    const duration = Math.max(1350, Math.min(1900, Math.abs(distance) * 0.8));
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        sectionScrollFrame = requestAnimationFrame(animate);
      } else {
        sectionScrollFrame = 0;
        restoreScrollStyles?.();
        restoreScrollStyles = null;
      }
    };
    sectionScrollFrame = requestAnimationFrame(animate);
  });
});