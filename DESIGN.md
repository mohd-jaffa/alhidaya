---
name: Al Hidaya Health Care Services
description: A calm white page where care is shown in people and soft cards, and words arrive as you read.
colors:
  forest: "#3b6b24"
  forest-2: "#2f581c"
  on-forest: "#ffffff"
  on-forest-2: "#e3eed6"
  leaf-pale: "#eef5e2"
  leaf: "#86ae3c"
  deep: "#0f64ac"
  sky: "#33a0da"
  on-deep: "#ffffff"
  on-deep-2: "#dce9f6"
  navy: "#0b2440"
  ink-2: "#3a5272"
  ink-soft: "#7d8aa0"
  ground: "#ffffff"
  mist: "#f1f6fb"
  rule: "#d5e1ed"
  focus: "#0f64ac"
  focus-on-deep: "#ffffff"
  error: "#b42318"
typography:
  hero:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 1.55rem + 3vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.6vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  statement:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.1rem + 2.2vw, 2.875rem)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.75rem + 3vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.04em"
  marquee:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(4rem, 1.5rem + 10vw, 11rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  section:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 500
    lineHeight: 1.25
  lead:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  card: "28px"
  frame: "24px"
  pill: "999px"
  inset: "20px"
  thumb: "16px"
  highlight: "0.18em"
  panel: "6px"
  control: "6px"
  tag: "4px"
spacing:
  gutter: "clamp(1rem, 0.5rem + 2.5vw, 2.5rem)"
  section: "clamp(3.5rem, 2rem + 6vw, 7rem)"
  touch: "44px"
  site: "78rem"
  measure: "60ch"
components:
  pill-forest:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  pill-forest-hover:
    backgroundColor: "{colors.forest-2}"
  pill-forest-lg:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "56px"
    typography: "{typography.lead}"
  pill-pale:
    backgroundColor: "{colors.leaf-pale}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  pill-pale-hover:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
  pill-on-forest:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  pill-on-forest-hover:
    backgroundColor: "{colors.leaf-pale}"
  pill-label:
    backgroundColor: "{colors.leaf-pale}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
    typography: "{typography.body}"
  icon-chip-pale:
    backgroundColor: "{colors.leaf-pale}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    size: "44px"
  icon-chip-forest:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.pill}"
    size: "44px"
  card-mist:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.navy}"
    rounded: "{rounded.card}"
    padding: "24px"
  card-accent:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.card}"
    padding: "24px"
  photo-frame:
    backgroundColor: "{colors.mist}"
    rounded: "{rounded.frame}"
  form-panel:
    backgroundColor: "{colors.mist}"
    rounded: "{rounded.card}"
    padding: "40px"
  field-line:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    height: "48px"
    typography: "{typography.body}"
  footer:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
  nav-link-current:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  admin-button-primary:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  admin-button-primary-hover:
    backgroundColor: "{colors.navy}"
  admin-button-secondary:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  admin-field-box:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
---

# Design System: Al Hidaya Health Care Services

<!-- Written from the built world at the end of Phase 6B (2026-10-31). Source of truth: src/app/globals.css, src/lib/motion/tokens.ts, src/components/{ui,sections,site,motion}. Where this file and the code disagree, the code was right on the day this was written; fix the file. -->

## Overview

**Creative North Star: "Care, Shown in People"**

The public site is the telehealth landing language of Dribbble shot 24320685 (Eloqwnt for DocInPoc), pinned by the user (plan D97) and translated into the logo's colours and Al Hidaya's own facts. It is a calm white page in **Persuade** mode: care is shown in photographs of people and in soft, deeply rounded mist cards; the logo's leaf green, deepened to forest, carries every main action, the one accent card and the footer; words are large, light and tight, and they arrive as you read: a headline's letters settle into place, a statement darkens with the scroll, cards rise one after another, steps travel sideways, the footer's words run.

It is not signage and not a dashboard. The old wayfinding line (D36) and its station dots are gone, the header is not pinned (D107), and nothing is decorated for its own sake. Density is low on the public site: one idea per section, separated by one generous section gap. The admin panel is a separate **Operate** surface that shares the tokens and type but keeps its own firm, boxed look (see the Admin note under Components).

