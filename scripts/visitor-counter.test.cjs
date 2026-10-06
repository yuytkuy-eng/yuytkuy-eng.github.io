const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/visitor-counter.js'), 'utf8');
const cacheKey = 'academic-unique-visitors:busuanzi-9420:https://yuytkuy-eng.github.io';
const oldCacheKey = 'academic-page-views:busuanzi-9420:https://yuytkuy-eng.github.io';
const identityKey = 'academic-visitor-identity:busuanzi-9420:https://yuytkuy-eng.github.io';
const success = (total, identity = null) => ({
  ok: true,
  headers: { get: (name) => name === 'Set-Bsz-Identity' ? identity : null },
  json: async () => ({ success: true, data: { site_uv: total, site_pv: total + 5000 } })
});
const settle = () => new Promise((resolve) => setImmediate(resolve));

function page(options = {}) {
  const counter = { dataset: { siteUrl: options.siteUrl || 'https://yuytkuy-eng.github.io' }, title: '' };
  const value = { textContent: '—' };
  const stored = options.stored || new Map(options.cached === undefined ? [] : [[cacheKey, options.cached]]);
  if (options.oldCached !== undefined) stored.set(oldCacheKey, options.oldCached);
  const timers = new Map();
  const events = {};
  const requests = [];
  let now = 0;
  let timerId = 0;
  const context = {
    URL, AbortController,
    document: {
      querySelector: () => options.missing ? null : counter,
      getElementById: (id) => options.missing || id !== 'busuanzi_value_site_uv' ? null : value
    },
    window: {
      location: { origin: options.origin || 'https://yuytkuy-eng.github.io', pathname: options.pathname || '/research/' },
      addEventListener: (event, handler) => { events[event] = handler; }
    },
    localStorage: {
      getItem: (key) => {
        if (options.storageBlocked) throw new Error('Storage blocked');
        return stored.has(key) ? stored.get(key) : null;
      },
      setItem: (key, item) => {
        if (options.storageBlocked) throw new Error('Storage blocked');
        stored.set(key, item);
      }
    },
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      timers.set(id, { callback, due: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    fetch: async (url, init) => {
      requests.push({ url, ...init });
      return options.fetch ? options.fetch(requests.length, init) : success(1234);
    }
  };
  vm.runInNewContext(source, context);
  return {
    counter, value, stored, requests, timers, events,
    runAgain() { vm.runInNewContext(source, context); },
    async nextTimer() {
      const [id, timer] = [...timers.entries()].sort((a, b) => a[1].due - b[1].due)[0];
      timers.delete(id);
      now = timer.due;
      timer.callback();
      await settle();
    }
  };
}

test('displays and caches unique visitors rather than page views; successful pages record once', async () => {
  const p = page();
  await settle();
  assert.equal(p.value.textContent, '1,234');
  assert.equal(p.counter.dataset.counterState, 'live');
  assert.equal(p.stored.get(cacheKey), '1234');
  assert.equal(p.requests[0].method, 'POST');
  assert.equal(p.requests[0].headers['x-bsz-referer'], 'https://yuytkuy-eng.github.io/research/');
  assert.equal(p.requests[0].credentials, 'omit');
  assert.equal(p.timers.size, 0);
  p.events.online();
  await settle();
  assert.equal(p.requests.length, 1);
});

test('an uncertain POST failure recovers with GET without recording another visit', async () => {
  const p = page({ fetch: async (attempt) => attempt === 1 ? { ok: false } : success(12) });
  await settle();
  assert.equal(p.counter.dataset.counterState, 'unavailable');
  await p.nextTimer();
  assert.deepEqual(p.requests.map((r) => r.method), ['POST', 'GET']);
  assert.equal(p.value.textContent, '12');
  assert.equal(p.timers.size, 0);
});

test('timeout aborts the original request and recovery still uses GET', async () => {
  const p = page({ fetch: (attempt, init) => attempt === 1
    ? new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('Aborted'))))
    : success(5) });
  await settle();
  await p.nextTimer();
  assert.equal(p.requests[0].signal.aborted, true);
  await p.nextTimer();
  assert.equal(p.value.textContent, '5');
  assert.deepEqual(p.requests.map((r) => r.method), ['POST', 'GET']);
});

test('network failure keeps the last real total and never increments cached data', async () => {
  const p = page({ cached: '42', fetch: async () => { throw new Error('Offline'); } });
  await settle();
  await p.nextTimer();
  await p.nextTimer();
  assert.equal(p.value.textContent, '42');
  assert.equal(p.counter.dataset.counterState, 'cached');
  assert.match(p.counter.title, /Last available/);
  assert.equal(p.stored.get(cacheKey), '42');
  assert.equal(p.timers.size, 0);
  assert.deepEqual(p.requests.map((r) => r.method), ['POST', 'GET', 'GET']);
});

