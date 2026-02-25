import type { DiffResponse, Change } from '../lib/types';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function show(id: string) {
  document.querySelectorAll<HTMLElement>('.state').forEach(el => {
    el.hidden = true;
  });
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

/** Build DOM nodes from the changes array — no innerHTML. */
function buildDiffNodes(changes: Change[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const c of changes) {
    let el: HTMLElement;
    if (c.removed) {
      el = document.createElement('del');
      el.className = 'wc-removed';
    } else if (c.added) {
      el = document.createElement('ins');
      el.className = 'wc-added';
    } else {
      el = document.createElement('span');
      el.className = 'wc-unchanged';
    }
    el.textContent = c.value;
    frag.appendChild(el);
  }
  return frag;
}

function renderDiff(diff: DiffResponse) {
  show('diff-view');

  const title = document.getElementById('page-title');
  if (title) title.textContent = diff.title;

  const oldDate = document.getElementById('old-date');
  if (oldDate) oldDate.textContent = formatDate(diff.oldTimestamp);

  const newDate = document.getElementById('new-date');
  if (newDate) newDate.textContent = formatDate(diff.newTimestamp);

  const sig = document.getElementById('significance');
  if (sig) sig.textContent = `${Math.round(diff.significance * 100)}% changed`;

  const content = document.getElementById('diff-content');
  if (content) {
    content.textContent = '';
    content.appendChild(buildDiffNodes(diff.changes));
  }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter') || 'all';
    const content = document.getElementById('diff-content');
    if (content) content.setAttribute('data-filter', filter);
  });
});

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      show('no-data');
      return;
    }

    const title = document.getElementById('page-title');
    if (title) title.textContent = tab.title || tab.url;

    const diff: DiffResponse | null = await chrome.runtime.sendMessage({
      type: 'get-diff',
      url: tab.url,
    });

    if (!diff) {
      show('no-data');
      return;
    }

    // Use the same threshold as popup/badge (B2 fix)
    if (diff.significance < diff.minSignificance) {
      show('no-changes');
      return;
    }

    if (diff.isDynamic) {
      show('dynamic-feed');
      return;
    }

    renderDiff(diff);
  } catch {
    show('no-data');
  }
}

// Re-init when the active tab changes
chrome.tabs.onActivated.addListener(() => init());
chrome.tabs.onUpdated.addListener((_id, info) => {
  if (info.status === 'complete') init();
});

init();
