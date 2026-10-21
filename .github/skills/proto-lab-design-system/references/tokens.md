# Token Reference

Complete vocabulary of available CSS custom properties and component variants.

<!-- generated:css-variables:begin -->
## CSS Custom Properties

Generated from `tokens/*.json`. Light values live in `tokens/css/variables-light.css`;
dark overrides in `tokens/css/variables-dark.css` (apply with `class="dark"` or
`data-theme="dark"`). Tailwind projects import `tokens/css/proto-lab.css`.

### Primitive: Brand
| Variable | Light | Dark |
|---|---|---|
| `--color-captech-blue` | #005eb8 | same |
| `--color-dark-grey` | #333f48 | same |
| `--color-medium-grey` | #888b8d | same |
| `--color-light-grey` | #d9d9d6 | same |
| `--color-white` | #ffffff | same |

### Primitive: Accent & Tertiary
| Variable | Light | Dark |
|---|---|---|
| `--color-accent-yellow` | #fdda24 | same |
| `--color-dark-blue` | #003865 | same |
| `--color-light-teal` | #68d2df | same |
| `--color-sky-blue` | #00a5df | same |

### Primitive: Brand Ramp
| Variable | Light | Dark |
|---|---|---|
| `--color-brand-10` | #061724 | same |
| `--color-brand-20` | #082338 | same |
| `--color-brand-30` | #0a2e4a | same |
| `--color-brand-40` | #0c3b5e | same |
| `--color-brand-50` | #0e4775 | same |
| `--color-brand-60` | #0f548c | same |
| `--color-brand-70` | #115ea3 | same |
| `--color-brand-80` | #005eb8 | same |
| `--color-brand-90` | #2886de | same |
| `--color-brand-100` | #479ef5 | same |
| `--color-brand-110` | #62abf5 | same |
| `--color-brand-120` | #77b7f7 | same |
| `--color-brand-130` | #96c6fa | same |
| `--color-brand-140` | #b4d6fa | same |
| `--color-brand-150` | #cfe4fa | same |
| `--color-brand-160` | #ebf3fc | same |

### Primitive: Blue Scale
| Variable | Light | Dark |
|---|---|---|
| `--color-blue-100` | #dbeeff | same |
| `--color-blue-200` | #a5cfff | same |
| `--color-blue-300` | #5598dd | same |
| `--color-blue-400` | #176ebf | same |
| `--color-blue-500` | #005eb8 | same |
| `--color-blue-700` | #004994 | same |

### Primitive: Neutral
| Variable | Light | Dark |
|---|---|---|
| `--color-black` | #000000 | same |
| `--color-grey-2` | #f5f5f4 | same |
| `--color-grey-4` | #ebebea | same |
| `--color-grey-6` | #e0e0df | same |
| `--color-grey-8` | #d6d6d5 | same |
| `--color-grey-12` | #c1c1c0 | same |
| `--color-grey-20` | #1a2730 | same |

### Primitive: Opacity
| Variable | Light | Dark |
|---|---|---|
| `--color-dark-grey-5` | rgba(51, 63, 72, 0.05) | same |
| `--color-captech-blue-30` | rgba(0, 94, 184, 0.3) | same |
| `--color-dark-grey-30` | rgba(51, 63, 72, 0.3) | same |
| `--color-white-50` | rgba(255, 255, 255, 0.5) | same |

### Semantic: Neutral
| Variable | Light | Dark |
|---|---|---|
| `--neutral-background-1` | #ffffff | #1a2730 |
| `--neutral-background-2` | #f5f5f4 | #1f2d36 |
| `--neutral-background-3` | #ebebea | #243640 |
| `--neutral-background-subtle` | rgba(51, 63, 72, 0.05) | rgba(255, 255, 255, 0.04) |
| `--neutral-background-inverted` | #333f48 | #ffffff |
| `--neutral-background-disabled` | #ebebea | #243640 |
| `--neutral-background-overlay` | rgba(0, 0, 0, 0.5) | rgba(0, 0, 0, 0.6) |
| `--neutral-background-canvas` | #f5f5f4 | #1a2730 |
| `--neutral-background-surface` | #ffffff | #1f2d36 |
| `--neutral-foreground-1` | #333f48 | #ffffff |
| `--neutral-foreground-2` | #888b8d | #adadad |
| `--neutral-foreground-3` | #c1c1c0 | #8a8a8a |
| `--neutral-foreground-disabled` | #d6d6d5 | #5c5c5c |
| `--neutral-foreground-inverted` | #ffffff | #333f48 |
| `--neutral-foreground-on-brand` | #ffffff | same |
| `--neutral-foreground-link` | #005eb8 | #479ef5 |
| `--neutral-stroke-1` | #e0e0df | #3d3d3d |
| `--neutral-stroke-2` | #ebebea | #2e2e2e |
| `--neutral-stroke-accessible` | #333f48 | #adadad |
| `--neutral-stroke-focus` | #333f48 | #ffffff |
| `--neutral-stroke-disabled` | #e0e0df | #3d3d3d |

