# Al Hidaya — entire-codebase Impeccable audit

Date: 2026-11-01. Scope: the current uncommitted working tree, after D136–D138.
This is a technical UI audit, not a design critique or a security penetration test.
No audit findings were fixed as part of this report.

## Implementation integrity verdict: PASS

The implementation expresses a consistent healthcare product: the logo palette,
self-hosted Inter Tight, server-rendered published content, shared controls,
central message catalogues and separate public/admin surfaces. The new admin
palette is scoped to `/admin`; its action/focus tokens resolve to forest while
New retains its original blue. The public site retains blue actions. Mission and
Vision reuse the existing delayed GSAP engine, motion tokens and scoped cleanup.

The bundled detector scanned all of `src`, `scripts`, `tests` and the Next,
Playwright, Vitest and ESLint configurations: **zero primary findings** and
**11 advisories**. Ten advisories concern email-only sizes/radii; one is an image
fixture's colour. These are not verified production UI defects. Source,
configuration and test scope totals 860 files, including 469 files under `src`.

## Audit health score

| Dimension | Score | Evidence / limitation |
|---|---:|---|
| Accessibility | 2/4 | Automated axe, labels, focus and reduced-motion paths are strong; automatic content still lacks a persistent stop mechanism. |
| Performance | 3/4 | Public modern-browser initial scripts meet the byte budget; the highest routes have only 305 bytes spare. Lab/field performance and CI budgets remain unverified. |
| Theming | 4/4 | Existing tokens throughout; isolated green admin actions, preserved status semantics and blue public actions. Light-only is intentional. |
| Responsive design | 3/4 | Phone/desktop journeys and intermediate widths covered; some links fall below the project's 44 px target requirement. Real touch hardware was not tested. |
| Implementation integrity | 3/4 | Coherent source with no primary detector findings and tested boundaries; the design sidecar is stale. |
| **Total** | **15/20** | **Good — address the accessibility gap before claiming full WCAG conformance.** |

These scores describe this local audit. They are not a Lighthouse score or a
certification of WCAG conformance.

## Executive summary

Four verified findings: **0 P0, 1 P1, 2 P2, 1 P3**.

1. Autoplay cannot be stopped persistently while continuing to use the page.
2. Navigation and footer links do not consistently meet the project's 44 px targets.
3. Release performance budgets are not yet enforced/measured comprehensively.
4. The Impeccable JSON design sidecar still describes the retired design.

The deliberate removal of carousel buttons (D136) and the clients' pause choice
(D133) are respected. The first finding records their accessibility consequence;
it does not reverse the user's decision or restore controls.

## Findings

### [P1] Automatic content has no persistent, generally accessible stop

- **Category:** Accessibility.
- **Locations:** `src/components/sections/HeroSlides.tsx:35`,
  `src/app/globals.css:371`, `src/components/sections/ClientsRows.tsx:31`.
- **Evidence:** Home advances every six seconds. Its progress indicators are
  decorative, and only deliberate keyboard focus pauses it; moving focus away
  restarts it. A mouse click or hover intentionally does not pause it, fixing the
  reported sticking. Clients has one global `chosen` ID, so choosing a logo stops
  only its own row; choosing one in the other row releases the first. Clicking
  outside releases the selection. Reduced motion provides a still alternative,
  but there is no in-page persistent stop for the normal-motion experience.
- **Impact:** A visitor who needs more reading time, particularly on touch, cannot
  stop all movement and continue using the page. Keyboard focus is occupied while
  Home is paused.
- **Standard:** WCAG 2.2 SC 2.2.2. W3C explicitly explains that a pause which only
  lasts while focus is held does not satisfy the criterion.
  [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).
- **Recommendation:** Agree on a persistent mechanism that works with keyboard
  and touch and can stop both clients' rows. It can be a separately placed
  motion control rather than restoring the rejected slider buttons. This is a
  design decision for the user, not an automatic audit fix.
- **Suggested command:** `/impeccable harden` after the mechanism is approved.

### [P2] Standalone navigation targets fall below the project's 44 px rule

- **Category:** Responsive design / accessibility.
- **Locations:** `src/components/site/SiteHeader.tsx:105`,
  `src/components/site/SiteFooter.tsx:41`,
  `src/features/auth/components/AuthScene.tsx:83`.
- **Evidence:** Desktop navigation is explicitly 40 px high. Rendered footer
  links measured 20.5 px high in the in-app browser at 1440 px. The standalone
  authentication aside link likewise has no minimum target height. Main buttons,
  switches and menu controls use the shared touch-sized controls.
