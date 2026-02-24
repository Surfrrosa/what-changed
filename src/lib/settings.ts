export interface Settings {
  retentionDays: number;
  minSignificance: number;
  blockedDomains: string[];
}

const DEFAULTS: Settings = {
  retentionDays: 90,
  minSignificance: 2,
  blockedDomains: [],
};

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings');
  return { ...DEFAULTS, ...(result.settings || {}) };
}

export async function saveSettings(
  partial: Partial<Settings>
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    settings: { ...current, ...partial },
  });
}
