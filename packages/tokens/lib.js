/**
 * lib.js
 *
 * Loads the DTCG token JSON in tokens/, resolves {references}, and names each
 * token as a CSS custom property. Shared by build.js and check.js.
 *
 * Tokens are loaded once per mode. Everything except the semantic color file
 * is shared; tokens/color/semantic-<mode>.json supplies the mode's values.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TOKENS_DIR = path.resolve(__dirname, '..', '..', 'tokens');

const SHARED_FILES = [
  'color/primitives.json',
  'typography.json',
  'layout.json',
  'motion.json',
  'alias/shadcn.json',
];
const MODE_FILES = {
  light: 'color/semantic-light.json',
  dark:  'color/semantic-dark.json',
};
const MODES = Object.keys(MODE_FILES);

const REF = /^\{([^}]+)\}$/;
const isRef = (v) => typeof v === 'string' && REF.test(v);
const refPath = (v) => v.match(REF)[1];

// ─── Loading ─────────────────────────────────────────────────────────────────

function flatten(node, trail, file, out) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$') || value == null || typeof value !== 'object') continue;
    const p = [...trail, key];
    if ('$value' in value) {
      const id = p.join('.');
      if (out.has(id)) throw new Error(`Duplicate token "${id}" in ${file}`);
      out.set(id, { path: id, value: value.$value, type: value.$type, description: value.$description, file });
    } else {
      flatten(value, p, file, out);
    }
  }
  return out;
}

function loadSet(mode) {
  const set = new Map();
  for (const file of [...SHARED_FILES, MODE_FILES[mode]]) {
    const json = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, file), 'utf8'));
    flatten(json, [], file, set);
  }
  return set;
}

// ─── Resolving ───────────────────────────────────────────────────────────────

// Follow a reference chain to the token that holds a literal value.
// Returns { token, chain } where chain lists every path visited.
function follow(set, id, chain = []) {
  if (chain.includes(id)) throw new Error(`Circular reference: ${[...chain, id].join(' -> ')}`);
  const token = set.get(id);
  if (!token) throw new Error(`Unknown token "${id}"${chain.length ? ` (from ${chain.at(-1)})` : ''}`);
  const next = [...chain, id];
  return isRef(token.value) ? follow(set, refPath(token.value), next) : { token, chain: next };
}

// ─── Naming ──────────────────────────────────────────────────────────────────

// Maps a token path to its CSS custom property name. Names match the
// hand-written variables-light.css that consumers already depend on.
function cssName(id) {
  const p = id.split('.');
  const tail = p.slice(-1)[0];
  if (p[0] === 'color' && p[1] === 'primitive') {
    const group = p[2];
    if (group === 'accent')     return `--color-accent-${tail}`;
    if (group === 'brand-ramp') return `--color-brand-${tail}`;
    if (group === 'blue-scale') return `--color-blue-${tail}`;
    return `--color-${tail}`;
  }
  if (p[0] === 'color' && p[1] === 'semantic') {
    if (p[2] === 'shadow') return `--shadow-${tail}`;
    return `--${p[2]}-${tail}`;
  }
  if (p[0] === 'typography') {
    if (p[1] === 'font-family') return tail === 'primary' ? '--font-family' : `--font-family-${tail}`;
    if (p[1] === 'font-weight') return `--font-weight-${tail}`;
    if (p[1] === 'styles') return null; // expanded by typographyVars()
  }
  if (p[0] === 'spacing')       return `--spacing-${tail}`;
  if (p[0] === 'corner-radius') return `--radius-${tail}`;
  if (p[0] === 'stroke-width')  return `--stroke-${tail}`;
  if (p[0] === 'shadow')        return `--shadow-${tail}`;
  if (p[0] === 'motion')        return `--${p[1]}-${tail}`;
  if (p[0] === 'alias')         return `--${tail}`;
  throw new Error(`No CSS name rule for token "${id}"`);
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const zero = (v) => (v === '0px' ? '0' : v);

// Format a token's value as CSS. With `refs`, references become var(--name)
// so the generated file reads like the token graph; without, they are
// resolved to literals.
function formatValue(set, token, refs) {
  const ref = (v, fmt) => {
    if (!isRef(v)) return fmt ? fmt(v) : String(v);
    if (refs) return `var(${cssName(refPath(v))})`;
    const { token: t } = follow(set, refPath(v));
    return formatValue(set, t, false);
  };
  const v = token.value;
  if (isRef(v)) return ref(v);
  switch (token.type) {
    case 'shadow':
      return v.map((l) => [zero(l.offsetX), zero(l.offsetY), l.blur, zero(l.spread) !== '0' ? l.spread : null, ref(l.color)]
        .filter(Boolean).join(' ')).join(', ');
    case 'cubicBezier':
      return `cubic-bezier(${v.join(', ')})`;
    default:
      return String(v);
  }
}

// Typography composites expand to size, line height and weight variables.
function typographyVars(set, token, refs) {
  const name = token.path.split('.').pop();
  const v = token.value;
  const weight = isRef(v.fontWeight)
    ? (refs ? `var(${cssName(refPath(v.fontWeight))})` : String(follow(set, refPath(v.fontWeight)).token.value))
    : String(v.fontWeight);
  return [
    [`--font-size-${name}`, v.fontSize],
    [`--line-height-${name}`, v.lineHeight],
    [`--font-weight-${name}`, weight],
  ];
}

// Every CSS variable a mode produces, in source order, as
// [{ name, value, literal, path, type, description, chain }].
function cssVars(set) {
  const out = [];
  const seen = new Map();
  const push = (entry) => {
    const prev = seen.get(entry.name);
    if (prev) {
      if (prev.literal !== entry.literal) {
        throw new Error(`${entry.name} is produced by ${prev.path} and ${entry.path} with different values`);
      }
      return; // e.g. brand.white and neutral.white both name --color-white
    }
    seen.set(entry.name, entry);
    out.push(entry);
  };
  for (const token of set.values()) {
    const chain = isRef(token.value) ? follow(set, token.path).chain : [token.path];
    if (token.type === 'typography') {
      const lit = typographyVars(set, token, false);
      typographyVars(set, token, true).forEach(([name, value], i) =>
        push({ name, value, literal: lit[i][1], path: token.path, type: 'typography', description: token.description, chain }));
      continue;
    }
    push({
      name: cssName(token.path),
      value: formatValue(set, token, true),
      literal: formatValue(set, token, false),
      path: token.path,
      type: token.type,
      description: token.description,
      chain,
    });
  }
  return out;
}

// ─── Color math (WCAG 2.x contrast) ──────────────────────────────────────────

function parseColor(str) {
  const s = str.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
  throw new Error(`Cannot parse color "${str}"`);
}

// Composite a (possibly translucent) color over an opaque one.
function over(top, under) {
  const a = top.a;
  return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 };
}

function luminance({ r, g, b }) {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Contrast of fg on bg; translucent bg is placed on `base` first.
function contrast(fg, bg, base) {
  const b = over(parseColor(bg), parseColor(base));
  const f = over(parseColor(fg), b);
  const [hi, lo] = [luminance(f), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

module.exports = {
  TOKENS_DIR, MODES, loadSet, follow, cssName, cssVars, isRef, refPath, contrast, parseColor,
};
