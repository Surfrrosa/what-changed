# What Changed

Chrome extension (Manifest V3) that silently snapshots pages you visit and shows word-level diffs when you return. All data stays local in IndexedDB.

## Build

```bash
npm install
npm run icons    # Generate PNG icons from SVG (requires sharp)
npm run build    # esbuild bundles TS -> dist/
npx tsc --noEmit # Type-check only
```

Load in Chrome: `chrome://extensions` > Developer mode > Load unpacked > select `dist/`.

## Architecture

- `src/content/` — Content script. Runs on every page at `document_idle`. Waits for DOM stability, extracts content via Readability.js, sends to background.
- `src/background/` — Service worker. Receives snapshots, normalizes URLs, deduplicates via SHA-256, stores in IndexedDB. Computes diffs on revisit. Manages badge, settings, pruning.
- `src/popup/` — Extension popup. Shows change count or status, button to open side panel.
- `src/sidepanel/` — Side panel diff viewer. Renders pre-computed HTML diff with filter controls.
- `src/options/` — Settings page. Retention, significance threshold, domain blocklist, data management.
- `src/lib/` — Shared modules: storage, diffing, capture, URL normalization, noise filtering, settings, types.
- `static/` — Manifest, HTML, CSS, icons. Copied to dist/ at build time.
- `docs/` — Landing page and privacy policy. Served via GitHub Pages.

## Running

```bash
npm run build    # Build extension to dist/
npm run icons    # Regenerate icons
npm run clean    # Remove dist/
```

Load `dist/` as unpacked extension in `chrome://extensions` (Developer mode).

## Session

- Read the latest session log in `docs/sessions/` before starting work.
- Write a session log at `docs/sessions/YYYY-MM-DD.md` at the end of each session.

## Key files

- `src/lib/storage.ts` — IndexedDB operations, deduplication, pruning
- `src/lib/capture.ts` — Readability.js content extraction with fallback chain
- `src/lib/diff.ts` — jsdiff word-level diffing, significance scoring, HTML rendering
- `src/lib/noise.ts` — DOM noise removal selectors, text normalization
- `src/lib/url.ts` — URL normalization, tracking param stripping, domain blocking
- `src/lib/settings.ts` — User preferences (retention, significance, blocklist)
- `src/background/index.ts` — Service worker: message routing, snapshot handling, badge
- `src/content/index.ts` — Content script: DOM stability, capture, SPA detection
- `static/manifest.json` — Chrome extension manifest (MV3)
- `build.mjs` — esbuild bundler config
- `scripts/generate-icons.mjs` — SVG to PNG icon generation

## Key conventions

- All entry points bundled as IIFE via esbuild (no ES module content scripts).
- Side panel and popup receive pre-rendered HTML from background — no lib imports needed.
- Settings stored in `chrome.storage.local`, snapshots in IndexedDB.
- URL normalization strips tracking params (UTM, fbclid, etc.), fragments, and trailing slashes.
- `npm run icons` generates 16/32/48/128px PNGs from an inline SVG via sharp.

## Testing in Chrome

After `npm run build`, load `dist/` as an unpacked extension. Visit a page, modify its content (or wait for the site to update), revisit — the badge shows a change count and the side panel shows the diff.

## Repo

- GitHub: https://github.com/Surfrrosa/what-changed
- Landing page: https://surfrrosa.github.io/what-changed/
- Privacy policy: https://surfrrosa.github.io/what-changed/privacy.html
