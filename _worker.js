/**
 * Cloudflare Pages Function — fronts every request to pietech.net.
 *
 * Routes /world-names/* to the world-names Pages project, everything else to
 * the static assets of this (landing) project. Without this _worker.js, Pages
 * would auto-serve the landing only, and there'd be no way to mount sibling
 * projects under the same domain.
 *
 * DO NOT remove env.ASSETS.fetch — once _worker.js is present, Pages stops
 * auto-serving static files; the worker must call ASSETS explicitly.
 */

// The Pages project name "world-names" was taken globally on the *.pages.dev
// namespace, so the project deploys to world-names-98k.pages.dev. The user-
// facing URL stays pietech.net/world-names/.
const WORLD_NAMES_ORIGIN = 'https://world-names-98k.pages.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/world-names' || url.pathname.startsWith('/world-names/')) {
      // Strip the /world-names prefix before forwarding. The world-names Pages
      // project serves its build at the pages.dev root; Vite's `base` config in
      // that repo writes asset URLs back with the /world-names/ prefix so the
      // user-facing URL stays clean.
      const stripped = url.pathname.replace(/^\/world-names\/?/, '/');
      const upstream = new URL(stripped + url.search, WORLD_NAMES_ORIGIN);
      return fetch(new Request(upstream, request));
    }

    // Landing page + static assets from this Pages project.
    return env.ASSETS.fetch(request);
  },
};
