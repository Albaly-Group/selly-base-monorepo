#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findPackageJsons(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findPackageJsons(full));
    } else if (e.isFile() && e.name === 'package.json') {
      results.push(full);
    }
  }
  return results;
}

function run(cmd, args, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  console.log('\n> ' + [cmd, ...(args || [])].join(' ') + '  (cwd: ' + cwd + ')');
  const res = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: true });
  if (res.error) {
    console.error('Command failed:', res.error);
    process.exit(res.status || 1);
  }
  if (res.status !== 0) {
    console.error(`Command exited with code ${res.status}`);
    // continue to allow audit attempts, but surface the non-zero status
  }
}

function main() {
  const root = process.cwd();
  console.log('Scanning for package.json files...');
  const pkgFiles = findPackageJsons(root).filter(p => !p.includes(path.join('node_modules', '')));
  console.log('Found', pkgFiles.length, 'package.json files');

  // Ensure npm-check-updates is available via npx
  for (const pkg of pkgFiles) {
    const dir = path.dirname(pkg);
    console.log('\n--- Updating deps in', dir, '---');
    // run ncu to upgrade package.json versions
    run('npx', ['npm-check-updates', '-u'], { cwd: dir });
  }

  console.log('\nInstalling updated dependencies at repo root...');
  run('npm', ['install']);

  console.log('\nRunning `npm audit` and attempting auto-fixes...');
  try {
    run('npm', ['audit', '--audit-level=low']);
    run('npm', ['audit', 'fix']);
    // Re-run audit to see remaining
    run('npm', ['audit']);
  } catch (e) {
    console.error('npm audit steps had issues:', e && e.message);
  }

  console.log('\nIf vulnerabilities remain, consider running `npm audit fix --force` manually.');
  console.log('Next steps: run your test/build scripts for each workspace and review any breaking changes.');
}

main();
