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

THESIS: Pinned by the user (2026-10-30, plan D97): the telehealth landing language of Dribbble shot 24320685 (Eloqwnt for DocInPoc) followed section by section, in Al Hidaya's words, photos and the logo's green; a calm white page where care is shown in people and soft cards, and words arrive as you read. It refuses the old wayfinding line, the pinned header bar and any stock it cannot source.

OWN-WORLD: white ground; pale mist cards (#f1f6fb) with large soft radii; the logo's leaf green deepened to forest (#3b6b24) for primary pills, the accent card and the footer, its pale tint (#eef5e2) for audience pills, inline icon chips and the highlight behind a headline word; navy ink with soft grey for the quieter words; Inter Tight at light-to-regular weights, large and tight; round photo avatars in groups; round pill buttons with an arrow; thin line icons in chips.

STORY: the visitor sees nurses and care first, reads in one sentence that Al Hidaya brings qualified care home and staffs institutions across Doha, finds their own audience section (families, institutions), sees how it works in four steps, and writes or messages from the page.

FIRST VIEWPORT: desktop: two halves in one white frame. Left: three nurse avatars between round brackets, the headline in large light type with one word on a pale-green highlight, a soft grey supporting line, a forest "WhatsApp us" pill with arrow and a pale "Request a quote" pill; at the bottom-left a pale card with an avatar stack and a real fact. Right: a tall rounded photo of care, three translucent word chips at its top-left, each with a check where the reference has a plus (a plus reads as an action that does nothing here), two white floating cards at its bottom-right (a service with its photo; a fact with an icon). Header above: logo, four thin links, forest quote pill; it scrolls away. Phone: the photo follows the copy, full width, chips and cards kept inside it. Signature: the headline's letters settle from wide spacing into the word; the statement below darkens word by word as it scrolls; the process steps travel sideways while held; the footer's giant words run with the scroll.

FORM: the user's pinned reference, translated to the logo's colours and Al Hidaya's facts; not from the roll. seed: none (pinned by the user)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

Logo colours only (D35), the deep and pale greens as the logo's leaf deepened and lightened (D98); light only (D28); GSAP + ScrollTrigger + Lenis, transform/opacity only, content visible by default, reduced-motion path, no auto-moving content (motion is scroll-linked, WCAG 2.2.2); performance budgets (plan §31); nothing childish; no invented proof (D7, D99): counters show only real facts; Arabic-ready, logical properties (plan §33). Never reuse the studio's images or text. Code-led build (no image generation): the reference frames are the composition the build matches and the finish review's critique reference.

## Unresolved

- Real numbers (patients, nurses) for the counters, when the client gives them.
- The client's own photographs, replacing the licensed stock.
