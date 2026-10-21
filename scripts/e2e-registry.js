#!/usr/bin/env node
/**
 * e2e-registry.js
 *
 * End-to-end check of the shadcn registry, the way a CapTech team would use
 * it. Copies fixtures/vite-consumer to a temp dir, runs
 * `shadcn init <apps/docs/public/r/base.json>`, adds upstream components,
 * builds, serves the app, and reads computed styles from headless Chrome.
 *
 * Set ADOBE_FONTS_KIT to also check that Gibson loads from Adobe Fonts.
 * Needs network (npm, the shadcn registry) and Chrome. Set CHROME_PATH if
 * Chrome is not in a standard location. Pass --keep to leave the temp app.
 *
 * Usage: node scripts/e2e-registry.js
 */

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const DOCS     = path.join(ROOT, 'apps', 'docs');
const SHADCN   = `shadcn@${require(path.join(DOCS, 'package.json')).devDependencies.shadcn}`;
const keep     = process.argv.includes('--keep');
const KIT      = process.env.ADOBE_FONTS_KIT;
const app      = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-lab-e2e-'));
let failed = false;

const run = (cmd, args, cwd) => execFileSync(cmd, args, {
  cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', env: { ...process.env, CI: '1' },
});
const step = (msg) => console.log(`\n  → ${msg}`);
function check(ok, msg, actual) {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}${ok ? '' : `  (got ${JSON.stringify(actual)})`}`);
  if (!ok) failed = true;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ];
  const found = candidates.find((c) => c && fs.existsSync(c));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH.');
  return found;
}

async function waitFor(url, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  step('Build tokens and registry');
  run(process.execPath, [path.join(ROOT, 'packages', 'tokens', 'build.js')], ROOT);
  run('npx', ['-y', SHADCN, 'build'], DOCS);

  step(`Scaffold consumer in ${app}`);
  fs.cpSync(path.join(ROOT, 'fixtures', 'vite-consumer'), app, { recursive: true });
  run('npm', ['install', '--no-audit', '--no-fund'], app);
  if (KIT) {
    const html = path.join(app, 'index.html');
    fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('</head>', `  <link rel="stylesheet" href="https://use.typekit.net/${KIT}.css" />\n  </head>`));
  }

  step('shadcn init from @proto-lab/base, add button input card and practice area icons');
  run('npx', ['-y', SHADCN, 'init', path.join(DOCS, 'public', 'r', 'base.json'), '-y'], app);
  run('npx', ['-y', SHADCN, 'add', 'button', 'input', 'card', path.join(DOCS, 'public', 'r', 'captech-icons-practice-areas.json'), path.join(DOCS, 'public', 'r', 'chart-area-default.json'), '-y'], app);
  const chartSrc = fs.readFileSync(path.join(app, 'src', 'components', 'charts', 'chart-area-default.tsx'), 'utf8');
  check(chartSrc.includes('@/components/ui/card') && !chartSrc.includes('registry/proto-lab'), 'chart item installs with the project\'s own import paths', chartSrc.match(/from "[^"]*card"/)?.[0]);

  step('Typecheck and build');
  run('npm', ['run', 'build'], app);
  const css = fs.readdirSync(path.join(app, 'dist', 'assets')).filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(app, 'dist', 'assets', f), 'utf8')).join('\n');

  step('Measure in headless Chrome');
  const port = 4400 + Math.floor(Math.random() * 500);
  const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: app, stdio: 'ignore' });
  let dom;
  try {
    await waitFor(`http://localhost:${port}`);
    dom = execFileSync(findChrome(),
      ['--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=8000', '--dump-dom', `http://localhost:${port}`],
      { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
  } finally {
    server.kill();
  }
  const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
  const out = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));

  step('Assertions');
  const WHITE = 'rgb(255, 255, 255)';
  check(!/\.(bg|text|border)-(red|blue|green|zinc|neutral|slate|gray)-\d{2,3}\b/.test(css), 'Tailwind palette utilities are absent');
  check(out.body.font.startsWith('canada-type-gibson'), 'body font is Gibson (canada-type-gibson)', out.body.font);
  if (KIT) check(out.gibsonLoaded, 'Gibson loads from the Adobe Fonts kit', out.gibsonLoaded);
  else console.log('  · Gibson load not checked: set ADOBE_FONTS_KIT to test the Adobe Fonts kit');
  check(out.body.size === '14px' && out.body.lineHeight === '20px', 'body text is body-1 (14/20)', [out.body.size, out.body.lineHeight]);
  check(out.button.height === '32px', 'button is 32px tall', out.button.height);
  check(out.button.weight === '600', 'button label is semibold (600)', out.button.weight);
  check(out.button.bg === 'rgb(0, 94, 184)', 'button fill is CapTech Blue', out.button.bg);
  check(out.button.color === WHITE, 'button text is white', out.button.color);
  check(out.input.height === '32px', 'input is 32px tall', out.input.height);
  check(out.body.bg === 'rgb(245, 245, 244)', 'page background is the light grey canvas', out.body.bg);
  check(out.card.bg === WHITE, 'card is a white surface on the canvas', out.card.bg);
  check(out.darkButton.bg === 'rgb(119, 183, 247)', 'dark button fill is light CapTech blue (brand 120)', out.darkButton.bg);
  check(out.darkButton.color === 'rgb(26, 39, 48)', 'dark button text is dark', out.darkButton.color);
  check(out.darkCard.bg === 'rgb(26, 39, 48)', 'dark card is the deepest blue grey on the Dark Grey canvas', out.darkCard.bg);
  check(out.darkCard.color === WHITE, 'dark card text is white', out.darkCard.color);
  check(out.icon === 'rgb(0, 94, 184)', 'CapTech icon uses CapTech Blue', out.icon);
  check(out.darkIcon === 'rgb(119, 183, 247)', 'CapTech icon lightens in dark mode (brand 120)', out.darkIcon);
  console.log(`\n  radii (codemod target, not asserted yet): button ${out.button.radius}, input ${out.input.radius}, card ${out.card.radius}`);
}

main()
  .catch((e) => { console.error(`\n  ✗ ${e.message}`); failed = true; })
  .finally(() => {
    if (keep) console.log(`\n  kept ${app}`);
    else fs.rmSync(app, { recursive: true, force: true });
    if (failed) process.exit(1);
    console.log('\n  registry e2e OK\n');
  });
