import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './_worker.js';

const WORLD_NAMES_ORIGIN = 'https://world-names-98k.pages.dev';

function withMockedUpstream(handler, body) {
  return async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      // Verify the worker is actually targeting the configured upstream.
      assert.ok(url.startsWith(WORLD_NAMES_ORIGIN), `expected upstream ${WORLD_NAMES_ORIGIN}, got ${url}`);
      return handler(input, init);
    };
    try {
      return await body();
    } finally {
      globalThis.fetch = realFetch;
    }
  };
}

for (const host of ['pietech.net', 'www.pietech.net']) {
  for (const path of ['/', '/about', '/w277-unknown?from=old', '/world-names-not-a-thing', '/style.css']) {
    test(`301 redirects ${host}${path} to Jacob’s homepage`, async () => {
      const res = await worker.fetch(new Request(`https://${host}${path}`));
      assert.equal(res.status, 301);
      assert.equal(res.headers.get('Location'), 'https://www.jacoblasky.com/');
    });
  }
}

test('forwards /world-names/ to upstream, stripping the prefix', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(new Request('https://pietech.net/world-names/'));
    assert.equal(await res.text(), 'UPSTREAM:/');
  },
));

test('forwards /world-names (no trailing slash) to upstream root', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(new Request('https://pietech.net/world-names'));
    assert.equal(await res.text(), 'UPSTREAM:/');
  },
));

test('forwards nested /world-names paths preserving the suffix', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(
      new Request('https://pietech.net/world-names/assets/index-abc.js'),
    );
    assert.equal(await res.text(), 'UPSTREAM:/assets/index-abc.js');
  },
));

test('preserves query strings when forwarding', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}${new URL(req.url).search}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(
      new Request('https://pietech.net/world-names/foo?bar=1&baz=2'),
    );
    assert.equal(await res.text(), 'UPSTREAM:/foo?bar=1&baz=2');
  },
));

test('keeps double-slash suffixes on the sibling origin', withMockedUpstream(
  async (req) => new Response(new URL(req.url).href),
  async () => {
    const res = await worker.fetch(new Request('https://pietech.net/world-names//example.com/asset.js'));
    assert.equal(await res.text(), `${WORLD_NAMES_ORIGIN}//example.com/asset.js`);
  },
));

test('proxies sibling requests on www and preserves method, headers, body, and response status', withMockedUpstream(
  async (req) => {
    assert.equal(req.method, 'POST');
    assert.equal(req.headers.get('Content-Type'), 'text/plain');
    assert.equal(await req.text(), 'sample');
    return new Response('upstream response', { status: 202, headers: { 'X-Upstream': 'world-names' } });
  },
  async () => {
    const res = await worker.fetch(new Request('https://www.pietech.net/world-names/api', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'sample',
    }));
    assert.equal(res.status, 202);
    assert.equal(res.headers.get('X-Upstream'), 'world-names');
    assert.equal(await res.text(), 'upstream response');
  },
));
