const NOISE_SELECTORS = [
  // Ads
  '[class*="ad-"]', '[class*="Ad"]', '[id*="ad-"]',
  '[data-ad]', '[data-testid*="ad"]',
  // Structure / chrome
  'nav', 'header', 'footer', 'aside',
  '[role="complementary"]', '[role="banner"]',
  '[role="navigation"]', '[role="contentinfo"]',
  '[role="search"]', '[role="menubar"]', '[role="menu"]',
  // Dynamic content
  '[class*="recommend"]', '[class*="sidebar"]',
  '[class*="related"]', '[class*="trending"]',
  '[class*="popular"]', '[class*="sponsored"]',
  // Timestamps and counters
  'time', '[class*="timestamp"]',
  '[class*="comment-count"]', '[class*="share-count"]',
  '[class*="like-count"]', '[class*="view-count"]',
  // Banners, overlays, promos
  '[class*="cookie"]', '[class*="consent"]',
  '[id*="cookie"]', '[id*="consent"]',
  '[class*="newsletter"]', '[class*="subscribe"]',
  '[class*="signup"]', '[class*="sign-up"]',
  '[class*="promo"]', '[class*="cta"]', '[class*="CTA"]',
  '[class*="modal"]', '[class*="overlay"]',
  '[class*="popup"]', '[class*="toast"]', '[class*="snackbar"]',
  // Social sharing widgets (scoped to avoid stripping article text)
  '[class*="share-button"]', '[class*="social-button"]',
  '[class*="share-widget"]', '[class*="social-widget"]',
  // User menus / account
  '[class*="user-menu"]', '[class*="profile-menu"]',
  // Breadcrumbs and pagination
  '[class*="breadcrumb"]', '[class*="pagination"]',
  // Technical noise
  'iframe', 'script', 'style', 'noscript', 'svg',
];

export function removeNoise(doc: Document): Document {
  const clone = doc.cloneNode(true) as Document;
  for (const selector of NOISE_SELECTORS) {
    try {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    } catch {
      // skip invalid selectors
    }
  }
  return clone;
}

const BLOCK_ELEMENTS = new Set([
  'address', 'article', 'aside', 'blockquote', 'dd', 'details',
  'dialog', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure',
  'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary',
  'table', 'td', 'th', 'tr', 'ul',
]);

/** Walk the DOM and extract text, inserting newlines at block boundaries. */
export function extractText(root: Element | null): string {
  if (!root) return '';
  const parts: string[] = [];

  function walk(node: Node): void {
    if (node.nodeType === 3 /* TEXT */) {
      const text = node.textContent || '';
      if (text.trim()) parts.push(text);
      return;
    }
    if (node.nodeType !== 1 /* ELEMENT */) return;
    const tag = (node as Element).tagName.toLowerCase();

    // br: single newline, no wrapping (T3)
    if (tag === 'br') {
      parts.push('\n');
      return;
    }

    const isBlock = BLOCK_ELEMENTS.has(tag);
    if (isBlock) parts.push('\n');
    for (let child = node.firstChild; child; child = child.nextSibling) {
      walk(child);
    }
    if (isBlock) parts.push('\n');
  }

  walk(root);
  return parts.join('');
}

export function normalizeText(text: string): string {
  return text
    .replace(/\n{2,}/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}
