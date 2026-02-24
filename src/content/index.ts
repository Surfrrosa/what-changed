import { captureContent } from '../lib/capture';

// Wait for the DOM to stop mutating (SPAs, async content)
function waitForStableDOM(timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
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
  });
}

function isLoginPage(): boolean {
  if (document.querySelectorAll('input[type="password"]').length === 0) {
    return false;
  }
  const text = document.body.innerText.toLowerCase();
  const keywords = ['sign in', 'log in', 'login', 'sign up', 'create account'];
  return keywords.some(kw => text.includes(kw));
}

async function capture() {
  if (isLoginPage()) return;

  await waitForStableDOM();

  const result = captureContent(document);
  if (result.text.length < 100) return;

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

// Detect SPA navigations
let lastUrl = location.href;
const spaObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(capture, 500);
  }
});
spaObserver.observe(document.body, { childList: true, subtree: true });

// Initial capture
capture();