**Key Characteristics:**
- White ground, mist cards at 28 px radius, photographs in 24 px frames, everything actionable round.
- One family, Inter Tight, at light-to-regular weights for anything large; medium for titles.
- Forest is the action colour on the site; deep blue is the action colour in the admin.
- Motion follows the scroll or arrives once; it never runs on its own and always has a still path.
- Only real facts and licensed stock: no invented proof, no staff captions on stock.

## Colors

The logo's four colours and two greens derived from its leaf, on white; one red for errors and nothing else.

### Primary
- **Forest** (forest): the logo's leaf deepened. The site's action colour: every primary pill, the accent card in the highlights, the footer, the filled tick of a site checkbox or radio, link words beside an arrow. Carries white text (about 6.3:1).
- **Forest Pressed** (forest-2): the forest pill's hover.
- **Leaf Pale** (leaf-pale): the leaf lightened. The pale pill, the pill label, icon chips beside words, the highlight behind a headline phrase, the current row of the phone menu, the empty fill behind a photo that has not arrived. Carries forest, navy or ink-2 text.

### Secondary
- **Deep Blue** (deep): the logo's blue. The admin's action colour, the floating WhatsApp button, the info and success notice icons, the focus ring on light ground. Carries white text.
- **Sky Blue** (sky): the logo's light blue. Text selection, the admin's in-progress and new-count pills. A line and fill colour: carries navy text only; white on it fails AA.
- **Leaf** (leaf): the logo's green as drawn. The admin's "resolved" status. Navy text only; white on it fails AA.

