(function () {
  'use strict';
  const counter = document.querySelector('.footer-counter');
  const value = document.getElementById('busuanzi_value_site_uv');
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

  // Re-evaluating the script while a request is pending must not record twice.
  if (counter.dataset.counterInitialized === 'true') return;
  counter.dataset.counterInitialized = 'true';

  // The original JSONP service is unavailable. Use the maintained Busuanzi API:
  // https://github.com/soxft/busuanzi/wiki/API
  const endpoint = 'https://busuanzi.9420.ltd/api';
  // Keep UV separate from the old PV cache; those totals have different meanings.
  const cacheKey = 'academic-unique-visitors:busuanzi-9420:' + site.origin;
  const identityKey = 'academic-visitor-identity:busuanzi-9420:' + site.origin;
  const retryDelays = [2000, 6000];
  let lastTotal = null;
  let identity = null;
  let countAttempted = false;
  let inFlight = false;
  let retries = 0;
  let retryTimer;

  function validTotal(total) {
    return Number.isSafeInteger(total) && total >= 0;
  }

  function showTotal(total, cached) {
    value.textContent = total.toLocaleString('en-US');
    counter.dataset.counterState = cached ? 'cached' : 'live';
    counter.title = cached
      ? 'Last available unique visitor count. Waiting for the statistics service.'
      : 'Estimated unique visitors across this website, powered by Busuanzi.';
  }

  // A cache is only a previously returned server total; never increment it locally.
  // Storage may be disabled, so it must not prevent a real statistics request.
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored !== null) {
      const total = JSON.parse(stored);
      if (validTotal(total)) lastTotal = total;
    }
  } catch (error) {}
  try {
    const storedIdentity = localStorage.getItem(identityKey);
    if (typeof storedIdentity === 'string' && storedIdentity) identity = storedIdentity;
  } catch (error) {}

  if (lastTotal !== null) {
    showTotal(lastTotal, true);
  } else {
    counter.dataset.counterState = 'loading';
    counter.title = 'Loading unique visitors…';
  }

  async function update() {
    if (inFlight || counter.dataset.counterState === 'live') return;
    inFlight = true;
    const controller = new AbortController();
    const timeout = setTimeout(function () { controller.abort(); }, 10000);

    // POST records this page load once. A failed response may still have recorded
    // the visit, so recovery uses read-only GET requests to avoid double counting.
    const method = countAttempted ? 'GET' : 'POST';
    countAttempted = true;
    try {
      const headers = { 'x-bsz-referer': site.origin + window.location.pathname };
      if (identity) headers.Authorization = 'Bearer ' + identity;
      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Statistics request failed');
      const newIdentity = response.headers.get('Set-Bsz-Identity');
      if (newIdentity) {
        identity = newIdentity;
        try { localStorage.setItem(identityKey, identity); } catch (error) {}
      }
      const result = await response.json();
      const total = result && result.data && result.data.site_uv;
      if (!result || result.success !== true || !validTotal(total)) {
        throw new Error('Invalid statistics response');
      }
      lastTotal = total;
      showTotal(total, false);
      clearTimeout(retryTimer);
      try { localStorage.setItem(cacheKey, JSON.stringify(total)); } catch (error) {}
    } catch (error) {
      if (lastTotal !== null) {
        showTotal(lastTotal, true);
      } else {
        value.textContent = '—';
        counter.dataset.counterState = 'unavailable';
        counter.title = 'Visitor statistics are temporarily unavailable. Retrying when possible.';
      }
      if (retries < retryDelays.length) {
        retryTimer = setTimeout(update, retryDelays[retries++]);
      }
    } finally {
      clearTimeout(timeout);
      inFlight = false;
    }
  }

  window.addEventListener('online', function () {
    clearTimeout(retryTimer);
    retries = 0;
    update();
  });
  update();
})();