### Semantic: Brand
| Variable | Light | Dark |
|---|---|---|
| `--brand-background-1` | #005eb8 | #115ea3 |
| `--brand-background-2` | #115ea3 | #2886de |
| `--brand-background-inverted` | #dbeeff | #0a2e4a |
| `--brand-background-compound` | #dbeeff | #0a2e4a |
| `--brand-foreground-1` | #005eb8 | #479ef5 |
| `--brand-foreground-2` | #115ea3 | #62abf5 |
| `--brand-foreground-link` | #005eb8 | #479ef5 |
| `--brand-foreground-inverted` | #ffffff | #333f48 |
| `--brand-foreground-compound` | #005eb8 | #479ef5 |
| `--brand-stroke-1` | #005eb8 | #479ef5 |
| `--brand-stroke-2` | #2886de | same |
| `--brand-stroke-compound` | #005eb8 | #479ef5 |

### Semantic: Status
| Variable | Light | Dark |
|---|---|---|
| `--status-danger-background` | #fdf3f4 | #3b1117 |
| `--status-danger-foreground` | #c4314b | #dc626d |
| `--status-danger-stroke` | #c4314b | #dc626d |
| `--status-success-background` | #f1faf1 | #052505 |
| `--status-success-foreground` | #0e7a0b | #54b054 |
| `--status-success-stroke` | #0e7a0b | #54b054 |
| `--status-warning-background` | #fff9f5 | #3d1a00 |
| `--status-warning-foreground` | #f7630c | #f98845 |
| `--status-warning-stroke` | #f7630c | #f98845 |
| `--status-severe-foreground` | #da3b01 | #e8420c |
| `--status-accent` | #fdda24 | same |
| `--status-danger-on-fill` | #ffffff | #000000 |
| `--status-success-on-fill` | #ffffff | #1a2730 |
| `--status-warning-on-fill` | #1a2730 | same |

### Semantic: Chart
| Variable | Light | Dark |
|---|---|---|
| `--chart-1` | #005eb8 | #479ef5 |
| `--chart-2` | #00a5df | same |
| `--chart-3` | #003865 | #68d2df |
| `--chart-4` | #68d2df | #fdda24 |
| `--chart-5` | #fdda24 | #a5cfff |

### Semantic: Illustration
| Variable | Light | Dark |
|---|---|---|
| `--illustration-primary` | #005eb8 | #479ef5 |
| `--illustration-accent` | #fdda24 | same |

### Shadow
| Variable | Light | Dark |
|---|---|---|
| `--shadow-2` | 0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14) | 0 1px 2px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.28) |
| `--shadow-4` | 0 0 2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.14) | 0 0 2px rgba(0, 0, 0, 0.24), 0 2px 4px rgba(0, 0, 0, 0.28) |
| `--shadow-8` | 0 0 2px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.14) | 0 0 2px rgba(0, 0, 0, 0.24), 0 4px 8px rgba(0, 0, 0, 0.28) |
| `--shadow-16` | 0 0 2px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.14) | 0 0 2px rgba(0, 0, 0, 0.24), 0 8px 16px rgba(0, 0, 0, 0.28) |
| `--shadow-28` | 0 0 8px rgba(0, 0, 0, 0.12), 0 14px 28px rgba(0, 0, 0, 0.14) | 0 0 8px rgba(0, 0, 0, 0.24), 0 14px 28px rgba(0, 0, 0, 0.28) |
| `--shadow-64` | 0 0 8px rgba(0, 0, 0, 0.12), 0 32px 64px rgba(0, 0, 0, 0.14) | 0 0 8px rgba(0, 0, 0, 0.24), 0 32px 64px rgba(0, 0, 0, 0.28) |
| `--shadow-ambient` | rgba(0, 0, 0, 0.12) | rgba(0, 0, 0, 0.24) |
| `--shadow-key` | rgba(0, 0, 0, 0.14) | rgba(0, 0, 0, 0.28) |

