#!/usr/bin/env node
/**
 * check.js
 *
 * Guards the generated tokens:
 *   1. Superset: every variable in the frozen hand-written baseline
 *      (baseline/variables-light.v1.css) still exists in the generated
 *      variables-light.css with the same resolved value. Existing consumers
 *      can't break silently.
 *   2. Parity: every semantic color has a light and a dark value.
 *   3. Contrast: pairs in contrast-pairs.json meet WCAG in both modes.
 *      'error' pairs fail the check unless listed in knownFailures.
 *
 * Usage: node packages/tokens/check.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { TOKENS_DIR, MODES, loadSet, cssVars, contrast } = require('./lib');

const PAIRS = require('./contrast-pairs.json');
let errors = 0;
const fail = (msg) => { console.log(`  ✗ ${msg}`); errors++; };

// ─── 1. Superset against the v1 baseline ─────────────────────────────────────

function parseVars(file) {
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const root = css.match(/:root\s*\{([\s\S]*?)\}/);
  const map = new Map();
  for (const [, name, value] of root[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(name, value.trim());
  return map;
}

function resolveAll(map) {
  const out = new Map();
  const resolve = (name, seen = []) => {
    if (seen.includes(name)) throw new Error(`Circular var(): ${[...seen, name].join(' -> ')}`);
    const raw = map.get(name);
    if (raw == null) return null;
    return raw.replace(/var\((--[\w-]+)\)/g, (_, ref) => resolve(ref, [...seen, name]) ?? `var(${ref})`);
  };
  for (const name of map.keys()) out.set(name, resolve(name));
  return out;
}

const normalize = (v) => v.toLowerCase().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').replace(/\b0px\b/g, '0').trim();

{
  const baseline = resolveAll(parseVars(path.join(__dirname, 'baseline', 'variables-light.v1.css')));
  const current  = resolveAll(parseVars(path.join(TOKENS_DIR, 'css', 'variables-light.css')));
  let missing = 0, changed = 0;
  for (const [name, value] of baseline) {
    if (!current.has(name)) { fail(`baseline variable ${name} is missing`); missing++; continue; }
    if (normalize(current.get(name)) !== normalize(value)) {
      fail(`${name} changed: ${value} → ${current.get(name)}`);
      changed++;
    }
  }
  const added = [...current.keys()].filter((n) => !baseline.has(n)).length;
  if (!missing && !changed) console.log(`  ✓ superset of v1 baseline (${baseline.size} kept, ${added} added)`);
}

// ─── 2. Light/dark parity ────────────────────────────────────────────────────

{
  const keys = Object.fromEntries(MODES.map((m) => [m,
    new Set([...loadSet(m).keys()].filter((k) => k.startsWith('color.semantic.')))]));
  const [a, b] = MODES;
  const onlyA = [...keys[a]].filter((k) => !keys[b].has(k));
  const onlyB = [...keys[b]].filter((k) => !keys[a].has(k));
  onlyA.forEach((k) => fail(`${k} has a ${a} value but no ${b} value`));
  onlyB.forEach((k) => fail(`${k} has a ${b} value but no ${a} value`));
  if (!onlyA.length && !onlyB.length) console.log(`  ✓ light/dark parity (${keys[a].size} semantic colors)`);
}

// ─── 3. Contrast ─────────────────────────────────────────────────────────────

{
  const known = new Set(PAIRS.knownFailures.map((k) => `${k.mode} ${k.fg} ${k.bg}`));
  const warnings = [];
  let passed = 0, allowed = 0;
  for (const mode of MODES) {
    const lit = new Map(cssVars(loadSet(mode)).map((v) => [v.name, v.literal]));
    for (const p of PAIRS.pairs) {
      const ratio = contrast(lit.get(p.fg), lit.get(p.bg), lit.get('--background'));
      const line = `${mode.padEnd(5)} ${p.fg} on ${p.bg}: ${ratio.toFixed(2)}:1 (needs ${p.min}:1)`;
      if (ratio >= p.min) { passed++; continue; }
      if (p.level === 'warn') warnings.push(line);
      else if (known.has(`${mode} ${p.fg} ${p.bg}`)) { allowed++; warnings.push(`${line} [known failure]`); }
      else fail(`contrast ${line}`);
    }
  }
  console.log(`  ✓ contrast: ${passed} pairs pass${allowed ? `, ${allowed} known failures` : ''}`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
}

if (errors) {
  console.error(`\n  ${errors} token check(s) failed.\n`);
  process.exit(1);
}
console.log('\n  tokens OK\n');
