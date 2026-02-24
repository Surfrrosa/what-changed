const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'dclid', 'msclkid', 'yclid', 'twclid',
  'mc_cid', 'mc_eid', '_ga', '_gl', 'srsltid',
  'ref', 'source',
];

export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);

    if (!url.protocol.startsWith('http')) return rawUrl;

    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }

    url.searchParams.sort();
    url.hash = '';

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function isBlockedDomain(
  url: string,
  blockedDomains: string[]
): boolean {
  if (blockedDomains.length === 0) return false;
  try {
    const hostname = new URL(url).hostname;
    return blockedDomains.some(
      d => hostname === d || hostname.endsWith('.' + d)
    );
  } catch {
    return false;
  }
}

export function isTrackablePage(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) return false;

    const skip = [
      /^chrome:/,
      /^chrome-extension:/,
      /^about:/,
      /^data:/,
      /^file:/,
    ];
    return !skip.some(p => p.test(url));
  } catch {
    return false;
  }
}
