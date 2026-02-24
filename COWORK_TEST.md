# What Changed — Testing & Review Brief

**Repo:** https://github.com/Surfrrosa/what-changed
**Type:** Chrome Manifest V3 extension
**Purpose:** Silently snapshots pages you visit, shows word-level diffs when content changes on revisit. Zero config, all data local.

## Setup

```bash
git clone https://github.com/Surfrrosa/what-changed.git
cd what-changed
npm install
npm run icons    # requires sharp — generates PNGs from SVG
npm run build    # esbuild bundles to dist/
```

Load in Chrome: `chrome://extensions` > Developer mode ON > Load unpacked > select `dist/` folder.

## What to test

### 1. Core capture and diff pipeline

The heart of the extension. Visit a page, wait a few seconds, then revisit or wait for the page to update. The badge should show a change count and the side panel should render a readable diff.

**Test pages (mix of static and dynamic):**
- A news homepage (e.g. Ground News, CNN, BBC) — high churn, lots of nav noise
- A Wikipedia article — stable content, should show "no changes" on revisit
- A blog post — Readability.js should extract cleanly
- A shopping product page (e.g. Amazon) — price/stock changes
- A GitHub repo page — mix of content and chrome
- A single-page app (e.g. Twitter/X, Reddit) — SPA navigation detection

**What to look for:**
- Are words properly separated with spacing/newlines, or still running together?
- Is the extracted text meaningful content, or polluted with nav items, promo banners, CTAs, user menus, footers?
- Is the diff accurate? Do the green (added) and red (removed) spans make sense?
- Does the significance percentage feel right?
- On a page that hasn't changed, does it correctly show "no changes"?
- Does deduplication work? (Visit the same unchanged page multiple times — it should not create duplicate snapshots.)

### 2. Side panel UX

Open via the popup's "View changes" button or directly from the Chrome side panel menu.

**What to look for:**
- Does the diff content scroll when it's longer than the viewport?
- Does the sticky header stay fixed while scrolling?
- Do the All/Added/Removed filter buttons work correctly?
- Is the text readable? Line spacing, font size, contrast?
- Does the panel update when you switch tabs?
- Does the panel update when the active tab finishes loading?

### 3. Popup

Click the extension icon in the toolbar.

**What to look for:**
- First visit to a new page: shows "First visit recorded"
- Revisit with changes: shows change count + "View changes" button
- Revisit without changes: shows "No changes detected"
- Non-trackable pages (chrome://, about:blank, extension pages): appropriate message
- Stats footer: "Tracking N pages" — does the count seem right?
- Does "View changes" open the side panel and close the popup?

### 4. Settings (options page)

Right-click extension icon > Options, or `chrome://extensions` > Details > Extension options.

**What to look for:**
- Retention slider: default 90 days, range 7–365
- Significance slider: default 5%, range 1–20%
- Domain blocklist: textarea, one domain per line
- Save feedback: toast notification on save
- Stats display: snapshot count, unique URLs, storage size
- Clear data: confirmation dialog, then stats should reset to 0
- Do saved settings actually affect behavior? (e.g., add a domain to blocklist, visit it, verify no snapshot is stored)

### 5. Edge cases and reliability

- **Service worker lifecycle:** The service worker will go inactive after 30s of inactivity (normal MV3 behavior). Does it wake up correctly when you visit a page? Check `chrome://extensions` — "Inspect views: service worker" should show activity.
- **Login pages:** Visit a page with a password field (e.g. a login form). The content script should skip it (security measure). Verify no snapshot is stored.
- **Very long pages:** Visit a page with massive content (e.g. a long Wikipedia article). Does the diff render without crashing? Does scrolling work?
- **Rapid navigation:** Click through multiple pages quickly. Does the extension handle it without errors? Check the service worker console for uncaught exceptions.
- **Tab switching:** With the side panel open, switch between tabs. Does it update to show the correct diff for each tab?
- **Empty/minimal pages:** Visit a page with very little text (<100 characters). The content script should skip it. Verify no snapshot is stored.
- **Error recovery:** If IndexedDB is somehow unavailable, does the extension fail gracefully without console errors on every page load?

### 6. Code quality review

Read through the source and flag anything concerning:

- `src/lib/noise.ts` — noise selectors, `extractText()`, `normalizeText()`
- `src/lib/capture.ts` — content extraction pipeline (Readability > selectors > body)
- `src/lib/diff.ts` — diffing, significance scoring, HTML rendering
- `src/lib/storage.ts` — IndexedDB operations, hashing, deduplication
- `src/background/index.ts` — service worker message routing
- `src/content/index.ts` — DOM stability detection, SPA detection, login skip
- `src/lib/url.ts` — URL normalization, domain blocking
- `src/lib/settings.ts` — settings management
- `static/manifest.json` — permissions, CSP

**Things to look for:**
- Security: XSS risks, unsafe innerHTML, missing input validation
- Performance: unnecessary DOM operations, memory leaks, unbounded loops
- Correctness: race conditions, missing error handling, edge cases
- Architecture: any coupling or design issues that would make this hard to maintain
- Manifest: any permissions that are excessive or missing

### 7. Build and tooling

```bash
npm run build     # Should succeed with no warnings
npx tsc --noEmit  # Should succeed with no type errors
npm run icons     # Should generate 4 PNG files in static/icons/
npm run clean     # Should remove dist/
```

- Verify the dist/ output contains: background.js, content.js, popup.js, sidepanel.js, options.js, manifest.json, HTML/CSS files, icons
- Verify no source maps are leaking sensitive paths
- Verify all dependencies in package.json are pinned to exact versions (no ^ or ~)

## Known context

- The extension was just rebuilt with a new text extraction system (`extractText` walks the DOM inserting newlines at block boundaries instead of using raw `textContent`). Old snapshots captured before this change will have concatenated text. Clear data and recapture to test with clean data.
- Ground News homepage was the primary test case and exposed most extraction issues.
- The Readability.js path handles articles well. The selector/body fallback paths handle homepages and non-article pages. Both now use `extractText`.

## What I want back

1. **Bug list** — anything broken, incorrect, or crashing
2. **UX issues** — anything confusing, unreadable, or frustrating
3. **Text extraction quality** — how does the diff read across different types of pages? Is it useful?
4. **Security concerns** — anything that could be exploited or would fail CWS review
5. **Recommendations** — improvements, missing features, architecture changes
6. **Overall assessment** — is this ready for Chrome Web Store submission?
