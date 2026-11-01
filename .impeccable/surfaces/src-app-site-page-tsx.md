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
FIRST VIEWPORT: desktop: the header (logo, the pages in a floating pill, the brochure button), then the hero in straight lines: the slide's headline (a phrase in deep blue), its words and optional button above the slides' controls in a mist pill (Previous, Next, bars, count, a small pause) on the left; the photo edge to edge on the right with the card on the photo at its foot. Phone: the photo first, then the words and controls. Signature: the slides wiping in, headings' words rising from behind their line, the clients' rows running opposite ways and stopping on a chosen logo.
FORM: the client's mix of the five themes, chosen from screenshots; not from the roll. seed: none (pinned by the client)
FINISH: unreviewed and undocumented is unfinished; Home is reviewed by the user first (R6C.1), then each other page (R6C.2); DESIGN.md records the built world.

## Constraints

Logo colours only (D35): deep blue leads, the leaf an accent (D132); soft white, never a pure white, on the public site; light only (D28); GSAP + ScrollTrigger + Lenis, transform/opacity (the slides' single-photo wipe the one clip-path), content visible by default, a reduced-motion path; nothing moves on its own but Home's slides (with a pause) and the clients' rows (stopped by the pointer, focus or a chosen logo; the user's choice, D133); performance budgets (plan §31); nothing childish; no invented proof (D7); Arabic-ready, logical properties (plan §33); the admin's look unchanged.

## Unresolved

- Real numbers (patients, nurses) for the counters, when the client gives them.
- The client's own photographs, replacing the licensed stock.
