---
version: 1
slug: "src-app-site-page-tsx"
primary_target: "src/app/(site)/page.tsx"
related_targets: ["src/app/(site)/layout.tsx","src/app/globals.css"]
---

## Scope

The public site (plan §6, §30): every public page, the site shell, sections, forms and system pages. Persuade mode. The admin panel is a separate Operate surface (its own brief); in Phase 6B it only loses its line and station dots.

## Audience and job

Families in Doha arranging home nursing, mostly on phones and often worried; hospital, clinic and school managers judging a staffing agency; nurses looking for work. Job: each knows within seconds what Al Hidaya does and takes their own next step (WhatsApp/Call, Request a Quote, Careers).

## Direction contract
THESIS: Pinned by the client (2026-10-31, plan D132): Theme 6, the current alhidaya.qa's simple structure made clear: Theme 2's header and services cards, Theme 4's straight-lined hero and quote card, Theme 5's About and footer; soft white, deep blue leading, the leaf green as the accent. It refuses a pure white, a green action, the old reference's statement, highlights and audience sections, and the running words.
OWN-WORLD: soft-white page (#f7f9fc) with cards a touch lighter (#fcfdfe); mist (#f1f6fb) and pale-leaf (#eef5e2) bands edge to edge; deep blue (#0f64ac) for the main button, links, the current page in the header's pill and a heading's phrase; leaf (#86ae3c) and forest (#5b7628) for marks only; navy ink, ink-2 for quieter words; Inter Tight semibold for headings; buttons with 12 px corners; rounded 28 px photo cards; round controls.
STORY: the visitor meets a slide of care with its headline, reads who Al Hidaya is, sees every service as a card to scroll, recognises the institutions it serves, and asks for a quote or messages from the same view.
FIRST VIEWPORT: desktop: the header (logo, the pages in a floating pill, the brochure button), then the hero in straight lines: the slide's headline (a phrase in deep blue), its words and optional button above the slides' progress bars in a compact mist pill (D136: no navigation buttons, Pause or count) on the left; the photo edge to edge on the right with the card on the photo at its foot. Phone: the photo first, then the words and controls. Signature: the slides’ layered wipe coordinated with their words (D136), headings' words rising from behind their line, About’s medical cross assembling beside its unfolding globe (D137), the clients' rows running opposite ways and stopping on a chosen logo.
FORM: the client's mix of the five themes, chosen from screenshots; not from the roll. seed: none (pinned by the client)
FINISH: unreviewed and undocumented is unfinished; Home is reviewed by the user first (R6C.1), then each other page (R6C.2); DESIGN.md records the built world.

## Constraints

Logo colours only (D35): deep blue leads, the leaf an accent (D132); soft white on the public site, except the user’s white Contact opening and controls (D145); light only (D28); GSAP + ScrollTrigger + Lenis, transform/opacity (the slides' single-photo wipe the one clip-path), content visible by default, a reduced-motion path; nothing moves on its own but Home's automatic slides (stopped by deliberate keyboard focus, never by hover or click, D136) and the clients' rows (stopped by the pointer, focus or a chosen logo; the user's choice, D133); performance budgets (plan §31); nothing childish; no invented proof (D7); Arabic-ready, logical properties (plan §33); the admin keeps its separate layout, with the user’s green palette scoped to it (D138).

## Unresolved

- Real numbers (patients, nurses) for the counters, when the client gives them.
- The client's own photographs, replacing the licensed stock.

Home services refinement (D143, 2026-11-02): approved 30 px pyramid steps; all cards retain their label/link panel; rear photos are softened while the centre remains crisp. Two existing arrows, swipe and six-second automatic advance, no pause button. Home alone; other service grids retain their layout. Reduced motion is static/manual; all links survive a failed enhancement.

Contact D145/D147: approved Blue ribbon body with a white opening, pastel-blue Reach us and pastel-green message band, existing navigation/footer; D152 replaces the overlap with an inset green section: heading/map/office left, shadowed white form right. The published headline types fully, holds, deletes from the end and loops, paused hidden/offscreen and static for reduced motion. Contact phone guidance is a placeholder; visible labels and errors remain. Service detail D146: approved Care editorial opening, deep-blue title and tall portrait, up to two optional published header actions (default hidden), pastel-blue About; omit Who it is for/24-7 panels and use concept two’s compact thumbnail/title related cards on pale green with All services; retain navigation/footer.

D148–D152 refinements: Careers’ retained opening can move/hide in the editor and is hidden locally; Open jobs supplies the h1 when hidden. About’s whole Mission/Vision cards lift and come forward with opposing perspective tilt/zoom, a full-surface sweep, supporting graphic animation and a static reduced-motion highlight. Only Services’ All services section changes to a unified green compact-card grid; its Talk to us is pastel blue. Home’s screenshot-based quote panel is inset rounded pastel blue, with contact tiles left and a plain white form card with float shadow right. Contact uses that form composition on pastel green, heading/map/office/address left and form right with float shadow; Reach us remains unchanged. Existing form consent/security, nav/footer and other sections remain.

D153 clarified: only the backdrop behind Contact’s rounded message panel is pastel blue; the panel remains pastel green, its form white. D154 uses the standard shared WhatsApp brand SVG throughout, with WhatsApp-green floating shortcut and white logo, an explicit client-requested brand-colour exception. D149 isolates the entrance transform on the outer scene so first-visit hover works.

D155 selects three distinct Other services from the full published catalogue, excluding the current service. D156 adds content visibility switches for About and main Services opening actions; both remain hidden in the local published preview, with their existing wording and destinations preserved.

D157–D159: hide the Home slider’s stored note pill independently via the Pages editor (hidden locally; progress remains). The user chose the first full-width photo/header blend for Home, About and main Services: navy-dimmed photo/copy, original coloured logo and navy navigation on protected light ground fading below controls. Do not use the later extended fade. Keep other routes unchanged, optional header actions, responsive/reduced-motion behavior and scroll-away/return navigation. Mobile WhatsApp/Call text fits side by side; shared download action reads Brochure with its icon.

Latest D160 supersedes the header-gradient part of D158: navbar stays solid soft white. Only the image and its navy overlay fade at their top into the matching light base, gradually through a static mask. Controls/logo stay fully visible. Scope remains Home, About and main Services photo openings only; no-photo openings and other pages retain the ordinary header.

D161 adapts the public site and mobile menu only: a phone-specific reading scale, shorter image crops/opening gaps, smaller Mission/Vision graphics and compact related cards, useful form widths, shorter menu rows and a two-column phone footer. Retain all content, 44 px touch areas, 16 px inputs, Theme 6, image fade, visibility, reduced motion, 30 px pyramid rise and desktop/admin. Verify 320/390/414 px phones, tablet, short landscape, all public templates and actual synthesized carousel gestures; viewport screenshots alone are not gesture evidence.

D162 supersedes all earlier sticky/return-on-up statements: the public navbar stays at the document top in normal flow and never returns while reading farther down. Existing content/menu and active-pill animation remain; photo openings retain their composition.

D163 makes Careers and Contact navigation surfaces match the other main pages’ soft white, retaining the coloured logo, controls and non-sticky placement. Other section colours remain.

D164 extends the current image-fade opening to each service detail: shared title/summary-over-photo composition, white non-sticky navbar, optional published buttons retained. No-photo records stay text-only. Pastel-blue About and three compact related cards remain.

Footer alignment refinement: social icons and labels align with the phone/email rows, using the same 20 px deep-blue icon and 10 px gap. Remove the social-only circular chip; preserve 44 px link targets and external-link behavior.

Footer social group: beneath Contact, show Follow us on only when published social links exist. One network shows its aligned icon and name; multiple networks show icons side by side, wrapping if needed, with accessible names and 44 px targets. No links means no group.

D165: only the footer logo receives a masked diagonal shine on a ten-second repeat, with a 4.5-second sweep and a quiet pause. The underlying original logo is stationary, with no transform. CSS transform/opacity moves only the decorative highlight, hidden entirely for reduced motion. This explicit user request is an exception to the default arrival-only motion grammar.

D166 final clarification: retain the faint pale-blue outline nurse-care illustration only. The user requires exact reference tool artwork or its omission; remove approximate nursing tools. Preserve all actual footer content, layout, responsive columns, social behavior, copyright and slow D165 logo shine. Static decorative pointer-transparent layer, local lazy-loaded image, no new client runtime or CMS design control.

D168: the public font family can vary independently for twenty semantic text
roles through the fixed fifteen-face Font Manager. Inter Tight remains the default;
the type scale, weights, spacing, colours and motion stay fixed. No admin font
uploads or arbitrary CSS. Each optional face is self-hosted and not preloaded.

D171 mobile pyramid refinement (2026-11-04): retain five layers at phone widths too, using tighter overlap and a readable centre card rather than hiding the outer pair. Preserve the 30 px steps, desktop geometry, all service labels/links, six-second advances, arrows/swipe and reduced motion.

D172/D173 consistency pass: uniform public navbar height/surface on every route; brand logos and footer shine contain-fit without distortion; Home contact-square backgrounds WhatsApp green and navy; Contact channels are off-white rounded cards with bold terms and an independent 8 px hover/focus lift plus opacity-only shadow highlight, static for reduced motion. Careers concept three is approved (D174).

D174–D176: Careers keeps the green-gradient nurse-photo card on a continuous mist backdrop with compact outer spacing. Photo has a shadow, no white border; Open Jobs dots alone cycle smoothly with static reduced motion. Contact uses deep blue continuously behind Reach us and the rounded green message panel. About/Services Talk to us has off-white rounded cards, navy Phone/Email squares and Call us without 24/7. Services has no redundant opening gap. No service categorisation is shown in public/admin surfaces or share images; historical values remain compatible.

D177: About What we stand for uses approved concept-one rounded commitment panels instead of points. Three columns on larger screens, stacked on phones, current copy retained. Sequential reveal; on hover only a subtle diagonal sheen moves, never the card itself. No lift. Reduced motion is static.

D178/D179: Who we are’s description starts level with its photo on wide screens. Contact uses the shared soft-white header and a lazy, accessible Google satellite iframe inside the existing rounded shadowed frame. Keep stable responsive geometry, visible provider attribution, the green message panel and continuous deep-blue backdrop. Narrow enlarged-text gutters preserve Google’s minimum frame size.

D179 follow-up: use the dedicated two-layer navy map shadow for noticeable elevation against green; explicitly bound the aspect-ratio frame to its column at narrow and enlarged-text sizes.

D181 polish: compact service cards fill the tallest item in their grid row, preserving approved layout, thumbnail and title treatment across fonts and breakpoints. Other public design, content and motion remain.

D182: Home intro points share one full-width off-white three-column card (stacked on phones), without ticks. Keep their copy and Read more, and no empty card when there are no points. About/default Intro list treatment stays.

D183 supersedes D136’s main-hero timing/buttons: three-second advance, simple previous/next chevrons flanking progress rails, no Pause/count. Keyboard focus within pauses; manual controls remain with reduced motion. The services pyramid stays at six seconds. D184 landscape/cardless pyramid variants are concepts only, not applied before user selection.


D185 supersedes D171 and the D184 proposal: Home services uses three landscape cards at every width. The smaller/softer rear pair is equally offset left/right around the centred front card and scales around their shared vertical centre, preserving top and bottom corner gaps even on phones. The entire pyramid stays inside the existing gutters. Titles are modest body-scale semibold white text centred at the photo bottom over a navy fade, without name arrows or label cards. Equal-height native flex items retain their layout boxes and form the pyramid with transforms only, avoiding a deferred-enhancement layout shift; enlarged accessibility text can grow without clipping. Preserve six-second autoplay, manual arrows/swipe, published links, reduced motion and the native fallback.

D186 Harden preserves the chosen visual system while recovering cleanly from interrupted/multi-pointer gestures and vertical page scrolling. Commit readiness is reviewed before the final Polish pass; nothing committed before user review.


D188: limited safe inline bold/italic copy, preserving the existing layouts, colours, semantic font roles, heading/highlight/typewriter motion and reduced-motion behavior. Accessible and nonvisual text receives visible words without delimiters; contact/routing values remain literal. Formatted italic masks and typewriter words reserve their ink/caret room on narrow/enlarged screens.
