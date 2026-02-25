export interface Snapshot {
  id?: number;
  url: string;
  timestamp: number;
  title: string;
  text: string;
  contentHash: string;
  byteLength: number;
  method: 'readability' | 'selector' | 'body';
}

export interface CaptureResult {
  method: 'readability' | 'selector' | 'body';
  title: string;
  text: string;
}

export interface Change {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffResult {
  oldSnapshot: Snapshot;
  newSnapshot: Snapshot;
  changes: Change[];
  significance: number;
}

export interface DiffResponse {
  oldTimestamp: number;
  newTimestamp: number;
  title: string;
  significance: number;
  changes: Change[];
  changeCount: number;
  minSignificance: number;
  isDynamic: boolean;
}

export interface StatusResponse {
  snapshotCount: number;
  lastVisit: number | null;
  hasChanges: boolean;
  changeCount: number;
}

export interface StatsResponse {
  totalSnapshots: number;
  uniqueUrls: number;
  totalBytes: number;
}
