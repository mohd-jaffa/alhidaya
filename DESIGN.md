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
  whatsapp: "#25d366"
typography:
  hero:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 1.55rem + 3vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  service-hero:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 1rem + 5vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  display:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.6vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  value-title:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.2rem + 1vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.015em"
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
  service-arch: "180px"
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
  service-portrait: "clamp(22rem, 18rem + 15vw, 37.5rem)"
  touch: "44px"
  slide-copy: "352px"
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
    height: "44px"
  slide-progress:
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
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-deep}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  admin-column:
    backgroundColor: "{colors.leaf-pale}"
    textColor: "{colors.navy}"
---

# Design System: Al Hidaya Health Care Service

<!-- Written from the built world when Home became Theme 6 (Phase 6C, R6C.1, 2026-10-31). Source of truth: src/app/globals.css, src/lib/motion/tokens.ts, src/components/{ui,sections,site,motion}. Where this file and the code disagree, the code was right on the day this was written; fix the file. Updated when the other pages joined Theme 6 (R6C.2, D135, 2026-11-01): Contact's and Careers' openings, a job's page and Apply keep Phase 6B's look, as the user chose. -->

## Overview

**Creative North Star: "The Old Site, Made Clear"**

The client wanted the structure they already knew (the current alhidaya.qa: a hero, About, What we do, Our clients, a quote form, a four-column footer) without it feeling like the same site. Shown five themes, they chose a mix, Theme 6 (plan D132): Theme 2's header and services cards, Theme 4's straight-lined hero and quote card, Theme 5's About and footer. It is a **Persuade** page on soft white, never a pure white (the client's words): deep blue leads every action, the logo's leaf green is the accent, photographs carry the care, and motion arrives as you read: slides wipe in, headings' words rise from behind their line, blocks rise as they scroll in, the clients' logos run in two rows.

Density stays low: one idea per section, the old site's order, generous section gaps; bands of mist and pale green mark What we do and the quote. The admin panel is a separate **Operate** surface and keeps its own look entirely (the user: "no changes needed in the admin panel or its designs"). Two small additions were asked for later (2026-11-14): the column header names the build's version beside "Admin panel" (D203), and a pending button shows a spinner (D204).

**Key Characteristics:**
- Soft white page (`page`), cards a touch lighter (`card`), mist and pale-leaf bands.
- Deep blue for the main button, links and the highlighted phrase in a heading; leaf green for small marks (checks, the WhatsApp chip, the mark under a heading).
- Buttons with 12 px corners; the header's links in a floating round pill.
- One family, Inter Tight, semibold for headings and titles, regular for reading.
- Automatic motion is limited to Home’s hero/services, Contact’s typewriter and the clients’ rows, with their recorded stop conditions and reduced-motion paths.

Opening headline and lead widths use font-size-based measures (`hero`, `split`, `hero-lede`, `page-lede`) matching Inter Tight’s loaded widths, so the text container does not resize when the font arrives. Reading text retains its character-based measure. On desktop, Home reserves a minimum 22 rem for the slides’ shared copy area before the font loads; longer copy can grow beyond it. This prevents hidden slides’ font wrapping from shifting the current slide and progress.

## Colors

The logo's colours on soft white; one red for errors. D154 explicitly adds WhatsApp green only for the floating brand shortcut.

### Primary
- **Deep Blue** (deep): the logo's blue and the site's action colour (D132): the main button, the current page in the header's pill, the slides' progress bars, the services' arrows and card marks, links ("Read more about us", "All services"), the highlighted phrase in a heading; the New status in the admin (D138; other admin actions use forest). Carries white text.
- **Leaf** (leaf): the logo's green, now the accent: the WhatsApp chip beside the quote, the card on the hero photo's icon chip, the green half of the short mark under a heading. Carries navy only.
- **Forest** (forest): the leaf deepened for words and marks on light grounds: the checks in About's points, "For families" on a service card; the admin's action, link, focus and enabled-switch roles (D138), carrying white words on a fill.
- **Leaf Pale** (leaf-pale): the quote's band, a photo's fill before it arrives.

### Secondary
- **Sky Blue** (sky): text selection; the admin's counts. Navy text only.

