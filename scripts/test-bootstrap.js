#!/usr/bin/env node
/**
 * test-bootstrap.js
 *
 * Regression test for bootstrap.js. Runs it twice against a throwaway project
 * that vendors this repo at design-system/ inside an ESM package (the common
 * Vite setup), then checks:
 *   - every target is created on the first run,
 *   - the second run reports everything up to date (idempotent),
 *   - the whole skill tree, including references/, is copied.
 */

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const dsRoot  = path.resolve(__dirname, '..');
const project = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-lab-bootstrap-'));
const SKIP    = new Set(['.git', 'node_modules', '.next']);
let failed = false;

function check(ok, msg) {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) failed = true;
}

try {
  fs.writeFileSync(path.join(project, 'package.json'), '{ "type": "module" }\n');
  // Copy rather than symlink: Node resolves symlinks to their real path, which
  // would hide the consumer's "type": "module" from the vendored scripts.
  fs.cpSync(dsRoot, path.join(project, 'design-system'), {
    recursive: true,
    filter: (src) => !SKIP.has(path.basename(src)),
  });

  const run = () => execFileSync(
    process.execPath,
    [path.join(project, 'design-system', 'scripts', 'bootstrap.js'), '--ds', 'design-system'],
    { cwd: project, encoding: 'utf8' }
  );

  const first = run();
  check(/✓ created: AGENTS\.md/.test(first), 'first run creates AGENTS.md');
  const skill = path.join(project, '.github', 'skills', 'proto-lab-design-system');
  check(fs.existsSync(path.join(skill, 'skill.md')), 'skill.md copied');
  check(fs.existsSync(path.join(skill, 'references', 'tokens.md')), 'references/tokens.md copied');
  check(
    fs.readFileSync(path.join(skill, 'skill.md'), 'utf8').includes('`design-system/tokens/'),
    'skill paths rewritten to design-system/'
  );

  const second = run();
  check(!/✓ /.test(second), 'second run writes nothing (idempotent)');
} finally {
  fs.rmSync(project, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log('\n  bootstrap OK\n');
