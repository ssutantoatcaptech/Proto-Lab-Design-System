#!/usr/bin/env node
/**
 * sync-blocks.js
 *
 * Installs upstream shadcn/ui blocks (Base UI "nova" style) the way a CapTech
 * project would receive them, and copies each one into its own folder,
 * apps/docs/registry/proto-lab/blocks/<name>/, so the docs can render it.
 *
 * Blocks share file names (several ship app-sidebar.tsx) and page targets
 * (app/dashboard/page.tsx), so they can't live in one project. Each block is
 * installed into a scratch app with the pinned CLI, which also replaces the
 * upstream icon placeholders with Lucide. Git in the scratch app tells us
 * exactly which files the block added. Those files are copied with imports
 * made self-contained:
 *   @/components/ui/*  -> @/registry/proto-lab/ui/*   (shared, already adopted)
 *   @/components/<x>   -> ./components/<x>            (the block's own files)
 *   @/hooks/*, @/lib/utils -> the Proto-Lab registry
 *
 * Writes blocks/<name>/... and blocks/manifest.json. The weekly upstream
 * workflow runs this through `npm run upstream:sync`.
 *
 * Also writes blocks/index.ts, the loaders the docs /view route uses.
 *
 * Usage:
 *   node scripts/sync-blocks.js                 every block in BLOCKS
 *   node scripts/sync-blocks.js login-01 ...    only these
 *   node scripts/sync-blocks.js --index         only regenerate index.ts
 */

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT   = path.resolve(__dirname, '..');
const DOCS   = path.join(ROOT, 'apps', 'docs');
const OUT    = path.join(DOCS, 'registry', 'proto-lab', 'blocks');
const STYLE  = 'base-nova';
const CLI    = `shadcn@${require(path.join(DOCS, 'package.json')).devDependencies.shadcn}`;

// Upstream blocks Proto-Lab adopts, by category. (preview and preview-02,
// the galleries on shadcn's Create page, aren't standalone: their cards
// import Create's internal modules and aren't published to the registry.)
const BLOCKS = {
  dashboard: ['dashboard-01'],
  sidebar: Array.from({ length: 16 }, (_, i) => `sidebar-${String(i + 1).padStart(2, '0')}`),
  login: ['login-01', 'login-02', 'login-03', 'login-04', 'login-05'],
  signup: ['signup-01', 'signup-02', 'signup-03', 'signup-04', 'signup-05'],
};

const run = (cmd, args, cwd) => execFileSync(cmd, args, {
  cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', env: { ...process.env, CI: '1' },
});
const git = (args, cwd) => run('git', ['-c', 'user.email=sync@proto-lab', '-c', 'user.name=sync', ...args], cwd);

// A minimal Next.js app: the CLI only installs block pages (registry:page)
// into Next projects, and pages carry icon placeholders it must convert.
function scaffoldNext(dir) {
  const docs = require(path.join(DOCS, 'package.json'));
  const v = (n) => docs.dependencies[n] || docs.devDependencies[n];
  const write = (f, c) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), c); };
  write('package.json', JSON.stringify({
    name: 'proto-lab-blocks-scratch', private: true,
    dependencies: { next: v('next'), react: v('react'), 'react-dom': v('react-dom') },
    devDependencies: { tailwindcss: v('tailwindcss'), '@tailwindcss/postcss': v('@tailwindcss/postcss'), typescript: v('typescript'), '@types/react': v('@types/react'), '@types/node': v('@types/node') },
  }, null, 2));
  write('.npmrc', 'legacy-peer-deps=true\n');
  write('tsconfig.json', JSON.stringify({ compilerOptions: { jsx: 'preserve', moduleResolution: 'bundler', module: 'esnext', strict: true, paths: { '@/*': ['./*'] } }, include: ['**/*.ts', '**/*.tsx'] }, null, 2));
  write('next.config.mjs', 'export default {}\n');
  write('postcss.config.mjs', 'export default { plugins: { "@tailwindcss/postcss": {} } }\n');
  write('app/globals.css', '@import "tailwindcss";\n');
  write('app/layout.tsx', 'import "./globals.css"\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html> }\n');
  write('app/page.tsx', 'export default function Page() { return null }\n');
}

// Where an installed file belongs inside the block folder.
function blockPath(rel) {
  if (/^(src\/)?app\/.+\/page\.tsx$/.test(rel)) return 'page.tsx';
  if (/^(src\/)?app\/.+\/[^/]+\.json$/.test(rel)) return path.basename(rel);
  const m = rel.match(/^(?:src\/)?components\/(?!ui\/)(.+)$/);
  if (m) return path.join('components', m[1]);
  return null; // shared ui, hooks, config: not part of the block
}

