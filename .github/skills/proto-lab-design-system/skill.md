---
name: proto-lab-design-system
description: "Apply and build with the Proto-Lab Design System (CapTech Brand + Fluent 2 Web on shadcn/ui). USE WHEN starting a new CapTech prototype or demo, creating UI, styling, choosing colors/spacing/typography, adding icons, setting up dark mode, or migrating an existing app to the design system. ALSO USE WHEN you encounter hardcoded hex colors, pixel spacing, or raw font sizes that should be token references."
---

> **Sync Rule:** This repo is mirrored to two remotes. Always commit and push to both:
> - `origin` — https://github.com/ssutantoatcaptech/Proto-Lab-Design-System.git
> - `new-origin` — https://github.com/captechconsulting/ProtoLab-Design-Guidelines.git
>
> After committing, run: `git push origin && git push new-origin`

# Proto-Lab Design System

CapTech Brand identity on Microsoft Fluent 2 Web. Light and dark mode. Primary font Gibson (Adobe Fonts, `canada-type-gibson`), brand color CapTech Blue `#005eb8`, accent Yellow `#fdda24`. **This system is authoritative:** it replaces conflicting project values.

## What Proto-Lab is

| Layer | What it is | Where |
|---|---|---|
| Theme and tokens | **The brand.** CapTech colors on Fluent semantics, Gibson type ramp, radii, shadows, dark mode | `tokens/`, registry items `base` and `theme` |
| CapTech icons | 162 duotone brand icons as React components or SVGs | registry items `captech-icons*`, `icons/` |
| Components | The 64 stock [shadcn/ui](https://ui.shadcn.com) components (Base UI). Kept identical to upstream; the theme restyles them. Don't fork or restyle them per project | shadcn CLI |
| Charts | 76 shadcn charts on the Proto-Lab theme | registry items `chart-*` |
| Patterns (blocks) | Page sections, installed as shadcn blocks. Proto-Lab patterns (screens and sections from CapTech work) come first on the docs site's Patterns page; the rest are upstream shadcn blocks | docs site `/patterns` |
| Templates | Whole prototypes. **Starter** templates are built on Proto-Lab, clone them. **Reference** templates are snapshots of past work with their own styling, read them for patterns, never copy their CSS | `templates/`, docs site `/templates` |

`tokens/components.json` is a Figma reference (46 components with variants and node IDs), not runnable code.

## Pick your route

- **React with Tailwind v4 (new prototypes, the default):** use the shadcn registry. Until the registry is hosted, build it from the design system checkout (`npm install && npm run registry:build` in `design-system/`), then:
  - New project: `npx shadcn init design-system/apps/docs/public/r/base.json`
  - Existing shadcn project: `npx shadcn add design-system/apps/docs/public/r/theme.json`
  - Components: `npx shadcn add button card input` (stock shadcn, the theme styles them)
  - Icons and charts: `npx shadcn add design-system/apps/docs/public/r/captech-icons-general.json` (or `chart-area-default.json` and so on)
- **Anything else (plain HTML, Flask or Django templates, other frameworks):** wire the CSS variables, as in the Apply phase below.

## Build a screen in this order

1. A **Starter** template, if one fits.
2. A **CapTech block** for each section, then an upstream block.
3. Stock **components** composed on the page.
4. Tokens and Tailwind theme classes for anything left. Never hex, never one-off pixel values.

## Token file paths

| Purpose | Path |
|---------|------|
| CSS variables (import this) | `tokens/css/variables-light.css` |
| Color primitives | `tokens/color/primitives.json` |
| Semantic colors (light) | `tokens/color/semantic-light.json` |
| Semantic colors (dark) | `tokens/color/semantic-dark.json` |
| Typography | `tokens/typography.json` |
| Layout (spacing, radii, shadows) | `tokens/layout.json` |
| Component registry | `tokens/components.json` |
| Icons | `icons/<category>/<slug>.svg` |

Paths are relative to the design-system root. In consuming projects the DS is typically at `design-system/` or the path noted in `AGENTS.md`.

**Full token vocabulary:** see `references/tokens.md` in this skill directory for every CSS variable and its value, plus the Figma component variants.

## Apply phase

### Greenfield (no UI yet)

1. Import `tokens/css/variables-light.css` into the project's entry stylesheet.
2. Build all UI directly on the tokens. Done.

### Existing app

1. **Wire tokens:** Import `variables-light.css` above any existing `:root` block in the project's global stylesheet.
2. **Build alias layer:** Re-point each existing CSS variable to the matching DS token by role (see quick reference below). Never delete existing variable names.
3. **Swap hardcoded values:** Replace hex colors, raw shadows, and pixel radii in component files with token references.
4. **Verify:** Run the project build, grep for stray `#` hex values, spot-check the UI.

### Dark mode

Generate a `[data-theme="dark"]` selector block with values from `tokens/color/semantic-dark.json`. Toggle by setting the data attribute on `<html>`. Only enable when explicitly requested.

### Conflict policy

The design system wins. Preserve existing variable names as aliases pointing at DS tokens. Exceptions must be clearly commented.

## Build phase

Follow these rules for all ongoing UI work:

- **Colors:** Always use semantic token vars (`--neutral-foreground-1`, `--brand-background-1`, etc.). Never hardcode hex. Read `semantic-light.json` for available roles.
- **Spacing:** Use `--spacing-xs` (4px) through `--spacing-xxxl` (32px). Never arbitrary pixel values.
- **Typography:** Font Gibson, loaded from the project's Adobe Fonts web project (`use.typekit.net/<id>.css`); never download or self-host it. Weights 300/400/600/700 only. Use type styles from `typography.json`.
- **Radii:** Use `--radius-none` (0), `--radius-small` (2px), `--radius-medium` (4px), `--radius-large` (6px), `--radius-x-large` (8px), `--radius-circular` (9999px).
- **Shadows:** Use elevation tokens by context: `--shadow-2` (cards at rest), `--shadow-8` (hover), `--shadow-16` (dropdowns), `--shadow-28` (floating panels).
- **Components:** In React projects use the shadcn/ui components with their own variants (`variant="outline"`, `size="sm"`). Style through the theme, not by editing the component files. Outside React, `tokens/components.json` lists the Figma variants to match.
- **Icons:** Brand icons are 48px duotone illustrative marks. Use as hero accents, category tiles, empty states. Never replace functional glyphs (status, close, chevron) with brand icons.

## Quick reference

| Role | CSS variable |
|------|-------------|
| Page background | `--neutral-background-2` |
| Card surface | `--neutral-background-1` |
| Primary text | `--neutral-foreground-1` |
| Secondary text | `--neutral-foreground-2` |
| Primary CTA / brand | `--brand-background-1` |
| Link text | `--neutral-foreground-link` |
| Card border | `--neutral-stroke-1` |
| Error / danger | `--status-danger-foreground` |
| Warning | `--status-warning-foreground` |
| Success | `--status-success-foreground` |

## Guardrails

- **Styling only.** Never change business logic, routing, data flow, or APIs.
- **No new hues** outside the documented palette unless justified and commented.
- **Never edit a token** in the DS repo to fit one project.
- **Never bulk-replace icons** or flip to dark mode unless explicitly requested.
- **Never delete variable names.** Alias them to DS tokens instead.