### Neutral
- **Navy Ink** (navy): all primary text, the deep blue darkened. The admin's side column. The dark half of a statement's words; the scrim under words on a photo (at 85% opacity).
- **Ink Two** (ink-2): supporting lines, hints, summaries, credits, inactive header links, field borders (3:1 against ground).
- **Quiet Grey** (ink-soft): a statement's softer words only. About 3.5:1: large type only.
- **Ground** (ground): the page.
- **Mist** (mist): cards, the form panel, photo placeholders, the current header link, an opened admin row.
- **Rule** (rule): hairlines (the phone menu's bar, admin dividers).
- **On Deep Two / On Forest Two** (on-deep-2, on-forest-2): quieter text on a deep-blue or forest surface (footer descriptions, column headings, copyright).

### Error
- **Error Red** (error): the one colour outside the logo's (D63). Field errors, error notices, invalid borders; always with the error pictogram and words.

### Named Rules
**The White-Only-On-Dark Rule.** White text sits only on deep blue, navy or forest (and forest-2, error). Sky and leaf carry navy text. tests/contract/tokens.test.ts holds every pairing the design uses to 4.5:1 and fails the build if one slips.

**The Large-Grey Rule.** The quiet grey is for large type only (the statement role and up); the test asserts it stays under 4.5:1 so no one mistakes it for a body colour.

**The Red-Means-Wrong Rule.** The error red appears only for errors, always with an icon and words, never colour alone.

**The Logo-Only Rule.** No colour outside the tokens above (D35, D98), and light theme only (D28). Tailwind's own palette is removed in globals.css (`--color-*: initial`), so an off-token colour does not compile to anything.

## Typography

**Display Font:** Inter Tight (self-hosted via next/font, variable 100–900, metric-matched Arial fallback)
**Body Font:** Inter Tight
**Label/Mono Font:** none; tabular figures (`tabular-nums`) for phone numbers, step numbers and request ids.

**Character:** a tight grotesk set large and light for the voice, regular for reading, medium for anything you must find (titles, pill words, labels). One family, roles not sizes (D108).

### Hierarchy
- **Hero** (400, clamp 42–60 px, 1.06, -0.02em): the one h1 of each page, in Home's hero (max 18ch) and every PageHero (max 15ch). Capped at 60 px so Home's headline runs in two lines on a desktop. Carries the settling letters and at most one highlighted phrase.
- **Display** (400, clamp 32–52 px, 1.1, -0.018em): a section's heading, centred under its pill label in a section opening, or beside a form; the phone menu's page links.
- **Statement** (400, clamp 26–46 px, 1.22, -0.025em): the one large centred sentence on Home (max 30ch), navy and quiet-grey words with inline icon chips.
- **Figure** (300, clamp 40–60 px, 1, -0.04em): counters' figures in a facts row; the hero's round brackets around the faces (200).
- **Marquee** (400, clamp 64–176 px, 0.9, -0.04em, uppercase): the footer's running words only.
- **Section** (500 on the site, 700 in the admin; 28 px, 1.15, -0.01em): headings inside long text (rich text, a job's page) and the admin's screen headings.
- **Title** (500, 21 px, 1.25): a card's name (a service, a highlight, a step at 400), the hero fact's value.
- **Lead** (400, 21 px, 1.45): the supporting line under a headline (max 36–40ch), always ink-2; the large pill's words from 640 px.
- **Body** (400, 17 px, 1.6): running text, pill words, field values. Reading width 60ch (`measure`).
- **Small** (400 or 500, 14 px, 1.45): summaries, hints, credits, footer column headings, the hero's word chips, errors (500).

### Named Rules
**The Light-And-Large Rule.** Hero, display and statement are set at 400 (figures at 300) and tight; weight never climbs to make a headline louder. Size and the pale highlight do that.

**The One-Highlight Rule.** A headline may put one phrase of a word or two on the pale-green highlight (leaf-pale, 0.18em radius, kept on one line). Never more than one per headline.

## Layout

- **Width:** content sits in a centred column of 78rem (`site`) with a fluid gutter of 16–40 px (`gutter`) on each side. Running text keeps to 60ch.
- **Rhythm:** the section gap (`section`, 56–112 px) is the only space between a page's sections; sections never add their own outer margin. Inside a section, the heading block and its content sit 48 px apart (gap-12); cards in a grid sit 16 px apart (gap-4).
- **Openings:** Home's hero and every PageHero are two columns from 1024 px (copy at 1fr, photo at 1.04fr, 56 px apart); on a phone the photo follows the words, full width. The header is 64 px tall, 80 px from 1024 px, and scrolls away.
- **Grids:** service cards 4 / 2 / 1 across (desktop / tablet / phone; on a phone each becomes a row with a small square photo beside its words); highlights 4 / 2 / 1; a facts row spreads its figures evenly from 640 px and stacks in one column on a phone; a form sits on the right at 1.2fr beside its sticky heading at 0.8fr.
- **Tracks:** the process steps (280–320 px cards) run to the window's edges and travel sideways while the section is held, from 1024 px; narrower, the row is swiped.
- **Breakpoints:** Tailwind's defaults are the ones in use: 640 (sm), 768 (md), 1024 (lg), 1280 (xl). Phone first: 360, 390, 414 px are checked before anything wider.
- **Direction:** logical properties throughout (`ms`, `pe`, `start`, `end`); directional pictograms mirror in RTL.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (white ground, mist card, white card on mist) and from photographs. Shadows appear only where something floats over the page or over a photo.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 20px 44px -20px rgb(11 36 64 / 0.32)`): the white cards that sit on the hero photo.
- **Raised** (`box-shadow: 0 8px 24px -12px rgb(11 36 64 / 0.28)`): the floating WhatsApp button.
- **Overlay** (`box-shadow: 0 24px 56px -16px rgb(11 36 64 / 0.38)`): a dialog.

### Named Rules
**The Only-What-Floats Rule.** A card in the page's flow has no shadow; mist on white is its edge. A shadow means "this sits over something", and is always navy-tinted and soft, never hard or offset.

## Shapes

Soft and round on the site, firm in the admin.

- **Cards** (28 px, `card`): every mist card, the accent card, the form panel, the hero's fact card, client logo tiles.
- **Photo frames** (24 px, `frame`): every standalone photograph (hero photos, page hero photos, ImageFrame), with a 1 px navy/10 hairline drawn inside the edge so a pale photo still reads as a panel.
- **Nested photos:** a photo or tile inside a card steps its radius down: **inset** (20 px) in a service card, the institutions card and a family service tile, **thumb** (16 px) for a small photo inside one (the hero's card, a family tile's photo). The highlight behind a headline phrase takes **highlight** (0.18em), in proportion to its words.
- **Round** (`pill`, or full circle): pills, the pill label, icon chips, avatars, header links, phone menu rows, the WhatsApp button, the hero's word chips.
- **Admin** (6 px `panel` and `control`, 4 px `tag`): admin panels, boxed fields, admin buttons, notices, checkboxes, skeletons.
- **Avatars** overlap by 12 px, each ringed in 3 px of ground white; a process step's round photo is ringed in 8 px.

## Components

### Pills (the site's actions)
Round, medium-weight words, an optional arrow that steps 4 px forward on hover. They press in to 98% by transform alone; colour changes over 200 ms. Look in `src/components/ui/pill-classes.ts`, kept apart from the components so a page can take the look without the component's JavaScript.
- **Forest** (default): the one main action in a view (WhatsApp in the hero, the form's send, the header's "Request a quote"). Hover forest-2.
- **Pale**: the action beside it (Request a quote beside WhatsApp; WhatsApp and Call in the phone menu). Hover fills forest with white words.
- **On forest**: white with forest words, on the footer or the accent card. **On forest quiet**: white outline and white words beside it.
- **Sizes:** md 44 px tall, 20 px sides, body; lg 52 px (56 px from 640 px), 24–28 px sides, lead from 640 px.
- **Do** keep one forest pill per view and add the arrow only for an action that moves the visitor on. **Don't** restyle a pill in a screen, and don't use the admin's Button on the site.

### Pill label
A 36 px pale-green pill with forest medium words, above a heading: who a section speaks to, or what a page is. It is the reference's own device (D97, D105), not decoration.
- **Do** leave it out where the headline already says the page's name (PageHero does this itself). **Don't** stack two, and don't use it as a tagline or a category tag invented for a section that names no audience or page.

### Icon chips
A thin-line pictogram (24-unit grid, 2 px stroke, round caps) in a circle.
- **Tones:** pale (leaf-pale, forest icon) beside words; forest (white icon) on a card's corner or set in a heading; ground (white, forest icon) on a photo.
- **Sizes:** inline (1.05em, set among the words of a heading or statement), sm 28 px (a tick before a list line), md 44 px, lg 56 px.
- Always decoration, hidden from screen readers; the words beside it carry the meaning.

### Cards
- **Mist card:** mist, 28 px, 20–24 px padding, no shadow, no border. Highlights, features, process steps, family services.
- **Service card:** a mist card holding a photo (4:3 at 20 px, scaling to 104% over 640 ms on hover), the name in title with a forest arrow, the summary in small ink-2. The whole card is the link. On a phone it becomes a row: 96 px square photo beside the words.
- **Accent card:** forest with white words, at most one per group (the green card in the highlights), with a faint thin-line globe low in its corner (on-forest at 25%) behind the faces' pill.
- **Photo card:** a photo filling a 28 px card, its words on a white pill at its foot, or on a navy scrim from the bottom.
- **Floating cards on the hero photo:** white, 28 px or round, Float shadow, at most two, bottom end; word chips at the top start (white at 75%, small medium words, a pale check chip; a check, never a plus).

### Forms (the site's)
- **Panel:** the form sits on a mist card (28 px; 20 / 32 / 40 px padding by width), its heading and words beside it, sticky on a wide screen.
- **Fields, "line" look:** no box, a 1.5 px ink-2 line under the control (2 px and error red when invalid), transparent fill, 48 px tall, 16 px+ text, label above in medium, hint under it in small ink-2, error below with the error pictogram. "(optional)" in ink-2 for what may be left empty.
- **Choices:** 24 px boxes and rounds with a 2 px ink-2 border, filled forest when ticked; each a 44 px tall row.
- **Send:** the forest pill, large, with an arrow, full width on a phone, at the form's end from 640 px. A failed send's reason shows above it; a sent form gives way to a success notice that takes focus.

### Notices
Info and success on mist with a deep-blue icon; error on white with a red border and red icon, announced as an alert. A title in semibold, words in ink-2. Always icon plus words.

### Navigation
- **Header:** ground, not pinned. Logo, then the pages as 44 px round links in ink-2 (navy on hover; the current one navy on mist), then the forest "Download brochure" pill with its download mark (D116), saving the published PDF under the company's name; until a brochure is published, the forest quote pill with an arrow. Below 1024 px a 44 px menu button replaces links and pill.
- **Phone menu:** the browser's modal dialog, full screen, white, with no backdrop tint; it fades in and its rows rise in order (D117). A bar with the logo and close; each page a 64 px round row in display type with a forest arrow, the current one on leaf-pale with forest words; below, WhatsApp and Call as pale pills side by side and the forest quote pill.
- **Floating WhatsApp:** a 56 px deep-blue circle with the chat pictogram, Raised shadow, inside the safe area at the bottom end.

### Footer
Forest with white words. Across its top the running words, the marquee role in uppercase, four copies in a row, in an endless slow loop by CSS alone (D113), with a 44 px round pause button (a checkbox drawn as a pause, then a play) at the top end. Below, the white logo and the company's line in on-forest-2, the admin's link columns under title-size semibold white headings with their links in on-forest-2, and a plain contact column: the phone, the email and the hours, then each social network as its line mark in a 40 px ringed circle beside its name, (D114). No quote pill, and no brochure link: the header offers it (D116). Links show their underline on hover; focus rings turn white. A 20% white hairline above the copyright.

### Signature: the opening
Home's hero: faces between thin round brackets, the hero headline settling with one highlighted phrase, the supporting line, the forest WhatsApp pill with an arrow and the pale quote pill, a mist fact card with an avatar stack and a real fact; beside it a tall photo frame (480–640 px) with word chips and two floating cards. Every other page opens with PageHero, the same thing smaller: a pill label (unless the headline names the page), the headline, the lead, the page's own pills, and a photo frame 544 px tall on a desktop.

### Admin (a separate Operate surface)
The admin shares the tokens, type and pictograms but keeps its own look (plan §30.5): a navy column of links (a plain list since D101, no line or station dots) with sky counts, a white work area, rows ruled by day that open in place on mist, fixed rem sizes (28 px headings at 700), times in tabular figures, 6 px corners and hairlines. Its controls are the **box** look: white, 1.5 px ink-2 border, 6 px radius, 48 px tall, semibold labels, ticks in deep blue. Its actions are `Button` (`src/components/ui/button.tsx`): primary deep blue with white words (hover navy), secondary a 2 px navy outline on white, quiet deep-blue words with no frame; one primary per view. No smooth scroll and no reveals; motion only for state (120–200 ms). The admin never loads the site's motion or pills. Its column (D115): each section with its line mark, in groups ("Inbox", "Website content", "Administration") under body-size bold white headings parted by a 15% white rule; the current row marked by its highlight alone (never bold); the column scrolls on its own (`overscroll-contain`). At its foot the admin's name, Profile and Log out, each with its mark; Log out asks first in a dialog. The sign-in page's navy panel names the panel, says what it is for, lists what it looks after (each in a ringed mark) and ends on the way back to the website. The admin's words are plain and professional ("Action required", "could not be saved", "Data retention"), never chatty.

### Motion (the site's grammar)

One grammar on the public site, from `globals.css` and `src/lib/motion/tokens.ts` (kept equal by a test): GSAP and ScrollTrigger with Lenis on the GSAP ticker, loaded after first paint when the browser is idle; Lenis smooths a wheel only, never touch. Lenis's own CSS sits outside every layer (so `html` grows with the page despite its `h-full`), and Lenis re-measures on every ScrollTrigger refresh: without both, it stops short of the page's end.

- **Letters settling** (CSS only, 1100 ms, ease-out, each letter 12 ms after the one before, from 80 ms): a headline's letters slide in from wide spacing and fade up, once, as the page opens.
- **The statement darkening** (scrubbed to the scroll from 85% to 50% of the viewport): each strong word's navy copy fades in over its quiet-grey self, so every word meets its contrast at every moment.
- **Cards rising in order** (640 ms, ease-out, 24 px rise, 80 ms stagger): a block below the fold when motion loads rises once into place; anything already on screen is left alone.
- **Counters** (1400 ms, ease-out): a whole-number figure counts up once on first view; "24/7" stands as written. Screen readers hear the figure once.
- **Sideways tracks** (scrub 0.4 s, from 1024 px): the process steps travel while their section is held; the families' service row drifts as the section passes.
- **The phone menu opening** (CSS only, D117): the sheet fades in over 200 ms with no backdrop tint, its bar where the header was; its rows, then the actions, rise 1.25 rem into place (640 ms, ease-out, 45 ms apart, from 60 ms); closing fades it out over 200 ms where the browser can keep a closing dialog on top (`overlay`), and it simply closes elsewhere.
- **Running words** (CSS animation, linear, an endless loop of 48 s, `--duration-run`, moving by half a row of four copies; D113): the footer's words; their pause button stops them, and with motion reduced they stand still.
- **State:** press 120 ms, colour and arrow 200 ms, photo hover zoom 640 ms. Eases: out `cubic-bezier(0.16, 1, 0.3, 1)` (expo.out), in-out `cubic-bezier(0.65, 0, 0.35, 1)`.

**The Transform-And-Opacity Rule.** Only transform and opacity move. Never layout properties, filter, box-shadow or large clip-path.

**The Still-Page Rule.** Nothing moves on its own (WCAG 2.2.2): motion follows the scroll or arrives once. The one exception is the footer's running words (D113), an endless slow loop with its own pause button, still with motion reduced. Content is visible by default; a reveal only hides what is still below the fold, and only with opacity. The one loop is a loading skeleton's slow fade (1.6 s).

**The Reduced-Motion Path.** With reduced motion the engine never loads: no Lenis, no reveals, no scrub, no counting; settling letters, running words and the phone menu's motion are off in CSS (the running words' pause button is hidden then); every animation and transition is cut to 0.01 ms. Tracks become plain sideways-scrolling rows.

## Do's and Don'ts

### Do:
- **Do** take every colour, size, radius, shadow, duration and ease from the tokens; Tailwind's own sets are removed so nothing else compiles.
- **Do** keep white text to deep blue, navy and forest, navy text on sky and leaf, and the quiet grey to the statement role and larger.
- **Do** use one forest pill per view for the main action, the pale pill beside it, and the arrow only for an action that moves the visitor on.
- **Do** put photographs in 24 px frames and cards at 28 px; nest a photo in a card at a smaller radius.
- **Do** give every interactive thing a 44 px target, every input 16 px text and a 48 px height, and keep the 3 px focus ring (deep blue, 3 px offset; white on deep, navy or forest).
- **Do** use licensed stock with its provenance recorded in `src/db/seed/photos/README.md`, and show only real facts in counters and fact cards (D7, D99).
- **Do** run axe at phone and desktop on every page, and test every new colour pairing in `tests/contract/tokens.test.ts`.
- **Do** keep each public route within 174,080 bytes of gzip JavaScript at first paint (Home and Contact: 172,042 at Phase 6B's end). Client JavaScript is the scarcest resource: prefer CSS (as the settling letters, running words and phone menu do) and server components; keep looks that a server page needs out of client components (as `pill-classes.ts` does).

### Don't:
- **Don't** use a colour outside the logo's, a dark theme, or the error red for anything that is not an error.
- **Don't** set a headline heavier than 400 to make it louder, or highlight more than one phrase in it.
- **Don't** put a shadow on a card in the page's flow, or use a hard or offset shadow anywhere.
- **Don't** pin the header, bring back the wayfinding line or station dots, or add anything that moves on its own.
- **Don't** caption a stock photograph as Al Hidaya staff, or show statistics, testimonials, ratings, awards or licence numbers the client has not supplied.
- **Don't** use cartoons, mascots, clip-art, emoji or playful decoration; pictograms are thin-line, in chips or beside words.
- **Don't** use the admin's Button or boxed fields on the public site, or the site's pills, motion or line fields in the admin.
- **Don't** add design controls (colour, font, size, spacing, layout, animation) to the admin (D12).
