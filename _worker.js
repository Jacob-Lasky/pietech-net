/**
 * Cloudflare Pages Function — fronts every request to pietech.net.
 *
 * Keep /world-names and its descendants on the sibling Pages project.
 * Every other path permanently redirects to Jacob’s website.
 * DO NOT redirect sibling paths: their public asset URLs use this prefix.
 * No ASSETS fallback is needed because the old landing site is retired.
 */

// The Pages project name "world-names" was taken globally on the *.pages.dev
// namespace, so the project deploys to world-names-98k.pages.dev. The user-
// facing URL stays pietech.net/world-names/.
const WORLD_NAMES_ORIGIN = 'https://world-names-98k.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/world-names' || url.pathname.startsWith('/world-names/')) {
      // Strip the /world-names prefix before forwarding. The world-names Pages
      // project serves its build at the pages.dev root; Vite's `base` config in
      // that repo writes asset URLs back with the /world-names/ prefix so the
      // user-facing URL stays clean.
      const stripped = url.pathname.replace(/^\/world-names\/?/, '/');
      const upstream = new URL(WORLD_NAMES_ORIGIN);
      upstream.pathname = stripped;
      upstream.search = url.search;
      return fetch(new Request(upstream, request));
    }

    return Response.redirect('https://www.jacoblasky.com/', 301);
  },
};
