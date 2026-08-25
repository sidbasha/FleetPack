#!/usr/bin/env node
/**
 * Compiles the app's global stylesheet (src/styles.css — Tailwind v4
 * CSS-first config, the Nexus design tokens, and the component utility
 * classes every Base component relies on, e.g. `btn-primary`, `panel`,
 * `table-th`) into a standalone CSS file and drops it into the packaged
 * library as dist/fleetpack-base/styles.css.
 *
 * Without this, `npm install @your-scope/fleetpack-base` gets component
 * logic/templates only and renders unstyled — see the (now resolved)
 * caveat this replaces in README.md / src/app/base/README.md. This is a
 * direct postcss + `@tailwindcss/postcss` compile of the exact same
 * `src/styles.css` the app itself builds with — same tokens, same
 * generated utilities, same `@source` scan (`./app`, `./index.html`,
 * `./stories`, all under src/), so the shipped CSS is never out of sync
 * with what the demo app renders.
 *
 * Runs as a postbuild step after `ng build fleetpack-base` (chained in
 * package.json's "build:base" script): it also patches the ng-packagr
 * output package.json so the new file is importable — Node's package
 * `exports` field, which ng-packagr generates, blocks any subpath not
 * explicitly listed.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceCss = join(repoRoot, 'src', 'styles.css');
const distDir = join(repoRoot, 'dist', 'fleetpack-base');
const outputCss = join(distDir, 'styles.css');
const distPkgPath = join(distDir, 'package.json');

if (!existsSync(distPkgPath)) {
  console.error(`\n✖ ${distPkgPath} not found. Run "ng build fleetpack-base" before this script.`);
  process.exit(1);
}

const css = readFileSync(sourceCss, 'utf8');
const result = await postcss([tailwind()]).process(css, { from: sourceCss, to: outputCss });

writeFileSync(outputCss, result.css);
if (result.map) writeFileSync(`${outputCss}.map`, result.map.toString());

const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
pkg.style = 'styles.css';
pkg.exports ??= {};
pkg.exports['./styles.css'] = './styles.css';
writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`✔ Compiled ${sourceCss} → ${outputCss} (${(Buffer.byteLength(result.css) / 1024).toFixed(1)} kB)`);
