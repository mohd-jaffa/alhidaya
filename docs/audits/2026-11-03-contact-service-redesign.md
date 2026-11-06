# Public-page refinements — D145–D156

Status: ready for user review after final local validation; uncommitted. No production action.

## Current approved result

- Contact keeps the white typewriter opening and pastel-blue Reach us ribbon. Its rounded pastel-green message panel sits on a pastel-blue backdrop (the user clarified that the backdrop alone changes). Send us a message, the static map, Visit our office, address and directions are at the left; the white form card is at the right. Both map and form use the existing float shadow. The former overlapping form is superseded. Phone layouts stack office information then form. Reach us, nav and footer stay unchanged.
- Home’s short quote follows the supplied screenshot with the requested pastel-blue correction: an inset rounded surface, navy heading/supporting words and three contact tiles left; a plain white rounded form card with float shadow right. Name/mobile and email/service retain paired rows; message guidance moves into its placeholder. The former blue title strip is removed. Existing consent, validation, bot protection and submission behavior remain on both forms.
- About’s Mission and Vision react as whole cards: 12 px uplift, 24 px forward depth, 1.035 scale and opposing five-degree tilts, with a shadow and full-card light sweep. The cross/globe graphic sequences support the card response. GSAP owns the scene-wrapper entrance; the article owns hover/focus transforms, fixing the first-navigation normalisation to inline `none`. Reduced motion keeps a static highlight.
- The main Services page’s All services section alone uses one pastel-green compact-card grid, with all services in published admin order and no audience headings/actions. Its Talk to us is pastel blue. Other sections remain.
- Service details follow Care editorial: blue title, summary, tall arched portrait, pastel-blue About, no Who it is for/24-hour panels, and optional admin-controlled header actions (up to two, hidden by default). Other services uses three distinct random published services from the full catalogue, excluding the current service; fewer only if fewer than three others exist overall (D155 removes the legacy audience filter).
- About and main Services each expose a Pages → Page header visibility switch for their existing opening actions. Both are off in the local published preview; enabling them still uses draft/preview/publish. Individual service-detail label/link controls remain separate.
- Careers’ retained opening can move, hide and restore in the Pages editor. It is to remain hidden in the final local preview, with all copy/photo preserved. Open jobs supplies the h1 when hidden. Other page locks remain.
- Every WhatsApp icon uses the standard Font Awesome Free brand SVG, locally served/reused with SVG use. The floating shortcut is WhatsApp green with the white logo, an explicit user-requested brand-colour exception. Attribution/licence: `docs/brand/icons.md`.

Public content still uses published copies, admin preview stays authenticated, form consent/bot checks and server behavior remain, and no dependency, database column, migration, scanner, hosting change or production action is added.

## Evidence and validation scope

A full pre-final-markup pass passed 1,265 tests across 355 files at 100% statements/branches/functions/lines. A later database check was invalidated by two overlapping test runs; it was discarded. An overnight interruption then caused unrelated worker/timeouts; that result was discarded. Final checks are run sequentially with fewer unit workers, with no relaxed assertions or budgets. Final counts and browser/performance results are appended below.

The earlier full built-app suite passed 203 cases with 45 intentional skips before the final related-card/form revisions. A subsequent 84-case run found three issues on phone and desktop: an incorrectly scoped test locator, an axe visitor-context setup issue, and the real first-entry GSAP/hover transform collision. Those are fixed and receive final targeted checks; the earlier suite is not claimed as a new final-build full run.

A scoped Impeccable detector reported no findings before the later refinements. Final refinements receive visual and automated browser verification; no second detector pass is claimed. Final responsive captures cover 390 and 1440 px; earlier Contact/service captures also cover 320 and 768 px. First client navigation now reports a 12 px lift and 1.035 scale with no inline article transform override.

Smooth-scroll setup moved to the deferred runtime to retain the original 174,080 gzip-byte JavaScript limit. Unused retired labels/control glyphs were removed, and the standard brand path is a static SVG rather than initial JavaScript. The final all-route size report is `2026-11-03-redesign-bundle-sizes.json`; budgets are unchanged.

## Limits

Q49’s persistent stop mechanism remains a release decision for requested automatic motion, including Contact’s typewriter. Reduced motion, keyboard and axe checks are not a whole-site WCAG certification. Lab input/frame proxies do not replace physical-device/compositor, screen-reader, other-browser or production-region checks. No client server or deployment was changed. The only developer-content updates are the explicitly requested hidden Careers opening and hidden About/main Services opening actions.

## Final validation

The final source passed all 1,271 tests across 355 unit/contract/local-MySQL files with 100% statements (4,788), branches (3,067), functions (1,770) and lines (4,250), using four workers without changing assertions or thresholds. Lint, typecheck, formatting and standalone build passed. Build `NeuDoY-tls_g0bBcMQcAE` passed all 20 initial-JavaScript sizes; maximum 174,079 gzip bytes against 174,080 (one byte headroom). The limit is unchanged and very tight; future shared-client changes must be measured.

Final targeted built-app checks passed 27 cases with one intentional skip, on phone and desktop, including axe, first client-navigation Mission/Vision hover, layouts and shadows, WhatsApp marks, School nurse staffing’s three related services, service header controls, Careers movement/visibility, and About/main Services action switches through preview/publish/hide.

All 14 isolated performance cases passed: seven affected routes with mobile Lighthouse/runtime and desktop scroll checks, no retries. Maximum mobile LCP 686 ms, scripted INP bound 56 ms, combined measured CLS 0.0349, minimum Lighthouse category 100; no scrolling long task at the observer threshold and a 0% desktop missed-vsync estimate. The unchanged budgets passed. See `2026-11-03-page-refinements-performance.json` and `../PERFORMANCE.md` for per-route figures and lab limits. This targeted run supplements the historical full-route evidence; it is not a new full-route performance run.

No SQL migration, dependency or production update is needed. Local content retains Careers hidden and the About/main Services opening actions off. Nothing is staged or committed.