### Neutral
- **Page** (page, #f7f9fc): the public site's ground, soft white (D132). The site sets it as its `ground`, so every `bg-ground` on the public site is soft white; the admin keeps white.
- **Card** (card, #fcfdfe): what is raised a touch above the page: the header's pill, the services' labels, the quote card, the card on the hero photo.
- **Mist** (mist): the services' band, the slides' progress, a photo placeholder.
- **Navy Ink** (navy): headings and primary text. **Ink Two** (ink-2): supporting lines, the footer's text, hints, field borders.
- **Rule** (rule): the hero's top edge, the footer's rules, About's ruled points, the outlined round buttons' rings.

### Error
- **Error Red** (error): field errors and error notices, always with the error pictogram and words; and the admin's Delete (D126).

### Named Rules
**The Never-Pure-White Rule.** On the public site, white is soft white: the page is `page`, a raised surface `card`. The user’s Contact exception (D145) sets its opening and form controls to pure `ground` white; other surfaces retain the existing palette.

**The Blue-Leads Rule.** One main action per view, deep blue with white words; green never carries an action on the site, only a mark.

**The White-Only-On-Dark Rule.** White text sits only on deep blue, navy or error red; sky and leaf carry navy. tests/contract/tokens.test.ts holds every pairing to 4.5:1, the soft whites included.

**The Logo-Only Rule.** No colour outside the tokens (D35), light theme only (D28); Tailwind's palette is removed so nothing else compiles.

## Typography

**Font:** Inter Tight throughout (self-hosted, variable, metric-matched fallback; the client may choose another later).

### Hierarchy
- **Hero** (600, clamp 42–60 px, -0.02em): each slide's headline, the one h1 shown at a time (max 16ch), its phrase in deep blue; every other page's sign keeps Phase 6B's settling letters until R6C.2.
- **Display** (600, clamp 32–52 px): a section's heading: About's (500, larger in feel, beside its words), What we do, Our clients (centred), the quote's.
- **Title** (600, 21 px): a service title, a way to reach us.
- **Lead** (400, 21 px, ink-2 or navy): a slide's words, About's first paragraph (navy), a section's words.
- **Body** (17 px, 1.6) and **Small** (14 px): running text; a card's audience, the count beside the slides.

### Named Rules
**The Phrase-In-Blue Rule.** A heading may set one phrase in deep blue (the admin's highlighted words), in the same weight and flow as the rest; never a second phrase, never a background. On the D158 dimmed photo openings, the phrase takes a light tint of sky for contrast.

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
Soft white, in normal document flow (D162): it scrolls away with the page and never returns on upward scrolling farther down. The logo; the admin's pages in a floating pill (card, Raised, 6 px inside), each a 44 px round link, the current one deep blue with white words, hover mist; as a page opens, the deep pill slides from the last page's link to the new one's (D134); the brochure button (deep, its download mark) or, with no brochure, Request a quote. Home is first in the menu (the admin edits the menu). When editable navigation exceeds five visible links or 42 label characters in total, the same full-screen menu is available at desktop widths too; every saved link and the header action remain reachable there (D142, agent default).

### The phone menu (D167)
Below 1024 px the menu button opens a full-screen sheet in deep blue (the logo's), the white logo and a 44 px close disc (white at 15%) on top. The pages: display-size words (28 – 42 px by the screen's height, 500, the current 600) in white, each row 48 – 76 px tall under a 1 px white rule at 20%, a 40 px arrow at its end (white at 60%; the current page's a leaf disc with a navy arrow). Under them two tiles, 28 px corners: WhatsApp on the leaf (a faint navy disc with the WhatsApp mark, "WhatsApp us" and the number in navy) and Call on the card (a mist disc, deep phone, "Call us" and the number in navy and ink-2); each number on one line at 320 – 414 px. Then the brochure (the quote until there is one) on a white button (card, deep words, Raised). A white mark at 7% sits low at the end edge as a watermark. No email, no hours, no "24/7". The sheet scrolls when a short screen needs it.

### The slides (D128, D136, Home's hero)
Up to eight admin slides. Left: the headline (hero, h1, its phrase in deep blue), the words (lead, ink-2), an optional deep button. Under them, progress bars in a compact mist pill, on phones too: fixed-width rails, the current one full width and the others scaled to 55%; only the inner fill runs for six seconds. No Previous, Next, Pause or slide count, as the client requested (D136). The progress is decorative, not another control. Right: the photo edge to edge; the card on the photo at its foot (card, Float, an icon chip in leaf and the note in semibold), kept within the photo's inline edges even with a longer note. The progress stays in one place whatever the words (all slides share one grid cell). One slide: no progress or extra keyboard stop. Only the current photo is exposed to a screen reader. The hero can receive keyboard focus, with a screen-reader hint; deliberate keyboard focus pauses the drift and fill. Hovering or clicking never stops the clock (the sticking fix, D136). With reduced motion the first slide stays still.

### About (D129, from Theme 5)
`INTRO`: the heading (display, 500) with its phrase in deep blue, flowing on one line; a photo under it when the admin gives one. Beside it the first paragraph as the lead (navy), the rest in ink-2, then the points: a ruled list (rule above and between), each a forest check, its title in semibold and its line in ink-2; on Home, "Read more about us" in deep, underlined by a 2 px line, with an arrow.

### What we do (D131, from Theme 2 in straight lines)
Home uses the approved pyramid (D143): the centre service is full-size and crisp, its neighbours step down by 30 px at 88% and 76% scale. All cards retain their audience, title and linked arrow panel; only rear photos soften to 72% and 56% opacity. The existing two 44 px arrows wrap through the published services on phone and desktop; a swipe moves one position. It advances every six seconds, sharing the hero duration, with no pause button. Hidden/offscreen pages and deliberate keyboard focus stop the clock; reduced motion keeps manual navigation without transitions. The motion controller loads after paint; a native row retains every link if enhancement fails. This applies only to Home; Services and detail-page grids retain their existing layout.

The unenhanced row and any non-Home use remain on a mist band edge to edge. The heading and words on the left; two 44 px arrows on the right (Earlier: card with a rule ring; More: deep), resting at the row's ends; hidden on a phone, which swipes. Each service a 296 × 395 px rounded card (28 px, Raised): its photo filling it (zooming to 106% under the pointer), a card-coloured label at its foot (20 px corners) with the audience in small semibold (forest for families, deep for institutions), the name in semibold navy, and a 36 px deep arrow circle. "All services" centred under the row as a plain link, like "Read more about us".

### Our clients (D133, as nahrdev.com)
The heading centred with a short mark beneath (deep 55%, leaf 45%). Two rows of logos (144 × 80 px, 192 × 96 px from 640 px) run in opposite directions across the window, faded at both edges by a mask; each logo greyed and faded (`grayscale`, 45% opacity, multiplied into the page) until the pointer is on it, it has focus or it is chosen: then its colours, 115% scale, and its row stops. A click or tap chooses a logo until it is clicked again or the visitor clicks elsewhere; a logo with a site opens it in a new tab instead. Each row repeats its logos until half of it is ten wide, moving by half its width (4 s a logo); only the first copy is read and reached by the keyboard.

### The short quote (D151, supplied reference)
An inset rounded pastel-blue panel. Left: navy heading/supporting words and three tinted contact tiles with rounded-square marks, labels and published number/email. Right: a plain white 28 px rounded form card with the float shadow and no title strip. Name/mobile and email/service share rows from 640 px; message spans the card and uses guidance as its placeholder. Existing consent, security and send behavior remain.

### An inner page's opening (D135)
About, Services, a service, the quote page, Privacy, Terms and the missing page open like Home's slide, still: under a rule, the page's name (semibold, deep; left out when the headline says it), the headline (hero, 600, navy, its phrase in deep, its words rising as a slide's do), the line (lead, ink-2) and the actions; the photo edge to edge on the right (52% of a wide window, 34 rem tall at least; first on a phone), settling from 106%. Without a photo the words stand alone at the site's width. Careers, a job's page and Apply keep the rounded photo and the pale-green highlight (D109). Contact follows D145/D147; service detail openings follow D146.

### Bands (D135)
A section may lie on a band edge to edge: the mist band (What we do, About's mission and vision, Contact's ways to reach us) or the pale-green band (Talk to us except Services’ pastel-blue variant, Contact's message section, Careers' open jobs, whose jobs turn to white cards with a pale chip); Home’s inset quote panel is pastel blue (D151); Careers' Before you apply lies on the mist band too. Two bands in a row meet; a page ending on one meets the footer.

### Talk to us, mission and vision, values (D135)
Talk to us: on the pale-green band, the heading (display, 600) and words beside the ways to reach us as on the short quote. Mission and vision (D137): distinct paired panels on the mist band, Mission deep blue with white words and Vision pale green with navy words; 28 px corners, 28–48 px padding, display headings and lead statements. The medical cross’s four logo-colour arms assemble, while the globe’s circle, meridian and latitude unfold; a quiet rule opens beside the art, then each masked heading and statement arrives. A single scoped GSAP timeline per panel uses the existing reveal duration, ease and stagger, transform and opacity only; no loop. The statements are unchanged. Reduced motion shows the finished composition without loading the engine. Values: the heading (display, 500) beside a ruled list, each value a forest check, its title semibold and its line in ink-2, as About's points.

### A service’s editorial opening (D146)
The approved second concept, Care editorial: large deep-blue title (42–96 px), published summary, tall portrait with 180 px top corners and the existing bottom card corners. On phones the title precedes the portrait. The heading’s words rise once; the photograph settles using the existing opening grammar. Missing photos leave a text-only opening.

Up to two published label/destination buttons may appear under the summary: primary deep blue, secondary line; none by default, including legacy records. The admin adds, reorders, edits or removes them through the existing draft/preview/publish workflow. Safe internal or HTTPS destinations only. This is content control, not design control.

About the service retains the description and any confirmed inclusions on a pastel-blue band, with a heading beside its text. Who it is for and the 24/7 panel are omitted; stored legacy audience/forWhom content remains compatible. Other services follows concept two: a pale-green band, three random distinct related services, as compact horizontal thumbnail/title links (three across on desktop); fewer only when fewer than three other services are published overall (D155), and All services; Home’s large portrait cards and duplicate audience actions are not used here. Navigation, footer and the Services listing retain their existing components. Scroll reveals remain one-time and reduced motion stays still.

### Services as cards (D135)
The Services listing’s All services section uses one pale-green band with compact thumbnail/title cards: three across from 1024 px, two from 640 px and one on a phone, in published admin order. Audience headings and actions are omitted here (D150). The page’s Talk to us band is pastel blue; other sections remain.

### Contact (D145, D147)
The approved fifth concept, Blue ribbon, with the user’s colours: white opening, pastel-blue (`mist`) Reach us ribbon, pastel-green (`leaf-pale`) message band. The existing navigation and footer stay unchanged. The headline leads the white opening, with its published supporting line beside it on desktop; the old hero photograph and duplicate opening actions are not displayed, while stored content is retained. Three contact channels span the ribbon; hours sit beside its heading and a published brochure remains available.

D152 replaces the former overlapping message panel. The inset rounded pastel-green message section puts its heading, published map, Visit our office, address and directions in the left column. A plain white rounded form card with the float shadow sits at the right; content then form stack on phones. Existing name/phone inputs align in a row from 640 px; phone guidance is a placeholder and labels remain visible. Email and message span the card. Consent, bot check, pending/error/success states and submission behavior are unchanged. Reach us stays as designed, with no overlap. Section ordering remains admin-controlled.

The opening loops through typing the complete headline, a reading hold, deletion from the end, then retyping (D147). Native opacity animations reserve the full text’s geometry; one static accessible copy avoids repeated screen-reader announcements. Six-second timing is an agent default for review. The existing deferred motion path owns observers and cleanup: offscreen/hidden pauses; navigation and reduced motion cancel to complete plain text. Reach details and the message/map use scoped one-time reveals. No new frame loop or dependency.

### Forms (the site's)
Boxed now (D130): white, 1.5 px ink-2 border, 6 px corners, 48 px tall, 16 px text, the label above in medium, hint under it, the error below with its pictogram. The consent's privacy link in deep. The send action the large deep button with an arrow, full width on a phone.

### Footer (D132, from Theme 5)
Soft white under a rule: the logo in its colours and the company's line; the admin's link columns under semibold navy headings, links in ink-2 underlining on hover; a contact column (phone, email, hours, each beside its deep mark) and a Follow us on group beneath the contact details when social links exist. A single social link shows its 20 px deep-blue icon and name with the contact rows’ 10 px gap. Multiple links show only the same icons side by side in 44 px targets, wrapping if needed, each named for assistive technology. With no social links the group is omitted; a rule above the copyright with the registered name (D121). No running words (removed with their setting).

### Shared-link previews

A 1200 × 630 self-contained PNG in Theme 6 (D140): white ground, the original colour logo at the top, the published page headline in deep blue, and an optional pale-green page label with navy words. Headlines scale down for longer copy. The domain sits below; a narrow deep-blue and leaf baseline closes the card. The logo, typeface and words come from the app, with no remote-image dependency. All content stays within generous insets. Open Graph and large Twitter cards use each page’s published title and description; social crawlers receive them in the initial HTML head.

### Floating WhatsApp
A 56 px WhatsApp-green circle with the proper standard white brand mark (D154), Raised, at the bottom end inside the safe area. Other WhatsApp marks share the same SVG and inherit their surface colour.

### Admin (a separate Operate surface, D138)
The admin shares the tokens, type and pictograms but keeps its boxed Operate layout. Its sidebar, mobile bar and mobile menu use pale leaf, navy headings and ink-2 links, the colour logo, green counts and forest-tinted rules. The current row is leaf with navy words, marked by its fill alone, never bold. The sidebar scrolls on its own (`overscroll-contain`), in the same groups; the admin's name, Profile and Log out remain at its foot, and Log out asks first.

The work area is white, with the same ruled rows, mist for opened details, fixed rem sizes (28 px headings at 700), 6 px corners and hairlines. `.admin-world` scopes forest to the action/link/focus/checked-switch roles, so the public site's blue is unchanged. Primary `Button` actions use forest with white words (hover navy), secondary actions keep their navy outline, quiet actions use forest words. Switches keep their sliding white knob and Enabled/Disabled words, now in forest. Danger actions and errors stay red. New uses the original blue through `status-new`, in-progress keeps sky, resolved leaf and archived the quiet ink; every status keeps its words and mark.

The sign-in panel uses pale leaf with navy and ink-2 words, forest marks in pale chips and the colour logo, beside the same white form. No smooth scroll or reveals; motion only for state (120–200 ms). The admin never loads the site's motion. Its words and workflow are unchanged.

### Motion (Theme 6's grammar)

GSAP and ScrollTrigger with Lenis on the GSAP ticker, loaded after first paint; Lenis smooths a wheel only. CSS draws everything it can, so motion costs little script.

- **Slides** (CSS, D128, D136): each moves on when its bar has filled (6 s, linear, `--duration-slide`). The incoming layer wipes from the inline end over the last (clip-path, 1100 ms, ease-out); the photo inside settles from 106% to 100% over six seconds. The outgoing photo keeps its layer and holds its last frame; each returning slide starts a fresh drift. The first photo is the page’s first paint and only settles. The headline’s words rise from behind their line (900 ms, ease-out, 45 ms apart, from 160 ms), then the supporting words (640 ms, from 480 ms), then an optional button (from 620 ms). The note and progress arrive once at 760 ms, over 640 ms. Timings are CSS tokens; these are agent defaults for review (Q48). Progress rails scale instead of animating width. Deliberate keyboard focus stops the drift and fill together; hovering and clicking never pause automatic playback. No script timer or extra animation loop.
- **Headings rising** (GSAP, D129): a heading's words rise from behind their line (110% to 0, 640 ms, ease-out, 55 ms apart, `wordStagger`) the first time it scrolls into view; one already on screen is left alone.
- **Blocks rising** (GSAP, D125): blocks rise 24 px and fade in once as they scroll into view, 80 ms apart in a group.
- **Clients' rows** (CSS, D133): endless, linear, the second row reversed; stopped under the pointer, on focus and on a chosen logo.
- **Header** (CSS transition, 640 ms ease-out): away going down, back going up.
- **An inner page's opening** (CSS, D135): its photo settles from 106% over six seconds; its headline's words rise as a slide's do, then its line and actions rise in.
- **The phone menu** (CSS, D167): the sheet drops in from the top (700 ms) on `ease-settle`, the one curve it shares with its rows; each row starts 40 ms after the last, the first at 40 ms, fading up from 14 px above its place to settle the same way the sheet moves (700 ms); nothing waits for the sheet to land. Closing, the rows fade (180 ms) as the sheet lifts away (420 ms, ease-in-out), and the dialog closes when `menu-out` ends; Escape and a chosen page take the same way out. It opens in the tap itself.
- **The menu's pill** (CSS transition, 640 ms ease-out, D134): set back where the last page's link was, at its width, then let go; the words cross to white as it arrives.
- **State:** press 120 ms, colour 200 ms, a card photo's zoom 1 s; a service arrow and a link's arrow step forward under the pointer.

**The Transform-And-Opacity Rule.** Movement is transform and opacity; the slides' wipe is the one clip-path, on a single photo at a time.

**The Still-Page Rule.** Nothing else moves on its own (WCAG 2.2.2). The slides stop on deliberate keyboard focus; the clients' rows stop under the pointer, on focus and on a chosen logo (the user chose no pause button for them; recorded in D133). Contact’s explicitly requested typewriter is another exception (D147), paused offscreen/hidden and static for reduced motion.

**The Reduced-Motion Path.** With reduced motion the engine never loads: no Lenis, no reveals, no word rising; the slides stay on the first slide, with static progress; the clients' rows stand still, their repeats gone, wrapped in rows; the header scrolls with the document; the menu's pill is simply on the new page; the phone menu appears and goes at once; an inner page's opening is simply there.

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
- **Don't** add design controls to the admin (D12), or let its scoped green theme change the public site (D138).

## Resilience and finish (D142)

Text wraps at an otherwise unbreakable word when necessary; masked word reveals
and letter-settling words remain within their container. Contact details and
long headings stay readable instead of clipping or widening the page. Short highlighted phrases stay together; a longer phrase or unbroken highlighted word can wrap inside the heading, and internal overflow is checked as well as page width.
Standalone header, footer, authentication and section links use the existing
44 px touch minimum. Footer rows remain compact, with no extra gap between
touch-sized links; its social marks stay 40 px inside the larger target.
The phone sign-in band sizes to its logo and existing padding; free vertical
space belongs to the white form area. The desktop retains its full-height panel.

Public form submissions lock immediately, including lazy validation loading;
errors preserve entered values and unlock a retry. Admin mutations likewise
accept one operation at a time per mutation hook. Pending actions remain disabled
and announced busy even when a caller supplies a false disabled/busy prop.
The agreed motion, reduced-motion treatment and statements are unchanged.

D145–D147 motion loading: smooth-scroll setup is now in the deferred runtime alongside the typewriter controller; initial public routes retain the existing 170 KiB budget. No extra dependency or animation-frame loop.

Careers opening controls (D148): its existing Nursing in Doha header can be reordered, hidden and restored in Pages → Careers. Hiding preserves the photo and copy. The retained header cannot be removed; other page headers keep their existing locks. With the opening hidden, the jobs heading supplies the page’s h1 using its unchanged visual style.

Mission/Vision hover (D149): a 420 ms token-timed 12 px lift, forward depth, 1.035 scale and opposing perspective tilt on fine-pointer hover or keyboard focus; the existing float shadow fades through an independent opacity layer. CSS individual transforms compose with the GSAP entrance. Reduced motion keeps only the static shadow/focus highlight; touch does not retain a hover state. Both statement articles can receive keyboard focus, without button semantics.

Main Services catalogue (D150): only the All services section uses a pale-green edge-to-edge band and the same compact thumbnail/title cards as Other services. All published services share one grid in admin order, without audience headings/actions. Header, other sections, Home and footer retain their existing presentation. The section heading and cards keep their current reveal sequence.

Services Talk to us (D150 follow-up): use the existing mist/pastel-blue band on the Services page only; contact-band content/actions and the other pages’ green contact bands stay unchanged.

D149 hover refinement: each panel also runs a distinct 900 ms graphic sequence. The cross separates its arms, turns a quarter turn and reassembles; the globe tilts while its meridian/latitude fold and unfold. An expanding outline fades behind the graphic. One sequence per hover/focus, with no ongoing loop. Individual CSS transform properties compose with the SVG entrance transforms; all graphic animation is disabled for reduced motion.

D149 whole-card refinement: the primary hover response is now the complete panel coming forward in perspective: 12 px up, 24 px depth, 1.035 scale, opposing 5-degree tilts, eased over 420 ms, with a translucent sweep over the whole surface. Scene wrappers isolate perspective from the existing GSAP entrance; graphic sequences support the full-card response. All movement and sheen are suppressed for reduced motion; the static shadow/focus ring remains.

Home quote reference (D151): inset rounded pastel-blue panel, navy headline/lede and three tinted contact tiles at the left, a plain white rounded form at the right. Remove the old blue title strip. Keep the reference’s paired name/mobile and email/service rows, full-width message and send action, with placeholders. Keep consent, bot protection, validation and all server behavior; other forms and Home sections retain their layout. Contact chips become rounded squares only in this tile variant.

D151 shadow follow-up: the Home white form card uses the existing float shadow.

Contact message layout (D152, superseding D145’s overlapping form): retain the Reach us ribbon exactly. Below it, an inset rounded pale-green section places Send us a message, the map, Visit our office and the published address/directions in the left column; the existing message form sits in a plain white rounded card at the right. On phones the content stacks in that order. The old overlap and spacing token are retired. No service selector or new data collection is added to Contact.

D152 shadow follow-up: Contact’s white form card uses the same float shadow as Home.

D153 clarification: keep Contact’s rounded message panel pastel green and all inner element colours as approved. A separate pastel-blue backdrop behind it joins Reach us; the white form keeps its float shadow.

D154: the shared chat storage key now draws the WhatsApp circle/tail/handset mark everywhere WhatsApp is used, public and admin. Shared WhatsApp actions include that mark alongside their existing text; decorative marks remain hidden from assistive technology. Retired unused footer play/pause glyphs are removed.

D154 brand refinement: use the standard Font Awesome Free WhatsApp brand SVG (CC BY 4.0), served once locally and reused through SVG use; no custom approximation. The floating shortcut uses WhatsApp green (#25d366) and the white logo, an explicit user-requested brand-colour exception; other WhatsApp marks inherit their existing surface colour.

D149 first-visit fix: GSAP owns the outer scene wrapper’s entrance transform; the inner article owns hover/focus transforms. This prevents GSAP from normalising the card’s individual CSS transforms to inline none during first-entry reveals.

D152 map follow-up: Contact’s map frame shares the float shadow with the form card; the attribution remains below it.

D155: Other services samples three distinct published services across the full catalogue, excluding the current service. No audience restriction remains, so School nurse staffing also has three when the catalogue provides them.

D156 opening actions: About and main Services each have a content visibility switch in Pages → Page header for their existing WhatsApp/Request a quote pair. Both are hidden by default, including legacy records, and kept off in the local published preview. Wording/destinations stay preserved; draft/preview/publish behavior applies. Individual service-detail buttons retain their existing D146 controls.

D157 slider note visibility: Pages → Home → Page header has Hide the slider pill. Keep text/icon stored, preserve legacy visible notes, and publish visibility separately from the progression bars. The local published note is hidden.

Initial D158 prototype (fade superseded by D160; header positioning by D162): Home, About and main Services use full-width opening photos, dimmed navy behind white copy and a light sky-tinted highlight. The original coloured logo and navy navigation retain an opaque soft-white surface through the controls; the short first-concept gradient fades into the photo below. The extended second-concept fade was rejected. The header keeps its scroll-away/return behavior and keyboard focus protection. Openings grow for longer copy; no-photo inner pages stay text-only. Other routes retain their layouts. Responsive full-width image sizes, existing slides/reveals, optional actions and reduced motion remain. Shared spacing/type/gradient roles live in globals.css; no brightness detection or client-side route switching.

D159 navigation actions: the mobile menu’s WhatsApp and Call labels remain centred on one line beside each other, with inset padding sized for 320–414 px phones. The shared brochure download button reads Brochure and retains its download icon.

D160 supersedes D158’s header-gradient implementation: keep the navbar solid soft white throughout its height. Fade the top of the image and its navy overlay together into the matching light base using a static alpha mask with a gradual 192 px transition. Header controls and the original coloured logo never fade. This is limited to Home’s opening, About and main Services when they have a photo; no-photo openings and other routes keep their normal header/layout. Existing reveals/autoplay remain, with no new animated mask or client script.

D160 font stability: the About/main Services photo openings reserve a minimum of three headline lines before the font arrives, allowing longer content to grow. This prevents a two-to-three-line font rewrap from moving the next section.

Initial D161 / Impeccable Adapt (the individual-service opening is superseded by D164): the public world alone has a phone scale below 768 px. Headlines begin at 32 px, section headings 28 px, supporting text 17 px, body/input text 16 px, and section spacing 40 px. Mobile image openings begin their copy at 200 px with a 64 px solid header and a 120 px gradual image fade; Home’s minimum opening is 620 px and inner photo openings 528 px, growing for copy. Reserve additional lower space only when the optional Home note is shown. The heading font-reservation behavior remains. Intro photos crop to 4:3; service portraits are 256 px minimum; Mission/Vision artwork is 96 px, with 24 px panel insets. Compact related cards use 64 px thumbnails, preserving titles/links. Form card insets become 20 px without shrinking fields below 16 px/44 px. Menu rows are 52 px with smaller type, independent contact actions stay at least 44 px, and the sheet scrolls in short landscape with bottom safe-area space. Phone footer navigation is two columns, brand/contact full width, with all content retained. Short landscape receives compact title/image roles too. Desktop (1024 px+) and admin retain their existing roles; the pinned colours, animation/reduced-motion paths and 30 px pyramid steps remain. These are adaptation proportions, not CMS controls.

D162 supersedes the earlier sticky/scroll-away-and-return behavior: the public navbar is positioned in normal document flow at the top. It scrolls away with the page and does not return on upward scrolling farther down. Preserve its original logo, active-page pill motion, menu, brochure and photo-opening overlap. Remove the scroll listener/state; reduced motion needs no special header behavior. Applies at all widths; the user’s latest explicit change to desktop is limited to navbar positioning.

D163: Careers and Contact navbar backgrounds use the same soft-white card surface as Home/About/main Services, with the original coloured logo and existing controls. Their other section colours and D162’s non-sticky behavior remain.

D164 replaces the individual-service editorial title/arched portrait with the shared PageSplit photo opening used by About and main Services: title and summary over a full-width navy-dimmed photo, top image alpha fading into the white non-sticky navbar. Published optional header buttons retain their labels/destinations and visibility; use readable light actions on the photo, including hover/focus. No-photo services stay text-only. Pastel-blue About and three compact related-service cards stay. The old portrait/title CSS is retired; legacy design tokens remain available to the existing design catalogue.

D148 spacing follow-up: Careers applies its outer opening inset only when the page sign is the first visible section. A hidden or moved sign leaves no empty pastel-blue strip above Open jobs; the jobs band retains its own internal spacing.

D163 spacing follow-up: Careers and Contact share the photo-opening navbar height token (64 px on phones, 76 px on tablets, 100 px on desktop) as well as its white background. Only photo openings overlap their navbar; Careers/Contact remain in normal flow.

D165 footer logo: retain the coloured logo without moving it. A soft diagonal white highlight is masked to the logo’s own shapes, sweeps from top-left across it, travels slowly for 4.5 seconds, then rests for the remainder of a ten-second cycle. Animate only the highlight’s transform/opacity; no new client runtime. Hide the decorative highlight for reduced motion. This user-requested decorative loop is limited to the footer.

Footer Instagram optical alignment: shift only its mark 2 px toward the inline start (left in English), as requested, preserving the aligned label and full link target. Other social marks remain centred in their slots.

D166 footer background, latest user clarification: retain only the very faint pale-blue outline illustration of a nurse reassuring an older seated patient. Extra nursing-tool graphics must match the reference exactly or be omitted; use the authorized omission fallback rather than retain approximations. Position the care scene along the desktop lower-left and mobile lower-right, clipped to the upper footer. It is static, decorative and pointer-transparent; copyright remains plain. Preserve every existing link/content position, responsive columns, social-link rules and the slow masked logo shine. One local lazy-loaded care image, no client runtime or CMS control.

D167 phone menu: the sheet is deep blue with white words; WhatsApp and Call are two side-by-side tiles (D159's outlined pills are superseded; its one-line fit at 320–414 px stands). The email, the hours and "24/7" are left out. The brochure button keeps D159's Brochure wording. Open and close are the sheet dropping in and lifting away, its rows following it down, on one curve; transform and opacity only.

## Public Font Manager (D168)

Inter Tight remains the default. The public website alone can choose among Inter Tight, Inter, Atkinson Hyperlegible Next, Roboto, Open Sans, Source Sans 3, Nunito Sans, Manrope, DM Sans, Work Sans, Playfair Display, Cormorant Garamond, Fraunces, Space Grotesk and Syne. Each is a self-hosted Latin variable face; licenses and source versions accompany the assets. The fourteen optional faces are not preloaded. The admin remains Inter Tight, apart from its clearly labelled font specimens.

Twenty independent roles: H1, H2, H3, H4, lead, paragraph, small/helper, caption, label, legend, input value, placeholder, button, link/navigation, list item, status, error, detail label/value, bold/emphasis and expandable summary. Semantic descendants inherit their parent's face; the heading's blue phrase stays in its heading face. Shared action links use the button role. Font family alone is editable; existing type scales, weights, colours, spacing and motion remain fixed.

Font Manager extends the existing Operate editor: grouped native selectors, live specimens beside each selector on wide screens and below on phones, the shared Save draft/Preview/Publish/Discard toolbar, and the existing unsaved-change guard. Typography publishes independently of Settings. Preview opens the real public Home page and remains active across public navigation.

D168 navigation refinement (2026-11-04): Font Manager uses a dedicated typography T pictogram on the existing 24-unit grid, with round-capped 2-unit strokes. Settings retains its sliders mark.

D169 expands the library to fifteen while retaining every existing selection.
Playfair Display brings editorial contrast; Cormorant Garamond a calligraphic
serif; Fraunces a softer, expressive serif; Space Grotesk geometric character;
Syne broad sculptural display forms. These are optional families, especially
useful for distinctive headings, and remain selectable for every text role.
The three serif faces use metric-adjusted Times New Roman fallbacks with
Georgia/serif last fallbacks. Existing type sizes, weights, spacing and colours
remain fixed, and optional faces are not preloaded.

D170 makes the stationary footer logo shine more often: retain the existing
0.4-second lead-in and 4.5-second sweep, shorten the recurring quiet gap from
5.5 to 2.75 seconds, for a 7.25-second cycle. Opacity timing scales to keep its
original elapsed times; the reduced-motion treatment remains static.

D171 corrects the mobile Home pyramid’s three-card variant: phone and laptop both show five depth positions, retaining the same crisp raised centre, two scaled/dimmed cards behind each side and 30 px steps. Phone overlap tightens to 16% of stage width, with a 60 cqw centre card capped at 16 rem; the outer cards can peek through the viewport edges. Laptop proportions stay unchanged. Every service keeps its full title/link panel and can be brought to the centre using the existing arrows or swipe. Six-second automatic advancement and reduced motion remain.

D172 app-wide consistency follow-up: every public navbar shares the same soft-white surface and 64/76/100 px phone/tablet/laptop height tokens; only photo openings overlap it. Brand logos use contain fitting rather than stretching in narrow columns; the footer shine mask uses the same contained, centred alignment. Admin menu buttons, editor back links, pagination and footer links retain at least 44 px targets, without changing the public/admin theme distinction.

D173 contact refinements: Home’s quote contact squares use WhatsApp green with a navy WhatsApp mark, and navy with white Call/Email marks. Other tile colours stay. Contact’s Reach us ribbon retains its pastel-blue background, with each of the three channels on its own off-white rounded card using the existing card radius and spacing scale. Existing reveals, links and form content stay.

D173 hover follow-up: Reach us channel terms are 700 weight. The entire off-white card lifts 8 px on fine-pointer hover or keyboard focus and fades in a static float-shadow layer. Independent CSS translate composes with GSAP’s scroll-reveal transform on the first visit. Motion uses the existing state duration/ease; reduced motion retains only the static highlight.

D172 motion check: client logos keep their grayscale-to-colour interaction, with no animated filter interpolation. The existing row loop, pause rules and reduced-motion presentation stay.

D174 approved refinement: Careers’ Open Jobs section uses a rounded pale-green-to-mist panel, nursing photo beside the heading on phones and beside heading/copy on larger screens, existing radius and raised shadow with no white border. The photo is editable through the existing media picker. Job rows, empty state and general application remain. Decorative punctuation cycles one/two/three dots over 2.4 seconds through opacity only, with fixed geometry and one accessible heading; reduced motion shows three dots. Contact’s Reach us and the backdrop behind the rounded message panel use deep blue continuously. Off-white channel cards, their whole-card hover, pastel-green message panel and white shadowed form remain.

D174 spacing follow-up: Open Jobs’ rounded green panel sits on the same mist background as Before you apply, with compact 16 px phone / 24 px larger-screen outer spacing above and below it. The mist backdrop remains continuous between the two sections.

D175: About’s Talk to us uses three off-white rounded channel cards. Keep its green band, existing icon colours, contact values and reveal. Its phone label reads Call us; the 24/7 label on other variants stays.

D175 follow-up: About and Services use the rounded contact-card variant with navy Phone/Email squares and white marks. The WhatsApp chip retains its green mark treatment. Both use Call us without 24/7; Services stays pastel blue and About stays pale green.

D176: no audience/category labels or grouping on public service cards, the catalogue, share images or admin service lists/editor. Keep a single ordered service collection and preserve historical stored values for compatibility. Services’ green catalogue meets its image opening without the redundant section-gap strip.

D172 enlarged-text follow-up: the admin header logo can shrink without hiding the menu; shared controls use zero-minimum grid tracks, field bounds and wrapping action labels/order controls so 200% text can reflow on a 320 px screen.

D174 photo-shadow follow-up: the nurse photo uses a dedicated two-layer navy shadow token in the Tailwind theme, so the shadow is visible on both the green and mist sides. Keep the photograph borderless and still.

D177 About values: the approved Promise triptych uses three equal rounded panels in deep blue/white, pale green/navy and mist/navy, stacked on mobile. Existing statements stay. Each panel reveals once in sequence. Fine-pointer hover runs a subtle 1.1-second diagonal translucent sheen, transform/opacity only; the card itself never lifts, scales or tilts. Reduced motion is static. Circular outline decoration is static and hidden from assistive technology.

D178 About intro alignment: on a wide screen the heading occupies the first row, and the photo and description start together in the second. Mobile retains heading, image, description order; Home and no-photo sections keep their existing composition.

D179 Contact map: use Google’s lazy satellite iframe with an accessible title, provider attribution unobscured, the existing rounded frame and float shadow, and stable 3:2 geometry with a 200 px minimum height. The published business/area resolves the view until an admin sets confirmed coordinates. Contact’s inner gutter caps at 5vw to retain the provider’s 200 px minimum width at enlarged text on narrow phones. Keep the green message panel and deep-blue outer backdrop. The shared header owns its soft-white card background directly on every route. Privacy discloses the map connection to Google; no API key, script SDK or new dependency.

D179 shadow refinement: the map has a dedicated static two-layer navy shadow (20/40/−10 px at 32% plus 8/18/−4 px at 22%) so both its edge and elevation remain noticeable against the pastel-green panel. Keep rounded corners, responsive geometry and provider content unchanged.

D180 verification only: public/admin hydration checks retain the existing rendered design, SSR forms, motion and shared tokens. No visual or runtime change. Browser-added `__gcr…` annotations are diagnosed separately from application rendering; preserve genuine React diagnostics.

D181 polish: compact thumbnail/title service links and their reveal wrappers fill their grid row, keeping bottoms aligned when titles or selected fonts wrap differently. Preserve card widths, thumbnail crops, spacing, copy, colours and reveal order. The shared editor Preview keeps its link destination but is dimmed, removed from tab order and marked unavailable while saving, publishing or discarding; normal and auxiliary activation wait until the operation finishes. Idle and failure-recovery behaviour retains the existing draft/preview workflow. Shared action styling treats aria-disabled the same as native disabled.

D181 pending-edit follow-up: group editor fields in a named, zero-minimum-width native fieldset, disabled only during saves/publish/discard. This prevents edits racing response-driven resets and restores controls and entered values on failure. Idle geometry and the visible design stay.

D182 Home About points: one full-width off-white rounded card below the intro body; three equal columns from 768 px, stacked on phones. Use existing padding/shadow/type tokens, plain titles/descriptions without tick marks or reserved icon space, and Read more afterward. Keep legacy/default Intro points and the About page unchanged. No points means no card or empty grid row; six stored items may wrap to two rows.

D183 Home hero controls: a hero-only three-second drift/progression clock; two unframed SVG chevrons flank the decorative rails, with 44 px minimum targets and white ink/focus against the dimmed photo. Keep no Pause and no visible count. Arrows wrap and restart the clock; keyboard-visible focus within the carousel pauses until leaving, pointer/hover does not stall. Reduced motion supports manual controls with autoplay off. Rail spacing caps against viewport width via slide-progress-gap so eight rails fit narrow/enlarged-text views. The six-second base clock for service pyramids/other photo openings remains.

D184 is a proposal only: five cardless service-label treatments with landscape cards on every screen, comparing three and five layers. The current production services pyramid remains unchanged pending the user’s selection.


D185 applies the approved soft-photo-fade service pyramid on Home only: three landscape photos on phones/tablets/desktops, a centred front card and two symmetrically smaller/softer rear cards. Scale the rear pair around the shared vertical centre, exposing both top and bottom corner gaps at every width; no fixed downward drop or vertical deck. The composition stays inside the existing max-site/gutter geometry. Front width is capped at 42rem/76cqw, rear scale is 0.88 and side spread is 14% of the track, without viewport bleed. Titles use body-scale semibold white text centred at the photo bottom over a navy fade, without label cards or name arrows. The native flex row keeps its layout boxes before and after enhancement; only transforms compose the pyramid. Equal-height cards preserve the corner geometry across titles, while enlarged accessibility text can increase intrinsic height rather than clip. Retain six-second autoplay, manual arrows/swipe, keyboard/reduced-motion behavior and the native fallback. Other service cards stay unchanged.

D186 Harden: keep a single gesture pointer, reject secondary/right-button starts and vertical-dominant swipes, clear cancelled/lost/blurred/hidden gestures, and finish a release outside the carousel. Re-entry must work without a reload; listeners clean up on navigation. No extra frame loop or layout animation.

The D185 caption’s fade reaches its high-contrast navy at the top padding boundary, so long/enlarged titles never begin over a transparent photo area. An empty pyramid track has no reserved photo height.

D186 enlarged menu: contact tiles use content-aware columns (paired at normal phone text, single when enlarged text needs room); numbers/navigation labels wrap, the logo can shrink, and close/arrow targets keep their size. Preserve the approved blue menu and its motion.

D186 fallback input: apply pan-y only after pyramid enhancement. The native row retains the browser’s horizontal touch scrolling if JavaScript or its deferred module is unavailable.

D186 menu interruption: cancellation of the closing animation (including a reduced-motion preference change) completes the native dialog close and restores focus; opening-animation cancellation keeps the menu open.


## D188 — Limited inline copy formatting

Website copy accepts `**bold**`, `*italic*` and `***both***` in the existing strings. Backslash-escaped asterisks and unmatched delimiters remain readable literal text. This is limited inline emphasis, not a Markdown document editor: no HTML, embedded media, auto-links or new styling controls. Shared safe React nodes use semantic strong/em, the existing bold weight (700), existing public font roles and the unchanged colour/size tokens.

Animated headings preserve emphasis across word/letter and blue-highlight boundaries. Their accessible copy contains the visible words once, without delimiters. RiseWords draws copy on the server and sends its existing motion wrapper the rendered slots. Contact's formatted typewriter reserves inline ink/caret room; italic word masks reserve ink room too. New spacing tokens are `--spacing-emphasis-ink: 0.15em` and `--spacing-typewriter-caret: calc(var(--spacing-emphasis-ink) + 2px)`. Unformatted copy retains the prior layout; reduced motion retains styled, visible text.

A single small syntax hint appears in Pages, Services, Jobs and Settings content editors. No toolbar or repeated per-field controls. Save/Preview/Publish/Discard and raw string limits stay unchanged. Metadata, share pictures, structured data, image labels, form choices, generated slugs and submission snapshots use a plain-text projection. Routing, contact addresses/phone/email, passwords and URL values remain literal. All formatting output remains escaped React text.

D210 places the four predefined screening controls together in the job editor's Application questions group. Each custom question uses the shared select for its answer mode. On the job's Apply page, visible screening questions carry the existing optional label. Custom questions use the shared radio rows for one answer or checkbox rows with selection instructions for multiple answers. The inbox and email show multiple selections on separate lines under the original question.


## Admin User manual (D189, 2026-11-07)

Administration includes User manual with the existing document pictogram. The white work area pairs a topic list with lesson buttons, one responsive native video player, numbered steps and an expandable transcript. On smaller screens the topics stack above the lesson. Only the selected clip loads metadata, playback is user initiated, and captions are optional. Existing admin tokens, forest actions and shared buttons are used.


## Per-placement photo framing (D190, 2026-11-07)

Existing page and service photo fields include a collapsed “Adjust photo framing” disclosure after a photo is selected. It expands inline: concise instructions, the full uncropped photo as a click/tap target with a navy/white focal ring, two labelled native percentage ranges, a reversible Reset framing action and wide/square/portrait example crops. Ranges run in physical left-to-right coordinates, including in RTL containers; the same control is usable with a keyboard. Existing admin tokens, visible focus and touch targets apply; no new decorative animation or modal. The source and preview columns shrink within phone/enlarged-text widths.

Coordinates belong to the selecting page/service reference and follow its Save → Preview → Publish/Discard. Shared service selections carry their framing into service cards and the pyramid. Logos keep contain-fit behavior and have no framing control. Unset points preserve every current public default; explicit points use CSS object-position on the existing responsive image. No extra image variants, runtime resizer, public control or dependency. Crop examples are representative; page Preview shows the actual composition.


## Browser policy (D191, 2026-11-09)

No visual changes. Every document carries a fresh nonce for executable scripts, including admin and error pages. Existing inline focal/animation styles, self-hosted fonts, Google satellite frames, Turnstile and private manual videos remain supported. Public content reads retain their existing publish cache. Reduced motion and responsive design contracts stay unchanged.

D192 changes only the cold integration-test setup deadline/barrier; image encodings, public performance budgets and visual behavior stay unchanged.


## Motion startup scheduling (D193, 2026-11-09)

Below-fold block and word reveals initialize in separate cancellable browser tasks after the existing engine loads. Visibility is checked when each task executes, so a visitor who has already reached a block never sees it hidden afterward. Each initializer retains its GSAP context and reverts on cleanup; queued work is cancelled on navigation/reduced-motion changes. Animation values, durations, easing, geometry and visible server content remain unchanged. No streaming fallback or extra loading state is introduced.
