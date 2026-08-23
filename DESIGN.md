# DESIGN.md

The visual system for the whole site. Phase 4 builds the admin against it;
Phases 5–8 inherit it.

## Direction

**Near-black and one warm accent.** Almost monochrome, with a single burnt-amber
accent spent sparingly. The interface should read the way a well-made tool
reads: quiet, dense where density helps, and completely unambiguous about what
is clickable.

The scene that decided the theme: *one operator at a desk, in a lit room,
entering structured data for twenty minutes at a stretch, needing to read prices
and statuses at a glance.* That forces **light as the default surface**, with a
dark counterpart for preference. A dark "gaming" dashboard would have been the
category reflex, and it would have made a dense price table harder to read, not
easier.

Colour strategy: **Restrained** — the product register's floor. Tinted neutrals
plus one accent under 10% of surface area.

## The accent rule

This one is easy to get wrong, so it is a rule rather than a guideline:

- **Amber means "interactive".** Focus rings, current nav item, selected row,
  drag handles, the featured star, progress fills.
- **Amber never means "status".** Status badges are their own semantic family
  with their own hues (below).
- **Primary buttons are near-black, not amber.** Near-black is the strongest
  thing on the page; reserving amber for state keeps both legible.

## Tokens

All colour in OKLCH. Defined in `app/globals.css` on `:root`, redefined under
`@media (prefers-color-scheme: dark)`.

### Light

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `oklch(0.985 0 0)` | Page. True neutral — deliberately **not** cream/sand |
| `--surface` | `oklch(1 0 0)` | Cards, panels, table body |
| `--surface-2` | `oklch(0.965 0 0)` | Sidebar, toolbars, table header |
| `--surface-3` | `oklch(0.94 0 0)` | Hover rows, inset wells |
| `--border` | `oklch(0.905 0 0)` | Hairlines |
| `--border-strong` | `oklch(0.82 0 0)` | Inputs, focused containers |
| `--ink` | `oklch(0.18 0 0)` | Primary text |
| `--ink-2` | `oklch(0.42 0 0)` | Secondary text, labels |
| `--ink-3` | `oklch(0.50 0 0)` | Muted text **and placeholders** |
| `--primary` | `oklch(0.20 0 0)` | Primary button fill |
| `--primary-hover` | `oklch(0.30 0 0)` | |
| `--on-primary` | `oklch(0.99 0 0)` | Text on primary |
| `--accent` | `oklch(0.66 0.15 66)` | Interactive indicator fills, focus ring |
| `--accent-ink` | `oklch(0.47 0.12 58)` | Accent-coloured **text** and icons |
| `--accent-soft` | `oklch(0.96 0.03 75)` | Accent tinted background |
| `--on-accent` | `oklch(0.18 0.02 60)` | Text on an accent fill |

`--ink-3` is `0.50`, not the `0.55` that looks nicer in isolation. At `0.55` a
placeholder lands near 3.9:1 on white and fails. Light-gray body text is the
single most common reason an interface is hard to read; the ramp is pinned so it
cannot happen by accident.

**Danger is two tokens, not one.** `--danger` is a fill that white text sits on;
`--danger-ink` is red text on a light surface. A single value cannot do both —
whichever end it is tuned for, the other fails. Use `--danger-ink` for text and
icons, `--danger` for button and indicator fills, `--danger-border` for outlines.

### Verified contrast

Every foreground/background pair in both themes was computed from these OKLCH
values and checked against WCAG AA: 4.5:1 for text, 3:1 for the focus ring
against its adjacent surface. All 40 pairs pass. The tightest are the danger
button hover in dark (4.57:1) and muted text on a hovered row in dark (4.99:1),
so those two are the ones to re-check if the neutral ramp is ever adjusted.

### Dark

Same roles, inverted. `--primary` becomes near-white (`oklch(0.95 0 0)`) with
near-black text, because a near-black button on a near-black page is invisible.
`--accent` lifts to `oklch(0.74 0.14 72)` to hold contrast on a dark ground.
`--surface-2` goes *darker* than `--bg` in dark mode — sidebars recede rather
than float. `--ink-3` sits at `0.66` rather than mirroring the light ramp,
because it has to stay legible on the hovered-row surface, which is the
lightest thing it ever lands on.

### Status colours

A separate family from the accent, one distinct hue each, all low-saturation
tinted badges — never full-saturation fills, which the product register bans on
inactive states.

