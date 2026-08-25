/**
 * Shared child-process helpers for the scripts/verify-lib-*.mjs scripts.
 *
 * Windows' cmd.exe (invoked via `shell: true`, needed here so `npm`/`ng`
 * resolve reliably regardless of which shell launched Node) does not
 * quote args for us even when they're passed as a separate array — it
 * just joins them with spaces. Quote anything containing a space (paths
 * under this repo do, e.g. ".../new update/...") before building the
 * command line; on POSIX, spawnSync's shell tokenizes on unquoted spaces
 * the same way, so this is required cross-platform, not Windows-only.
 */
import { spawnSync } from 'node:child_process';

function quote(arg) {
  return /\s/.test(arg) ? `"${arg}"` : arg;
}

function commandLine(command, args) {
  return [command, ...args.map(quote)].join(' ');
}

export function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

export function run(command, args, cwd) {
  const line = commandLine(command, args);
  console.log(`\n$ ${line}`);
  const result = spawnSync(line, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    fail(`Command failed (exit ${result.status}): ${line}`);
  }
}

export function runCapture(command, args, cwd) {
  const line = commandLine(command, args);
  const result = spawnSync(line, { cwd, encoding: 'utf8', shell: true });
  if (result.status !== 0) {
    fail(`Command failed (exit ${result.status}): ${line}\n${result.stderr}`);
  }
  return result.stdout.trim();
}
