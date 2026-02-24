import { Readability } from '@mozilla/readability';
import { removeNoise } from './noise';
import type { CaptureResult } from './types';

const MAIN_CONTENT_SELECTORS = [
  'main', 'article', '[role="main"]',
  '#content', '.content', '#main', '.main',
  '#article', '.article', '.post-content', '.entry-content',
];

export function captureContent(doc: Document): CaptureResult {
  const cleaned = removeNoise(doc);

  // Try Readability first (best for articles and long-form content)
  try {
    const reader = new Readability(cleaned);
    const article = reader.parse();
    if (article && article.textContent.trim().length > 200) {
      return {
        method: 'readability',
        title: article.title || doc.title,
        text: article.textContent.trim(),
      };
    }
  } catch {
    // Readability can throw on malformed DOMs
  }

  // Try known content selectors
  for (const selector of MAIN_CONTENT_SELECTORS) {
    const el = cleaned.querySelector(selector);
    if (el?.textContent && el.textContent.trim().length > 200) {
      return {
        method: 'selector',
        title: doc.title,
        text: el.textContent.trim(),
      };
    }
  }

  // Fallback: full body text
  return {
    method: 'body',
    title: doc.title,
    text: cleaned.body?.textContent?.trim() || '',
  };
}
