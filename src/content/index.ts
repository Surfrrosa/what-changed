import { captureContent } from '../lib/capture';

// Wait for the DOM to stop mutating (SPAs, async content)
function waitForStableDOM(timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    // Wait for document to be fully loaded first (B4)
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => startObserving(resolve, timeout), { once: true });
    } else {
      startObserving(resolve, timeout);
    }
  });
}

function startObserving(resolve: () => void, timeout: number): void {
  let timer: ReturnType<typeof setTimeout>;

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 1500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Hard timeout
  setTimeout(() => {
    observer.disconnect();
    resolve();
  }, timeout);

  // Resolve if no mutations happen quickly
  timer = setTimeout(() => {
    observer.disconnect();
    resolve();
  }, 1500);
}

function isLoginPage(): boolean {
  // Check for password fields only — conservative approach (S5)
  return document.querySelectorAll('input[type="password"]').length > 0;
}

async function capture() {
  if (isLoginPage()) return;

  await waitForStableDOM();

  const result = captureContent(document);
  if (result.text.length < 100) return;

  if (!chrome.runtime?.id) return; // extension context invalidated
  chrome.runtime.sendMessage({
    type: 'snapshot',
    data: {
      url: window.location.href,
      title: result.title,
      text: result.text,
      method: result.method,
    },
  });
}

// Detect SPA navigations via History API (B3)
let lastUrl = location.href;

function onNavigation() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(capture, 500);
  }
}

// Monkey-patch pushState/replaceState
const origPushState = history.pushState.bind(history);
const origReplaceState = history.replaceState.bind(history);

history.pushState = function (...args) {
  origPushState(...args);
  onNavigation();
};

history.replaceState = function (...args) {
  origReplaceState(...args);
  onNavigation();
};

window.addEventListener('popstate', onNavigation);

// Initial capture
capture();
