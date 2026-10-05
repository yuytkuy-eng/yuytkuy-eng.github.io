(function () {
  'use strict';
  const counter = document.querySelector('.footer-counter');
  const value = document.getElementById('busuanzi_value_site_pv');
  if (!counter || !value) return;

  // Count only on the configured public site, never on a local or staging preview.
  let site;
  try { site = new URL(counter.dataset.siteUrl); } catch (error) { return; }
  const host = site.hostname;
  const previewHost = !host.includes('.') || host.includes(':') || /^[\d.]+$/.test(host) || /(^|\.)localhost$|\.local$|\.test$/.test(host);
  if (previewHost || window.location.origin !== site.origin) {
    counter.title = 'Counting starts when the site is live.';
    return;
  }

  counter.title = 'Loading total page views…';
  let timeout;
  const observer = new MutationObserver(function () {
    const total = value.textContent.trim();
    if (!/^\d+$/.test(total)) return;
    observer.disconnect();
    clearTimeout(timeout);
    value.textContent = Number(total).toLocaleString('en-US');
    counter.title = 'Cumulative page views across this website, powered by Busuanzi.';
  });
  observer.observe(value, { childList: true, characterData: true, subtree: true });

  function unavailable() {
    clearTimeout(timeout);
    value.textContent = '—';
    counter.title = 'Page views are temporarily unavailable.';
  }

  const script = document.createElement('script');
  script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  script.async = true;
  script.onerror = unavailable;
  timeout = setTimeout(unavailable, 8000);
  document.head.appendChild(script);
})();