function rewrite(src, fileInBlock) {
  const depth = fileInBlock.split('/').length - 1;
  const toRoot = depth ? '../'.repeat(depth) : './';
  return src
    .replaceAll('@/components/ui/', '@/registry/proto-lab/ui/')
    .replaceAll('@/hooks/', '@/registry/proto-lab/hooks/')
    .replaceAll('@/lib/utils', '@/registry/proto-lab/lib/utils')
    .replace(/(["'])@\/components\/([^"']+)\1/g, (_, q, p) => `${q}${toRoot}components/${p}${q}`);
}

function writeIndex() {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));
  const names = Object.keys(manifest.blocks).sort();
  const out = [
    '// GENERATED by scripts/sync-blocks.js. Do not edit.',
    'import type { ComponentType } from "react"',
    '',
    'export const blockLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {',
    ...names.map((n) => `  "${n}": () => import("./${n}/page"),`),
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'index.ts'), out);
}

async function main() {
  if (process.argv.includes('--index')) { writeIndex(); return; }
  const only = process.argv.slice(2);
  const wanted = Object.entries(BLOCKS).flatMap(([category, names]) => names.map((name) => ({ name, category })))
    .filter((b) => !only.length || only.includes(b.name));
  if (!wanted.length) throw new Error(`No known blocks in: ${only.join(' ')}`);

  const app = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-lab-blocks-'));
  const manifestFile = path.join(OUT, 'manifest.json');
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : { blocks: {} };
  try {
    scaffoldNext(app);
    console.log('  → npm install, shadcn init @proto-lab/base');
    run('npm', ['install', '--no-audit', '--no-fund'], app);
    run('npx', ['-y', CLI, 'init', path.join(DOCS, 'public', 'r', 'base.json'), '-y'], app);
    git(['init', '-q'], app);
    git(['add', '-A'], app);
    git(['commit', '-qm', 'base'], app);

    for (const { name, category } of wanted) {
      run('npx', ['-y', CLI, 'add', name, '-y', '--overwrite'], app);
      const changed = git(['status', '--porcelain', '-uall'], app).split('\n').filter(Boolean).map((l) => l.slice(3));
      const deps = JSON.parse(git(['show', 'HEAD:package.json'], app));
      const now = JSON.parse(fs.readFileSync(path.join(app, 'package.json'), 'utf8'));
      const added = Object.keys(now.dependencies || {}).filter((d) => !(deps.dependencies || {})[d]);

      const dir = path.join(OUT, name);
      fs.rmSync(dir, { recursive: true, force: true });
      const files = [];
      for (const rel of changed) {
        const target = blockPath(rel);
        if (!target) continue;
        const src = fs.readFileSync(path.join(app, rel), 'utf8');
        const out = path.join(dir, target);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, target.endsWith('.tsx') || target.endsWith('.ts') ? rewrite(src, target) : src);
        files.push(target.split(path.sep).join('/'));
      }
      // Galleries ship one component file and no page: make it the entry.
      if (!files.includes('page.tsx')) {
        const entry = files.find((f) => f.endsWith('.tsx'));
        if (!entry) throw new Error(`${name}: no files found`);
        fs.writeFileSync(path.join(dir, 'page.tsx'),
          `// GENERATED by scripts/sync-blocks.js: entry for a block without a page.\nexport { default } from "./${entry.replace(/\.tsx$/, '')}"\n`);
        files.push('page.tsx');
      }
      const item = await (await fetch(`https://ui.shadcn.com/r/styles/${STYLE}/${name}.json`)).json();
      manifest.blocks[name] = {
        category,
        description: item.description || null,
        iframeHeight: item.meta?.iframeHeight || null,
        dependencies: added.sort(),
        files: files.sort(),
      };
      console.log(`  ✓ ${name} (${files.length} files${added.length ? `, needs ${added.join(', ')}` : ''})`);

      // Reset the scratch app for the next block.
      git(['checkout', '-q', '.'], app);
      git(['clean', '-qfd'], app);
    }
  } finally {
    fs.rmSync(app, { recursive: true, force: true });
  }

  manifest.$comment = 'GENERATED by scripts/sync-blocks.js. Upstream shadcn/ui blocks installed with ' + CLI + '.';
  manifest.style = STYLE;
  manifest.blocks = Object.fromEntries(Object.entries(manifest.blocks).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  writeIndex();
}

main().catch((e) => { console.error(`  ✗ ${e.message}`); process.exit(1); });
