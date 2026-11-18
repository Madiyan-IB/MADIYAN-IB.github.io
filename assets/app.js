/* Progressive enhancement: the CV, projects and navigation work without a framework. */
(() => {
  'use strict';
  // Only load a portrait when the site owner explicitly supplies its local path.
  const portraitImg = document.getElementById('profile-image');
  const photoPath = window.PORTFOLIO_CONFIG?.profilePhoto;
  if (portraitImg && typeof photoPath === 'string' && /^assets\/[a-z0-9_\-/.]+\.(jpe?g|png|webp)$/i.test(photoPath) && !photoPath.includes('..')) {
    const photo = new Image();
    photo.onload = () => {
      portraitImg.src = photo.src;
      portraitImg.alt = 'Portrait of Madiyan Imran';
      portraitImg.closest('.profile-portrait')?.classList.add('has-photo');
    };
    photo.src = photoPath;
  }
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function syncTheme() {
    const dark = root.dataset.theme !== 'light';
    if (themeButton) {
      const label = `Switch to ${dark ? 'light' : 'dark'} theme`;
      themeButton.setAttribute('aria-label', label);
      themeButton.title = label;
    }
    if (themeMeta) themeMeta.content = dark ? '#0c1018' : '#fafbfe';
  }
  syncTheme();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('mi-portfolio-theme', root.dataset.theme); } catch (_) {}
    syncTheme();
  });

  const menu = document.getElementById('site-nav');
  const menuButton = document.getElementById('menu-toggle');
  function closeMenu(returnFocus = false) {
    if (!menu || !menuButton) return;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    if (returnFocus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (menu?.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width:701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Links are deliberately optional. Never substitute a guessed profile or repository.
  const config = window.PORTFOLIO_CONFIG || {};
  function safeURL(value, requiredHost = '') {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      if (requiredHost && url.hostname !== requiredHost) return null;
      if (requiredHost && (!url.pathname || url.pathname === '/')) return null;
      return url.href;
    } catch (_) { return null; }
  }
  const githubURL = safeURL(config.githubUrl, 'github.com');
  if (githubURL) document.querySelectorAll('[data-github-link]').forEach(a => {
    a.href = githubURL;
    a.hidden = false;
  });
  document.querySelectorAll('[data-project-links]').forEach(container => {
    const project = config.projects?.[container.dataset.projectLinks];
    if (!project) return;
    [['repositoryUrl', 'View source code'], ['demoUrl', 'View live demo']].forEach(([key, label]) => {
      const href = safeURL(project[key], key === 'repositoryUrl' ? 'github.com' : '');
      if (!href) return;
      const a = document.createElement('a');
      a.className = 'button button-outline button-small';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `${label} ↗`;
      container.append(a);
    });
  });

  const toast = document.querySelector('.toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }
  document.querySelector('.copy-email')?.addEventListener('click', async () => {
    const email = 'madiyanimranb@outlook.com';
    let copied = false;
    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        copied = true;
      }
    } catch (_) {}
    if (!copied) {
      // Fallback also supports opening the standalone HTML locally.
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.cssText = 'position:fixed;top:0;left:-9999px';
      textarea.setAttribute('aria-hidden', 'true');
      document.body.append(textarea);
      textarea.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      textarea.remove();
      document.querySelector('.copy-email')?.focus({ preventScroll: true });
    }
    notify(copied ? 'Email address copied.' : 'Copy this address: ' + email);
  });

  const sectionLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = sectionLinks.map(link => document.getElementById(link.dataset.nav)).filter(Boolean);
  let ticking = false;
  function markSection() {
    let current = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 180) current = section.id;
    }
    const contact = document.getElementById('contact');
    if (contact && contact.getBoundingClientRect().top <= 180) current = '';
    sectionLinks.forEach(a => {
      const active = a.dataset.nav === current;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(markSection); }
  }, { passive: true });
  markSection();
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
