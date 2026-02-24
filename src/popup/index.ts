import type { StatusResponse, StatsResponse } from '../lib/types';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function show(id: string) {
  document.querySelectorAll<HTMLElement>('.state').forEach(el => {
    el.hidden = true;
  });
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url || !tab.url.startsWith('http')) {
    show('not-trackable');
    return;
  }

  const status: StatusResponse = await chrome.runtime.sendMessage({
    type: 'get-status',
    url: tab.url,
  });

  if (!status || status.snapshotCount <= 1) {
    show('first-visit');
  } else if (status.hasChanges) {
    show('has-changes');
    const summary = document.querySelector('.change-summary');
    if (summary) {
      const n = status.changeCount;
      summary.textContent = `${n} change${n !== 1 ? 's' : ''} detected`;
    }
    const info = document.querySelector('#has-changes .visit-info');
    if (info && status.lastVisit) {
      info.textContent = `Previous visit: ${timeAgo(status.lastVisit)}`;
    }
  } else {
    show('no-changes');
    const info = document.querySelector('#no-changes .visit-info');
    if (info && status.lastVisit) {
      info.textContent = `Last visited: ${timeAgo(status.lastVisit)}`;
    }
  }

  // Stats footer
  const stats: StatsResponse = await chrome.runtime.sendMessage({
    type: 'get-stats',
  });
  const el = document.getElementById('stats');
  if (el && stats) {
    el.textContent = `Tracking ${stats.uniqueUrls} page${stats.uniqueUrls !== 1 ? 's' : ''}`;
  }
}

// Open side panel
document.getElementById('view-changes')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  }
});

init();
