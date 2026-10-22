> **Sync Rule:** This repo is mirrored to two remotes. Always commit and push to both:
> - `origin` — https://github.com/ssutantoatcaptech/Proto-Lab-Design-System.git
> - `new-origin` — https://github.com/captechconsulting/ProtoLab-Design-Guidelines.git
>
> After committing, run: `git push origin && git push new-origin`

# Icons

SVG icon files for the Proto-Lab Design System — 162 CapTech brand icons.

## Directory structure

```
icons/
├── practice-areas/
├── core-competencies/
├── core-values/
├── ergs/
└── general/
    ├── duotone/      # CapTech Blue (#005eb8) + Yellow (#fdda24)
    ├── monotone/     # CapTech Blue (#005eb8) + Blue 30%
    ├── greyscale/    # Dark Grey (#333f48) + Grey 30%
    └── inverse/      # White (#ffffff) + White 50% — for dark backgrounds
```

All icons are **48 × 48 px** flattened SVG vectors.  
Each icon filename is the slugified icon name, e.g. `rocket-launch.svg`.

## Sample icons (included in this repo)

| Category | File |
|---|---|
| Practice Areas | `practice-areas/{mode}/cx-customer-experience.svg` |
| Core Competencies | `core-competencies/{mode}/communicator.svg` |
| Core Values | `core-values/{mode}/belonging.svg` |
| ERGs | `ergs/{mode}/blacktech.svg` |
| General | `general/{mode}/rocket-launch.svg` |

> The samples above are representative SVGs that demonstrate the correct structure,
> color usage, and naming convention. Run the export script below to pull the
> **full, accurate** vector paths directly from Figma.

## Exporting all 162 icons from Figma

A Node.js export script is provided at `scripts/export-icons.js`.

### Prerequisites

- Node.js ≥ 16
- A [Figma personal access token](https://www.figma.com/developers/api#access-tokens)
  (Figma → Account Settings → Personal access tokens → Generate new token)

### Run

```bash
# Export all icons in all four color modes (default)
FIGMA_TOKEN=<your-token> node scripts/export-icons.js

# Export only one color mode
COLOR_MODE=duotone FIGMA_TOKEN=<your-token> node scripts/export-icons.js

# Control concurrency (default: 5 parallel requests)
CONCURRENCY=10 FIGMA_TOKEN=<your-token> node scripts/export-icons.js
```

The script will:
1. Read all 162 node IDs from `tokens/iconography.json`
2. Call the Figma REST API to get signed SVG download URLs
3. Download each SVG
4. Recolor copies into the remaining three color modes
5. Write files to `icons/<category>/<mode>/<slug>.svg`

### Color-mode recoloring

The Figma export returns duotone SVGs. The script automatically produces the
other three modes by substituting fill/stroke values:

| Mode | Primary → | Secondary → |
|---|---|---|
| **duotone** | `#005eb8` | `#fdda24` |
| **monotone** | `#005eb8` | `rgba(0,94,184,0.3)` |
| **greyscale** | `#333f48` | `rgba(51,63,72,0.3)` |
| **inverse** | `#ffffff` | `rgba(255,255,255,0.5)` |
