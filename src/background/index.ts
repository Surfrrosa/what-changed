import {
  storeSnapshot,
  hashContent,
  getLatestTwo,
  getSnapshotCount,
  pruneOldSnapshots,
  getStats,
  clearAllData,
} from '../lib/storage';
import { normalizeUrl, isTrackablePage, isBlockedDomain } from '../lib/url';
import { computeDiff, isDynamicFeed, buildDiffResponse } from '../lib/diff';
import { getSettings } from '../lib/settings';
import type { Snapshot, DiffResponse, StatusResponse } from '../lib/types';

const BADGE_COLOR = '#4A90D9';

// --- Daily cleanup ---

chrome.alarms.create('prune-snapshots', { periodInMinutes: 60 * 24 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'prune-snapshots') {
    const settings = await getSettings();
    const maxAge = settings.retentionDays * 24 * 60 * 60 * 1000;
    const n = await pruneOldSnapshots(maxAge);
    if (n > 0) console.log(`[What Changed] Pruned ${n} old snapshots`);
  }
});

// --- Message handling ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = messageHandlers[message.type as string];
  if (handler) {
    handler(message, sender).then(sendResponse);
    return true; // async
  }
});

const messageHandlers: Record<
  string,
  (msg: any, sender: chrome.runtime.MessageSender) => Promise<any>
> = {
  snapshot: handleSnapshot,
  'get-diff': (msg) => handleGetDiff(msg.url),
  'get-status': (msg) => handleGetStatus(msg.url),
  'get-stats': () => getStats(),
  'clear-all': () => clearAllData(),
};

async function handleSnapshot(
  msg: { data: { url: string; title: string; text: string; method: string } },
  sender: chrome.runtime.MessageSender
) {
  const url = normalizeUrl(msg.data.url);
  if (!isTrackablePage(url)) {
    return { stored: false, hasChanges: false };
  }

  const settings = await getSettings();
  if (isBlockedDomain(url, settings.blockedDomains)) {
    return { stored: false, hasChanges: false };
  }

  const contentHash = await hashContent(msg.data.text);

  const snapshot: Omit<Snapshot, 'id'> = {
    url,
    timestamp: Date.now(),
    title: msg.data.title,
    text: msg.data.text,
    contentHash,
    byteLength: new TextEncoder().encode(msg.data.text).byteLength,
    method: msg.data.method as Snapshot['method'],
  };

  const result = await storeSnapshot(snapshot);
  const tabId = sender.tab?.id;

  if (tabId == null) return result;

  if (!result.hasChanges) {
    chrome.action.setBadgeText({ tabId, text: '' });
    return result;
  }

  // Compute diff to check significance
  const pair = await getLatestTwo(url);
  if (!pair) return result;

  const diff = computeDiff(pair[0], pair[1]);

  const minSig = settings.minSignificance / 100;
  if (isDynamicFeed(url, diff.significance) || diff.significance < minSig) {
    chrome.action.setBadgeText({ tabId, text: '' });
    return { ...result, hasChanges: false };
  }

  const count = diff.changes.filter(c => c.added || c.removed).length;
  chrome.action.setBadgeText({ tabId, text: String(count) });
  chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });

  return result;
}

async function handleGetDiff(rawUrl: string): Promise<DiffResponse | null> {
  const url = normalizeUrl(rawUrl);
  const pair = await getLatestTwo(url);
  if (!pair) return null;

  const diff = computeDiff(pair[0], pair[1]);
  return buildDiffResponse(diff);
}

async function handleGetStatus(rawUrl: string): Promise<StatusResponse> {
  const url = normalizeUrl(rawUrl);
  const count = await getSnapshotCount(url);
  const pair = await getLatestTwo(url);

  let changeCount = 0;
  let hasChanges = false;

  if (pair && pair[0].contentHash !== pair[1].contentHash) {
    const diff = computeDiff(pair[0], pair[1]);
    const settings = await getSettings();
    const minSig = settings.minSignificance / 100;
    hasChanges = diff.significance >= minSig;
    changeCount = diff.changes.filter(c => c.added || c.removed).length;
  }

  return {
    snapshotCount: count,
    lastVisit: pair ? pair[1].timestamp : null,
    hasChanges,
    changeCount,
  };
}
