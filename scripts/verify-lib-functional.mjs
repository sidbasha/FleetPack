#!/usr/bin/env node
/**
 * Deep, functional verification that a *real* Angular application can
 * consume the packaged library end to end — not just that files exist,
 * but that they compile, link, bundle, and style correctly:
 *
 *   1. Pack dist/fleetpack-base into a tarball (same artifact as
 *      verify-lib-install.mjs / `npm publish` would use).
 *   2. Scaffold a minimal but complete Angular 20 application in a temp
 *      directory that depends on the tarball via a `file:` reference
 *      (npm treats this identically to a registry-resolved dependency —
 *      the resulting node_modules layout is the same either way) plus
 *      the same peerDependency versions this repo uses.
 *   3. `npm install` it — pulls @angular/core, @angular/cdk, etc. from
 *      the registry for real, proving the declared peer ranges resolve.
 *   4. Render three representative exports (`BaseButtonComponent`,
 *      `BaseBadgeComponent`, `BaseTableComponent` — the last one pulls in
 *      @angular/cdk/drag-drop internally, exercising that peer dep too)
 *      in a standalone root component, wire the package's styles.css
 *      into angular.json's "styles", and run a real production
 *      `ng build` (AOT + Ivy partial-compilation linking + esbuild
 *      bundling + CSS concatenation).
 *   5. Assert the built JS bundle contains each component's distinctive
 *      marker text/logic and the built CSS contains the design tokens
 *      and utility classes those components actually render with.
 *
 * This does not launch a browser — it doesn't visually confirm
 * rendering — but a successful build here means the same TypeScript
 * compiler, Angular compiler, and bundler a real consumer's `ng build`
 * uses processed the installed package cleanly and produced output
 * containing the expected component logic and styles.
 *
 * Run `npm run build:base` first. Usage: `npm run verify:base` (chained
 * after verify-lib-install.mjs) or `node scripts/verify-lib-functional.mjs`
 * directly. Pass `--keep` to leave the temp project behind for inspection.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, run, runCapture } from './lib/proc.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist', 'fleetpack-base');
const keepTemp = process.argv.includes('--keep');

if (!existsSync(join(distDir, 'package.json'))) {
  fail(`No build output at ${distDir}.\nRun "npm run build:base" first, then re-run this script.`);
}

const builtPkg = JSON.parse(readFileSync(join(distDir, 'package.json'), 'utf8'));
const rootPkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const angularVersionRange = rootPkg.dependencies['@angular/core'];
console.log(`Functionally verifying: ${builtPkg.name}@${builtPkg.version}`);

// 1. Pack the built library into a real tarball.
const workDir = mkdtempSync(join(tmpdir(), 'fleetpack-base-functional-'));
const packOutput = runCapture('npm', ['pack', distDir, '--json'], workDir);
const [packInfo] = JSON.parse(packOutput);
const tarballAbsPath = join(workDir, packInfo.filename);
console.log(`Packed tarball: ${tarballAbsPath}`);

// 2. Scaffold a minimal Angular application that consumes it.
const appDir = join(workDir, 'consumer-app');
mkdirSync(join(appDir, 'src', 'app'), { recursive: true });

writeFileSync(
  join(appDir, 'package.json'),
  JSON.stringify(
    {
      name: 'fleetpack-base-functional-consumer',
      version: '0.0.0-verify',
      private: true,
      dependencies: {
        [builtPkg.name]: `file:../${packInfo.filename}`,
        '@angular/animations': angularVersionRange,
        '@angular/cdk': angularVersionRange,
        '@angular/common': angularVersionRange,
        '@angular/compiler': angularVersionRange,
        '@angular/core': angularVersionRange,
        '@angular/forms': angularVersionRange,
        '@angular/platform-browser': angularVersionRange,
        '@angular/router': angularVersionRange,
        rxjs: rootPkg.dependencies.rxjs,
        tslib: rootPkg.dependencies.tslib,
        'zone.js': rootPkg.dependencies['zone.js'],
      },
      devDependencies: {
        '@angular/build': rootPkg.devDependencies['@angular/build'],
        '@angular/cli': rootPkg.devDependencies['@angular/cli'],
        '@angular/compiler-cli': rootPkg.devDependencies['@angular/compiler-cli'],
        typescript: rootPkg.devDependencies.typescript,
      },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(appDir, 'angular.json'),
  JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      projects: {
        'consumer-app': {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                outputPath: 'dist/consumer-app',
                index: 'src/index.html',
                browser: 'src/main.ts',
                polyfills: ['zone.js'],
                tsConfig: 'tsconfig.app.json',
                styles: [`node_modules/${builtPkg.name}/styles.css`, 'src/styles.css'],
                assets: [],
                scripts: [],
              },
              configurations: {
                production: { outputHashing: 'none' },
              },
              defaultConfiguration: 'production',
            },
          },
        },
      },
      cli: { analytics: false },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(appDir, 'tsconfig.json'),
  JSON.stringify(
    {
      compileOnSave: false,
      compilerOptions: {
        outDir: './dist/out-tsc',
        strict: true,
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        experimentalDecorators: true,
        useDefineForClassFields: false,
        skipLibCheck: true,
        lib: ['ES2022', 'dom'],
      },
      angularCompilerOptions: { strictTemplates: true },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(appDir, 'tsconfig.app.json'),
  JSON.stringify(
    { extends: './tsconfig.json', compilerOptions: { outDir: './out-tsc/app', types: [] }, files: ['src/main.ts'] },
    null,
    2,
  ),
);

writeFileSync(
  join(appDir, 'src', 'index.html'),
  '<!doctype html><html><head><meta charset="utf-8"><title>verify</title></head><body><app-root></app-root></body></html>\n',
);

writeFileSync(join(appDir, 'src', 'styles.css'), '/* consumer app global styles (trivial for this smoke test) */\n');

