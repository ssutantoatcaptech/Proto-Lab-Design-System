# Proto-Lab Design System

Design tokens and component registry extracted from the [Proto-Lab Design System](https://www.figma.com/design/ADyu4GaQPThxZXCkuABH98/Proto-Lab-Design-System) Figma file.

**Foundation:** CapTech Brand identity layered on Microsoft Fluent 2 Web, with light and dark mode support.

## Applying this design system to a project

The goal: any project at CapTech (greenfield or fully built, any IDE, any AI
coding agent) can adopt this system the same way. The pattern is **a pointer in
your project, the procedure in this repo** — so when the design system updates,
every project picks up the new procedure on its next pull instead of going
stale.

### 1. Add this repo to your project

Vendor it at `design-system/` in your project root, using whichever you prefer:

```bash
# Git submodule (recommended — tracks the upstream repo, easy to update)
git submodule add https://github.com/ssutantoatcaptech/Claude-Exploration design-system

# …or a plain clone
git clone https://github.com/ssutantoatcaptech/Claude-Exploration design-system

# …or just copy the folder in
```

### 2. Wire it into your AI agent

Run the bootstrap script from your **project root**. It points your agent
config at [`APPLY.md`](APPLY.md) (the versioned application procedure) and is
safe to re-run:

```bash
node design-system/scripts/bootstrap.js
```

This creates or updates, without clobbering your existing content:

| File | For |
|---|---|
| `AGENTS.md` | The cross-tool standard (Codex, Cursor, Aider, Zed, Factory, …) |
| `CLAUDE.md` | Claude Code (imports `AGENTS.md`) |
| `.github/copilot-instructions.md` | GitHub Copilot |

> **Prefer not to run a script?** Add this to your project's `AGENTS.md`
> (create the file if it doesn't exist), and you're done:
>
> ```markdown
> ## Design system
> This project uses the CapTech Proto-Lab design system in `design-system/`.
> Before any UI or styling work, read and follow `design-system/APPLY.md`.
> ```
>
> If you use Claude Code, also add a `CLAUDE.md` containing `See @AGENTS.md`.
> If you use Copilot, mirror the block into `.github/copilot-instructions.md`.

### 3. Tell your agent to apply it

> **"Apply the design system to this project."**

Your agent reads [`APPLY.md`](APPLY.md) and follows it. `APPLY.md` already
decides the conflict policy (this system is **authoritative** — it replaces a
project's conflicting tokens, while aliasing existing variable names so nothing
breaks) and the per-scenario behavior, so the agent doesn't have to ask and the
result is the same across projects.

The deterministic setup (steps 1–2) is scripted; the judgment work (mapping a
built app's existing styles onto the tokens, swapping components, placing icons)
is what the agent does in step 3.

### Versioning

`APPLY.md` carries a procedure version, and [`CHANGELOG.md`](CHANGELOG.md)
records what changes between revisions. To update an already-adopted project,
pull the latest design system and tell your agent to re-apply it; check the
changelog for whether anything since your recorded version needs re-review.

## Structure

```
tokens/
├── color/
│   ├── primitives.json       # Raw color palette (brand, neutral, accent, ramp)
│   ├── semantic-light.json   # Light mode semantic tokens (references primitives)
│   └── semantic-dark.json    # Dark mode semantic tokens
├── typography.json            # Font family, weights, and type scale
├── layout.json                # Spacing, corner radius, stroke width, shadows
├── components.json            # Full component registry with variants and Figma node IDs
├── iconography.json           # 162 CapTech brand icons with node IDs and color modes
└── css/
    └── variables-light.css   # Ready-to-use CSS custom properties (light mode)
icons/
├── practice-areas/           # CX, DA, MC, SI
├── core-competencies/        # Communicator, Strategic Thinker…
├── core-values/              # Belonging, Enthusiasm…
├── ergs/                     # BlackTech, CAKE, PrideTech…
└── general/                  # 140 general-purpose icons
    ├── duotone/              # Blue (#005eb8) + Yellow (#fdda24)
    ├── monotone/             # Blue + Blue 30%
    ├── greyscale/            # Dark Grey + Grey 30%
    └── inverse/              # White + White 50%
scripts/
└── export-icons.js           # Fetch all SVGs from Figma API → icons/
```

## Token Format

JSON files follow the [Design Tokens Community Group](https://tr.designtokens.org/format/) spec:

```json
{
  "color-name": {
    "$value": "#005eb8",
    "$type": "color",
    "$description": "CapTech Blue — primary brand color"
  }
}
```

Semantic tokens use `{references}` to point back to primitives, keeping the system maintainable.

## Quick Start — CSS

Drop in the CSS file for immediate use:

```html
<link rel="stylesheet" href="tokens/css/variables-light.css">
```

Then use variables in your styles:

```css
.card {
  background: var(--neutral-background-2);
  border: var(--stroke-thin) solid var(--neutral-stroke-1);
  border-radius: var(--radius-large);
  padding: var(--spacing-l);
  box-shadow: var(--shadow-4);
  font-family: var(--font-family);
  color: var(--neutral-foreground-1);
}

.button-primary {
  background: var(--brand-background-1);
  color: var(--neutral-foreground-on-brand);
  border-radius: var(--radius-medium);
  padding: var(--spacing-xs) var(--spacing-m);
}
```

## Key Design Decisions

| Decision | Detail |
|---|---|
| **Primary font** | Gibson (falls back to Source Sans Pro) |
| **Brand color** | CapTech Blue `#005eb8` (Brand-80 in ramp) |
| **Brand accent** | Yellow `#fdda24` (same in light & dark) |
| **Spacing scale** | Fluent 2 — 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32 |
| **Corner radius** | Fluent 2 — 0, 2, 4, 6, 8, 9999 |
| **Elevation** | 6 levels (2, 4, 8, 16, 28, 64) using ambient + key shadows |

## Components (46 total)

### Actions (4)
| Component | Variants |
|---|---|
| **Button** | Appearance: Primary, Outline, Subtle, Transparent × Size: Small, Medium, Large |
| **Split Button** | Appearance: Primary, Outline |
| **Compound Button** | Appearance: Primary, Outline |
| **Link** | Default, Subtle, Inline |

### Inputs (12)
| Component | Variants |
|---|---|
| **Input** | State: Default, Filled, Disabled |
| **Textarea** | — |
| **Checkbox** | State: Checked, Unchecked, Indeterminate, Disabled |
| **Radio** | State: Selected, Unselected, Disabled |
| **Switch** | State: On, Off, Disabled |
| **Dropdown** | — |
| **Slider** | — |
| **Spin Button** | — |
| **SearchBox** | — |
| **Rating** | Color: Marigold, Brand, Neutral |
| **Swatch Picker** | — |
| **Tag Picker** | — |

### Data Display (12)
| Component | Variants |
|---|---|
| **Avatar** | Size: 24, 32, 40, 48, 64 |
| **Avatar Group** | — |
| **Badge** | Variant: Count, Text, Dot |
| **Presence Badge** | Status: Available, Busy, Away, DoNotDisturb, Offline |
| **Persona** | — |
| **DataGrid** | — |
| **List** | — |
| **Tree** | — |
| **Skeleton** | — |
| **Status Indicator** | Status: Online, Warning, Error, Info |
| **Spinner** | Size: Small, Medium, Large |
| **Progress Bar** | — |

### Navigation (4)
| Component | Variants |
|---|---|
| **Nav Item** | State: Default, Active, Nested, Disabled |
| **Breadcrumb** | — |
| **Tab** | Orientation: Horizontal, Vertical × State: Active, Inactive |
| **Carousel** | — |

### Layout & Containers (7)
| Component | Variants |
|---|---|
| **Card** | Appearance: Elevated, Outline |
| **Dialog** | — |
| **Drawer** | — |
| **Popover** | — |
| **Divider** | Appearance: Default, Subtle, Strong, Brand |
| **Accordion Item** | State: Expanded, Collapsed |
| **Field** | State: Default, Error, Success |

### Feedback & Messaging (5)
| Component | Variants |
|---|---|
| **Message Bar** | Status: Info, Success, Warning, Error |
| **Toast** | Status: Success, Error, Info |
| **Tooltip** | Position: Top, Bottom, Right |
| **Teaching Popover** | — |
| **Info Label** | — |

### Other (6)
| Component | Variants |
|---|---|
| **Label** | State: Default, Required, Disabled |
| **Tag** | Color: Brand, Danger, Success, Warning, Neutral |
| **Interaction Tag** | — |
| **Toolbar** | — |
| **Menu** | — |
| **Material Acrylic** | — |

## Iconography (162 icons)

All icons are 48×48px flattened vectors available in four color modes:

| Mode | Primary | Secondary |
|---|---|---|
| **Duotone** | CapTech Blue `#005eb8` | Yellow `#fdda24` |
| **Monotone** | CapTech Blue `#005eb8` | CapTech Blue 30% |
| **Greyscale** | Dark Grey `#333f48` | Dark Grey 30% |
| **Inverse** | White `#ffffff` | White 50% |

| Category | Count | Examples |
|---|---|---|
| **Practice Areas** | 4 | CX, DA, MC, SI |
| **Core Competencies** | 5 | Communicator, Strategic Thinker, Results Driver |
| **Core Values** | 6 | Belonging, Enthusiasm, Intellectual Curiosity |
| **ERGs** | 7 | BlackTech, CAKE, PrideTech, Juntos |
| **General** | 140 | AI Sparkle, Innovation Lightning, Rocket Launch, Chat Bot, Security Lock, People Teams... |

SVG files live in `icons/<category>/<mode>/<slug>.svg`.  
See [icons/README.md](icons/README.md) for the full export guide.

### Export all SVGs from Figma

```bash
FIGMA_TOKEN=<your-personal-access-token> node scripts/export-icons.js
```

Requires a [Figma personal access token](https://www.figma.com/developers/api#access-tokens).  
The script reads node IDs from `tokens/iconography.json`, calls the Figma API, downloads the SVGs, and writes all four color-mode variants into the `icons/` tree.

## Figma Source

- **File key:** `ADyu4GaQPThxZXCkuABH98`
- **Variable collections:** Primitive Colors, Semantic Tokens (Light/Dark), Layout, Brand Ramp
- **Component pages:** Actions, Inputs, Data Display, Navigation, Layout & Containers, Feedback & Messaging, Other
- **Iconography page:** Node `1:461` — 162 icons across 5 categories