### Typography
| Variable | Light | Dark |
|---|---|---|
| `--font-family` | canada-type-gibson, ui-sans-serif, system-ui, sans-serif | same |
| `--font-family-mono` | ui-monospace, SFMono-Regular, Menlo, Consolas, monospace | same |
| `--font-weight-light` | 300 | same |
| `--font-weight-regular` | 400 | same |
| `--font-weight-semibold` | 600 | same |
| `--font-weight-bold` | 700 | same |
| `--font-size-display` | 68px | same |
| `--line-height-display` | 92px | same |
| `--font-weight-display` | 300 | same |
| `--font-size-large-title` | 40px | same |
| `--line-height-large-title` | 56px | same |
| `--font-weight-large-title` | 300 | same |
| `--font-size-title-1` | 32px | same |
| `--line-height-title-1` | 40px | same |
| `--font-weight-title-1` | 300 | same |
| `--font-size-title-2` | 28px | same |
| `--line-height-title-2` | 36px | same |
| `--font-weight-title-2` | 300 | same |
| `--font-size-title-3` | 24px | same |
| `--line-height-title-3` | 32px | same |
| `--font-weight-title-3` | 400 | same |
| `--font-size-subtitle-1` | 20px | same |
| `--line-height-subtitle-1` | 28px | same |
| `--font-weight-subtitle-1` | 600 | same |
| `--font-size-subtitle-2` | 16px | same |
| `--line-height-subtitle-2` | 22px | same |
| `--font-weight-subtitle-2` | 600 | same |
| `--font-size-body-1` | 14px | same |
| `--line-height-body-1` | 20px | same |
| `--font-weight-body-1` | 400 | same |
| `--font-size-body-1-stronger` | 14px | same |
| `--line-height-body-1-stronger` | 20px | same |
| `--font-weight-body-1-stronger` | 700 | same |
| `--font-size-body-2` | 16px | same |
| `--line-height-body-2` | 22px | same |
| `--font-weight-body-2` | 400 | same |
| `--font-size-caption-1` | 12px | same |
| `--line-height-caption-1` | 16px | same |
| `--font-weight-caption-1` | 400 | same |
| `--font-size-caption-1-strong` | 12px | same |
| `--line-height-caption-1-strong` | 16px | same |
| `--font-weight-caption-1-strong` | 600 | same |
| `--font-size-caption-1-stronger` | 12px | same |
| `--line-height-caption-1-stronger` | 16px | same |
| `--font-weight-caption-1-stronger` | 700 | same |
| `--font-size-caption-2` | 10px | same |
| `--line-height-caption-2` | 14px | same |
| `--font-weight-caption-2` | 400 | same |
| `--font-size-caption-2-strong` | 10px | same |
| `--line-height-caption-2-strong` | 14px | same |
| `--font-weight-caption-2-strong` | 600 | same |

### Spacing
| Variable | Light | Dark |
|---|---|---|
| `--spacing-none` | 0px | same |
| `--spacing-xxs` | 2px | same |
| `--spacing-xs` | 4px | same |
| `--spacing-s-nudge` | 6px | same |
| `--spacing-s` | 8px | same |
| `--spacing-m-nudge` | 10px | same |
| `--spacing-m` | 12px | same |
| `--spacing-l` | 16px | same |
| `--spacing-xl` | 20px | same |
| `--spacing-xxl` | 24px | same |
| `--spacing-xxxl` | 32px | same |

### Corner Radius
| Variable | Light | Dark |
|---|---|---|
| `--radius-none` | 0px | same |
| `--radius-small` | 2px | same |
| `--radius-medium` | 4px | same |
| `--radius-large` | 6px | same |
| `--radius-x-large` | 8px | same |
| `--radius-circular` | 9999px | same |

### Stroke Width
| Variable | Light | Dark |
|---|---|---|
| `--stroke-thin` | 1px | same |
| `--stroke-thick` | 2px | same |
| `--stroke-thicker` | 3px | same |
| `--stroke-thickest` | 4px | same |

