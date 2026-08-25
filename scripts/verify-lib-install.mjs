#!/usr/bin/env node
/**
 * Validates that dist/fleetpack-base is actually installable via `npm
 * install`, the way a real consumer would get it:
 *
 *   1. `npm pack` the built library into a real .tgz tarball.
 *   2. Scaffold a throwaway consumer project in a temp directory.
 *   3. `npm install <tarball>` into it — this also resolves the library's
 *      peerDependencies (@angular/core, @angular/cdk, …) from the
 *      registry, the same as a first-time consumer install would.
 *   4. Confirm the installed package's package.json points at files that
 *      actually exist on disk (main/module/typings/exports/style).
 *
 * This is the fast, shape-level check. `scripts/verify-lib-functional.mjs`
 * (chained after this one in `npm run verify:base`) goes further and
 * actually compiles a consumer Angular app against the installed package.
 *
 * Run `npm run build:base` first. Usage: `npm run verify:base`.
 * Pass `--keep` to leave the temp directory behind for inspection.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, run, runCapture } from './lib/proc.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist', 'fleetpack-base');
const keepTemp = process.argv.includes('--keep');

if (!existsSync(join(distDir, 'package.json'))) {
  fail(`No build output at ${distDir}.\nRun "npm run build:base" first, then re-run "npm run verify:base".`);
}

const builtPkg = JSON.parse(readFileSync(join(distDir, 'package.json'), 'utf8'));
console.log(`Built package: ${builtPkg.name}@${builtPkg.version}`);

// 1. Pack the built library into a real tarball, the same artifact `npm
//    publish` would upload.
const workDir = mkdtempSync(join(tmpdir(), 'fleetpack-base-verify-'));
const packOutput = runCapture('npm', ['pack', distDir, '--json'], workDir);
const [packInfo] = JSON.parse(packOutput);
const tarballPath = join(workDir, packInfo.filename);
if (!existsSync(tarballPath)) {
  fail(`npm pack reported ${packInfo.filename} but it was not found at ${tarballPath}`);
}
console.log(`Packed tarball: ${tarballPath} (${packInfo.size} bytes)`);

// 2. Scaffold a throwaway consumer project.
const consumerDir = join(workDir, 'consumer');
mkdirSync(consumerDir);
writeFileSync(
  join(consumerDir, 'package.json'),
  JSON.stringify({ name: 'fleetpack-base-verify-consumer', version: '0.0.0-verify', private: true }, null, 2),
);

// 3. Install the tarball — this also pulls peerDependencies from the
//    registry, proving the declared peer ranges actually resolve.
run('npm', ['install', tarballPath, '--no-audit', '--no-fund', '--loglevel=warn'], consumerDir);

// 4. Confirm the installed package's advertised entry points are real files.
const installedPkgDir = join(consumerDir, 'node_modules', ...builtPkg.name.split('/'));
const installedPkgJsonPath = join(installedPkgDir, 'package.json');
if (!existsSync(installedPkgJsonPath)) {
  fail(`Install reported success but ${installedPkgJsonPath} is missing.`);
}
const installedPkg = JSON.parse(readFileSync(installedPkgJsonPath, 'utf8'));

const entryFields = ['main', 'module', 'typings', 'types', 'style'];
const missing = [];
for (const field of entryFields) {
  const rel = installedPkg[field];
  if (!rel) continue;
  const abs = join(installedPkgDir, rel);
  if (!existsSync(abs)) missing.push(`${field} → ${rel}`);
}
if (installedPkg.exports) {
  for (const [key, value] of Object.entries(installedPkg.exports)) {
    const targets = typeof value === 'string' ? [value] : Object.values(value);
    for (const rel of targets) {
      if (typeof rel !== 'string') continue;
      const abs = join(installedPkgDir, rel);
      if (!existsSync(abs)) missing.push(`exports["${key}"] → ${rel}`);
    }
  }
}

if (missing.length > 0) {
  fail(`Installed package.json points at files that don't exist:\n  ${missing.join('\n  ')}`);
}

if (!keepTemp) {
  rmSync(workDir, { recursive: true, force: true });
} else {
  console.log(`\n(--keep) Left temp project at: ${workDir}`);
}

console.log(
  `\n✔ ${builtPkg.name}@${builtPkg.version} installs cleanly via npm install and all declared entry points resolve.`,
);
