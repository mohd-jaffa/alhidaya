---
name: Al Hidaya Health Care Service
description: The current site's simple structure, cleaner — deep blue leading, leaf-green accents, soft white, and motion that arrives as you read.
colors:
  deep: "#0f64ac"
  sky: "#33a0da"
  leaf: "#86ae3c"
  leaf-2: "#7a9f37"
  on-leaf: "#0b2440"
  on-leaf-2: "#1d393f"
  forest: "#5b7628"
  leaf-pale: "#eef5e2"
  on-deep: "#ffffff"
  on-deep-2: "#dce9f6"
  navy: "#0b2440"
  ink-2: "#3a5272"
  ink-soft: "#7d8aa0"
  ground: "#ffffff"
  page: "#f7f9fc"
  card: "#fcfdfe"
  mist: "#f1f6fb"
  rule: "#d5e1ed"
  focus: "#0f64ac"
  focus-on-deep: "#ffffff"
  focus-on-leaf: "#0b2440"
  error: "#b42318"
typography:
  hero:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 1.55rem + 3vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.6vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  section:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
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
  button: "12px"
  card: "28px"
  frame: "24px"
  inset: "20px"
  pill: "999px"
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
  button-deep:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  button-deep-hover:
    backgroundColor: "{colors.navy}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.deep}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "44px"
  button-line-hover:
    backgroundColor: "{colors.mist}"
  nav-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "6px"
  nav-link-current:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  slide-controls:
    backgroundColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    padding: "6px"
  service-card:
    backgroundColor: "{colors.leaf-pale}"
    rounded: "{rounded.card}"
    size: "296px x 395px"
  service-card-label:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    rounded: "{rounded.inset}"
    padding: "14px"
  services-band:
    backgroundColor: "{colors.mist}"
  quote-band:
    backgroundColor: "{colors.leaf-pale}"
  quote-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
  quote-card-strip:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
  field-box:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  footer:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink-2}"
  admin-button-primary:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  admin-column:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.on-deep}"
---

# Design System: Al Hidaya Health Care Service

<!-- Written from the built world when Home became Theme 6 (Phase 6C, R6C.1, 2026-10-31). Source of truth: src/app/globals.css, src/lib/motion/tokens.ts, src/components/{ui,sections,site,motion}. Where this file and the code disagree, the code was right on the day this was written; fix the file. Updated when the other pages joined Theme 6 (R6C.2, D135, 2026-11-01): Contact's and Careers' openings, a job's page and Apply keep Phase 6B's look, as the user chose. -->

## Overview

**Creative North Star: "The Old Site, Made Clear"**

The client wanted the structure they already knew (the current alhidaya.qa: a hero, About, What we do, Our clients, a quote form, a four-column footer) without it feeling like the same site. Shown five themes, they chose a mix, Theme 6 (plan D132): Theme 2's header and services cards, Theme 4's straight-lined hero and quote card, Theme 5's About and footer. It is a **Persuade** page on soft white, never a pure white (the client's words): deep blue leads every action, the logo's leaf green is the accent, photographs carry the care, and motion arrives as you read: slides wipe in, headings' words rise from behind their line, blocks rise as they scroll in, the clients' logos run in two rows.

Density stays low: one idea per section, the old site's order, generous section gaps; bands of mist and pale green mark What we do and the quote. The admin panel is a separate **Operate** surface and keeps its own look entirely (the user: "no changes needed in the admin panel or its designs").

**Key Characteristics:**
- Soft white page (`page`), cards a touch lighter (`card`), mist and pale-leaf bands.
- Deep blue for the main button, links and the highlighted phrase in a heading; leaf green for small marks (checks, the WhatsApp chip, the mark under a heading).
- Buttons with 12 px corners; the header's links in a floating round pill.
- One family, Inter Tight, semibold for headings and titles, regular for reading.
- Two things move on their own: Home's slides (with a pause) and the clients' rows (stopped by the pointer, focus or a chosen logo).

## Colors

The logo's colours on soft white; one red for errors and nothing else.