### Motion
| Variable | Light | Dark |
|---|---|---|
| `--duration-ultra-fast` | 50ms | same |
| `--duration-faster` | 100ms | same |
| `--duration-fast` | 150ms | same |
| `--duration-normal` | 200ms | same |
| `--duration-gentle` | 250ms | same |
| `--duration-slow` | 300ms | same |
| `--duration-slower` | 400ms | same |
| `--duration-ultra-slow` | 500ms | same |
| `--easing-accelerate-max` | cubic-bezier(0.9, 0.1, 1, 0.2) | same |
| `--easing-accelerate-mid` | cubic-bezier(1, 0, 1, 1) | same |
| `--easing-accelerate-min` | cubic-bezier(0.8, 0, 0.78, 1) | same |
| `--easing-decelerate-max` | cubic-bezier(0.1, 0.9, 0.2, 1) | same |
| `--easing-decelerate-mid` | cubic-bezier(0, 0, 0, 1) | same |
| `--easing-decelerate-min` | cubic-bezier(0.33, 0, 0.1, 1) | same |
| `--easing-easy-ease-max` | cubic-bezier(0.8, 0, 0.2, 1) | same |
| `--easing-easy-ease` | cubic-bezier(0.33, 0, 0.67, 1) | same |
| `--easing-linear` | cubic-bezier(0, 0, 1, 1) | same |

### shadcn Aliases
| Variable | Light | Dark |
|---|---|---|
| `--background` | #f5f5f4 | #1a2730 |
| `--foreground` | #333f48 | #ffffff |
| `--card` | #ffffff | #1f2d36 |
| `--card-foreground` | #333f48 | #ffffff |
| `--popover` | #ffffff | #1f2d36 |
| `--popover-foreground` | #333f48 | #ffffff |
| `--primary` | #005eb8 | #115ea3 |
| `--primary-foreground` | #ffffff | same |
| `--secondary` | #ebebea | #243640 |
| `--secondary-foreground` | #333f48 | #ffffff |
| `--muted` | #ebebea | #243640 |
| `--muted-foreground` | #888b8d | #adadad |
| `--accent` | rgba(51, 63, 72, 0.05) | rgba(255, 255, 255, 0.04) |
| `--accent-foreground` | #333f48 | #ffffff |
| `--destructive` | #c4314b | #dc626d |
| `--destructive-foreground` | #ffffff | #000000 |
| `--destructive-subtle` | #fdf3f4 | #3b1117 |
| `--destructive-stroke` | #c4314b | #dc626d |
| `--success` | #0e7a0b | #54b054 |
| `--success-foreground` | #ffffff | #1a2730 |
| `--success-subtle` | #f1faf1 | #052505 |
| `--success-stroke` | #0e7a0b | #54b054 |
| `--warning` | #f7630c | #f98845 |
| `--warning-foreground` | #1a2730 | same |
| `--warning-subtle` | #fff9f5 | #3d1a00 |
| `--warning-stroke` | #f7630c | #f98845 |
| `--border` | #ebebea | #2e2e2e |
| `--input` | #e0e0df | #3d3d3d |
| `--ring` | #333f48 | #ffffff |
| `--overlay` | rgba(0, 0, 0, 0.5) | rgba(0, 0, 0, 0.6) |
| `--link` | #005eb8 | #479ef5 |
| `--sidebar` | #f5f5f4 | #1f2d36 |
| `--sidebar-foreground` | #333f48 | #ffffff |
| `--sidebar-primary` | #005eb8 | #115ea3 |
| `--sidebar-primary-foreground` | #ffffff | same |
| `--sidebar-accent` | #ebebea | #243640 |
| `--sidebar-accent-foreground` | #333f48 | #ffffff |
| `--sidebar-border` | #ebebea | #2e2e2e |
| `--sidebar-ring` | #333f48 | #ffffff |
| `--radius` | 4px | same |
<!-- generated:css-variables:end -->

## Component Registry (46 components)

### Actions
| Component | Variants |
|-----------|----------|
| **Button** | Appearance: Primary, Outline, Subtle, Transparent. Size: Small, Medium, Large |
| **Split Button** | Appearance: Primary, Outline |
| **Compound Button** | Appearance: Primary, Outline |
| **Link** | Variant: Default, Subtle, Inline |