- **Impact:** These targets are harder to acquire accurately, and do not meet
  AGENTS.md §18 / plan §30.3's 44 px requirement.
- **Standard:** Project requirement. This is **not automatically a WCAG AA
  failure**: SC 2.5.8's minimum is 24 px and includes spacing/inline exceptions;
  the footer's spaced rows may meet that exception.
  [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- **Recommendation:** Expand the clickable boxes with logical padding/min-height,
  preserving the visual type size and checking the compact header at breakpoints.
- **Suggested command:** `/impeccable adapt`.

### [P2] Performance release gates remain incomplete

- **Category:** Performance.
- **Location:** `.github/workflows/ci.yml:96` through its build/E2E steps;
  `healthcare-portfolio-website-studio.md` R7.1.
- **Evidence:** CI runs coverage, build and E2E but has no budget job for LCP, INP,
  CLS, long tasks or Lighthouse. The current modern-browser initial script sums
  fit 174,080 bytes, but Home, Contact and Quote are 173,775 bytes: 305 bytes spare.
- **Impact:** A small shared-client change can exceed the JavaScript budget with
  a green pipeline. A successful build/axe run does not establish LCP ≤2 s,
  INP ≤150 ms, CLS ≤0.05, scrolling tasks ≤50 ms or Lighthouse ≥95.
- **Standard:** Plan §31 and the explicitly unfinished Phase 7 R7.1. This is a
  pre-release verification gap, not a measured assertion that these timings fail.
- **Recommendation:** Complete R7.1 with reproducible mobile lab measurements and
  CI budgets, retaining headroom on the shared public routes; verify real-device
  scroll and field responsiveness separately.
- **Suggested command:** `/impeccable optimize`.

### [P3] Design sidecar still describes the retired public/admin palette

- **Category:** Implementation integrity / theming documentation.
- **Location:** `.impeccable/design.json:432`, `:440`, `:448`, `:459`.
- **Evidence:** It still describes an unpinned header, forest footer with running
  words, public forest actions and blue admin actions. Current code, DESIGN.md
  and surface briefs describe Theme 6 and the green admin.
- **Impact:** Generated previews or future tooling that reads the sidecar can
  steer work toward the retired design or accept old tonal ramps.
- **Recommendation:** Regenerate the sidecar from the approved built world after
  review. No incidental drift repair was performed during this audit.
- **Suggested command:** `/impeccable document`.

## Validation and measured evidence

- Lint, repository formatting and Next/TypeScript checks passed.
- Production standalone build passed.
- Unit/contract/database suite: **343 files, 1,217 tests; 100% statements,
  branches, functions and lines**.
- Public focused production browser suite: **46 passed, two one-width skips**.
  Home completed all slides and the wrap while hovered/clicked on both widths;
  deliberate keyboard pause/resume and reduced motion passed. Mission/Vision's
  completed panel, heading and statement transforms were verified.
- Full phone/desktop E2E suite: **187 passed, 41 intentional one-width skips** (5.5 minutes). All executed tests passed, including axe and public width checks at 320, 768 and 1024 px.
- Browser layout reviews: Home, Mission/Vision and sign-in at desktop and phone.
  Admin computed action/focus roles were `#5b7628`, New status `#0f64ac`.
- The full suite includes axe, authentication, publishing/drafts, inboxes,
  validation, uploads, mail retry, keyboard focus, reduced motion and public
  width checks at 320, 768 and 1024 px, alongside 390 and 1440 px projects.
- The two “phone”/“desktop” E2E projects use Chromium with emulated viewport
  sizes. They do **not** synthesize real touch gestures (`Desktop Chrome`,
  `hasTouch` not enabled). No physical-device, screen-reader speech, Firefox,
  Safari or production-server test was performed. Native overflow scrolling
  has no custom pointer drag implementation to verify; real touch still needs
  a device pass.

### Initial JavaScript, production HTML, gzip bytes

Unique script files declared by each successful seeded page response, compressed
individually with Node's default gzip. Modern-browser totals exclude the
conditional `noModule` legacy polyfill (39,627 bytes), which modern browsers do
not execute/download. Post-paint motion follows plan D65's separate accounting.
The early probe made before seeding completed was discarded and the test server
restarted with a clean memory cache before the final run.

| Route | Modern gzip bytes | Budget |
|---|---:|---:|
| Home | 173,775 | 174,080 |
| About, Services, Careers, Privacy, Terms | 167,411 | 174,080 |
| Home nursing service | 164,996 | 174,080 |
| General application | 171,046 | 174,080 |
| Contact, Request a Quote | 173,775 | 174,080 |
| Admin sign-in | 230,766 | No public-route budget |

These are script asset sums, not network latency, parse time, LCP, INP or a
Lighthouse assessment. See `2026-11-01-bundle-sizes.json` for per-route data.

### Detector advisories reviewed

- Ten email-template typography/radius advisories in
  `src/lib/mail/templates/layout.ts`. Email has its own constrained rendering
  surface; a mismatch to the web typography ramp alone is insufficient evidence
  of a defect. No mail appearance change was requested or made.
- One colour advisory in `tests/db/integration/media-admin.test.ts:31`, an image
  fixture. It does not ship as product UI.
- Raw output: `2026-11-01-impeccable-detector.json`.

## Patterns and positives

- The principal gap is motion control, not reduced-motion handling: the latter
  is implemented and tested. Axe does not prove SC 2.2.2 is satisfied.
- The 44 px rule is well expressed by shared controls but not consistently
  applied to plain links; fix at the shared navigation/link layer.
- Tokens, centralized copy, server-rendered published content, accessible form
  errors, native modal focus handling and scoped motion cleanup are coherent.
- No new dependency, worker, background animation loop or production change was
  introduced by D136–D138. The admin does not load the public motion engine.

## Recommended order

1. **P1 — `/impeccable harden`:** after approval of a persistent motion mechanism.
2. **P2 — `/impeccable adapt`:** expand the plain-link targets to the project's 44 px.
3. **P2 — `/impeccable optimize`:** complete the performance measurements and gates.
4. **P3 — `/impeccable document`:** regenerate the sidecar after visual approval.
5. **`/impeccable polish`:** final pass after any approved fixes.

You can ask me to run these one at a time, all at once, or in any order you prefer.
Re-run `/impeccable audit` after fixes to see the score change.

## Follow-up — numbered findings 3 and 4 (D139)

The user selected only the report’s third and fourth numbered findings. Their
local fixes are ready for review; findings 1 and 2 remain unchanged. The score
above describes the original audit and has not been rewritten as certification.

### Finding 3 — local/CI performance gates ready for review

The final production standalone build passed **40 serial performance tests**:
20 mobile cases and the same 20 desktop scroll cases (19 published launch routes
and the deliberate missing-page template). Procedure, exact profile, semantic
noindex/404 exceptions and measurement limits are in
[Performance verification](../PERFORMANCE.md). CI now enforces these budgets and
retains detailed reports. CI itself has not run on these uncommitted changes.

| Final local maximum / minimum | Observed | Gate |
|---|---:|---:|
| Initial modern JS, gzip | 173,784 B | ≤174,080 B |
| Mobile lab LCP | 618 ms | ≤2,000 ms |
| Scripted mobile INP upper bound | 56 ms | ≤150 ms |
| CLS across measured phone/desktop passes | 0.0384 | ≤0.05 |
| Lighthouse category minimum | 96 | ≥95 |
| Desktop missed-vsync estimate | 0% | <5% |
| Scroll long tasks observed above 50 ms | None | None |

Only **296 bytes** remain in the most expensive routes’ initial JS allowance.
Post-paint navigation motion is reported separately: 50,245 gzip bytes (D65).
Zero recorded long tasks means none reached the observer’s threshold; it does
not mean all JavaScript tasks took zero time. Frame cadence is a lab proxy, not
physical compositor certification. Raw per-route summaries, exact build/browser
and event/shift attribution are in
[the measured evidence](2026-11-01-performance.json).

The complete run first exposed genuine cold-font layout shifts. The openings
now use stable em measures matching their loaded font widths; Home reserves its
shared desktop slide-copy space while allowing longer copy to grow. The touch
probe travels beyond the nominal range so gesture inertia cannot silently omit
the page’s bottom. Performance thresholds were unchanged. A final isolated run
passed all 40 tests without retries.

Physical Android/compositor review, field responsiveness and cached-response
timing from the server’s region remain release verification. R7.1 is therefore
**lab gates ready for review**, not a claim that every release check is complete.

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 173,784 | 532 | 56 | 0.0346 | 0.00% |
| /about | 167,417 | 508 | 32 | 0.0013 | 0.00% |
| /careers | 167,417 | 467 | 32 | 0.0133 | 0.00% |
| /careers/apply | 171,046 | 204 | 32 | 0.0004 | 0.00% |
| /careers/registered-general-nurse-home-care | 164,243 | 206 | 32 | 0.0007 | 0.00% |
| /careers/registered-general-nurse-home-care/apply | 171,046 | 204 | 32 | 0.0008 | 0.00% |
| /contact | 173,784 | 505 | 40 | 0.0004 | 0.00% |
| /performance-page-that-does-not-exist | 163,676 | 163 | 40 | 0.0000 | 0.00% |
| /privacy | 167,417 | 204 | 32 | 0.0029 | 0.00% |
| /request-a-quote | 173,784 | 618 | 32 | 0.0006 | 0.00% |
| /services | 167,417 | 529 | 32 | 0.0005 | 0.00% |
| /services/child-care | 164,996 | 471 | 32 | 0.0009 | 0.00% |
| /services/chronic-condition-care | 164,996 | 608 | 48 | 0.0013 | 0.00% |
| /services/elderly-care | 164,996 | 466 | 48 | 0.0010 | 0.00% |
| /services/home-nursing-care | 164,996 | 467 | 48 | 0.0011 | 0.00% |
| /services/hospital-and-clinic-staffing | 164,996 | 603 | 32 | 0.0384 | 0.00% |
| /services/maternity-and-newborn-care | 164,996 | 487 | 48 | 0.0018 | 0.00% |
| /services/palliative-care | 164,996 | 467 | 48 | 0.0010 | 0.00% |
| /services/school-nurse-staffing | 164,996 | 466 | 48 | 0.0011 | 0.00% |
| /terms | 167,417 | 204 | 32 | 0.0005 | 0.00% |

### Finding 4 — current sidecar ready for review

`.impeccable/design.json` now uses current normative colour/type keys, OKLCH ramps,
Theme 6 public components, the assembling Mission cross and Vision globe, and
green admin navigation/actions while preserving the blue New status. Ten
self-contained token-bound component previews rendered without overflow.
Contract tests check token/reference parity and narrative copied from DESIGN.md.
DESIGN.md remains authoritative; subsequent D139 spacing fixes and D140 share
previews are documented there.

### Additional user requests verified

- **Shared-link previews (D140):** branded 1200 × 630 cards with the original
  logo, current colours, published page headline and domain. WhatsApp crawler
  responses for all 19 published launch routes, plus Home for Facebook, X,
  LinkedIn and Slack, carry complete initial-head metadata and absolute OG/Twitter
  image URLs. Generated PNG dimensions and sub-300 KB size passed on standalone.
  Cards were visually reviewed, including a long headline. Live platform caches
  still require checking after authorized deployment.
- **Uploads (D141):** full conversion errors now reject damaged images before
  storage. Adversarial endpoint tests reject disguised programs and oversize
  images/brochures; private-CV rejection, bounded reads, re-encoding and decoded
  dimension limits are covered. See [the focused upload review](2026-11-01-upload-security.md).
  The user explicitly deferred malware scanning to a decision before launch.

### Validation of this follow-up

- Complete unit/contract/local-MySQL run: **345 files, 1,224 tests; 100%** of
  statements, branches, functions and lines. Final spacing-only adjustment:
  16 affected unit/contract tests passed and six phone/desktop opening, axe and
  self-hosted-font browser checks passed.
- Complete functional browser run: 188 passed, 43 intentional skips, one new
  fixture assertion failed because zero-filled oversize data hit the type check
  first. Corrected that fixture to carry a valid signature; all three focused
  media browser tests then passed. All functional scenarios are covered by the
  full run and affected follow-ups; this is not reported as a fresh single
  189-pass run.
- Final isolated performance run: **40 passed (9.1 minutes)**, no retries.
- Lint, format, typecheck, standalone build and dependency audits passed. The
  97 shipped packages have no known moderate-or-higher advisory in that audit.
- The logo and share typeface are present in standalone output. Lighthouse is
  development-only; no new performance script ships to visitors.
- No migration, new environment variable, production-server change, commit or push.

## Follow-up — harden and polish (D142)

The subsequent harden/polish pass fixed the identified 44 px touch-target surfaces
(numbered finding 2), submission races, pending-control overrides, long-content
wrapping and phone sign-in spacing. All 40 new performance cases passed.
[The D142 report](2026-11-01-impeccable-harden-polish.md) records the exact scope,
verification and current measurements. Earlier evidence and the original score
remain historical. Persistent-motion finding 1 / Q49 remains unresolved.
