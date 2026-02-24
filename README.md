# What Changed

A Chrome extension that automatically tracks webpage changes and shows you a clean diff when you return. Zero setup. Completely private.

Every existing change-detection tool asks you to predict which pages will change and set up watchers in advance. What Changed flips the model — it silently snapshots every page you visit and shows you what's different the moment you return.

## How it works

1. **Install** — one click from the Chrome Web Store. No account, no configuration.
2. **Browse** — the extension silently captures the main content of every page you visit.
3. **Return** — revisit any page and see exactly what changed, highlighted word-by-word.

## Features

- **Zero config** — works on every page automatically. No watchlists, no polling.
- **Smart extraction** — uses Mozilla's Readability to focus on real content, ignoring ads, navigation, and timestamps.
- **Private by design** — all data stays in your browser's local IndexedDB. No servers, no accounts, no analytics. Nothing leaves your machine.
- **Meaningful diffs** — word-level change detection with significance scoring. Filters out trivial updates and dynamic feeds.
- **SPA support** — detects `pushState` navigations and re-captures automatically.
- **Configurable** — retention period, significance threshold, and domain blocklist.

## Architecture

```
Content Script (content.js)
  Readability.js extraction → noise filtering → SHA-256 deduplication
       ↓
Service Worker (background.js)
  URL normalization → settings check → IndexedDB storage → badge update
       ↓
Side Panel / Popup
  jsdiff word-level diff → significance scoring → rendered HTML
```

**Key decisions:**

- **Text diffing, not DOM diffing.** Comparing extracted text avoids false positives from CSS/layout changes and page redesigns. A site can completely overhaul its HTML and if the words didn't change, the diff is empty.
- **Readability extraction before storage.** Stripping boilerplate at capture time (not diff time) keeps storage small and diffs clean. Average snapshot is ~5 KB of text vs ~200 KB of raw HTML.
- **Content hashing for deduplication.** ~70% of revisits find unchanged content. SHA-256 hashing skips redundant storage, keeping actual disk usage to ~80-100 KB/day for typical browsing.
- **Settings-driven thresholds.** Significance scoring (configurable 1-20%) suppresses noise from minor edits, A/B tests, and dynamic feeds without requiring manual blocklists.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Content extraction | [@mozilla/readability](https://github.com/mozilla/readability) |
| Text diffing | [jsdiff](https://github.com/kpdecker/jsdiff) (`diffWords`) |
| Storage | IndexedDB via [idb](https://github.com/jakearchibald/idb) |
| Build | [esbuild](https://esbuild.github.io/) |
| Language | TypeScript |
| Extension platform | Chrome Manifest V3 |

**Bundle sizes:** content script 88 KB (mostly Readability), background 40 KB, popup + sidepanel + options ~7 KB combined.

## Development

```bash
# Install dependencies
npm install

# Generate extension icons
npm run icons

# Build the extension
npm run build

# Type-check
npx tsc --noEmit
```

To load in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Project structure

```
src/
  lib/
    capture.ts     Content extraction (Readability + fallbacks)
    diff.ts        Word-level diffing and significance scoring
    noise.ts       DOM noise removal and text normalization
    settings.ts    User preferences (chrome.storage.local)
    storage.ts     IndexedDB operations (store, query, prune)
    types.ts       Shared TypeScript interfaces
    url.ts         URL normalization and domain blocking
  background/      Service worker
  content/         Content script
  popup/           Extension popup
  sidepanel/       Diff viewer side panel
  options/         Settings page
static/            HTML, CSS, manifest, icons
docs/              Landing page and privacy policy
```

## Privacy

All data is stored locally in your browser. No data is ever transmitted to any server. [Read the full privacy policy.](https://surfrrosa.github.io/what-changed/privacy.html)

## License

MIT
