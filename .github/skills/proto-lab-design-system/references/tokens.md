# Token Reference

Complete vocabulary of available CSS custom properties and component variants.

## CSS Custom Properties (variables-light.css)

### Brand Colors
| Variable | Value |
|----------|-------|
| `--color-captech-blue` | #005eb8 |
| `--color-dark-grey` | #333f48 |
| `--color-medium-grey` | #888b8d |
| `--color-light-grey` | #d9d9d6 |
| `--color-accent-yellow` | #fdda24 |
| `--color-dark-blue` | #003865 |
| `--color-light-teal` | #68d2df |
| `--color-sky-blue` | #00a5df |

### Brand Ramp
`--color-brand-10` through `--color-brand-160` (16 steps from #061724 to #ebf3fc). Primary brand: `--color-brand-80` = #005eb8.

### Neutrals
| Variable | Value |
|----------|-------|
| `--color-black` | #000000 |
| `--color-white` | #ffffff |
| `--color-grey-2` | #f5f5f4 |
| `--color-grey-4` | #ebebea |
| `--color-grey-6` | #e0e0df |
| `--color-grey-8` | #d6d6d5 |
| `--color-grey-12` | #c1c1c0 |
| `--color-grey-20` | #1a2730 |

### Semantic: Neutral
| Variable | Resolves to |
|----------|-------------|
| `--neutral-background-1` | white (card surface) |
| `--neutral-background-2` | grey-2 (page background) |
| `--neutral-background-3` | grey-4 (subtle surface) |
| `--neutral-background-subtle` | rgba(51,63,72,0.05) |
| `--neutral-background-inverted` | dark-grey |
| `--neutral-background-disabled` | grey-4 |
| `--neutral-background-overlay` | rgba(0,0,0,0.5) |
| `--neutral-foreground-1` | dark-grey (primary text) |
| `--neutral-foreground-2` | medium-grey (secondary text) |
| `--neutral-foreground-3` | grey-12 (tertiary/placeholder) |
| `--neutral-foreground-disabled` | grey-8 |
| `--neutral-foreground-inverted` | white |
| `--neutral-foreground-on-brand` | white |
| `--neutral-foreground-link` | captech-blue |
| `--neutral-stroke-1` | grey-6 (borders) |
| `--neutral-stroke-2` | grey-4 (subtle borders) |
| `--neutral-stroke-accessible` | dark-grey |
| `--neutral-stroke-focus` | dark-grey |
| `--neutral-stroke-disabled` | grey-6 |

### Semantic: Brand
| Variable | Resolves to |
|----------|-------------|
| `--brand-background-1` | captech-blue (primary CTA) |
| `--brand-background-2` | brand-70 |
| `--brand-background-inverted` | blue-100 |
| `--brand-background-compound` | blue-100 |
| `--brand-foreground-1` | captech-blue |
| `--brand-foreground-2` | brand-70 |
| `--brand-foreground-link` | captech-blue |
| `--brand-foreground-inverted` | white |
| `--brand-foreground-compound` | captech-blue |
| `--brand-stroke-1` | captech-blue |
| `--brand-stroke-2` | brand-90 |
| `--brand-stroke-compound` | captech-blue |

### Semantic: Status
| Variable | Value |
|----------|-------|
| `--status-danger-background` | #fdf3f4 |
| `--status-danger-foreground` | #c4314b |
| `--status-danger-stroke` | #c4314b |
| `--status-success-background` | #f1faf1 |
| `--status-success-foreground` | #0e7a0b |
| `--status-success-stroke` | #0e7a0b |
| `--status-warning-background` | #fff9f5 |
| `--status-warning-foreground` | #f7630c |
| `--status-warning-stroke` | #f7630c |
| `--status-severe-foreground` | #da3b01 |

### Shadows
| Variable | Use for |
|----------|---------|
| `--shadow-2` | Cards, buttons at rest |
| `--shadow-4` | Dropdowns, popovers |
| `--shadow-8` | Flyouts, hover states |
| `--shadow-16` | Dialogs, drawers |
| `--shadow-28` | Modals, command bars |
| `--shadow-64` | Top-level surfaces |

### Typography
| Variable | Value |
|----------|-------|
| `--font-family` | Inter, sans-serif |
| `--font-weight-light` | 300 |
| `--font-weight-regular` | 400 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

| Style | Size / Line-height | Weight |
|-------|-------------------|--------|
| Display | 68px / 92px | light |
| Large Title | 40px / 56px | light |
| Title 1 | 32px / 40px | light |
| Title 2 | 28px / 36px | light |
| Title 3 | 24px / 32px | regular |
| Subtitle 1 | 20px / 28px | semibold |
| Subtitle 2 | 16px / 22px | semibold |
| Body 1 | 14px / 20px | regular |
| Body 1 Stronger | 14px / 20px | bold |
| Body 2 | 16px / 22px | regular |
| Caption 1 | 12px / 16px | regular |
| Caption 1 Strong | 12px / 16px | semibold |
| Caption 2 | 10px / 14px | regular |

### Spacing
| Variable | Value |
|----------|-------|
| `--spacing-none` | 0px |
| `--spacing-xxs` | 2px |
| `--spacing-xs` | 4px |
| `--spacing-s-nudge` | 6px |
| `--spacing-s` | 8px |
| `--spacing-m-nudge` | 10px |
| `--spacing-m` | 12px |
| `--spacing-l` | 16px |
| `--spacing-xl` | 20px |
| `--spacing-xxl` | 24px |
| `--spacing-xxxl` | 32px |

### Corner Radius
| Variable | Value |
|----------|-------|
| `--radius-none` | 0px |
| `--radius-small` | 2px |
| `--radius-medium` | 4px |
| `--radius-large` | 6px |
| `--radius-x-large` | 8px |
| `--radius-circular` | 9999px |

### Stroke Width
| Variable | Value |
|----------|-------|
| `--stroke-thin` | 1px |
| `--stroke-thick` | 2px |
| `--stroke-thicker` | 3px |
| `--stroke-thickest` | 4px |

---

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
