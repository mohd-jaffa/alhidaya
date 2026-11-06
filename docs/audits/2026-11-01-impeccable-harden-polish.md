# Impeccable harden and polish — D142

2026-11-01. Scope: the current public site and admin interface, preserving Theme 6,
content, the green admin palette and the approved motion. Ready for review;
no commit, push or production change. This is a refinement pass, not a redesign
or a claim of complete accessibility/security certification.

## Confirmed defects repaired

- **Duplicate submissions:** repeated public form submits while the lazy schema
  loaded could reach the server twice. Admin mutation hooks also accepted
  simultaneous calls. Immediate per-hook locks now cover validation, the request
  and revalidation, unlock after failures, and preserve entered form values.
  Successful public forms do not resubmit.
- **Pending controls:** `disabled={false}` could overwrite the shared button
  families’ pending lock. Pending now takes precedence for disabled/busy state.
  Regression tests reproduced these four failures before the fixes.
- **Long content:** an unbroken heading/email widened the 390 px page to 1,594 px.
  Resilient wrapping and bounded word masks keep complete text readable. An
  additional highlighted-heading case had 2,152 px of internal overflow despite
  a fitting document; highlighted phrases and punctuation groups now use bounded
  containers, with short phrases remaining together when they fit.
- **Targets:** desktop navigation, footer, authentication, standalone section
  links and the phone admin logo use the existing 44 px minimum. Footer gaps
  were adjusted to retain a compact rhythm. Logos and social marks retain their
  visual size; their targets grow around them. This resolves the original audit’s
  numbered touch-target finding 2 for the identified surfaces.
- **Phone sign-in:** the grid no longer assigns free vertical space to its brand
  band. It sizes to the logo and existing padding; the white form area receives
  the remaining space. Desktop retains its full-height side panel.
- **Editable navigation:** beyond five visible links or 42 total label characters,
  the existing full menu is available at desktop widths too. All saved links and
  the header action remain reachable. These capacity defaults are for review
  (Q53), not new limits on what the CMS may save.

A measured 1024 px check found no logo/navigation overlap; no breakpoint change
was made. No new animation, dependency, translation, factual claim, content
control, database table or environment variable was added.

## Verification

- Complete unit/contract/local-MySQL run: **345 files, 1,227 tests passed**, with
  100% statements, branches, functions and lines. Subsequent word-wrapper/target
  class corrections passed 17 affected unit/contract tests without adding
  application branches. Pending controls also test explicit false busy/disabled
  props.
- Complete built phone/desktop browser run: **195 passed, 45 intentional skips**
  (5.7 minutes). After the final word-wrapper correction: **32 affected browser
  checks passed**, four intentional skips, including width/axe coverage of every
  public page at 320, 768 and 1024 px. The final phone admin target/menu/sign-out
  journey also passed. These follow-ups are distinguished from the complete run.
- A real saved/published test-site change supplied ten long navigation labels.
  Every link remained reachable at 1440 and 390 px; keyboard focus brought the
  last link into view; Escape closed the menu and returned focus. Original content
  was restored through the same admin APIs. Only the local test database was used.
- Long-heading tests render the actual Words/SettleText components, inject their
  trusted test markup and check internal scroll width as well as document width.
  They do not merely remove or clip overflowing text.
- Home, About, Contact and sign-in were checked with **200% text enlargement**;
  local visual/overflow checks covered 390, 768 and 1440 px. Rendered phone sign-in,
  public layouts and the desktop green admin were visually reviewed.
- Source detector: **zero primary findings**, 11 unchanged advisories (email-only
  formatting and an image fixture colour), recorded in
  [the scan output](2026-11-01-harden-polish-detector.json). This is not proof of
  visual quality; rendered interactions were checked separately.
- Typecheck, lint, formatting and the production standalone build passed.

## Final isolated performance run

**40 passed in 9.2 minutes**, with unchanged budgets and no retries.

| Metric | Local result | Gate |
|---|---:|---:|
| Largest initial modern JS | 173,897 gzip B | ≤174,080 B |
| Highest mobile lab LCP | 621 ms | ≤2,000 ms |
| Highest scripted INP bound | 72 ms | ≤150 ms |
| Highest measured CLS | 0.0386 | ≤0.05 |
| Lowest Lighthouse category | 96 | ≥95 |
| Desktop missed-vsync estimate | 0% | <5% |
| Scroll tasks observed above 50 ms | None | None |

Initial JavaScript has **183 bytes spare** on the most expensive routes. Deferred
post-paint motion remains 50,245 gzip bytes, accounted separately under D65.
Zero long-task records means none reached the observer’s threshold, not that all
JavaScript took zero time. Frame cadence and scripted interaction timings are
local lab evidence, not physical-device or field certification.

[Raw per-route evidence](2026-11-01-harden-polish-performance.json) records the
exact build, browser and event/shift attribution. The earlier D139 evidence is
preserved separately; it has not been overwritten with this pass’s measurements.

| Route | Initial JS (gzip B) | LCP (ms) | Lab INP bound (ms) | Max CLS, phone/desktop | Desktop missed-vsync estimate |
|---|---:|---:|---:|---:|---:|
| / | 173,897 | 545 | 72 | 0.0348 | 0.00% |
| /about | 167,902 | 530 | 32 | 0.0013 | 0.00% |
| /careers | 167,902 | 469 | 32 | 0.0134 | 0.00% |
| /careers/apply | 171,148 | 208 | 40 | 0.0004 | 0.00% |
| /careers/registered-general-nurse-home-care | 164,729 | 204 | 32 | 0.0007 | 0.00% |
| /careers/registered-general-nurse-home-care/apply | 171,148 | 204 | 32 | 0.0008 | 0.00% |
| /contact | 173,897 | 528 | 32 | 0.0004 | 0.00% |
| /performance-page-that-does-not-exist | 164,162 | 162 | 32 | 0.0000 | 0.00% |
| /privacy | 167,902 | 204 | 32 | 0.0029 | 0.00% |
| /request-a-quote | 173,897 | 621 | 32 | 0.0006 | 0.00% |
| /services | 167,902 | 510 | 32 | 0.0005 | 0.00% |
| /services/child-care | 165,490 | 467 | 32 | 0.0010 | 0.00% |
| /services/chronic-condition-care | 165,490 | 606 | 40 | 0.0013 | 0.00% |
| /services/elderly-care | 165,490 | 491 | 32 | 0.0010 | 0.00% |
| /services/home-nursing-care | 165,490 | 470 | 40 | 0.0011 | 0.00% |
| /services/hospital-and-clinic-staffing | 165,490 | 466 | 32 | 0.0386 | 0.00% |
| /services/maternity-and-newborn-care | 165,490 | 468 | 32 | 0.0018 | 0.00% |
| /services/palliative-care | 165,490 | 489 | 32 | 0.0010 | 0.00% |
| /services/school-nurse-staffing | 165,490 | 465 | 32 | 0.0011 | 0.00% |
| /terms | 167,902 | 204 | 32 | 0.0005 | 0.00% |

## Remaining decisions and release work

- **Q49 remains open:** a persistent motion-stop mechanism compatible with the
  user’s progression-only hero and client-logo choices. Rejected slider controls
  were not restored. Do not claim full WCAG conformance from the automated checks.
- **Q52 remains the agreed before-launch decision:** malware scanning. Upload
  type checks are not a virus-free guarantee; this pass adds no scanner/service.
- Q53 records the reviewable navigation/sign-in defaults.
- Physical-device touch/compositor review, screen-reader speech, Safari/Firefox,
  field responsiveness, server-region timings and live social caches remain
  separate release verification. No production-server change was attempted.
