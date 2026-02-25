import { diffWords } from 'diff';
import { normalizeText } from './noise';
import type { Snapshot, DiffResult, Change, DiffResponse } from './types';

export function computeDiff(
  oldSnapshot: Snapshot,
  newSnapshot: Snapshot
): DiffResult {
  const oldText = normalizeText(oldSnapshot.text);
  const newText = normalizeText(newSnapshot.text);
  const changes = diffWords(oldText, newText) as Change[];
  const significance = computeSignificance(oldText, newText, changes);

  return { oldSnapshot, newSnapshot, changes, significance };
}

function computeSignificance(
  oldText: string,
  newText: string,
  changes: Change[]
): number {
  const total = Math.max(oldText.length, newText.length);
  if (total === 0) return 0;

  const changed = changes
    .filter(c => c.added || c.removed)
    .reduce((sum, c) => sum + c.value.length, 0);

  return Math.min(changed / total, 1);
}

export function isDynamicFeed(url: string, significance: number): boolean {
  const feeds = [
    /twitter\.com\/(home|explore|search)/,
    /x\.com\/(home|explore|search)/,
    /facebook\.com\/?$/,
    /reddit\.com\/?$/,
    /instagram\.com\/?$/,
    /tiktok\.com\/(foryou|explore)/,
    /news\.ycombinator\.com\/?$/,
    /linkedin\.com\/feed/,
  ];

  if (feeds.some(p => p.test(url))) return true;
  if (significance > 0.8) return true;
  return false;
}

export function buildDiffResponse(
  diff: DiffResult,
  minSignificance: number,
  url: string
): DiffResponse {
  return {
    oldTimestamp: diff.oldSnapshot.timestamp,
    newTimestamp: diff.newSnapshot.timestamp,
    title: diff.newSnapshot.title,
    significance: diff.significance,
    changes: diff.changes,
    changeCount: diff.changes.filter(c => c.added || c.removed).length,
    minSignificance,
    isDynamic: isDynamicFeed(url, diff.significance),
  };
}
