# Public mobile Adapt and shared photo openings — D161–D164

Status: ready for user review; final source, browser and full-route performance checks passed. Uncommitted. No production action.

## Result and scope

Impeccable Adapt, with the user’s confirmed scope of public website/mobile menu only. The existing Theme 6 palette, copy, information order, fields, motion/reduced-motion behavior and 30 px Home services steps remain. Phone proportions below 768 px use headlines starting at 32 px, 28 px section headings, 17 px supporting text, 16 px body/inputs and a 40 px section rhythm. Intro photos crop more compactly; Mission/Vision art/padding and related-service thumbnails become smaller; form cards leave more usable width. Phone footer navigation reflows to two columns while retaining every link; menu rows are shorter and scroll in short landscape. Admin styles remain.

At 390 px, Home’s opening is 620 px (formerly 780), its headline 32 px (42), supporting text 17 px (21), Mission’s panel about 309 px (470) and form inputs remain 48 px high with 16 px text. The optional hidden Home pill keeps its content and can still be enabled by the admin; its visible state reserves extra lower space. See `2026-11-03-mobile-adapt-layouts.json` for 320/390/768/1440 measurements. Main-page desktop metrics stay unchanged; the two following explicit user changes apply at all widths.

D162 keeps the public navbar at the document top, scrolling away naturally and never returning on upward scrolling farther down; remove its scroll listener/state. Active-page pill motion, menu and controls remain. D163 gives Careers/Contact the same soft-white navigation surface as the other main pages. D164 extends the current gradual image-fade composition to individual services: title and summary over the dimmed full-width image, image top fading into the solid white navbar. Preserve optional published header buttons, text-only no-photo fallback, pastel-blue About and three compact related services. Short service titles keep their summary close. This supersedes the earlier arch opening, including its intermediate phone crop.

## Verification

Final complete source: 1,275 tests / 355 files passed at 100% statements (4,767), branches (3,061), functions (1,765) and lines (4,232). Lint, typecheck, formatting and standalone build passed. The lower test count removes an obsolete test for the deleted scroll-return feature; coverage thresholds stay unchanged.

An initial broad browser pass passed 93 checks with four intentional skips and caught a real 40 px footer-logo link after its image became smaller. The link now retains an independent 44 px minimum target; focused unit verification and the final browser follow-up pass. Final targeted built-app follow-up: 47 passed, three intentional skips, including all 20 public templates with axe on phone/desktop, 320/414 px phones, tablet and short landscape, 200% text enlargement, first navigation/hover, non-sticky navigation, matching header colours, Home pill preview/publish/restore, service actions through editor/preview/publish, and proper WhatsApp marks. The preceding broad pass also covered working Contact/Quote/CV submission/error journeys.

Real synthesized Chromium touch verifies a horizontal services swipe, subsequent tap navigation, and vertical scrolling over the custom carousel without changing the selected service. Viewport screenshots are only layout evidence; this is not physical iOS/Android or Safari evidence.

Repeated historical test seeds filled the shared local media allowance. Final browser/performance runs use isolated temporary image/CV folders. Old unreferenced image variants, verified byte-identical to referenced seed images, were moved to a reversible temporary quarantine, recovering 237,742,630 bytes from the preview media folder. Every actual/test database reference and all other uploads remain untouched. No database/production content was deleted or upload budget increased. No new runtime infrastructure, dependency or migration.

All 20 final initial-JavaScript budgets pass, maximum 173,894 gzip bytes against 174,080, 186 bytes spare. All 40 final serial performance cases passed across the 20 public templates, including their desktop scroll counterparts, with unchanged budgets and no retries. Maximum mobile lab LCP 735.3 ms, scripted INP upper bound 64 ms, combined CLS 0.04192, minimum Lighthouse category 96, no scrolling long tasks at the observer threshold and 0% desktop missed-vsync estimate. See [full measurements](2026-11-03-mobile-adapt-performance.json) and [performance report](../PERFORMANCE.md). Final build: `Lvrq97SaI_O7gc0qkYK55`.

## Limits

All evidence is local Chromium lab/emulated viewport or synthesized touch evidence. Physical iPhone/Android, other browser engines/screen readers, compositor/field responsiveness and the server-region response checks remain release checks. The existing Q49 automatic-motion stop decision remains open; axe/Lighthouse is not a whole-site WCAG certification. No client server, deployment, staging or commit.
