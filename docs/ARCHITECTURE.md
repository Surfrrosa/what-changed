# Architecture

## Overview

What Changed is a Chrome Manifest V3 extension with four execution contexts:

```
Content Script (per tab)
  Readability.js extraction → noise filtering → SHA-256 hash
       ↓ chrome.runtime.sendMessage
Service Worker (singleton)
  URL normalization → blocked domain check → IndexedDB store → badge update
       ↓ chrome.runtime.sendMessage (response)
Side Panel / Popup / Options (extension pages)
  Receive pre-rendered HTML and metadata from service worker
```

## Data flow

### Capture (on every page load)

1. Content script waits for DOM stability (MutationObserver debounce, 1.5s silence)
2. Skips login pages (password field + login keywords heuristic)
3. Clones document, removes noise elements (ads, nav, timestamps, banners)
4. Tries Readability.js extraction → falls back to known content selectors → falls back to body text
5. Sends extracted text + URL + title to service worker
6. Service worker normalizes URL (strips UTM params, fragments, trailing slashes)
7. Checks against blocked domain list from settings
8. SHA-256 hashes the text content
9. Compares hash against latest stored snapshot for that URL
10. If unchanged: skip storage (deduplication)
11. If changed: store new snapshot in IndexedDB, compute diff, update badge

### Diff (on revisit with changes)

1. Service worker retrieves two most recent snapshots for the URL
2. Normalizes text (collapse whitespace, strip relative timestamps, normalize quotes)
3. Runs jsdiff `diffWords` on normalized text
4. Computes significance score (changed characters / total characters)
5. Filters: suppresses dynamic feeds (>80% change) and trivial edits (below threshold)
6. Renders diff to HTML with `<ins>`/`<del>` tags and CSS classes
7. Returns pre-rendered HTML + metadata to requesting UI

## Storage

### IndexedDB (`whatchanged` database)

Single object store `snapshots` with indexes:
- `by-url` — lookup by normalized URL
- `by-url-date` — compound index for "latest N snapshots for URL" queries
- `by-date` — for age-based pruning

### chrome.storage.local

User settings only: retention period, significance threshold, blocked domains.

## Bundle strategy

All entry points bundled as IIFE via esbuild. No ES modules at runtime.

- Content script cannot use ES module format (Chrome limitation)
- IIFE for all contexts keeps the build simple and consistent
- Each bundle is self-contained with all dependencies inlined
- Side panel imports only `changesToHtml` from diff.ts but gets the full diff module bundled (acceptable tradeoff: jsdiff is ~15 KB)

## Key design decisions

1. **Text diffing over DOM diffing**: comparing extracted text avoids false positives from layout/CSS changes
2. **Readability extraction at capture time**: reduces storage from ~200 KB (HTML) to ~5 KB (text) per snapshot
3. **SHA-256 deduplication**: skips storage when content hasn't changed (~70% of revisits)
4. **Background renders diff HTML**: UI pages are thin renderers with no lib dependencies
5. **Settings-driven thresholds**: configurable significance scoring avoids hardcoded noise filters