test('without cached data failures stay unavailable, then recover when online', async () => {
  const p = page({ fetch: async (attempt) => {
    if (attempt <= 3) throw new Error('Offline');
    return success(8);
  } });
  await settle();
  await p.nextTimer();
  await p.nextTimer();
  assert.equal(p.value.textContent, '—');
  assert.equal(p.stored.size, 0);
  assert.equal(p.timers.size, 0);
  p.events.online();
  await settle();
  assert.equal(p.value.textContent, '8');
  assert.equal(p.requests[3].method, 'GET');
});

test('disabled browser storage does not break live counting', async () => {
  const p = page({ storageBlocked: true, fetch: async () => success(1234, 'visitor-token') });
  await settle();
  assert.equal(p.value.textContent, '1,234');
  assert.equal(p.counter.dataset.counterState, 'live');
  assert.equal(p.timers.size, 0);
});

test('malformed API data cannot replace a previously valid count', async () => {
  const p = page({ cached: '9', fetch: async (attempt) => attempt === 1
    ? success(-100)
    : attempt === 2 ? { ok: true, headers: { get: () => null }, json: async () => null } : success(10) });
  await settle();
  assert.equal(p.value.textContent, '9');
  await p.nextTimer();
  assert.equal(p.value.textContent, '9');
  await p.nextTimer();
  assert.equal(p.value.textContent, '10');
});

test('zero from the server is a valid total', async () => {
  const p = page({ fetch: async () => success(0), cached: 'not-json' });
  await settle();
  assert.equal(p.value.textContent, '0');
  assert.equal(p.counter.dataset.counterState, 'live');
});

test('refreshing and switching pages reuse the visitor identity and keep the same UV total', async () => {
  const first = page({ fetch: async () => success(25, 'visitor-token') });
  await settle();
  assert.equal(first.stored.get(identityKey), 'visitor-token');
  for (const pathname of ['/research/', '/publications/']) {
    const next = page({ stored: first.stored, pathname, fetch: async () => success(25) });
    await settle();
    assert.equal(next.value.textContent, '25');
    assert.equal(next.requests[0].headers.Authorization, 'Bearer visitor-token');
    assert.equal(next.requests[0].headers['x-bsz-referer'], 'https://yuytkuy-eng.github.io' + pathname);
  }
});

test('a renewed visitor identity replaces the old one for later requests', async () => {
  const p = page({ stored: new Map([[identityKey, 'old-token']]), fetch: async () => success(7, 'renewed-token') });
  await settle();
  assert.equal(p.requests[0].headers.Authorization, 'Bearer old-token');
  assert.equal(p.stored.get(identityKey), 'renewed-token');
});

test('a damaged UV cache does not discard a saved visitor identity', async () => {
  const p = page({ stored: new Map([[cacheKey, 'not-json'], [identityKey, 'visitor-token']]) });
  await settle();
  assert.equal(p.requests[0].headers.Authorization, 'Bearer visitor-token');
  assert.equal(p.value.textContent, '1,234');
});

test('the old page-view cache is never displayed as a unique-visitor count', async () => {
  const p = page({ oldCached: '99999', fetch: async () => { throw new Error('Offline'); } });
  await settle();
  assert.equal(p.value.textContent, '—');
  assert.equal(p.stored.has(cacheKey), false);
  assert.equal(p.stored.get(oldCacheKey), '99999');
});

test('evaluating the script twice while the first request is pending records only once', async () => {
  let respond;
  const p = page({ fetch: () => new Promise(resolve => { respond = resolve; }) });
  p.runAgain();
  await settle();
  assert.equal(p.requests.length, 1);
  respond(success(31));
  await settle();
  assert.equal(p.value.textContent, '31');
  assert.equal(p.timers.size, 0);
});

test('evaluating the script again after a failed POST does not submit another POST', async () => {
  const p = page({ fetch: async (attempt) => attempt === 1 ? { ok: false } : success(9) });
  await settle();
  p.runAgain();
  await p.nextTimer();
  assert.deepEqual(p.requests.map(r => r.method), ['POST', 'GET']);
  assert.equal(p.value.textContent, '9');
});

for (const siteUrl of ['http://localhost:4000', 'http://127.0.0.1:4173', 'http://[::1]:4173', 'https://preview.test']) {
  test('preview never records visits: ' + siteUrl, async () => {
    const p = page({ siteUrl, origin: new URL(siteUrl).origin });
    await settle();
    assert.equal(p.requests.length, 0);
  });
}

test('a different hosting origin never records visits', async () => {
  const p = page({ origin: 'https://preview.example.com' });
  await settle();
  assert.equal(p.requests.length, 0);
});

test('pages without a counter exit safely', async () => {
  const p = page({ missing: true });
  await settle();
  assert.equal(p.requests.length, 0);
});
