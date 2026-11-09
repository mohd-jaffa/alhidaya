# Performance verification

Plan §31 is checked against the production standalone build and the same
local-only, published launch seed as the browser journeys:

```sh
npm run services:start
npm run build
npm run test:performance
```

The existing Playwright database guard refuses a remote test database. The
performance suite owns port 3100 and uses Chromium's debugging port 9224 for
Lighthouse; do not run it alongside E2E or another performance run. Keep the
machine otherwise idle while measuring. The normal dev server may remain on
3000. Lighthouse is a pinned development dependency; it adds no visitor script.

## Gates

Every fixed public page, each seeded service, the seeded job, and both application
variants and the missing-page template run serially. The test server reads no content until seeding finishes, so no unpublished or
empty page response is cached. The server's published-content cache is warmed
before each navigation; browser assets are cold for Lighthouse.

- Modern initial JavaScript: at most 174,080 gzip bytes. The HTML's script tags
  **and streamed Next Flight module references** count, including error-boundary
  chunks. Conditional `noModule` polyfills are excluded. Post-paint scripts are
  reported separately under D65, not silently added to the initial allowance.
- Lighthouse 13.6.0: performance, accessibility, best practices and SEO each at
  least 95; LCP at most 2,000 ms and CLS at most 0.05. The mobile navigation
  profile uses 4× CPU slowdown and Fast 4G: 40 ms RTT, 9 × 1,024 Kbps download,
  1.5 × 1,024 Kbps upload. Lighthouse simulates this profile; its report includes
  the exact settings and browser version.
- Real scripted interactions in an emulated touch browser: tap to open/close the menu,
  tap and type into the actual name/email/phone/message fields and blur them, without sending
  personal data or submitting a form. This exercises the delayed validation
  import. Event Timing groups events by interaction ID; the longest interaction
  excludes one outlier per 50 interactions. Values below the observer's 16 ms
  threshold are reported as an upper bound of 16 ms. The lab INP bound must be at
  most 150 ms. The runtime pass applies 4× CPU and the network profile through
  CDP rather than simulation.
- Runtime probes start after fonts are ready and the engine's 2 s idle-load
  timeout has elapsed (2.5 s settling allowance). They measure the enhanced page,
  rather than conflating navigation/hydration work with steady-state scrolling.
- Full-page native touch scroll: no task above 50 ms; CLS, including scrolling,
  at most 0.05. Desktop uses a wheel gesture through the existing Lenis engine,
  no CPU slowdown, and also enforces the 50 ms task limit. Both passes verify
  that the page's bottom was reached.
- Desktop missed-vsync estimate: below 5%. The test calibrates the current
  browser's refresh interval and measures rAF gaps during the full scroll,
  counting a three-frame gap as two missed frames. This is a frame-cadence proxy,
  not a compositor/GPU measurement on physical hardware.

Application and missing pages are intentionally `noindex`. Only their `is-crawlable`
Lighthouse audit is omitted; their remaining SEO checks, other categories and
all performance limits still run. No thresholds are relaxed and there are no
performance exceptions for the missing page: its expected 404 is explicitly accepted,
while every published launch page must return 200. There are no
performance-test retries. Playwright trace recording is off during timings,
so DOM snapshots do not contaminate the CPU-throttled interaction measurement.

The missing page also omits Lighthouse's SEO `http-status-code` audit: returning
404 is its required behaviour, checked explicitly before Lighthouse runs. Its
other SEO checks and every performance threshold still apply. The runner is
Playwright's pinned Chromium headless shell, shared with the functional suite.
Full-Chrome diagnostics produced different input presentation timings; the two
runner results are not treated as interchangeable or as physical-device evidence.

## Evidence and limits

Per-route `summary.json`, `runtime.json`, desktop-scroll JSON and full Lighthouse
JSON/HTML reports are written under `test-results/performance/`. CI runs this gate beside the
functional E2E suites, in sharded jobs, and uploads the resulting artifacts even on
success. On GitHub's runners it is report-only (D194): the budgets are unchanged and stay strict
in `npm run verify`, but a miss does not block the run. Coverage
uses one worker: the real photo-seed encodes otherwise competed for CPU and
exceeded their existing timeout locally; no timeout or coverage threshold changed.

