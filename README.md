# pietech-net

Cloudflare Pages router for [pietech.net](https://pietech.net) and
[www.pietech.net](https://www.pietech.net).

`_worker.js` proxies `/world-names` and `/world-names/*` to
`https://world-names-98k.pages.dev`, stripping the mount prefix and preserving
queries. This keeps [World Names](https://pietech.net/world-names/) and its assets
working on both hosts. Every other path returns HTTP 301 to
`https://www.jacoblasky.com/`; old path suffixes and queries are discarded.

`index.html` is a minimal fallback link; the worker handles all public requests.
The retired landing page remains in Git history at the pre-change tag
`pre-w277-redirect-20261109`.

## Test and preview

Run `node --test _worker.test.js`. For a Pages-compatible preview, assemble
`dist/` as in `.github/workflows/deploy.yml` and run `wrangler pages dev dist`.
A basic static server cannot exercise the worker.

## Deploy

Pushes to `main` run tests and directly upload `dist/` to the `pietech-net`
Cloudflare Pages project. Both hostnames must be registered as Pages custom
domains, with DNS pointing at `pietech-net.pages.dev`.

To roll back the source, restore the pre-change tag’s files on a new branch,
review, and merge through the same workflow. The added `www` custom domain can
remain attached; it uses the same worker as the apex.
