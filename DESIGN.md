# DESIGN.md

The visual system for the whole site. Phase 4 builds the admin against it;
Phases 5–8 inherit it.

## Direction

**Black and deep oxblood.** Almost monochrome, with a single dark red carrying
the brand. The interface should read the way a well-made tool reads: quiet,
dense where density helps, and completely unambiguous about what is clickable.

**Dark is the default, not the alternative.** The storefront is composed on a
black ground — the token block on `:root` is the dark one, and light is opt-in
through `[data-theme="light"]`. A visitor who has expressed no preference sees
the design as it was composed.

That is a reversal of the original decision, which made light the default for
the admin operator reading dense numeric data at a desk. The reasoning still
holds for the admin, which is why the theme control appears in the admin
sidebar as well as the public header: the operator can put their own screen
back into light and it is remembered per device.

The neutrals are not grey. Every one carries a trace of the brand hue (chroma
~0.012 at hue 20), so the interface reads as one material rather than a grey
box with red parts attached.

Colour strategy: **Restrained** — tinted neutrals plus one brand colour, spent
deliberately. The oxblood covers a full field exactly once per page.

## The accent rule

This one is easy to get wrong, so it is a rule rather than a guideline:

- **Oxblood means "interactive".** Focus rings, current nav item, selected row,
  drag handles, the featured star, progress fills.
- **Oxblood never means "status".** Status badges are their own semantic family
  with their own hues (below).
- **Primary buttons are near-black** (near-white in dark), not oxblood.
  Near-black is the strongest thing on the page; reserving the brand colour for
  state keeps both legible.

### The four accent roles are not interchangeable

The brand colour cannot be one value. A red dark enough to read as oxblood is
invisible as a focus ring on black; a red light enough to signal on black reads
as salmon. So it is four tokens:

| Token | Role | Constraint |
| --- | --- | --- |
| `--accent-fill` | Large filled areas: bands, plates | Never carries state |
| `--accent` | Interactive state, focus rings | ≥3:1 on the adjacent surface |
| `--accent-ink` | Text and icons | ≥4.5:1 on every surface it lands on |
| `--accent-display` | Headings ≥24px **only** | ≥3:1 — fails as body text |
| `--accent-soft` | Tinted ground | Pairs with `--accent-ink` |

`--accent-display` is the deepest of them. It exists because WCAG asks 3:1 of
large text rather than 4.5:1, and that extra room is the last step from crimson
down to oxblood. Using it below 24px is a contrast failure.

### Danger versus the brand

The brand colour is now itself a red, so danger has to be told apart by
something other than hue. It is pushed to hue 32 and kept **lit and saturated**;
the oxblood is dark and muted and never appears on a destructive control. If the
accent is ever brightened, this separation is the first thing that breaks.

## Tokens

All colour in OKLCH. Defined in `app/globals.css`: the dark set on `:root`, the
light set on `:root[data-theme="light"]`.

The values are not duplicated here — a token table in a document drifts out of
step with the stylesheet the moment either is edited, and then it is worse than
no table at all. `globals.css` is the source of truth and is commented at each
decision. What this file records is the *reasoning* that is not visible from a
list of values:

- **`--ink-3` is pinned**, not tuned by eye. It has to clear 4.5:1 on
  `--surface-3`, the lightest ground it ever lands on (a hovered row).
  Light-grey body text is the single most common reason an interface is hard to
  read; the ramp is pinned so it cannot happen by accident.
- **`--surface-2` goes darker than `--bg` in dark mode.** Sidebars recede rather
  than float.
- **Danger is two tokens, not one.** `--danger` is a fill that white text sits
  on; `--danger-ink` is red text on a light surface. A single value cannot do
  both — whichever end it is tuned for, the other fails.
- **`--on-accent` and `--on-accent-fill` differ.** `--accent` is the lit value
  and takes near-black text; `--accent-fill` is deep and takes white.

### Verified contrast

Contrast is checked against the *rendered page* in both themes rather than
computed from the token values, because what matters is the pair that actually
ends up on screen — a colour is only legible against the surface it lands on.
Every text/background pair on the storefront passes WCAG AA in both themes; the
tightest is small accent-coloured text at 4.73:1, which is the pair to re-check
first if the neutral ramp is ever adjusted.

## Theme switching

Three states — Light, Dark, System — stored under `jeyd-theme`. `System` keeps
following the device while it is selected, so a phone crossing into night mode
changes the page without a reload.

Two states would have been simpler and is the wrong answer: once someone taps a
two-way switch there is no way back to "follow my device" without clearing site
data. `System` is the way back.

`ThemeScript` resolves the theme in a blocking inline script in `<head>`. This
cannot be done in a React component — by the time one runs, the first frame is
painted, and a visitor who chose Light would watch the page load black and then
flip. No stored choice at all resolves to dark.

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

**Geist Sans** carries labels, buttons, body and data across the whole site.
Geist Mono is used for exactly one thing: the account reference code, which is
an identifier people copy.

**Archivo, set expanded (`wdth` 112), carries headings on the buyer-facing
pages** and the wordmark everywhere. A wide grotesque is the lettering of
signage and catalogue plates, and the shop is asking a stranger to trust it with
real money. It contrasts with Geist on an axis Geist does not have — width —
rather than being a second sans that merely looks slightly different. The admin
keeps Geist for headings; `.display` is not used under `/admin`.

**Fixed rem scale, not fluid — in the admin.** Clamp-sized headings do not serve
product UI: users sit at a consistent viewing distance, and a heading that
shrinks inside a panel looks broken, not responsive. Ratio ≈ 1.15.

**The storefront is fluid.** `--display-1/2/3` are `clamp()`, ratio ~1.3,
ceiling 4.5rem. A landing page headline is read at arm's length on a phone and
from further back on a desktop; that is a different problem from a panel title.

The base element rules for `h1`–`h4` live inside `@layer base`, which is not a
detail. Written unlayered they beat every Tailwind utility regardless of
specificity, and a heading asking for `--display-1` silently renders at
`--text-2xl` with nothing in the markup to explain why.

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
