#!/usr/bin/env node
/**
 * bootstrap.js
 *
 * Wires the Proto-Lab Design System into a consuming project so any AI agent
 * picks it up automatically. This does the deterministic half of adoption:
 *
 *   1. Inserts a pointer block into the project's AGENTS.md (creating it if
 *      needed) that tells agents to read design-system/APPLY.md.
 *   2. Writes shims for tools that don't read AGENTS.md natively:
 *        - CLAUDE.md                         (Claude Code)
 *        - .github/copilot-instructions.md   (GitHub Copilot)
 *      Each shim just imports/points at AGENTS.md, so there is one source of
 *      truth.
 *
 * The judgment half (mapping existing styles onto tokens, swapping components,
 * placing icons) is then performed by an agent following APPLY.md.
 *
 * Idempotent: re-running detects the existing pointer and makes no duplicate
 * edits. Safe to run on every `git pull` of the design system.
 *
 * Usage, from the consuming project's root:
 *   node design-system/scripts/bootstrap.js
 *
 * Options:
 *   --dir <path>   Project root to write into (default: current directory).
 *   --ds  <path>   Path to the design-system dir relative to the project root
 *                  (default: auto-detected from this script's location).
 *   --dry          Print what would change without writing.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Markers so we can find and re-update our own block without duplicating ──
const BEGIN = '<!-- proto-lab-design-system:begin -->';
const END   = '<!-- proto-lab-design-system:end -->';

function parseArgs(argv) {
  const args = { dir: process.cwd(), ds: null, dry: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') args.dry = true;
    else if (a === '--dir') args.dir = path.resolve(argv[++i]);
    else if (a === '--ds')  args.ds  = argv[++i];
  }
  return args;
}

// The pointer block dropped into AGENTS.md. `dsPath` is the design-system dir
// relative to the project root (e.g. "design-system").
function pointerBlock(dsPath) {
  return [
    BEGIN,
    '## Design system',
    '',
    `This project uses the CapTech Proto-Lab design system in \`${dsPath}/\`.`,
    'Before any UI, styling, theming, or component work, read and follow',
    `\`${dsPath}/APPLY.md\`. That file is authoritative for how this design`,
    'system is applied; do not improvise a different approach.',
    END,
  ].join('\n');
}

// Read a file or return null if it doesn't exist.
function readOrNull(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

// Upsert our marker block into existing content. Returns { content, action }.
function upsertBlock(existing, block) {
  if (existing == null) {
    return { content: block + '\n', action: 'created' };
  }
  const b = existing.indexOf(BEGIN);
  const e = existing.indexOf(END);
  if (b !== -1 && e !== -1 && e > b) {
    const before = existing.slice(0, b);
    const after  = existing.slice(e + END.length);
    return { content: before + block + after, action: 'updated' };
  }
  // Append, keeping one blank line of separation.
  const sep = existing.endsWith('\n') ? '\n' : '\n\n';
  return { content: existing + sep + block + '\n', action: 'appended' };
}

function write(p, content, dry) {
  if (dry) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function main() {
  const args = parseArgs(process.argv);
  const projectRoot = args.dir;

  // Resolve where the design system lives relative to the project root.
  // Default: this script is at <ds>/scripts/bootstrap.js, so <ds> is two up.
  const dsAbs = args.ds
    ? path.resolve(projectRoot, args.ds)
    : path.resolve(__dirname, '..');
  const dsRel = path.relative(projectRoot, dsAbs) || '.';
  // Normalize Windows separators for the markdown we emit.
  const dsPath = dsRel.split(path.sep).join('/');

  // Sanity check: APPLY.md should exist where we're pointing.
  if (!fs.existsSync(path.join(dsAbs, 'APPLY.md'))) {
    console.error(
      `\n  ✗ Could not find APPLY.md at "${dsPath}/APPLY.md".\n` +
      `    Run this from your project root, or pass --ds <path-to-design-system>.\n`
    );
    process.exit(1);
  }

  const targets = [];

  // 1) AGENTS.md — the canonical agent instructions file.
  {
    const p = path.join(projectRoot, 'AGENTS.md');
    const existing = readOrNull(p);
    const { content, action } = upsertBlock(existing, pointerBlock(dsPath));
    targets.push({ label: 'AGENTS.md', p, content, action });
  }

  // 2) CLAUDE.md shim — Claude Code reads this; @import pulls in AGENTS.md.
  {
    const p = path.join(projectRoot, 'CLAUDE.md');
    const existing = readOrNull(p);
    const shim = [
      BEGIN,
      '# Project instructions',
      '',
      'See @AGENTS.md for all project guidance, including the design system.',
      END,
    ].join('\n');
    // Only manage CLAUDE.md if it's absent or already ours; never clobber a
    // hand-written CLAUDE.md that lacks our markers.
    if (existing == null || existing.includes(BEGIN)) {
      const { content, action } = upsertBlock(existing, shim);
      targets.push({ label: 'CLAUDE.md', p, content, action });
    } else if (!existing.includes('AGENTS.md')) {
      const { content, action } = upsertBlock(existing, shim);
      targets.push({ label: 'CLAUDE.md', p, content, action });
    } else {
      targets.push({ label: 'CLAUDE.md', p, content: existing, action: 'skipped (already references AGENTS.md)' });
    }
  }

  // 3) Copilot shim — GitHub Copilot reads .github/copilot-instructions.md.
  {
    const p = path.join(projectRoot, '.github', 'copilot-instructions.md');
    const existing = readOrNull(p);
    const shim = [
      BEGIN,
      '# Copilot instructions',
      '',
      `This project uses the CapTech Proto-Lab design system. Before any UI or`,
      `styling work, read and follow \`${dsPath}/APPLY.md\` (see also \`AGENTS.md\`).`,
      END,
    ].join('\n');
    const { content, action } = upsertBlock(existing, shim);
    targets.push({ label: '.github/copilot-instructions.md', p, content, action });
  }

  // ─── Apply ──────────────────────────────────────────────────────────────
  console.log(`\n  Proto-Lab Design System bootstrap`);
  console.log(`  project:       ${projectRoot}`);
  console.log(`  design system: ${dsPath}/`);
  console.log(args.dry ? `  mode:          DRY RUN (no files written)\n` : ``);

  for (const t of targets) {
    if (t.action.startsWith('skipped')) {
      console.log(`  • ${t.label} — ${t.action}`);
      continue;
    }
    const prev = readOrNull(t.p);
    if (prev === t.content) {
      console.log(`  • ${t.label} — already up to date`);
      continue;
    }
    write(t.p, t.content, args.dry);
    console.log(`  ${args.dry ? '· would ' + t.action : '✓ ' + t.action}: ${t.label}`);
  }

  console.log(`\n  Next: tell your AI agent  →  "Apply the design system to this project."\n`);
}

main();
