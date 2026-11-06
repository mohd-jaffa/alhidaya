# Landscape services pyramid — review concepts

These are the proposal-stage artifacts. The user subsequently approved Soft photo fade with three landscape cards (D185), modest bottom-centred names without arrows, and smaller rear cards with visible top/bottom corner insets on mobile too. That implementation is now in the public Home code. No content/database writes or commits were made for these concept artifacts.

The latest instruction is landscape cards on **every screen**, with mobile quality determining whether the change is worthwhile. All five boards therefore show three landscape cards on desktop and mobile: one highlighted front card and two quieter rear cards, with 30px depth. A separate comparison shows three versus five landscape cards at both sizes.

## Shareable boards

- `01-soft-photo-fade.png` — service name over a gentle bottom navy fade.
- `02-plain-caption.png` — left-aligned name below the active photo.
- `03-editorial-top.png` — stronger heading at the top of the active photo.
- `04-photo-baseline.png` — slim flush photo footer; no floating label card.
- `05-shared-caption.png` — clean photo with one centred name below the stack.
- `00-wide-count-comparison.png` — three versus five visible landscape cards, desktop and mobile.

All names are the current published service names. Rear names are simple, unboxed links below the photos so they remain readable rather than being squeezed into narrow exposed card edges. There are no category labels, title cards or pause buttons.

## Interactive review

`pyramid-wide-prototype.html` is a self-contained standalone prototype. It includes all five text choices, a three/five visible-card comparison, arrows, swipe and six-second automatic advancement. Automatic motion stops for reduced motion, a hidden document or deliberate keyboard focus. These review controls do not propose new admin settings.

The inline conversation fragment is at:
`/Users/jaffa/.codex/visualizations/2026/11/01/01a195ed-13b8-7450-ad9b-8db906b4ad38/pyramid-wide-prototype.html`

The prototype bundles downsampled copies of the eight current service photos and the existing font, with no network dependencies. Service links point to the local app for review. The original image assets remain unchanged.

## Suggested direction

Three landscape cards make the front/back hierarchy clearer on mobile. The shared-caption option preserves the most photo detail; soft-photo-fade is a more compact alternative. No option or card count is assumed approved.

The Home Nursing photo is 1672×941. A centred 3:4 portrait crop shows approximately 42% of its original width; a 16:10 landscape crop shows approximately 90%. These are image geometry comparisons, not business claims.

## Validation

HTML/CSS screenshots were rendered with local Playwright and visually reviewed. The interactive layout was checked at 320, 390, 768 and 1440px across all five styles, both visible-card counts and all eight service titles; previous/next, touch swipe and automatic advancement were exercised. The inline fragment is approximately 302KB, including its images and font.

Generated from read-only published content on the local development app on 2026-11-05. Rendering source and validation scripts live under `/private/tmp/alhidaya-pyramid-concepts/`; no production source was edited.
