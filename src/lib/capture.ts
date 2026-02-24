import { Readability } from '@mozilla/readability';
import { removeNoise, extractText } from './noise';
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
      // Parse article HTML through extractText for proper block spacing
      const parsed = new DOMParser().parseFromString(article.content, 'text/html');
      const text = extractText(parsed.body);
      return {
        method: 'readability',
        title: article.title || doc.title,
        text: text || article.textContent.trim(),
      };
    }
  } catch {
    // Readability can throw on malformed DOMs
  }

  // Try known content selectors (use block-aware extraction)
  for (const selector of MAIN_CONTENT_SELECTORS) {
    const el = cleaned.querySelector(selector);
    const text = extractText(el);
    if (text.length > 200) {
      return {
        method: 'selector',
        title: doc.title,
        text,
      };
    }
  }

  // Fallback: full body text (block-aware extraction)
  return {
    method: 'body',
    title: doc.title,
    text: extractText(cleaned.body),
  };
}
