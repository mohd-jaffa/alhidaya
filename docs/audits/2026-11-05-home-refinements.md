# Home refinements and horizontal pyramid review — 2026-11-05

D182 and D183 are implemented locally. D184 is a proposal only; the production services pyramid is unchanged until the user chooses a label design and card count. Nothing committed, pushed or deployed.

## Result

Home About uses one off-white card, three equal columns from tablet width, stacked on phones, with no check marks. Read more follows the card. Empty content leaves no empty row. Other Intro/Values treatments stay as implemented.

The main hero advances every three seconds, with plain previous/next SVG chevrons on either side of the progression bars. There is no Pause or visible count. Manual navigation wraps and restarts the clock; deliberate keyboard focus pauses, pointer interaction does not stall, and reduced motion supports manual navigation only. The service pyramid retains its independent six-second interval.

Five shareable image boards and an interactive prototype show landscape cards on every screen, three or five visible, with real published service photos and unboxed names. Rear service names remain readable links below the photos. The concept review introduced no production code or database change. See `../concepts/2026-11-05-pyramid-labels/README.md`.

## Validation

- Build `vd6yQ9LXbS1QCufCMQ6Qm`; lint, typecheck, formatting and diff checks pass.
- Full unit, DB-contract and local-MySQL integration suite: 1,316 tests in 366 files, 100% statements/branches/functions/lines.
- Built browser suite: 40 passed, 4 duplicate-project skips. Home About: 15 fonts × 9 widths (320–1440px). Hero: autoplay, manual wrap, clock reset, focus pause, hover/click recovery, reduced motion and eight rails at enlarged text. Existing pyramid and public/admin hydration journeys pass.
- Home performance: two mobile/desktop cases passed. Lighthouse performance/accessibility/best-practices/SEO all 100; mobile LCP 554 ms, INP upper bound 64 ms, CLS 0. Desktop CLS 0.001813. No scroll long tasks in either profile.
- All 20 public routes remain under 170 KiB initial gzip JavaScript; maximum 173,715 / 174,080 bytes. This remains close to the limit and is recorded rather than rounded down.
- Scoped manual Impeccable detector on the four changed UI components: zero findings; no new ignores.
- Prototype author checked 320 states (5 styles × 2 counts × 8 services × 4 widths), arrows/swipe/six-second advance, no overflow/title clipping or JavaScript errors. Root visually reviewed all five boards and the three-versus-five comparison. The inline conversation version was separately rendered at 320/390px across another 160 states with all images loaded and no overflow, clipping or JavaScript errors.

## Evidence

Files alongside this report carry the `2026-11-05-home-refinements-` prefix for performance, runtime, desktop scroll, route JS and detector results. Home About layout matrix and three screenshots use `2026-11-05-home-about-card-`.

Review server restored on localhost:3210 using the existing local database. Actual content was not edited. The user's browser tab was not touched. Pyramid implementation awaits design selection; no other blocker.
