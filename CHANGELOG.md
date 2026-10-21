# Changelog

All notable changes to the Proto-Lab Design System are recorded here. The
format follows [Keep a Changelog](https://keepachangelog.com/), and the project
aims to follow [Semantic Versioning](https://semver.org/).

Versions track the **application procedure and tooling** that consuming projects
depend on ([`APPLY.md`](APPLY.md), [`scripts/bootstrap.js`](scripts/bootstrap.js)),
alongside the token and icon content. When a project adopts the system, it
records the `APPLY.md` procedure version, so an update here is diffable against
what a project last applied.

- **MAJOR** — a change to the conflict policy or migration steps that could make
  an agent re-apply the system differently (existing adopters should re-review).
- **MINOR** — new tokens, icons, components, or procedure guidance that is
  additive and backward compatible.
- **PATCH** — clarifications, fixes, and tooling tweaks with no behavior change
  for adopters.

## [Unreleased]

### Added
- **Generated token pipeline** (`packages/tokens/`). `npm run tokens:build`
  writes every CSS file and `tokens/dist/tokens.json` from the DTCG JSON, and
  regenerates the CSS variable section of the skill's `references/tokens.md`.
  The JSON is now the only source of truth.
- **`tokens/css/variables-dark.css`**, the first shipped dark mode CSS. Apply
  with `class="dark"` or `data-theme="dark"` on any element, including a
  wrapper inside a light page.
- **`tokens/css/tailwind-theme.css` and `proto-lab.css`** for Tailwind v4 and
  shadcn/ui projects. Tailwind's color palette is removed; type sizes, weights,
  radii and shadows map onto the Fluent ramp (`text-sm` = body-1,
  `font-medium` = 600, `rounded-md` = 4px, `shadow-xs` = elevation 2).
- **shadcn alias layer** (`tokens/alias/shadcn.json`): `--background`,
  `--primary`, `--muted-foreground` and the rest, plus `--success`,
  `--warning`, `--destructive-foreground`, `--overlay` and `--link`.
- **New tokens built from existing colors only:** `chart.1`–`5`,
  `illustration.primary`/`accent`, `status.{danger,success,warning}-on-fill`,
  a mono font stack, and Fluent 2 motion durations and easing.
- **`npm run tokens:check`** (also in CI): fails if generated files are stale,
  if any variable from the original hand-written CSS is missing or changed, if
  a semantic color lacks a light or dark value, or if a text pair falls below
  WCAG AA.

- **shadcn/ui registry** (`apps/docs/registry.json`, generated). Two items:
  `base` (a `registry:base` for `shadcn init`: Base UI, Lucide, Inter, strict
  theme with the Tailwind palette removed) and `theme` (for existing shadcn
  projects; overrides values in place). `npm run registry:build` writes
  `apps/docs/public/r/`.
- **`scripts/e2e-registry.js`** (`npm run test:registry`, also in CI): installs
  `base` into `fixtures/vite-consumer`, adds upstream button, input and card,
  builds, and checks computed styles in headless Chrome (32px controls,
  Inter, weight 600, CapTech Blue, dark mode on a nested `.dark` wrapper).

### Changed
- `tokens/css/variables-light.css` is now generated. Every variable it had is
  kept with the same value; new variables are added.
- Dark `brand.background-1` now points at brand-ramp 70 (Fluent's dark brand
  background). White text on the old value was 2.8:1. No dark CSS had shipped
  before, so no consumer is affected.

### Known issues
- Four text pairs fail WCAG AA and cannot be fixed with the current palette:
  light secondary text (`neutral.foreground-2`, 3.4:1 on white), light warning
  text (3.1:1), and dark error text (4.37:1). Listed in
  `packages/tokens/contrast-pairs.json` until a color decision is made.

## [1.0.1] — 2026-10-21

Fixes and tooling only. No change to tokens, icons, or how the system is applied.

### Fixed
- **`scripts/bootstrap.js` crashed in ESM projects.** A consuming project with
  `"type": "module"` (the Vite default) made Node load the vendored script as
  ESM, so `require` failed. A root `package.json` now declares the repo's
  scripts CommonJS.
- **Font name.** `README.md` and `APPLY.md` still said Gibson after the tokens
  moved to Inter (`20588e0`). Both now say Inter.
- **Repo URL.** Install commands and changelog links pointed at
  `Claude-Exploration`; they now point at `Proto-Lab-Design-System`.

### Added
- **`bootstrap.js` copies the whole agent skill**
  (`.github/skills/proto-lab-design-system/`, including `references/tokens.md`)
  into the consuming project, rewriting token and icon paths. Re-running
  reports each file as created, updated, or up to date.
- **The agent skill is now tracked** in `.github/skills/proto-lab-design-system/`.
- **`scripts/test-bootstrap.js`** runs bootstrap twice in a throwaway ESM project
  and checks the skill tree is copied and the second run is a no-op.
- **CI** (`.github/workflows/ci.yml`) syntax-checks the scripts and runs the
  bootstrap test on every push and pull request.
- Root `package.json` (npm workspaces, private), `.nvmrc`, `.gitignore`, ready
  for the token build and docs site.

### Notes
- `tokens/components.json` is the Figma component inventory. It is unrelated to
  the `components.json` file at the root of a shadcn project.

## [1.0.0] — 2026-06-15

First versioned release of the adoption workflow. The token and icon content
below already existed in the repo; this release makes the system applicable to
any project in a repeatable, tool-agnostic way.

### Added
- **`APPLY.md`** — the authoritative, versioned procedure an AI agent or
  developer follows to apply the system. Pre-decides the conflict policy
  (authoritative: replace conflicting tokens, alias existing variable names),
  the greenfield vs. existing-app branches, the icon rules, verification, and
  guardrails, so adoption is consistent across projects without per-project
  judgment calls.
- **`scripts/bootstrap.js`** — wires a consuming project's agent config to
  `APPLY.md`. Idempotent; creates or updates `AGENTS.md`, a `CLAUDE.md` shim
  (Claude Code), and a `.github/copilot-instructions.md` shim (GitHub Copilot)
  without clobbering existing content.
- **README "Applying this design system to a project"** — the 3-step adoption
  guide (vendor the repo, run bootstrap, tell the agent to apply it), with a
  manual-paste fallback for those who prefer not to run a script.
- **Procedure version stamp** in `APPLY.md` and this changelog.

### Baseline (pre-existing content carried into 1.0.0)
- Color, typography, and layout tokens extracted from the Proto-Lab Figma file
  (Design Tokens Community Group format), plus `tokens/css/variables-light.css`.
- Component registry of 46 components with variants (`tokens/components.json`).
- 162 CapTech brand SVG icons across 5 categories, and the Figma export script
  (`scripts/export-icons.js`).

### Known limitations
- The single-color icon variant directories (`monotone/`, `greyscale/`,
  `inverse/`) are largely placeholder stubs; only the flat duotone marks are
  complete. Run `scripts/export-icons.js` to populate the remaining variants.

[Unreleased]: https://github.com/ssutantoatcaptech/Proto-Lab-Design-System/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/ssutantoatcaptech/Proto-Lab-Design-System/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ssutantoatcaptech/Proto-Lab-Design-System/releases/tag/v1.0.0
