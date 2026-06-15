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

[Unreleased]: https://github.com/ssutantoatcaptech/Claude-Exploration/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ssutantoatcaptech/Claude-Exploration/releases/tag/v1.0.0
