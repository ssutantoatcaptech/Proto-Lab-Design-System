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

_Nothing yet._

## [1.1.0] — 2026-06-15

Procedure guidance for typography. A prior application mapped only the font
*family* and left headings without an explicit weight, so they inherited the
browser's `bold` default and rendered far heavier than the tokens intend. The
tokens were already correct; the procedure didn't tell agents to apply weights
or to confirm a font face exists for each weight. This release closes that gap.
Additive and backward compatible — re-applying is recommended but not required.

### Added
- **`APPLY.md` §4 — typography mapping step.** Migration now explicitly calls
  for mapping type **weight** (and size), not just family, with a warning that an
  unset heading weight snaps to the heaviest *loaded* font face.
- **`APPLY.md` §4 role list — type sizes and weights** added as first-class
  mapping targets alongside colors, surfaces, radii, and shadows.
- **`APPLY.md` §5.1 — Fonts (weight coverage).** Notes that the system ships no
  font binaries, that browsers don't synthesize missing weights, and that a
  missing face silently falls back — so agents must confirm a face exists per
  weight. Directs agents to treat a missing weight as a vendoring gap first
  (vendor an already-licensed copy if obtainable — e.g. an installed/org-managed
  font) and only substitute the nearest loaded weight as a last resort, never
  fetching a licensed font from the open internet.
- **`APPLY.md` §6 — verification check** that type renders at the intended
  weights and that every `--font-weight-*` used resolves to a loaded face.

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

[Unreleased]: https://github.com/ssutantoatcaptech/Claude-Exploration/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/ssutantoatcaptech/Claude-Exploration/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ssutantoatcaptech/Claude-Exploration/releases/tag/v1.0.0
