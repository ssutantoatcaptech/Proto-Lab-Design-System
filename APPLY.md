# Applying the Proto-Lab Design System

This file is the procedure an AI agent (or a developer) follows to apply this
design system to a project. It is versioned with the tokens, so it always
matches the current system. Read it top to bottom before changing any code.

**Procedure version:** `1.1.0` (2026-06-15). See [`CHANGELOG.md`](CHANGELOG.md)
for what changed between revisions. When you apply this system to a project,
record this version in the project (for example, the agent can note
"Proto-Lab design system, APPLY procedure v1.1.0" in its summary or the
project's `AGENTS.md`) so future updates are diffable.

> **You are an agent reading this because a project's `AGENTS.md` pointed you
> here.** Follow these steps directly. Do not ask the user which approach to
> take: the conflict policy and per-scenario behavior are already decided below.

---

## 1. What this design system is

| Path | What it holds |
|---|---|
| `tokens/css/variables-light.css` | **The integration surface.** Ready-to-use CSS custom properties. This is what you wire into a project. |
| `tokens/color/`, `typography.json`, `layout.json` | Source-of-truth token values (Design Tokens Community Group format). |
| `tokens/components.json` | Registry of 46 components with variants. Reference for component structure, not runnable code. |
| `icons/` | 162 CapTech brand SVG icons (`<category>/<mode>/<slug>.svg`). 48px, duotone by default. |

**Foundation:** CapTech Brand layered on Microsoft Fluent 2 Web. Primary font
Gibson, brand color CapTech Blue `#005eb8`, accent Yellow `#fdda24`.

---

## 2. Conflict policy — READ FIRST

**This design system is AUTHORITATIVE.** When a project already has its own
colors, typography, spacing, shadows, or radii that disagree with these tokens,
**replace the project's values with these.** The design system wins.

One preservation rule, to keep the migration safe and reviewable:

> **Preserve the project's existing variable *names* as a thin alias layer that
> points at our tokens.** Re-point each existing custom property to the matching
> design-system token instead of renaming it everywhere. Example:
> `--app-heading-color: var(--neutral-foreground-1);`. This means existing
> component code keeps working without a rename sweep, while every value now
> resolves to an official token.

Do **not** treat the system as advisory or "blend" it with the old palette. If a
project genuinely needs an exception (a product-specific status color, a
data-viz ramp), keep it as a clearly-commented local addition, never by editing
a design-system token.

---

## 3. Pick the scenario

**Greenfield (no UI built yet):**
1. Import `tokens/css/variables-light.css` into the project's entry stylesheet.
2. Build all new UI directly on the tokens. Done. Skip to section 6.

**Existing app (UI already built):** do the migration in section 4.

---

## 4. Migration steps (existing app)

Work in this order. Commit nothing until the project's build passes (section 6).

1. **Wire in the tokens.** Import `variables-light.css` into the project's
   global/entry stylesheet (e.g. the file that `:root` styles already live in,
   or the app's main CSS imported once at the root). If the project keeps its
   own `:root` token block, paste the design-system primitives + semantic tokens
   above it so the project's tokens can reference them.

2. **Build the alias layer.** For each existing style variable the project
   defines (its brand color, ink/text colors, surfaces, borders, radii, shadows,
   type sizes), re-point it at the matching design-system token. Map by
   *role*, not by old value:
   - headings / primary text → `--neutral-foreground-1`
   - secondary / meta text → `--neutral-foreground-2`
   - page background → `--neutral-background-2`
   - card surface → `--neutral-background-1`
   - primary brand / CTA → `--brand-background-1`
   - card border → `--neutral-stroke-1`
   - shadows → `--shadow-2` (rest) / `--shadow-8` (hover) / `--shadow-28` (floating)
   - radii → `--radius-medium/large/x-large` (4/6/8px)
   - status/score colors → `--status-{danger,warning,success}-foreground`
   - type sizes → `--font-size-*` / `--line-height-*`
   - type **weights** → `--font-weight-book/regular/medium/semibold/bold`
     (map by role and set one explicitly on every heading — see step 4)

3. **Swap ad-hoc values in components.** Find hardcoded hex colors, raw shadows,
   and pixel radii in component files and replace them with token references.
   Leave the alias names in place; just make sure nothing bypasses the tokens.

4. **Map typography — family, size, AND weight.** Do not stop at
   `--font-family`. Set an explicit `font-weight` token on every heading and
   text role per [`tokens/typography.json`](tokens/typography.json) (e.g. the
   title styles are weight `book`/300, not bold). A heading with *no* weight
   rule inherits the browser default (`bold`) and snaps to the heaviest *loaded*
   font face — so it renders too heavy even though the family is correct. Then
   confirm the weights you used can actually render (see section 5.1 on fonts).

5. **Icons (see section 5).**

6. **Run the project's build + typecheck and fix what breaks** (section 6).

---

## 5. Icon rules

The brand icons are **48px duotone illustrative marks** (blue + a yellow accent).
They render at a fixed two-color fill and **cannot inherit `currentColor`**.

- **Use brand icons as illustrative anchors:** hero accents, section/category
  tiles, empty states, nav landmarks. Standalone, on a light surface, at ~30px+.
- **Do NOT replace functional/state glyphs with brand icons.** Small inline
  icons whose *color carries meaning* (status checks, error/warning glyphs,
  rank medals, directional arrows, close/chevron controls) should stay on the
  project's existing icon set (e.g. an inherited line-icon library). Color-as-
  state and accessibility depend on these inheriting their context color.
- **Only bundle what you use.** Import the specific SVGs you place; do not bulk-
  import all 162. The single-color variant directories (`monotone/`,
  `greyscale/`, `inverse/`) may be incomplete in a given checkout, so prefer the
  flat duotone files unless you've confirmed a variant exists.

### 5.1 Fonts — weight coverage

A weight token only renders if a matching font face is actually loaded. **This
design system ships no font binaries** — it specifies the family (Gibson) and a
weight ramp, but the project must provide the `@font-face` files.

- **Confirm a face exists for every weight you use.** Before relying on
  `--font-weight-book` (300), check the project loads a Gibson Book/Light face.
  Browsers do **not** synthesize a lighter weight: a missing face silently falls
  back to the nearest loaded weight, so the CSS looks correct while the type is
  wrong (e.g. 300 rendering as 400, or an unset heading rendering as the heaviest
  loaded face).
- **If a weight's face is missing,** either add the `@font-face` for it, or map
  that role to the nearest loaded weight and **note the substitution** in your
  apply summary. Do not leave a weight token pointing at a face that can't render.

---

## 6. Verification — done when

- The project's own build command passes (e.g. `npm run build`, `tsc`,
  `vite build`, framework equivalent). Run it; don't assume.
- No hardcoded off-palette colors remain in component files (grep for stray
  `#` hex values and confirm they're intentional exceptions).
- The UI renders on the tokens (spot-check one or two screens).
- **Type renders at the intended weights**, not just the right family and size.
  Every `--font-weight-*` you used resolves to a loaded `@font-face`; spot-check
  that headings aren't defaulting to bold or the heaviest loaded face (section
  5.1). Note any weight you had to substitute.
- Report what changed, what was aliased, and any exceptions you kept.

---

## 7. Guardrails

- **Styling only.** Do not change business logic, routing, data flow, or APIs.
- **No new hues** outside the documented palette and the project's justified,
  commented exceptions.
- **Never delete a project's variable names** — alias them.
- **Never edit a token in this repo** to fit one project. Tokens are shared.
- **Don't bulk-replace icons** or flip a project to dark mode unless the project
  explicitly asks; this system ships light mode as the default surface.
