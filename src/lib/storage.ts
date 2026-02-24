import { openDB, type IDBPDatabase } from 'idb';
import type { Snapshot } from './types';

const DB_NAME = 'whatchanged';
const DB_VERSION = 1;
const STORE = 'snapshots';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-url', 'url');
        store.createIndex('by-url-date', ['url', 'timestamp']);
        store.createIndex('by-date', 'timestamp');
      },
    });
  }
  return dbPromise;
}

export async function hashContent(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function storeSnapshot(
  snapshot: Omit<Snapshot, 'id'>
): Promise<{ stored: boolean; hasChanges: boolean }> {
  const db = await getDB();

  // Check if the latest snapshot for this URL is identical
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.store.index('by-url-date');
  const range = IDBKeyRange.bound(
    [snapshot.url, 0],
    [snapshot.url, Date.now()]
  );
  const cursor = await index.openCursor(range, 'prev');
  const previous = cursor?.value as Snapshot | undefined;
  await tx.done;

  if (previous && previous.contentHash === snapshot.contentHash) {
    return { stored: false, hasChanges: false };
  }

  await db.put(STORE, snapshot);
  return { stored: true, hasChanges: !!previous };
}

export async function getLatestTwo(
  url: string
): Promise<[Snapshot, Snapshot] | null> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.store.index('by-url-date');
  const range = IDBKeyRange.bound([url, 0], [url, Date.now()]);

  const results: Snapshot[] = [];
  let cursor = await index.openCursor(range, 'prev');
  while (cursor && results.length < 2) {
    results.push(cursor.value as Snapshot);
    cursor = await cursor.continue();
  }
  await tx.done;

  if (results.length < 2) return null;
  return [results[1], results[0]]; // [older, newer]
}

export async function getSnapshotCount(url: string): Promise<number> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const count = await tx.store.index('by-url').count(url);
  await tx.done;
  return count;
}

export async function pruneOldSnapshots(
  maxAge = 90 * 24 * 60 * 60 * 1000
): Promise<number> {
  const db = await getDB();
  const cutoff = Date.now() - maxAge;
  const tx = db.transaction(STORE, 'readwrite');
  const index = tx.store.index('by-date');

  let deleted = 0;
  let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));
  while (cursor) {
    await cursor.delete();
    deleted++;
    cursor = await cursor.continue();
  }
  await tx.done;
  return deleted;
}

export async function getStats(): Promise<{
  totalSnapshots: number;
  uniqueUrls: number;
  totalBytes: number;
}> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');

  let totalSnapshots = 0;
  let totalBytes = 0;
  const urls = new Set<string>();

  let cursor = await tx.store.openCursor();
  while (cursor) {
    const snap = cursor.value as Snapshot;
    totalSnapshots++;
    totalBytes += snap.byteLength;
    urls.add(snap.url);
    cursor = await cursor.continue();
  }
  await tx.done;

  return { totalSnapshots, uniqueUrls: urls.size, totalBytes };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  await tx.store.clear();
  await tx.done;
}