### Primary
- **Deep Blue** (deep): the logo's blue and the site's action colour (D132): the main button, the current page in the header's pill, the slides' Next arrow and bars, the services' arrows and card marks, links ("Read more about us", "All services"), the highlighted phrase in a heading, the quote card's strip, the floating WhatsApp button; the admin's column and actions (D123). Carries white text.
- **Leaf** (leaf): the logo's green, now the accent: the WhatsApp chip beside the quote, the card on the hero photo's icon chip, the green half of the short mark under a heading. Carries navy only.
- **Forest** (forest): the leaf deepened for words and marks on light grounds: the checks in About's points, "For families" on a service card.
- **Leaf Pale** (leaf-pale): the quote's band, a photo's fill before it arrives.

### Secondary
- **Sky Blue** (sky): text selection; the admin's counts. Navy text only.

### Neutral
- **Page** (page, #f7f9fc): the public site's ground, soft white (D132). The site sets it as its `ground`, so every `bg-ground` on the public site is soft white; the admin keeps white.
- **Card** (card, #fcfdfe): what is raised a touch above the page: the header's pill, the services' labels, the quote card, the card on the hero photo.
- **Mist** (mist): the services' band, the slides' controls, a photo placeholder.
- **Navy Ink** (navy): headings and primary text. **Ink Two** (ink-2): supporting lines, the footer's text, hints, field borders.
- **Rule** (rule): the hero's top edge, the footer's rules, About's ruled points, the outlined round buttons' rings.

### Error
- **Error Red** (error): field errors and error notices, always with the error pictogram and words; and the admin's Delete (D126).

### Named Rules
**The Never-Pure-White Rule.** On the public site, white is soft white: the page is `page`, a raised surface `card`. Pure white appears only as words on deep blue or navy.

**The Blue-Leads Rule.** One main action per view, deep blue with white words; green never carries an action on the site, only a mark.

**The White-Only-On-Dark Rule.** White text sits only on deep blue, navy or error red; sky and leaf carry navy. tests/contract/tokens.test.ts holds every pairing to 4.5:1, the soft whites included.

**The Logo-Only Rule.** No colour outside the tokens (D35), light theme only (D28); Tailwind's palette is removed so nothing else compiles.

## Typography

**Font:** Inter Tight throughout (self-hosted, variable, metric-matched fallback; the client may choose another later).

### Hierarchy
- **Hero** (600, clamp 42–60 px, -0.02em): each slide's headline, the one h1 shown at a time (max 16ch), its phrase in deep blue; every other page's sign keeps Phase 6B's settling letters until R6C.2.
- **Display** (600, clamp 32–52 px): a section's heading: About's (500, larger in feel, beside its words), What we do, Our clients (centred), the quote's.
- **Title** (600, 21 px): the quote card's strip, a way to reach us.
- **Lead** (400, 21 px, ink-2 or navy): a slide's words, About's first paragraph (navy), a section's words.
- **Body** (17 px, 1.6) and **Small** (14 px): running text; a card's audience, the count beside the slides.

### Named Rules
**The Phrase-In-Blue Rule.** A heading may set one phrase in deep blue (the admin's highlighted words), in the same weight and flow as the rest; never a second phrase, never a background.

## Layout

- **Width:** a centred 78rem column with a 16–40 px gutter; the hero's photo, the services' row and the clients' rows reach the window's edge.
- **Rhythm:** one section gap between sections; What we do and the quote are bands edge to edge with the section gap as their padding. Home starts at the hero (no top padding) and ends on the quote's band (no bottom padding).
- **Header:** a three-part grid from 1024 px: the logo, the pill of pages centred, the brochure button; below it the menu button. 64 px tall, 80 px from 1024 px.
- **Hero:** two columns from 1024 px (words 1fr, photo 1.08fr) in straight lines (a rule above, the photo edge to edge, no rounding); the words start on the site column's edge; on a phone the photo comes first, 352–480 px tall.
- **About:** heading 0.85fr beside its words 1.15fr, 80 px apart.
- **Services:** the opening and two arrows over a row of 296 px cards that scrolls sideways, snapping card by card, starting on the site column's edge.
- **Quote:** words 0.9fr beside the card 1.1fr.
- **Footer:** the logo and description, the admin's columns, the contact column; four across from 1024 px.
- **Breakpoints:** 640, 768, 1024, 1280; phone first (360, 390, 414). Logical properties throughout; arrows mirror right to left.

## Elevation & Depth

- **Raised** (`0 8px 24px -12px` navy 28%): the header's pill, the main button, a service card, the WhatsApp button.
- **Float** (`0 20px 44px -20px` navy 32%): the card on the hero photo.
- **Overlay** (`0 24px 56px -16px` navy 38%): the quote card, a dialog.
Soft and navy-tinted always; never hard or offset.

## Shapes

- **Buttons** 12 px (`button`). **Cards** 28 px (service cards, the quote card). **Inset** 20 px (a service card's label). **Round**: the header's pill and its links, the slides' controls and arrows, icon chips, the WhatsApp button.
- **Straight lines**: the hero (D132): no rounded frame, its photo edge to edge.
- **Admin**: 6 px panels and controls, 4 px tags.

## Components

### Buttons (the site's actions)
`src/components/ui/pill-classes.ts` (the name kept from Phase 6B). **Deep** (default): deep blue, white semibold words, Raised, hover navy; an arrow that steps forward. **Line**: deep words in a 1.5 px deep ring, hover mist. md 44 px, lg 52–56 px. They press to 98%. **On leaf** variants remain for Phase 6B's green cards on the other pages until R6C.2.

### Header (D132, from Theme 2)
Soft white, sticky: it slides away (transform) as the page goes down past 160 px and returns as soon as it goes up, and stays while focus is inside it. The logo; the admin's pages in a floating pill (card, Raised, 6 px inside), each a 40 px round link, the current one deep blue with white words, hover mist; as a page opens, the deep pill slides from the last page's link to the new one's (D134); the brochure button (deep, its download mark) or, with no brochure, Request a quote. Home is first in the menu (the admin edits the menu).

### The slides (D128, Home's hero)
Up to eight admin slides. Left: the headline (hero, h1, its phrase in deep blue), the words (lead, ink-2), an optional deep button. Under them the controls in a mist pill: Previous (card, rule ring) and Next (deep) 44 px circles, a bar per slide (24 px, the current 48 px, its deep fill running for six seconds), the count "01 / 05" in tabular figures, and a smaller pause (36 px to the eye, a 44 px target). Right: the photo edge to edge; the card on the photo at its foot (card, Float, an icon chip in leaf and the note in semibold). The controls stay in one place whatever the words (all slides share one grid cell). One slide: no controls.

### About (D129, from Theme 5)
`INTRO`: the heading (display, 500) with its phrase in deep blue, flowing on one line; a photo under it when the admin gives one. Beside it the first paragraph as the lead (navy), the rest in ink-2, then the points: a ruled list (rule above and between), each a forest check, its title in semibold and its line in ink-2; on Home, "Read more about us" in deep, underlined by a 2 px line, with an arrow.

### What we do (D131, from Theme 2 in straight lines)
A mist band edge to edge. The heading and words on the left; two 44 px arrows on the right (Earlier: card with a rule ring; More: deep), resting at the row's ends; hidden on a phone, which swipes. Each service a 296 × 395 px rounded card (28 px, Raised): its photo filling it (zooming to 106% under the pointer), a card-coloured label at its foot (20 px corners) with the audience in small semibold (forest for families, deep for institutions), the name in semibold navy, and a 36 px deep arrow circle. "All services" centred under the row as a plain link, like "Read more about us".

### Our clients (D133, as nahrdev.com)
The heading centred with a short mark beneath (deep 55%, leaf 45%). Two rows of logos (144 × 80 px, 192 × 96 px from 640 px) run in opposite directions across the window, faded at both edges by a mask; each logo greyed and faded (`grayscale`, 45% opacity, multiplied into the page) until the pointer is on it, it has focus or it is chosen: then its colours, 115% scale, and its row stops. A click or tap chooses a logo until it is clicked again or the visitor clicks elsewhere; a logo with a site opens it in a new tab instead. Each row repeats its logos until half of it is ten wide, moving by half its width (4 s a logo); only the first copy is read and reached by the keyboard.

### The short quote (D130, from Theme 4)
A pale-green band. Left: the heading, its words, and the ways to reach us from Settings, each a 44 px chip (WhatsApp in leaf; call and email white with deep marks) beside a small label and the number or address in title semibold. Right: the card (card, 28 px, Overlay) under a deep strip ("Request a quote", "We reply quickly"), holding the short form two fields to a row from 640 px, the message across.

### An inner page's opening (D135)
About, Services, a service, the quote page, Privacy, Terms and the missing page open like Home's slide, still: under a rule, the page's name (semibold, deep; left out when the headline says it), the headline (hero, 600, navy, its phrase in deep, its words rising as a slide's do), the line (lead, ink-2) and the actions; the photo edge to edge on the right (52% of a wide window, 34 rem tall at least; first on a phone), settling from 106%. Without a photo the words stand alone at the site's width. Contact, Careers, a job's page and Apply keep the rounded photo and the pale-green highlight (D109).

### Bands (D135)
A section may lie on a band edge to edge: the mist band (What we do, About's mission and vision, Contact's ways to reach us) or the pale-green band (the short quote, Talk to us, Contact's form, Careers' open jobs, whose jobs turn to white cards with a pale chip); Careers' Before you apply lies on the mist band too. Two bands in a row meet; a page ending on one meets the footer.

### Talk to us, mission and vision, values (D135)
Talk to us: on the pale-green band, the heading (display, 600) and words beside the ways to reach us as on the short quote. Mission and vision: two white cards (28 px, Raised) on the mist band, each its icon in a 44 px deep-blue chip beside its title (title, 600), the statement in lead ink-2. Values: the heading (display, 500) beside a ruled list, each value a forest check, its title semibold and its line in ink-2, as About's points.

### Services as cards (D135)
The Services page and a service's other services show What we do's rounded card in a grid: four across from 1024 px, two from 640 px, one on a phone (4:3 there, 3:4 above). Each audience under its name (title, 600) with its actions.

### Contact (D135)
Its ways to reach us on the mist band as white cards, each icon in a pale chip, with the map; its form on the pale-green band, on the short quote's card under a deep strip ("Your message", "We reply quickly").

### Forms (the site's)
Boxed now (D130): white, 1.5 px ink-2 border, 6 px corners, 48 px tall, 16 px text, the label above in medium, hint under it, the error below with its pictogram. The consent's privacy link in deep. The send action the large deep button with an arrow, full width on a phone.

### Footer (D132, from Theme 5)
Soft white under a rule: the logo in its colours and the company's line; the admin's link columns under semibold navy headings, links in ink-2 underlining on hover; a contact column (phone, email, hours, each beside its deep mark) and each social network in a 40 px mist circle; a rule above the copyright with the registered name (D121). No running words (removed with their setting).

### Floating WhatsApp
A 56 px deep-blue circle with the chat mark, Raised, at the bottom end inside the safe area.

### Admin (a separate Operate surface)
The admin shares the tokens, type and pictograms but keeps its own look (plan §30.5): a column of links in the logo's deep blue (D123; a plain list since D101, no line or station dots) with sky counts, a white work area, rows ruled by day that open in place on mist, fixed rem sizes (28 px headings at 700), times in tabular figures, 6 px corners and hairlines. Its controls are the **box** look: white, 1.5 px ink-2 border, 6 px radius, 48 px tall, semibold labels, ticks in deep blue. What turns something on or off is a **switch** (D134, `src/components/ui/switch.tsx`): its words, then a 48 × 28 px pill (ink-2 ring and knob when off; deep blue with a white knob slid to the end when on) and a small semibold "Enabled" (deep) or "Disabled" (ink-2) beside it. Its actions are `Button` (`src/components/ui/button.tsx`): primary deep blue with white words (hover navy), secondary a 2 px navy outline on white, quiet deep-blue words with no frame, danger white on the error red (deleting an image, D126); one primary per view. No smooth scroll and no reveals; motion only for state (120–200 ms). The admin never loads the site's motion or pills. Its column (D115): each section with its line mark, in groups ("Inbox", "Website content", "Administration") under body-size bold white headings parted by a 15% white rule; the current row marked by its highlight alone (never bold); the column scrolls on its own (`overscroll-contain`). At its foot the admin's name, Profile and Log out, each with its mark; Log out asks first in a dialog. The sign-in page's deep-blue panel names the panel, says what it is for, lists what it looks after (each in a ringed mark) and ends on the way back to the website. The admin's words are plain and professional ("Action required", "could not be saved", "Data retention"), never chatty.

### Motion (Theme 6's grammar)

GSAP and ScrollTrigger with Lenis on the GSAP ticker, loaded after first paint; Lenis smooths a wheel only. CSS draws everything it can, so motion costs little script.

- **Slides** (CSS, D128): each moves on when its bar has filled (6 s, linear, `--duration-slide`); the new photo wipes in from the end side over the last (clip-path, 1.3 s, ease-out) and settles from 106% to 100% over the six seconds; the first photo, the page's first paint, only settles. The headline's words rise from behind their line (1 s, ease-out, 60 ms apart, from 120 ms), then the words and button rise in (640 ms, from 450 ms). The pause stops the bar and the photo together.
- **Headings rising** (GSAP, D129): a heading's words rise from behind their line (110% to 0, 640 ms, ease-out, 55 ms apart, `wordStagger`) the first time it scrolls into view; one already on screen is left alone.
- **Blocks rising** (GSAP, D125): blocks rise 24 px and fade in once as they scroll into view, 80 ms apart in a group.
- **Clients' rows** (CSS, D133): endless, linear, the second row reversed; stopped under the pointer, on focus and on a chosen logo.
- **Header** (CSS transition, 640 ms ease-out): away going down, back going up.
- **An inner page's opening** (CSS, D135): its photo settles from 106% over six seconds; its headline's words rise as a slide's do, then its line and actions rise in.
- **The menu's pill** (CSS transition, 640 ms ease-out, D134): set back where the last page's link was, at its width, then let go; the words cross to white as it arrives.
- **State:** press 120 ms, colour 200 ms, a card photo's zoom 1 s; a service arrow and a link's arrow step forward under the pointer.

**The Transform-And-Opacity Rule.** Movement is transform and opacity; the slides' wipe is the one clip-path, on a single photo at a time.

**The Still-Page Rule.** Nothing else moves on its own (WCAG 2.2.2). The slides have a pause; the clients' rows stop under the pointer, on focus and on a chosen logo (the user chose no pause button for them; recorded in D133).

**The Reduced-Motion Path.** With reduced motion the engine never loads: no Lenis, no reveals, no word rising; the slides stay until moved and their pause is hidden; the clients' rows stand still, their repeats gone, wrapped in rows; the header simply appears and disappears; the menu's pill is simply on the new page; an inner page's opening is simply there.

## Do's and Don'ts

### Do:
- **Do** take every colour, size, radius, shadow, duration and ease from the tokens.
- **Do** keep the public site on soft white; raise a surface with `card`, never a pure white.
- **Do** use one deep button per view, the line button beside it, the arrow only for an action that moves the visitor on.
- **Do** give every interactive thing a 44 px target and keep the 3 px focus ring.
- **Do** show only real facts and licensed or the client's own photographs (D7).
- **Do** keep each public route within 174,080 bytes of gzip JavaScript at first paint; prefer CSS and server components (the slides' words and photos are drawn on the server; only their state is in the browser).

### Don't:
- **Don't** use a colour outside the logo's, a dark theme, or green for an action.
- **Don't** round the hero, or bring back the running words, the statement, the highlights or the audience sections.
- **Don't** add anything else that moves on its own.
- **Don't** caption stock as Al Hidaya's staff, or invent statistics, testimonials or licences.
- **Don't** change the admin's look, or add design controls to it (D12).
