import { build } from 'esbuild';
import { cpSync, rmSync } from 'fs';

const isDev = process.argv.includes('--dev');

// Clean previous build
rmSync('dist', { recursive: true, force: true });

// Bundle all entry points
await build({
  entryPoints: {
    'background': 'src/background/index.ts',
    'content': 'src/content/index.ts',
    'popup/index': 'src/popup/index.ts',
    'sidepanel/index': 'src/sidepanel/index.ts',
    'options/index': 'src/options/index.ts',
  },
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  target: 'chrome120',
  sourcemap: isDev,
});

// Copy static assets (manifest, HTML, CSS)
cpSync('static', 'dist', { recursive: true });

console.log(`Build complete -> dist/${isDev ? ' (with source maps)' : ''}`);