These checks provide repeatable **local lab** evidence. The scripted INP sample
only describes the tested interactions; it is not a field percentile over real
visits. Lighthouse scores and timings depend on the browser and host hardware.
Axe/Lighthouse also do not certify the persistent-motion-control requirement.

A physical mid-range Android touch/scroll pass, field responsiveness, compositor
frame review and the cached-page response budget (≤200 ms from the server's
region) remain release checks. The client's server cannot be changed or deployed
to before full payment and the required deployment approvals (D48/D44). No local
result is presented as evidence from Qatar or the production server.

Method references: [Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md),
[INP and lab measurement limits](https://web.dev/articles/inp),
[Event Timing](https://www.w3.org/TR/event-timing/).

## Recorded local result — 2026-11-01

All 40 final cases passed against the standalone build. The largest initial JS
response was 173,784 gzip bytes (296 bytes spare); maximum mobile lab LCP 618 ms,
scripted INP bound 56 ms and combined measured CLS 0.0384. The lowest Lighthouse
category was 96. No scrolling long task above 50 ms was observed; the desktop
missed-vsync proxy was 0% in this run. Zero long-task records means none reached
the observer’s threshold, not that all tasks took zero time.

See [per-route evidence](audits/2026-11-01-performance.json) and
[the audit follow-up](audits/2026-11-01-impeccable-audit.md). This local result does
not replace the release checks described above.

## Subsequent harden/polish result — D142, 2026-11-01

The final hardened standalone build passed all 40 serial cases in 9.2 minutes.
Maximum initial JS 173,897 gzip bytes (183 spare), mobile lab LCP 621 ms,
scripted INP bound 72 ms, CLS 0.0386 and minimum Lighthouse category 96.
No scrolling task above 50 ms was observed; the desktop cadence estimate was 0%.
The same measurement limits and remaining release checks apply.

See [D142 evidence](audits/2026-11-01-harden-polish-performance.json) and
[the harden/polish review](audits/2026-11-01-impeccable-harden-polish.md).

## Public-page refinements — D145–D156, 2026-11-03

The final standalone build `NeuDoY-tls_g0bBcMQcAE` passed 14 serial cases across
seven affected routes: mobile Lighthouse/runtime and desktop scroll checks,
without retries. All Lighthouse categories scored 100. Maximum mobile lab LCP
686 ms, scripted INP bound 56 ms and combined measured CLS 0.0349; no scrolling
long task at the observer threshold and a 0% desktop missed-vsync estimate.
All 20 initial-route JavaScript budgets also passed, with a maximum of 174,079
gzip bytes against 174,080: only one byte remains. No limit was raised.

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 174,079 | 686 | 56 | 0.0348 | 0.00% |
| /about | 168,053 | 507 | 32 | 0.0013 | 0.00% |
| /careers | 168,053 | 468 | 32 | 0.0134 | 0.00% |
| /contact | 174,079 | 524 | 40 | 0.0008 | 0.00% |
| /services | 168,053 | 508 | 32 | 0.0005 | 0.00% |
| /services/home-nursing-care | 165,468 | 489 | 32 | 0.0013 | 0.00% |
| /services/school-nurse-staffing | 165,468 | 467 | 32 | 0.0011 | 0.00% |

See [targeted performance evidence](audits/2026-11-03-page-refinements-performance.json),
[all-route initial JavaScript sizes](audits/2026-11-03-redesign-bundle-sizes.json) and
[the refinement review](audits/2026-11-03-contact-service-redesign.md).
The existing physical-device, compositor, field responsiveness and production-region
limits still apply. This targeted run supplements the historical full-route gate;
it does not re-measure unaffected routes beyond their initial JavaScript sizes.

## Gradual image fade and navigation — D157–D160, 2026-11-03

All six final serial checks passed on the three changed photo openings, phone
and desktop. A prior run caught About’s real font-rewrap CLS of 0.0592; reserving
three heading lines corrected the section movement, verified by a delayed-font
browser regression. No threshold was raised. Final maximum mobile lab LCP 754 ms,
scripted INP bound 56 ms, combined CLS 0.0420, all Lighthouse categories 100,
no scrolling long task at the observer threshold and 0% desktop missed-vsync estimate.
All 20 route JavaScript budgets pass, maximum 174,075 gzip bytes (five bytes spare).

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 174,075 | 754 | 56 | 0.0018 | 0.00% |
| /about | 168,049 | 683 | 32 | 0.0419 | 0.00% |
| /services | 168,049 | 701 | 40 | 0.0013 | 0.00% |

See [final evidence](audits/2026-11-03-image-fade-performance.json) and
[the refinement review](audits/2026-11-03-image-fade-review.md). These are local
Chromium lab results, not field/physical-device/compositor or production-region
measurements. Earlier full-route evidence and release limitations remain.

## Public mobile Adapt and service photo openings — D161–D164, 2026-11-03

All 40 final serial cases passed across the 20 public templates and their desktop
scroll counterparts, unchanged budgets and no retries. Maximum mobile lab LCP
735.3 ms, scripted INP upper bound 64 ms, combined CLS 0.04192, minimum Lighthouse
category 96, no scrolling long task at the observer threshold and 0% desktop
missed-vsync estimate. Maximum initial JavaScript 173,894 gzip bytes against
174,080 (186 bytes spare). Build `Lvrq97SaI_O7gc0qkYK55`, Lighthouse 13.6.0,
local Chromium 156, isolated temporary media/CV folders.

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 173,894 | 735 | 64 | 0.0018 | 0.00% |
| /about | 167,868 | 681 | 48 | 0.0419 | 0.00% |
| /careers | 167,868 | 466 | 32 | 0.0000 | 0.00% |
| /careers/apply | 170,818 | 244 | 32 | 0.0004 | 0.00% |
| /careers/registered-general-nurse-home-care | 164,526 | 244 | 32 | 0.0007 | 0.00% |
| /careers/registered-general-nurse-home-care/apply | 170,818 | 244 | 32 | 0.0008 | 0.00% |
| /contact | 173,894 | 524 | 64 | 0.0008 | 0.00% |
| /performance-page-that-does-not-exist | 163,832 | 162 | 32 | 0.0000 | 0.00% |
| /privacy | 167,868 | 245 | 32 | 0.0029 | 0.00% |
| /request-a-quote | 173,894 | 617 | 32 | 0.0006 | 0.00% |
| /services | 167,868 | 682 | 32 | 0.0013 | 0.00% |
| /services/child-care | 165,283 | 508 | 32 | 0.0000 | 0.00% |
| /services/chronic-condition-care | 165,283 | 644 | 32 | 0.0017 | 0.00% |
| /services/elderly-care | 165,283 | 488 | 32 | 0.0000 | 0.00% |
| /services/home-nursing-care | 165,283 | 489 | 32 | 0.0000 | 0.00% |
| /services/hospital-and-clinic-staffing | 165,283 | 646 | 48 | 0.0000 | 0.00% |
| /services/maternity-and-newborn-care | 165,283 | 507 | 32 | 0.0000 | 0.00% |
| /services/palliative-care | 165,283 | 646 | 48 | 0.0000 | 0.00% |
| /services/school-nurse-staffing | 165,283 | 624 | 32 | 0.0000 | 0.00% |
| /terms | 167,868 | 244 | 32 | 0.0005 | 0.00% |

See [full performance evidence](audits/2026-11-03-mobile-adapt-performance.json),
[all-route JavaScript sizes](audits/2026-11-03-redesign-bundle-sizes.json) and
[the mobile Adapt review](audits/2026-11-03-mobile-adapt-review.md).
These are local lab and synthesized-touch results. Physical devices, other
browser engines, compositor/field responsiveness and production-region checks
remain release checks; thresholds were not relaxed.

## Footer care background — D166, measured 2026-11-03; recorded 2026-11-04

Both targeted Home cases passed on the final nurse-only footer, unchanged
budgets and no retries. Mobile lab LCP 540.3 ms, scripted INP bound 64 ms,
CLS 0, all four Lighthouse categories 100, initial JavaScript 173,895 gzip
bytes against 174,080 (185 spare). No scrolling long task at the observer
threshold; desktop missed-vsync estimate 0%. The local 67,854-byte care
illustration is lazy-loaded and adds no client script.

These measurements precede later D167 menu work; the original build ID was not
captured before the verification interruption. They are exported from the
preserved JSON log rows, not attributed to the newer current build. See
[performance evidence](audits/2026-11-03-footer-art-performance.json) and
[the completed footer review](audits/2026-11-03-footer-art-review.md).
Local lab/emulated interactions only; physical-device, compositor, field and
production-region checks remain separate. No new full-route result is claimed.

## Consistency and approved refinements — D172–D179, 2026-11-05

Final standalone build `xi6uZU75_ddlMNiFdwfpo` passed twelve serial checks across Home, About, Services, Careers, Contact and Privacy, with live Google satellite requests enabled. Mobile lab LCP ≤722.46 ms, scripted INP bound ≤64 ms, combined measured CLS ≤0.04192, lowest Lighthouse category 99, and no scrolling long task at the observer threshold. All twenty public initial JS budgets pass, maximum 173,402 / 174,080 gzip bytes. No limit changed.

See [performance evidence](audits/2026-11-04-consistency-performance.json), [initial JS evidence](audits/2026-11-04-consistency-route-js.json) and [review and limits](audits/2026-11-04-consistency-review.md). Existing physical-device, browser and server-region release checks remain.


## Final commit-readiness gate — D187, 2026-11-07

The complete final suite passed all 40 cases in 9.0 minutes against build `_QNMIT61o2sag9LiLs039`: twenty public mobile routes with Lighthouse, initial JavaScript, scripted interactions and touch scrolling, followed by all twenty desktop wheel-scroll/cadence cases. Thresholds and retry settings were unchanged.

Maximum initial JavaScript was 173,842 / 174,080 gzip bytes, mobile lab LCP 686.447 ms, scripted INP upper bound 64 ms and combined measured CLS 0.0419191. The lowest Lighthouse category scored 96. No scrolling long task at the observer threshold was observed; the desktop missed-vsync estimate was 0%. Home's mobile CLS was zero. All expected public statuses and the deliberate 404 passed.

See [full-route evidence](audits/2026-11-07-readiness-performance.json), [gate summary](audits/2026-11-07-readiness-summary.json) and [readiness review/limits](audits/2026-11-07-readiness.md). These remain local Chromium lab results; existing physical-device, other-browser, manual accessibility, field/compositor and production-region checks retain their release status. No push or deployment was performed.


## Lightweight inline copy formatting — D188, 2026-11-07

The final formatting build `gLhbjogm1XoQ77FAgEygi` passed the complete 40-case suite in 9.0 minutes. All twenty public mobile routes and desktop scrolling counterparts retained the same strict budgets and no retries. Maximum initial JavaScript 173,771 / 174,080 gzip bytes, mobile lab LCP 688.4 ms, scripted INP bound 64 ms, combined measured CLS 0.0419191, lowest Lighthouse category 96, no observed scrolling long task and 0% desktop missed-vsync estimate.

See [all-route evidence](audits/2026-11-07-inline-formatting-performance.json) and [feature validation and limits](audits/2026-11-07-inline-formatting.md). The separate functional pass includes styled copy across every bundled font, 320–1440 px and normal/doubled text, plus formatted development hydration. These remain local lab/emulated-layout results, with existing release checks unchanged.


## D190 — Per-placement image framing, 2026-11-07

All 40 serial performance cases passed on `JFI8gFRSKn_HhB5BWmAgr` after the focal-point controls and deterministic per-tag publishing revisions. Initial public JS peaked at 173,789 / 174,080 gzip bytes; LCP 687.1 ms; scripted INP upper bound 64 ms; combined CLS 0.0000000; minimum Lighthouse category 96; observed scrolling long-task maximum 0 ms; desktop missed-vsync estimate 0.0%. No retries or threshold changes. Framing reuses existing variants and adds only CSS object-position when explicitly set.

[All-route evidence](audits/2026-11-07-focal-points-performance.json) · [validation and limits](audits/2026-11-07-focal-points.md).