| Status | Hue | Reads as |
| --- | --- | --- |
| Available | green `150` | purchasable |
| Reserved | orange `55` | in progress |
| Sold | neutral `0` | done, inert |
| Hidden | slate `250`, dashed border | not public |

Hidden gets the dashed border because it is the only status that changes who can
see the row. That needs to be visible from across the table, not read.

Colour is never the only signal: every badge carries its label as text.

## Typography

**One family** — Geist Sans, already loaded, carries headings, labels, buttons,
body and data. Geist Mono is used for exactly one thing: the account reference
code, which is an identifier people copy. No display face anywhere in the UI.

**Fixed rem scale, not fluid.** Clamp-sized headings do not serve product UI —
users sit at a consistent viewing distance, and a heading that shrinks inside a
panel looks broken, not responsive. Ratio ≈ 1.15.

| Token | Size | Line height | Tracking |
| --- | --- | --- | --- |
| `--text-xs` | 0.75rem | 1.4 | `+0.01em` |
| `--text-sm` | 0.8125rem | 1.45 | `+0.005em` |
| `--text-base` | 0.875rem | 1.55 | `0` |
| `--text-md` | 1rem | 1.5 | `0` |
| `--text-lg` | 1.125rem | 1.4 | `-0.005em` |
| `--text-xl` | 1.375rem | 1.3 | `-0.01em` |
| `--text-2xl` | 1.75rem | 1.25 | `-0.015em` |
| `--text-3xl` | 2.25rem | 1.15 | `-0.02em` |

Tracking is size-specific, never one value for everything: small text opens up
slightly for legibility, large text tightens because letters read too far apart
as they grow. Body sits at `0.875rem` — admin density, not a marketing page.

**Numbers get `font-variant-numeric: tabular-nums`** everywhere they appear in a
column: prices, levels, hero and skin counts, dashboard figures. Proportional
digits make a price column impossible to scan.

Prose caps at 65–75ch. Tables are exempt and may run wide.

## Layout

- **Sidebar + content** above `lg`. Below that the sidebar becomes a top bar
  with a slide-in drawer. This is a different layout, not a squeezed one.
- **The accounts table stays a real `<table>` on desktop.** Density is a
  permission in this register, and the columns genuinely need to align. Below
  `md` it becomes a stacked list where each listing is one row of information.
- Flexbox for one dimension, Grid for two. No Grid where `flex-wrap` does it.
- **No nested cards.** The dashboard figures are a divided row, not five cards.

## Motion

- `--dur-fast: 120ms`, `--dur: 180ms`, `--dur-slow: 240ms`.
- `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` — ease-out-quart. No bounce, no
  elastic. Bounce is only ever earned by a gesture that carried momentum.
- `transform` and `opacity` only. Never animate layout properties.
- Motion conveys state: press feedback, loading, reveal, dismissal. Nothing
  decorative, and no orchestrated page-load sequence — the admin loads into a
  task.
- **Press feedback fires on pointer-down, not on click.** Waiting for release
  feels dead.
- Dialogs and drawers enter and exit along the same path, anchored to what
  opened them.
- `prefers-reduced-motion: reduce` replaces every transform with a short
  cross-fade. Not optional.

## Component contract

Every interactive component ships **default, hover, focus-visible, active,
disabled, loading, error**. Shipping half of them is what makes an interface
feel subtly wrong.

- Focus is always visible: `outline: 2px solid var(--accent); outline-offset: 2px`.
  Never `outline: none` without a replacement.
- Loading content uses skeletons shaped like the content. Spinners only inside
  buttons, where the thing being waited on is the button itself.
- Empty states teach the interface — what this screen is for and the one action
  that fills it — never "No data".
- Destructive actions get a confirmation dialog that names the specific record.
  Everything else stays inline and undoable. Confirmations used for anything
  non-destructive train people to click through them.
- **Hit targets are at least 44px.** Standard controls — buttons, inputs,
  selects, nav links — are 44px tall outright. Small controls that genuinely
  read better compact (icon buttons, the table's status select, dense `sm`
  buttons) keep their size and use the `.hit-target` utility, which grows the
  tap area to 44px via a centred pseudo-element without changing the layout.
  Links inside a sentence are exempt; padding them out would break the prose.

## Banned

Beyond the shared bans (side-stripe accent borders, gradient text, decorative
glassmorphism, hero-metric templates, identical icon-card grids, uppercase
tracked eyebrows on every section):

- Full-saturation status fills.
- A different-looking Save button on two screens.
- Modal as the first answer to a design problem.
- Custom scrollbars or reinvented form controls.
- Decorative motion.
