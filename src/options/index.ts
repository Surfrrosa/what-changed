import { getSettings, saveSettings } from '../lib/settings';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function loadStats() {
  const stats = await chrome.runtime.sendMessage({ type: 'get-stats' });

  const pages = document.getElementById('stat-pages');
  const snapshots = document.getElementById('stat-snapshots');
  const storage = document.getElementById('stat-storage');

  if (pages) pages.textContent = String(stats.uniqueUrls);
  if (snapshots) snapshots.textContent = String(stats.totalSnapshots);
  if (storage) storage.textContent = formatBytes(stats.totalBytes);
}

async function loadSettings() {
  const s = await getSettings();

  const retention = document.getElementById('retention') as HTMLSelectElement;
  if (retention) retention.value = String(s.retentionDays);

  const sig = document.getElementById('significance') as HTMLInputElement;
  if (sig) {
    sig.value = String(s.minSignificance);
    const label = document.getElementById('significance-value');
    if (label) label.textContent = `${s.minSignificance}%`;
  }

  const blocked = document.getElementById('blocked-domains') as HTMLTextAreaElement;
  if (blocked) blocked.value = s.blockedDomains.join('\n');
}

function showToast(text = 'Saved') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

function setupListeners() {
  document.getElementById('retention')?.addEventListener('change', async (e) => {
    await saveSettings({
      retentionDays: parseInt((e.target as HTMLSelectElement).value),
    });
    showToast();
  });

  document.getElementById('significance')?.addEventListener('input', (e) => {
    const v = (e.target as HTMLInputElement).value;
    const label = document.getElementById('significance-value');
    if (label) label.textContent = `${v}%`;
  });

  document.getElementById('significance')?.addEventListener('change', async (e) => {
    await saveSettings({
      minSignificance: parseInt((e.target as HTMLInputElement).value),
    });
    showToast();
  });

  document.getElementById('save-domains')?.addEventListener('click', async () => {
    const ta = document.getElementById('blocked-domains') as HTMLTextAreaElement;
    const domains = ta.value
      .split('\n')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0);
    await saveSettings({ blockedDomains: domains });
    showToast();
  });

  document.getElementById('clear-data')?.addEventListener('click', async () => {
    if (!confirm('Delete all stored snapshots? This cannot be undone.')) return;
    await chrome.runtime.sendMessage({ type: 'clear-all' });
    await loadStats();
    showToast('Data cleared');
  });
}

async function init() {
  await loadStats();
  await loadSettings();
  setupListeners();
}

init();
