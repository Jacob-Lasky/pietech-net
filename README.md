# pietech-net

Source for [pietech.net](https://pietech.net) — Jake Lasky's personal site.

Pure static HTML/CSS. No build step. Deploys to Cloudflare Pages on push to `main`.

## Structure

- `index.html` — landing page
- `style.css` — styles

## Sibling projects (path-routed by Cloudflare Worker on `pietech.net/*`)

- [`world-names`](https://github.com/Jacob-Lasky/world-names) → `pietech.net/world-names/`

## Local preview

```sh
python3 -m http.server 8000
# → http://localhost:8000
```
