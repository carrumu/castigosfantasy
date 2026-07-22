---
name: CastigosFantasy
description: Obsidian locker-room scoreboard lit by a single acid-lime accent — loud, brutalist, banter-forward.
colors:
  accent: "#deed00"
  accent-deep: "#c3d000"
  obsidian: "#131313"
  ink: "#0e0e0e"
  surface: "#20201f"
  surface-hover: "#2a2a2a"
  surface-raised: "#1c1b1b"
  hairline: "#000000"
  paper: "#ffffff"
  text-light: "#e5e2e1"
  text-muted: "#c8c8ab"
  danger: "#d30017"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "3.4rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-1.8px"
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-1px"
  title:
    fontFamily: "Syne, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.3px"
  body:
    fontFamily: "Syne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Syne, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.5px"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "50%"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.hairline}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
    textColor: "{colors.hairline}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  input-field:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1rem"
---

# Design System: CastigosFantasy

## Overview

**Creative North Star: "The Locker-Room Scoreboard"**

CastigosFantasy looks like the moment the results go up on the wall and the group
starts roasting whoever finished last. The world is obsidian and near-black —
the dim of a locker room — cut by one loud acid-lime accent (#deed00) that reads
like a scoreboard glowing in the dark. Nothing here is polite or corporate; the
type is heavy geometric Syne, set in tight uppercase, and surfaces are framed in
hard black hairlines that make every card feel like a printed sticker slapped on
the wall.

Density is confident, not cramped: chunky tap targets, generous padding inside
cards, and a strict two-value contrast model — the acid-lime speaks, everything
else recedes into obsidian. Depth is hybrid: interactive, brutalist elements sit
on solid offset black shadows (they look pressable), while accent and focus states
bloom with a soft acid-lime glow rather than a gray drop shadow. The accent is
scarce on purpose; when it appears, it's the thing being called out — the moroso,
the CTA, the live score.

This is deliberately *not* a clean SaaS dashboard, not a pastel fantasy-manager,
and not a minimalist neutral tool. Banter and legibility both win; expression
never costs you the ability to read the scoreboard at a glance.

**Key Characteristics:**
- Obsidian-on-obsidian layering, lit by a single acid-lime accent
- Heavy uppercase Syne with tight negative tracking
- Hard black hairlines + solid offset shadows (sticker/brutalist feel)
- Accent glow for state, solid shadow for structure
- Loud, tactile, banter-forward — built to call people out

## Surface Modes

The brutalist hard-frame treatment above is the **Persuade** register — landing,
seo-home, marketing. It is not sitewide. **Operate** surfaces (auth, dashboard,
league-hub, select-league, and most in-app screens/modals — anywhere a user is
doing a task rather than being sold to) intentionally soften the frame: this is
confirmed product direction, not drift to fix.

**Operate treatment ("scoreboard glass"):**
- **Cards:** `background: var(--bg-card)` (#20201f), a hairline border at low
  opacity (`rgba(255,255,255,0.08)`, not solid black), `border-radius: 12px`,
  and an ambient blurred shadow (`0 4px 20px rgba(0,0,0,0.25)`) rather than a
  solid offset. The `.glass` utility additionally applies `backdrop-filter:
  blur(16px)` where a card floats over other content. Hover tints the border
  and shadow toward the accent at low alpha and lifts 1px; no hard-frame
  sticker motion.
- **Buttons:** acid-lime gradient fill (`var(--accent)` → `var(--accent-deep)`,
  135deg) with black text, `border: none`, `border-radius: 8px`, and a soft
  lime-tinted blurred shadow (`rgba(var(--accent-rgb), 0.15)`) instead of the
  hard offset. Hover brightens + lifts 1px + blooms the shadow; active settles.
  Uppercase/800-weight/0.5px-tracking labels still apply — that rule is shared
  with Persuade.
- Foul Red, typography, and spacing rules from the rest of this doc apply
  unchanged in Operate; only the frame/shadow/border language differs.

Persuade keeps the full hard-frame brutalist system described below. Don't
port the Operate softening onto Persuade surfaces, and don't port Persuade's
hard offset shadows onto Operate — each is deliberate for its mode.

## Colors

A two-voice palette: obsidian everything, one acid-lime scream.

### Primary
- **Scoreboard Lime** (#deed00): The single loud accent. Primary CTAs, active
  states, the live/called-out element (moroso, current turn), key links, and
  focus glows. It carries the brand; keep it rare.
- **Lime Deep** (#c3d000): The pressed/hover shade of the accent, for button
  hover and active fills so the accent darkens under the finger.

### Neutral
- **Obsidian** (#131313): The base background and header — the room's dim.
- **Ink** (#0e0e0e): Deepest recess — sidebar, inputs, wells that sit *under* the
  surface.
- **Surface** (#20201f): Default card and panel fill, one step up from obsidian.
- **Surface Raised** (#1c1b1b): Light-item / list-row fill and secondary buttons.
- **Surface Hover** (#2a2a2a): Hover state for cards and rows.
- **Hairline Black** (#000000): Borders and the solid offset shadow color. This
  hard black frame is a signature, not a subtle divider.
- **Paper White** (#ffffff): Reserved for favicons/avatars and rare inverted
  chips; never a page background.
- **Bone Text** (#e5e2e1): Primary body and heading text on dark.
- **Muted Sand** (#c8c8ab): Secondary text, captions, metadata.

### Tertiary
- **Foul Red** (#d30017): Danger only — destructive actions, the colista/last-place
  highlight, error states. Never decorative.

### Named Rules
**The One Scream Rule.** Acid-lime covers ≤10% of any screen. It marks exactly
what the group should look at — the CTA or the called-out player — and its rarity
is what makes the callout land. Two limes competing for attention is a bug.

**The Hard Frame Rule.** Borders are true black (#000000), never a gray tint.
The black frame is the material; softening it to gray breaks the sticker feel.

## Typography

**Display Font:** Syne (with sans-serif fallback)
**Body Font:** Syne (with -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)

**Character:** One geometric family does everything. Syne's wide, slightly
eccentric letterforms feel like sports lettering; at heavy weights in uppercase
it reads as a scoreboard, at 400 it stays legible as body copy. The system leans
on weight and case for hierarchy, not on a second family.

### Hierarchy
- **Display** (800, 3.4rem, line-height 1, letter-spacing −1.8px): Hero and
  landing headlines. Tight tracking pulls the heavy caps into a solid block.
- **Headline** (800, 2.1rem, line-height ~1.05, −1px): Section and view titles.
- **Title** (800, 1.2rem, −0.3px): Card titles, row headers.
- **Body** (400, ~0.92rem, line-height 1.5): Paragraphs, descriptions, forum text.
- **Label** (800, 0.75rem, letter-spacing 0.5px, UPPERCASE): Buttons, tags, chips,
  metadata. Uppercase + heavy weight is the default for any control label.

### Named Rules
**The Uppercase Control Rule.** Every button and chip label is uppercase, weight
800, with slight positive tracking (0.5px). Sentence-case controls look borrowed
from another system.

**The Tight-Cap Rule.** Big headings use negative letter-spacing (−1px to −1.8px)
so heavy caps read as one graphic mass, not spaced-out letters.

## Layout

A single-column, mobile-first app shell built around a `#view-container` that
swaps views. Content sits in stacked cards with ~1.25rem internal padding and
~1.25rem vertical rhythm between them. Spacing steps are informal but cluster on
0.5 / 0.75 / 1 / 1.25rem. On mobile the type hierarchy is intentionally compressed
via `!important` media blocks — override those with `#view-container .class`
specificity rather than editing the blocks. Density is comfortable-tactile:
targets stay chunky, rows breathe, nothing is packed to a data-grid density.

## Elevation & Depth

Hybrid. The system is mostly flat obsidian layering — recesses go darker (ink),
surfaces go lighter (surface/surface-raised) — but two distinct depth mechanisms
coexist:

1. **Solid offset shadows** on brutalist/interactive elements: a hard, un-blurred
   black block offset down-right, so the element looks like a pressable sticker.
2. **Accent glow** for state: focus rings and live elements bloom acid-lime,
   never gray.

Gray blurred drop-shadows are used sparingly for large floating panels only; they
are not the house style.

### Shadow Vocabulary
- **Sticker offset** (`box-shadow: 2px 2px 0 0 #000000`): Default for brutalist
  buttons, link previews, and framed interactive cards. On hover, deepen and lift:
  `3px 3px 0 0 #000000` with `transform: translate(-1px, -1px)`.
- **Focus glow** (`box-shadow: 0 0 0 3px var(--primary-green-glow)`): Input focus
  and active accent elements — an acid-lime ring at ~15–25% alpha.
- **Ambient panel** (`box-shadow: 0 10px 30px rgba(0,0,0,0.5)`): Large floating
  surfaces (modals, sidebars) only.

### Named Rules
**The Press Rule.** Interactive brutalist elements move on interaction — translate
toward the shadow on hover, settle on active. A static offset shadow with no
motion reads as broken.

## Shapes

Softened brutalism. Corners are small and consistent (4–12px): controls and
inputs at 8px, cards and rows at 12px, tiny chips/tags at 4–6px, avatars fully
round (50%). The softness on the radius is deliberate — it keeps the hard black
frames and offset shadows from feeling hostile, matching the "loud and tactile"
rather than "sharp and cold" intent. Borders are 1–2px solid black; the 2px black
frame plus offset shadow is the signature silhouette.

## Components

### Buttons
Persuade default — see [Surface Modes](#surface-modes) for the Operate variant
(soft blurred shadow, no hard border) used on auth/dashboard/app screens.
- **Shape:** Softened rectangles (8px radius). Labels always UPPERCASE, weight 800,
  0.5px tracking.
- **Primary:** Acid-lime fill (`#deed00`) with black text — the scoreboard button.
  Padding `0.65rem 1.25rem`.
- **Hover / Active:** Darken toward Lime Deep (#c3d000) / `filter: brightness(1.1)`,
  lift with `translateY(-1px)`, settle on active. Brutalist variants translate
  toward their offset shadow.
- **Secondary:** Surface-raised fill (#1c1b1b), bone text, 1px black border.
- **Danger:** Transparent-to-tinted red wash, Foul Red text/border; destructive only.

### Cards / Containers
Persuade default — see [Surface Modes](#surface-modes) for the Operate variant
(low-opacity hairline, ambient blurred shadow, optional backdrop blur).
- **Corner Style:** 12px (lg).
- **Background:** Surface (#20201f), one step up from obsidian; rows use
  surface-raised (#1c1b1b).
- **Shadow Strategy:** Flat at rest; brutalist/interactive cards carry the sticker
  offset shadow (see Elevation). Hover raises row fill to surface-hover and lights
  the border toward an accent glow.
- **Border:** 1px black hairline; framed variants use 2px.
- **Internal Padding:** 1.25rem (lg).

### Inputs / Fields
- **Style:** Ink fill (#0e0e0e), 1px black border, 8px radius, bone text.
- **Focus:** Border shifts to acid-lime plus a 3px acid-lime glow ring
  (`0 0 0 3px var(--primary-green-glow)`). No gray focus states.

### Navigation
- App-shell view swapping inside `#view-container`; active items carry the
  acid-lime accent (fill or underline), inactive stay muted bone/sand. Mobile
  compresses type via the `!important` media blocks noted in Layout.

### Signature: Leaderboard / Lista de Morosos
The defining component. Vertical stack of rows (surface-raised, 12px, 1px black
border). The colista (last place) is highlighted with the Foul Red treatment —
1.5px red border and an 8% red wash — so the person being called out is
unmistakable. This is the product's core "scoreboard" moment made visual.

## Do's and Don'ts

### Do:
- **Do** keep acid-lime (#deed00) scarce — one scream per screen, on the CTA or the
  called-out element.
- **Do** frame interactive brutalist elements in true black (#000000) with a solid
  offset shadow, and move them on hover/active.
- **Do** set every button and chip label UPPERCASE, weight 800, 0.5px tracking.
- **Do** use negative letter-spacing (−1px to −1.8px) on large Syne headings.
- **Do** convey focus and "live" state with an acid-lime glow, never gray.
- **Do** reserve Foul Red (#d30017) for danger and the last-place callout only.

### Don't:
- **Don't** use two competing accent hits in one view.
- **Don't** soften black hairlines to gray — the hard black frame is the material.
- **Don't** default to blurred gray drop-shadows for cards; that's for large
  floating panels only.
- **Don't** put paper white (#ffffff) behind page content; it's for avatars/chips.
- **Don't** introduce a second type family — hierarchy comes from Syne's weight
  and case.
- **Don't** edit the mobile `!important` media blocks directly; override with
  `#view-container .class` specificity.
