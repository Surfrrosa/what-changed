#!/usr/bin/env node

/**
 * Generate CWS promo tiles using sharp.
 *
 * Output:
 *   static/promo-small.png   (440x280)
 *   static/promo-marquee.png (1400x560)
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../static');

const BG = '#1a1a1a';
const ACCENT = '#4A90D9';
const GREEN = '#2ea043';
const RED = '#cf222e';
const WHITE = '#ffffff';
const MUTED = '#8b8b8b';

function smallTile() {
  const w = 440, h = 280;
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}"/>

    <!-- Diff lines with readable text -->
    <g transform="translate(24, 24)">
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="82" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="11" fill="${RED}" text-decoration="line-through">$29/month</text>
        <rect x="90" y="0" width="82" height="20" rx="3" fill="#152a17"/>
        <text x="96" y="14" font-family="monospace" font-size="11" fill="${GREEN}">$39/month</text>
      </g>

      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="152" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="11" fill="${RED}" text-decoration="line-through">10 team members</text>
        <rect x="160" y="0" width="130" height="20" rx="3" fill="#152a17"/>
        <text x="166" y="14" font-family="monospace" font-size="11" fill="${GREEN}">5 team members</text>
      </g>

      <g transform="translate(0, 60)">
        <rect x="0" y="0" width="170" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="11" fill="${RED}" text-decoration="line-through">Priority email support</text>
        <rect x="178" y="0" width="180" height="20" rx="3" fill="#152a17"/>
        <text x="184" y="14" font-family="monospace" font-size="11" fill="${GREEN}">Standard email support</text>
      </g>

      <g transform="translate(0, 90)">
        <rect x="0" y="0" width="110" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="11" fill="${RED}" text-decoration="line-through">Cancel anytime</text>
        <rect x="118" y="0" width="220" height="20" rx="3" fill="#152a17"/>
        <text x="124" y="14" font-family="monospace" font-size="11" fill="${GREEN}">Cancel with 30 days notice</text>
      </g>
    </g>

    <!-- Title -->
    <text x="220" y="195" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="${WHITE}">What Changed</text>

    <!-- Tagline -->
    <text x="220" y="224" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="13" fill="${MUTED}">See what changed on any page since your last visit.</text>

  </svg>`;

  return sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(OUT, 'promo-small.png'));
}

function marqueeTile() {
  const w = 1400, h = 560;
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}"/>

    <!-- Left side: diff preview -->
    <g transform="translate(100, 120)">
      <!-- Card background -->
      <rect width="480" height="320" rx="12" fill="#242424"/>
      <rect width="480" height="1" y="48" fill="#333"/>

      <!-- Card header -->
      <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="${WHITE}">Acme Pro — Pricing</text>
      <text x="456" y="32" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" fill="${MUTED}">18% changed</text>

      <!-- Diff lines -->
      <g transform="translate(24, 72)">
        <rect x="0" y="0" width="80" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="12" fill="${RED}" text-decoration="line-through">$29/month</text>

        <rect x="90" y="0" width="80" height="20" rx="3" fill="#152a17"/>
        <text x="96" y="14" font-family="monospace" font-size="12" fill="${GREEN}">$39/month</text>
      </g>

      <g transform="translate(24, 108)">
        <rect x="0" y="0" width="180" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="12" fill="${RED}" text-decoration="line-through">Priority email support</text>

        <rect x="190" y="0" width="190" height="20" rx="3" fill="#152a17"/>
        <text x="196" y="14" font-family="monospace" font-size="12" fill="${GREEN}">Standard email support</text>
      </g>

      <g transform="translate(24, 144)">
        <rect x="0" y="0" width="140" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="12" fill="${RED}" text-decoration="line-through">10 team members</text>

        <rect x="150" y="0" width="120" height="20" rx="3" fill="#152a17"/>
        <text x="156" y="14" font-family="monospace" font-size="12" fill="${GREEN}">5 team members</text>
      </g>

      <g transform="translate(24, 180)">
        <rect x="0" y="0" width="120" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="12" fill="${RED}" text-decoration="line-through">Cancel anytime</text>

        <rect x="130" y="0" width="250" height="20" rx="3" fill="#152a17"/>
        <text x="136" y="14" font-family="monospace" font-size="12" fill="${GREEN}">Cancel with 30 days notice</text>
      </g>

      <g transform="translate(24, 216)">
        <rect x="0" y="0" width="100" height="20" rx="3" fill="#2a1517"/>
        <text x="6" y="14" font-family="monospace" font-size="12" fill="${RED}" text-decoration="line-through">99.9% uptime</text>

        <rect x="110" y="0" width="100" height="20" rx="3" fill="#152a17"/>
        <text x="116" y="14" font-family="monospace" font-size="12" fill="${GREEN}">99.5% uptime</text>
      </g>

      <!-- Filter buttons -->
      <g transform="translate(24, 268)">
        <rect x="0" y="0" width="40" height="24" rx="12" fill="${WHITE}"/>
        <text x="20" y="16" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" font-weight="600" fill="${BG}">All</text>

        <rect x="48" y="0" width="56" height="24" rx="12" fill="#333" stroke="#555" stroke-width="1"/>
        <text x="76" y="16" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" fill="${MUTED}">Added</text>

        <rect x="112" y="0" width="72" height="24" rx="12" fill="#333" stroke="#555" stroke-width="1"/>
        <text x="148" y="16" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" fill="${MUTED}">Removed</text>
      </g>
    </g>

    <!-- Right side: text -->
    <g transform="translate(720, 160)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="${WHITE}">What Changed</text>

      <text x="0" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="20" fill="${MUTED}">See what changed on any page</text>
      <text x="0" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="20" fill="${MUTED}">since your last visit.</text>

      <text x="0" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="15" fill="#666">Word-level diffs. Zero setup.</text>
      <text x="0" y="164" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="15" fill="#666">All data stays in your browser.</text>

      <!-- Badge mockup -->
      <g transform="translate(0, 224)">
        <rect x="0" y="0" width="28" height="18" rx="4" fill="${ACCENT}"/>
        <text x="14" y="13" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" fill="${WHITE}">7</text>
        <text x="36" y="13" font-family="-apple-system, sans-serif" font-size="13" fill="#666">changes detected</text>
      </g>
    </g>
  </svg>`;

  return sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(OUT, 'promo-marquee.png'));
}

await Promise.all([smallTile(), marqueeTile()]);
console.log('Promo tiles generated:');
console.log('  static/promo-small.png   (440x280)');
console.log('  static/promo-marquee.png (1400x560)');
