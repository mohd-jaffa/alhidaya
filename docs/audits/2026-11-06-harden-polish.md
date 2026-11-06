# Harden, commit-readiness review and Polish — 2026-11-06

D185 and D186 are complete locally and ready for review. Nothing staged, committed, pushed or deployed. The local preview is restored at http://localhost:3210 with the existing published local content. No actual content, private drafts or user browser tabs were edited.

## Result

Home uses the selected soft-photo-fade pyramid with three horizontal cards at every screen size. The smaller rear pair stays left/right around the front card and shares its vertical centre, exposing upper and lower corner gaps on phones too. Titles are modest, bottom-centred and have no arrows or label cards. Existing gutters, published links/order, six-second advance, manual arrows, swipe, keyboard focus and reduced motion remain.

The performance gate exposed a real layout shift when deferred enhancement changed the native row to a grid. The final implementation retains native flex layout boxes and uses transforms to compose the pyramid. Explicit zero minimums keep its track bounded on phones. Final Home mobile CLS is zero; the desktop result is 0.001813.

Other Harden fixes cover interrupted/multiple pointers, vertical page gestures, release outside the carousel, native swiping if enhancement is unavailable, enlarged-menu reflow, motion-preference changes before/during menu closing, long/enlarged caption contrast and an empty track’s reserved space.

## Commit-readiness checkpoint — before Polish

The review included every uncommitted path present at the start (423 paths: 180 tracked modifications and 243 untracked files totalling 16.52 MiB). It covered public/admin layouts, font controls and licensing, forms/uploads, authenticated draft/preview/publish boundaries, migration/contracts, motion, SEO, CI and documentation. Secret/path scans found no private keys, cloud credentials or stray environment/log files. The only new SQL file is the planned typography migration. The index stayed empty.

- Lint, build/typecheck, formatting and diff checks passed.
- Full unit/contract/local-MySQL run: **1,318 tests in 366 files, 100% coverage**. Focused current-module coverage after the last narrow fixes also passed at 100%; the combined evidence explicitly records this provenance.
- Complete browser sweep: 260 passed, 62 intentional duplicate-project skips and four findings. These were an empty-track specificity defect, two obsolete wrapping-style assertions and an ambiguous Next route-announcer/error selector. All were corrected and their affected cases passed. A later reduced-motion edge case and the Home stability defect were separately fixed and verified. The report does not claim a fresh whole-suite run after every narrow fix.
- Affected follow-ups: nine passed/two project skips, final all-font menu case passed, final pyramid suite seven passed/three project skips. The actual rendered single-line number is asserted at ordinary phone text sizes, while enlarged text may reflow. Editor error assertions target the editor’s own alert.
- Development hydration: two cases/46 navigations passed after raw HTML and readiness inspection were made safe against development reloads. No diagnostic suppression or browser-annotation scrubber was introduced. Production public/admin hydration passed in the broader sweep.
- 12 performance cases across six affected templates passed. The five non-Home templates passed before the Home-only stability correction; Home was rechecked afterward with identical strict thresholds. All four Lighthouse categories scored 100. Maximum lab LCP 549 ms, INP upper bound 120 ms, CLS 0.04192, no scroll task over 50 ms.
- All 20 published/test-route statuses and initial gzip-JavaScript limits passed on the final build: maximum **173,839 / 174,080 bytes**. The intentional missing page alone returns 404. Asset collection runs after the isolated database is seeded.
- Advisory check found no moderate/high/critical finding in the 97 runtime packages. Changed-UI and focused post-edit detector scans had no primary findings. No new detector ignores were added.

These local gates were checked before beginning visual Polish. They establish local review readiness; the user’s existing no-commit instruction remains binding.

## Polish — actual published content

The final visual pass kept the approved design/content and required no further application changes. It checked 30 page/width combinations across Home, About, Services, Careers, Contact and a real service detail at 320, 390, 768, 1440 and 1920 px. The separate pyramid pass covered 264 combinations using all eight longer real service names and every bundled font at narrow widths. No clipping, page overflow, distorted logo, small field/target or uncaught browser error was found.

The first-navigation Mission hover showed the existing 3D lift; Promise cards stayed stationary on hover; Reach us cards lifted on first hover; the enlarged narrow menu reflowed, closed and returned keyboard focus. The final phone/desktop pyramid images and representative About, Contact and Careers sections were visually inspected.

## Evidence and limits

Files alongside this report with `2026-11-06-harden-` contain layout/hydration matrices, current-source coverage provenance, all-route JS and six-template performance results. Files with `2026-11-06-polish-` contain the actual-content matrices and final pyramid previews. Earlier concept images remain proposal-stage snapshots, with their README recording the later approval.

Browser evidence is Chromium with emulated viewports and synthesized touch; it is not physical iOS/Android or Safari/Firefox verification. No remote CI/deployment or client-server operation was performed. Existing release/device checks, the user’s autoplay/no-Pause decisions and deferred malware-scanning decision remain recorded in the plan; this pass introduced no new release or product scope.