writeFileSync(
  join(appDir, 'src', 'main.ts'),
  `import { bootstrapApplication } from '@angular/platform-browser';\nimport { AppComponent } from './app/app.component';\n\nbootstrapApplication(AppComponent).catch((err) => console.error(err));\n`,
);

// Renders three representative exports spanning form/action, data-display,
// and the table (which pulls in @angular/cdk/drag-drop internally via
// Manage Columns) — enough breadth to exercise every declared peer dep,
// not just @angular/core.
writeFileSync(
  join(appDir, 'src', 'app', 'app.component.ts'),
  `import { Component } from '@angular/core';
import { BaseBadgeComponent, BaseButtonComponent, BaseColumnDef, BaseTableComponent } from '${builtPkg.name}';

interface VerifyRow {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BaseButtonComponent, BaseBadgeComponent, BaseTableComponent],
  template: \`
    <base-button variant="primary">VERIFY_BUTTON_MARKER</base-button>
    <base-badge label="VERIFY_BADGE_MARKER"></base-badge>
    <base-table [columns]="columns" [rows]="rows" trackKey="id"></base-table>
  \`,
})
export class AppComponent {
  columns: BaseColumnDef<VerifyRow>[] = [{ key: 'name', header: 'Name' }];
  rows: VerifyRow[] = [{ id: 1, name: 'VERIFY_ROW_MARKER' }];
}
`,
);

// 3. Install — resolves the file: dependency plus every peer from the
//    real registry, same as a first-time consumer install.
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=warn'], appDir);

// 4. Real production build: AOT compile, Ivy partial-compilation linking,
//    esbuild bundling, CSS concatenation.
run('npx', ['ng', 'build'], appDir);

// 5. Inspect the built output for the expected content.
const browserDir = join(appDir, 'dist', 'consumer-app', 'browser');
if (!existsSync(browserDir)) {
  fail(`Build reported success but ${browserDir} is missing.`);
}
const builtFiles = readdirSync(browserDir);
const jsFile = builtFiles.find((f) => f === 'main.js') ?? builtFiles.find((f) => /^main[.-].*\.js$/.test(f));
const cssFile = builtFiles.find((f) => f === 'styles.css') ?? builtFiles.find((f) => /^styles[.-].*\.css$/.test(f));
if (!jsFile || !cssFile) {
  fail(`Expected main.js and styles.css in ${browserDir}, found: ${builtFiles.join(', ')}`);
}

const js = readFileSync(join(browserDir, jsFile), 'utf8');
const css = readFileSync(join(browserDir, cssFile), 'utf8');

const jsChecks = [
  ['VERIFY_BUTTON_MARKER', 'the app\'s own template text made it into the bundle at all'],
  ['VERIFY_BADGE_MARKER', 'same, for the badge usage'],
  ['VERIFY_ROW_MARKER', 'table row data flows through BaseTableComponent'],
  ['bg-action', "BaseButtonComponent's compiled class-computation logic (not just its template) shipped and runs"],
];
const cssChecks = [
  ['--p-indigo', 'the Nexus primitive design tokens compiled into styles.css'],
  ['.bg-action', 'the semantic Tailwind utility Base components render with was actually generated, not just referenced'],
];

const failures = [];
for (const [needle, why] of jsChecks) {
  if (!js.includes(needle)) failures.push(`main.js is missing "${needle}" (${why})`);
}
for (const [needle, why] of cssChecks) {
  if (!css.includes(needle)) failures.push(`styles.css is missing "${needle}" (${why})`);
}
if (failures.length > 0) {
  fail(`Built output is missing expected content:\n  ${failures.join('\n  ')}`);
}

if (!keepTemp) {
  rmSync(workDir, { recursive: true, force: true });
} else {
  console.log(`\n(--keep) Left consumer app at: ${appDir}`);
}

console.log(
  `\n✔ A real Angular app installing ${builtPkg.name}@${builtPkg.version} compiles, bundles, and ships the` +
    ` expected component logic and Tailwind/token CSS.`,
);