### Inputs
| Component | Variants |
|-----------|----------|
| **Input** | State: Default, Filled, Disabled |
| **Textarea** | (no variants) |
| **Checkbox** | State: Checked, Unchecked, Indeterminate, Disabled |
| **Radio** | State: Selected, Unselected, Disabled |
| **Switch** | State: On, Off, Disabled |
| **Dropdown** | (no variants) |
| **Slider** | (no variants) |
| **Spin Button** | (no variants) |
| **Search Box** | (no variants) |
| **Rating** | Color: Marigold, Brand, Neutral |
| **Swatch Picker** | (no variants) |
| **Tag Picker** | (no variants) |

### Data Display
| Component | Variants |
|-----------|----------|
| **Avatar** | Size: 24, 32, 40, 48, 64 |
| **Avatar Group** | (no variants) |
| **Badge** | Variant: Count, Text, Dot |
| **Presence Badge** | Status: Available, Busy, Away, DoNotDisturb, Offline |
| **Persona** | (no variants) |
| **Data Grid** | (no variants) |
| **List** | (no variants) |
| **Tree** | (no variants) |
| **Skeleton** | (no variants) |
| **Status Indicator** | Status: Online, Warning, Error, Info |
| **Spinner** | Size: Small, Medium, Large |
| **Progress Bar** | (no variants) |

### Navigation
| Component | Variants |
|-----------|----------|
| **Nav Item** | State: Default, Active, Nested, Disabled |
| **Breadcrumb** | (no variants) |
| **Tab** | Orientation: Horizontal, Vertical. State: Active, Inactive |
| **Carousel** | (no variants) |

### Layout / Containers
| Component | Variants |
|-----------|----------|
| **Card** | Appearance: Elevated, Outline |
| **Dialog** | (no variants) |
| **Drawer** | (no variants) |
| **Popover** | (no variants) |
| **Divider** | Appearance: Default, Subtle, Strong, Brand |
| **Accordion Item** | State: Expanded, Collapsed |
| **Field** | State: Default, Error, Success |

### Feedback / Messaging
| Component | Variants |
|-----------|----------|
| **Message Bar** | Status: Info, Success, Warning, Error |
| **Toast** | Status: Success, Error, Info |
| **Tooltip** | Position: Top, Bottom, Right |
| **Teaching Popover** | (no variants) |
| **Info Label** | (no variants) |

### Other
| Component | Variants |
|-----------|----------|
| **Label** | State: Default, Required, Disabled |
| **Tag** | Color: Brand, Danger, Success, Warning, Neutral |
| **Interaction Tag** | (dismissible, no named variants) |
| **Toolbar** | (no variants) |
| **Menu** | (no variants) |
| **Material Acrylic** | (frosted glass effect) |

---

## Iconography (162 brand icons)

All icons are 48x48px flattened vectors. These are **illustrative brand marks**, not functional UI icons.

### Color Modes
| Mode | Colors | Use for |
|------|--------|---------|
| **Duotone** (default) | CapTech Blue #005eb8 + Yellow #fdda24 | Light backgrounds, hero accents |
| **Monotone** | CapTech Blue + Blue 30% | Subtle or monochrome contexts |
| **Greyscale** | Dark Grey #333f48 + Grey 30% | Print, low-emphasis |
| **Inverse** | White + White 50% | Dark backgrounds |

### File path pattern
```
icons/<category>/<slug>.svg           (duotone default)
icons/<category>/monotone/<slug>.svg
icons/<category>/greyscale/<slug>.svg
icons/<category>/inverse/<slug>.svg
```

### Usage rules
- Use as illustrative anchors: hero accents, section tiles, category markers, empty states
- Render at 30px+ on a contrasting surface
- Do NOT replace functional/state glyphs (close, chevron, checkmarks, status dots)
- Do NOT bulk-import all 162; import only what you use
- Icons cannot inherit `currentColor` (fixed two-color fills)

### Practice Areas (4 icons)
| Name | Slug |
|------|------|
| CX — Customer Experience | `cx-customer-experience` |
| DA — Data and Analytics | `da-data-and-analytics` |
| MC — Management Consulting | `mc-management-consulting` |
| SI — Systems Integration | `si-systems-integration` |

### Core Competencies (5 icons)
| Name | Slug |
|------|------|
| Communicator | `communicator` |
| Continuous Learner | `continuous-learner` |
| Relationship Builder | `relationship-builder` |
| Results Driver | `results-driver` |
| Strategic Thinker | `strategic-thinker` |

