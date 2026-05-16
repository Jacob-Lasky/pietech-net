# pietech-net

Source for [pietech.net](https://pietech.net) — Jake Lasky's personal site.

Static HTML/CSS landing page + a Cloudflare Pages Function (`_worker.js`) that fronts the whole `pietech.net` domain and dispatches path-prefixed routes to sibling Pages projects.

## Structure

- `index.html` — landing page
- `style.css` — styles
- `_worker.js` — Pages Function: routes `/world-names/*` to the world-names Pages project, serves everything else from this project's static assets

## Sibling projects (path-routed by `_worker.js`)

- [`world-names`](https://github.com/Jacob-Lasky/world-names) → `pietech.net/world-names/`

## Local preview

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

`_worker.js` is not exercised by the local server; test it via `wrangler pages dev` or by deploying to Pages.

## Deploy

Auto-deploys from `main` to the `pietech-net` Cloudflare Pages project on push. `pietech.net` is configured as the custom domain on this Pages project; the worker serves the routing.
