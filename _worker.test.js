import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './_worker.js';

const landingAssets = {
  fetch: async (req) => new Response(`LANDING:${new URL(req.url).pathname}`, { status: 200 }),
};

function withMockedUpstream(handler, body) {
  return async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = handler;
    try {
      return await body();
    } finally {
      globalThis.fetch = realFetch;
    }
  };
}

test('serves landing assets for /', async () => {
  const res = await worker.fetch(new Request('https://pietech.net/'), { ASSETS: landingAssets });
  assert.equal(await res.text(), 'LANDING:/');
});

test('serves landing assets for nested non-routed paths', async () => {
  const res = await worker.fetch(new Request('https://pietech.net/about'), { ASSETS: landingAssets });
  assert.equal(await res.text(), 'LANDING:/about');
});

test('forwards /world-names/ to upstream, stripping the prefix', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(new Request('https://pietech.net/world-names/'), { ASSETS: landingAssets });
    assert.equal(await res.text(), 'UPSTREAM:/');
  },
));

test('forwards /world-names (no trailing slash) to upstream root', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(new Request('https://pietech.net/world-names'), { ASSETS: landingAssets });
    assert.equal(await res.text(), 'UPSTREAM:/');
  },
));

test('forwards nested /world-names paths preserving the suffix', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(
      new Request('https://pietech.net/world-names/assets/index-abc.js'),
      { ASSETS: landingAssets },
    );
    assert.equal(await res.text(), 'UPSTREAM:/assets/index-abc.js');
  },
));

test('preserves query strings when forwarding', withMockedUpstream(
  async (req) => new Response(`UPSTREAM:${new URL(req.url).pathname}${new URL(req.url).search}`, { status: 200 }),
  async () => {
    const res = await worker.fetch(
      new Request('https://pietech.net/world-names/foo?bar=1&baz=2'),
      { ASSETS: landingAssets },
    );
    assert.equal(await res.text(), 'UPSTREAM:/foo?bar=1&baz=2');
  },
));

test('does NOT forward similarly-prefixed paths like /world-names-not-a-thing', async () => {
  const res = await worker.fetch(
    new Request('https://pietech.net/world-names-not-a-thing'),
    { ASSETS: landingAssets },
  );
  assert.equal(await res.text(), 'LANDING:/world-names-not-a-thing');
});