### Core Values (6 icons)
| Name | Slug |
|------|------|
| Belonging | `belonging` |
| Enthusiasm | `enthusiasm` |
| Flexibility | `flexibility` |
| Intellectual Curiosity | `intellectual-curiosity` |
| Servant Leadership | `servant-leadership` |
| Trusted Advisor | `trusted-advisor` |

### ERGs (7 icons)
| Name | Slug |
|------|------|
| BlackTech | `blacktech` |
| CAKE | `cake` |
| Families | `families` |
| Infinity and Beyond | `infinity-and-beyond` |
| PrideTech | `pridetech` |
| Women at CapTech | `women-at-captech` |
| Juntos | `juntos` |

### General (140 icons)

Sorted alphabetically by slug:

`accessibility`, `accessibility-person-universal-access`, `accessibility-video-play`, `accessibility-vision-sight`, `accessibility-work-in-progress`, `agile-cycle`, `agile-growth`, `agile-sprint`, `ai-capabilities-sparkle`, `ai-content-document`, `ai-content-write`, `ai-internet-connect`, `ai-nucleus`, `ai-system-gear`, `analytics-magnifying-glass`, `ar-app`, `ar-cube`, `attract-magnet`, `bell-alert`, `benefits-certification`, `benefits-gift`, `benefits-loyalty-medal`, `branding-badge`, `build-construction-hat`, `camera-views`, `capabilities-strong-weight`, `capflex-work-from-anywhere`, `cares-heart-hands`, `celebration-balloons`, `chat-bot`, `choices-decisions-art-design`, `cloud-data`, `commerce-wallet`, `communication-listen`, `communication-phone-call`, `communication-quote`, `connect-relationship-link`, `connection-linked-bound`, `connection-overlap`, `contact-click-technology`, `data-and-analytics-pie-chart`, `data-filter`, `data-flow`, `database-engineering`, `design-customer-experience-pen`, `design-touch`, `design-visual-ruler-and-pencil`, `design-wireframe`, `device-laptop`, `device-phone`, `device-phone-and-laptop`, `direction-progress-arrows`, `document-solutions`, `event-badge-employee`, `event-tickets`, `exciting-fire-impressive`, `future-arrows`, `gamification-controller`, `gauge-meter-score`, `goals-bulls-eye`, `golf`, `graph-decline`, `graph-growth`, `growth-plant-water`, `industry-automotive-car`, `industry-banking`, `industry-communication-and-media`, `industry-consumer-products`, `industry-consumer-retail`, `industry-distribution-logistics`, `industry-electric-utilities`, `industry-financial-insurance`, `industry-financial-investing`, `industry-food-and-beverage`, `industry-healthcare`, `industry-hospitality-travel`, `industry-it-cloud`, `industry-manufacturing`, `industry-oil-and-gas`, `industry-public-service`, `industry-sports-entertainment`, `innovation-ladder-cloud`, `innovation-lightning`, `insurance-coverage-weather`, `internship-badge`, `issue-bug`, `launch-kick-off-sport-game`, `location-image`, `location-map`, `location-map-alt`, `location-office`, `location-pin`, `machine-learning`, `mail-letter-email`, `mail-letter-email-alt`, `management-consulting-cycle`, `measure-ruler`, `ocm-change`, `people-group`, `people-manager`, `people-mentorship`, `people-person`, `people-presentation`, `people-teams`, `podcast`, `progress-growth`, `project-clipboard`, `puzzle-draft`, `research-magnifying-glass`, `roadmap-pin`, `rocket-launch`, `ruler-measure-alt`, `security-database`, `security-lock`, `send-message`, `send-message-mail`, `social-media`, `software-engineering`, `solutions-wrench-cog`, `sports-shoe-run`, `status-checklist-tasks`, `strategy-chess`, `strategy-magic`, `success-capabilities-key`, `success-mountain`, `sustainability`, `systems-integration-network`, `target-mission`, `technology-api`, `technology-gear`, `testing-tubes`, `time-calendar`, `time-clock`, `timer-progress`, `tools-gears`, `transformation-butterfly`, `transit-shipping-truck`, `user-research-ab-testing`, `user-research-testing`, `work-in-progress-loading`
