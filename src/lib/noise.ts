const NOISE_SELECTORS = [
  // Ads
  '[class*="ad-"]', '[class*="Ad"]', '[id*="ad-"]',
  '[data-ad]', '[data-testid*="ad"]',
  // Structure
  'nav', 'header', 'footer', 'aside',
  '[role="complementary"]', '[role="banner"]',
  '[role="navigation"]', '[role="contentinfo"]',
  // Dynamic content
  '[class*="recommend"]', '[class*="sidebar"]',
  '[class*="related"]', '[class*="trending"]',
  '[class*="popular"]', '[class*="sponsored"]',
  // Timestamps and counters
  'time', '[class*="timestamp"]',
  '[class*="comment-count"]', '[class*="share-count"]',
  // Banners and overlays
  '[class*="cookie"]', '[class*="consent"]',
  '[id*="cookie"]', '[id*="consent"]',
  '.newsletter-signup',
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

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\d+\s*(minutes?|hours?|days?|weeks?|months?)\s*ago/gi, '')
    .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|am|pm)?/g, '')
    .replace(/\d+\s*(shares?|likes?|comments?|retweets?|views?|reactions?)/gi, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}
