(function () {
  'use strict';
  const menu = document.querySelector('.menu-button');
  const links = document.querySelector('.academic-menu');
  const toggle = document.querySelector('.theme-button');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  function setTheme(dark) {
    document.documentElement.toggleAttribute('data-theme', dark);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    document.getElementById('theme-icon').className = 'fa-solid ' + (dark ? 'fa-moon' : 'fa-sun');
    document.dispatchEvent(new CustomEvent('academic-theme-change'));
  }
  let preference;
  try { preference = localStorage.getItem('academic-theme'); } catch (error) {}
  setTheme(preference ? preference === 'dark' : systemTheme.matches);
  toggle.addEventListener('click', function () {
    const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
    setTheme(dark);
    try { localStorage.setItem('academic-theme', dark ? 'dark' : 'light'); } catch (error) {}
  });
  systemTheme.addEventListener('change', function (event) {
    let stored;
    try { stored = localStorage.getItem('academic-theme'); } catch (error) {}
    if (!stored) setTheme(event.matches);
  });
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open'); }
  menu.addEventListener('click', function () {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  document.addEventListener('click', function (event) { if (!event.target.closest('.academic-nav')) closeMenu(); });
  links.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
})();
