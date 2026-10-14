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

// Uma abertura ou recarga direta começa no topo, mesmo se o navegador restauraria
// a posição anterior. A navegação voltar/avançar mantém o comportamento esperado.
const sectionIds = ['inicio', 'sobre', 'servicos', 'como-funciona', 'contato'];
const navigationType = performance.getEntriesByType('navigation')[0]?.type;
if (navigationType !== 'back_forward') {
  window.history.scrollRestoration = 'manual';
  if (sectionIds.includes(window.location.hash.slice(1))) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
  window.scrollTo(0, 0);
}

// Avança pelas setas sem gravar a seção no endereço, com duração moderada.
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      destination.scrollIntoView({ block: 'start', behavior: 'auto' });
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
    const duration = Math.max(800, Math.min(1100, Math.abs(distance) * 0.55));
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
