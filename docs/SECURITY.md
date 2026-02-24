# Security Checklist

## Threat model

What Changed runs entirely in the browser with no server component. The primary security concerns are:

1. **Local data sensitivity** — stored page content may include PII from pages the user visits
2. **Content script injection** — the content script runs on every page and must not leak data or be exploitable
3. **Extension permissions** — `<all_urls>` is a powerful permission that requires justification

## Checklist

### Data handling
- [x] All data stored locally in IndexedDB (no network requests)
- [x] No external API calls, analytics, or telemetry
- [x] No remote code loading
- [x] SHA-256 hashing uses Web Crypto API (not a custom implementation)
- [x] Content extraction uses Mozilla's Readability.js (audited, open source)
- [x] User can clear all data from settings page
- [x] Automatic pruning deletes old snapshots (configurable retention)

### Content script safety
- [x] Content script only reads DOM, never modifies it
- [x] No `eval()`, `Function()`, or dynamic code execution
- [x] No `innerHTML` writes to the host page
- [x] Content script communicates only via `chrome.runtime.sendMessage` (extension-internal)
- [x] Login pages detected and skipped (password field heuristic)

### Extension pages (popup, sidepanel, options)
- [x] Diff HTML rendered via `innerHTML` in extension-owned pages only (not injected into host pages)
- [x] Diff content is escaped (`&`, `<`, `>`) before rendering to prevent XSS from captured page content
- [x] No user-supplied URLs used in navigation or fetch calls

### Permissions
- [x] `<all_urls>` justified: passive capture on every page requires broad access; `activeTab` would require user click per page
- [x] `unlimitedStorage` justified: accumulated snapshots exceed default quota
- [x] `tabs` justified: needed for URL detection and badge updates
- [x] `alarms` justified: daily pruning of old snapshots
- [x] No `webRequest`, `debugger`, or other high-risk permissions

### Supply chain
- [x] Dependencies pinned to exact versions (no `^` or `~`)
- [x] 3 runtime dependencies: @mozilla/readability, diff, idb (all widely used, audited)
- [x] No post-install scripts in dependencies
- [x] Source maps included in build for CWS review transparency

### Privacy
- [x] Privacy policy published and covers all data handling
- [x] No data transmitted off-device
- [x] No third-party integrations
- [x] Domain blocklist allows users to exclude sensitive sites
