# Home services pyramid — D143

Status: ready for user review, uncommitted. Review scope is Home’s services section only.

## Approved behavior

The centre service leads a pyramid with 30 px vertical steps. The third published service starts in front; published order and links are preserved. Rear cards retain their audience, heading and linked panel; only their photos soften. Existing Previous/Next controls wrap in both directions, and a native touch swipe advances one card. A fresh tap after a swipe still opens the service.

The interval shares the hero’s six-second CSS token, following the user’s latest timing instruction. There is no pause button. The clock stops offscreen, in a hidden document and during deliberate keyboard focus; hover and mouse interaction do not strand it. Reduced motion leaves a static, manually navigable deck. Without JavaScript or the deferred enhancement, every service remains linked in a native row.

Only transforms and opacity animate. No dependency, animation loop, content fetch, schema, CMS control or production change was added. Other service grids retain their existing layout. The RTL origin is verified at 390 and 1440 px after the production CSS build; an explicit direction selector avoids the CSS optimizer’s language-based rewriting of `:dir()`.

## Implementation and evidence

- `HomeServicesPyramid.tsx` is a small after-paint enhancement boundary; headings, controls and cards are server-rendered by `ServicesRowSection.tsx`.
- `services-pyramid.ts` owns scoped DOM listeners, observers, native timer and cleanup. CSS owns the step, scale transition and shared duration.
- Full unit/contract/local-MySQL integration coverage: 347 files, 1,239 tests passed, 100% statements/branches/functions/lines.
- Full built phone/desktop E2E: 198 passed, 44 intentional skips. Subsequent focused checks covered real touch swipe followed by a fresh link tap, enhancement-free navigation, reduced motion, timer behavior and axe. Final CSS build repeated the two phone/desktop pyramid journeys successfully.
- Responsive render checks: 320, 390, 768 and 1440 px; explicit RTL centring at 390 and 1440 px.
- Lint, typecheck and format checks were green before the final CSS-only direction correction; final checks recorded below.
- Scoped Impeccable detector returned no findings (`2026-11-02-pyramid-detector.json`). This is a scoped automated pass, not a new whole-codebase audit or accessibility certification.
- All 20 route initial JavaScript sizes are recorded in `2026-11-02-pyramid-bundle-sizes.json`. The largest route is exactly 174,080 gzip bytes: no spare capacity remains under the existing 170 KiB gate. No budget was raised.

## Performance scope and limits

The targeted lab run covers Home plus Contact, which shares the largest initial bundle, on phone and desktop. Historical D139/D142 full-route runs remain separate evidence; this change does not claim a fresh 40-case run. A first isolated run passed Home and desktop scrolling but failed Contact’s scripted keyup interaction at 320 ms (2.2 ms input delay, 0.7 ms processing; the remaining delay was presentation). It is retained as a failed sample, not silently converted into a pass. The final-build isolated follow-up and its outcome are appended below.

Q49’s persistent motion-stop decision remains open under the approved no-pause direction. Automated axe and keyboard checks do not resolve that decision. Physical-device/compositor, speech, other-browser and production-region evidence remains release work. No production action, commit or push.

## Final-build follow-up

Build `xIApxph_gBS1wViJ7yUpx`: four targeted performance cases passed in one serial run with zero retries and unchanged limits. Home’s measured lab interaction bound was 88 ms; Contact’s was 40 ms. The maximum LCP was 527 ms, maximum phone/desktop CLS 0.0349, no scrolling long task was recorded, and both desktop missed-vsync estimates were zero. Lighthouse scores were 100 on the measured routes. These are controlled local lab results, not field performance.

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 174,080 | 527 | 88 | 0.0348 | 0.00% |
| /contact | 174,080 | 506 | 40 | 0.0004 | 0.00% |

Raw evidence: `2026-11-02-home-services-performance.json`. Bundle evidence records the same build. The failed first Contact sample remains disclosed above; a passing follow-up does not establish its cause or erase it.

Final lint, typecheck, repository format check and `git diff --check` passed after the CSS direction correction and documentation update. The implementation remains uncommitted for review.
