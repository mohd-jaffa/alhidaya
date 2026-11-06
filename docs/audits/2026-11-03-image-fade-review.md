# Image openings, slider pill and mobile navigation — D157–D160

Status: ready for review after final local validation; uncommitted. No production action.

## Approved behavior

Home, About and main Services use full-width opening photographs, with navy dimming behind light copy and a sky-tinted heading phrase. D160 supersedes the earlier header-gradient prototype: the navbar stays solid soft white, with the original coloured logo and navy navigation. The photo and its dimming overlay fade gradually at their top through a static 192 px alpha mask into the matching light base. Neither the logo nor the controls fade. Other routes and text-only inner-page openings retain their ordinary header/layout. The existing header scroll-away/return/focus behavior, slide timing, progression-only indicators, opening reveals and reduced-motion paths remain.

Pages → Home → Page header → Hide the slider pill controls the stored note/icon pill independently from the progress indicators, through authenticated draft/preview/publish. Legacy records remain visible unless explicitly hidden. The local published pill is hidden; note/icon content is preserved. No SQL migration.

The mobile menu’s WhatsApp and Call labels fit and remain centred side by side at 320, 360, 390 and 414 px. Their existing contact links and proper WhatsApp mark remain. The shared download-button label is Brochure, with its download icon and behavior; Request a quote remains the fallback when no brochure has been published.

## Verification

Full source coverage passed 1,276 tests across 355 unit/contract/local-MySQL files: statements 4,788/4,788, branches 3,074/3,074, functions 1,770/1,770 and lines 4,250/4,250, all 100%. After the later CSS refinement and brochure test-fixture correction, 11 focused token/sidecar/HeaderAction tests passed. Final lint, typecheck, formatting and standalone build passed. The first browser pass’s two failures came from assuming the intentionally brochure-free launch test fixture contained a brochure; the actual published-brochure workflow now verifies its short label/icon on desktop and mobile, while the contact-fit test checks the unchanged fallback.

All 20 final initial-JavaScript sizes pass the unchanged 174,080 gzip-byte limit: maximum 174,075, five bytes spare. Future shared-client changes must be measured. See the common final size report. New work adds no client-side route/brightness logic or dependency. Final browser/performance results follow below.

## Limits

Responsive visual checks cover the actual built pages at 390 and 1440 px; the mobile menu is checked through 320–414 px. Axe and keyboard checks are automated browser evidence, not a whole-site WCAG certification. The existing Q49 persistent-motion release decision, physical-device/compositor, screen-reader, other-browser and production-region checks remain. There is no hosting, infrastructure or production-server change. Nothing is staged or committed.

## Final result

The built-app workflow passed 27 checks with one intentional skip on phone/desktop, covering note visibility preview/publish/restore, contact labels at 320–414 px, the actual published brochure’s label/icon on desktop/mobile, automatic slides, keyboard use and axe. Performance then caught a real desktop About font rewrap (CLS 0.0592). Reserving three heading lines keeps the next section still while longer headings can grow. The final delayed-font/layout/axe follow-up passed seven checks with one intentional skip; no assertion or budget was relaxed.

All six final isolated performance checks pass on Home/About/main Services: maximum mobile lab LCP 754 ms, scripted INP bound 56 ms, combined CLS 0.0420, Lighthouse categories all 100, no scrolling long task at the observer threshold and 0% desktop missed-vsync estimate. See `2026-11-03-image-fade-performance.json` and `../PERFORMANCE.md`. The fixed title box remains stable through the delayed-font regression; individual word wrapping contributes the remaining measured About CLS. Physical-device and production-region limits remain as described above.

All 20 final initial-JavaScript sizes pass at 174,075 gzip bytes maximum. Local Home’s pill remains hidden with its note/icon retained. About/main Services opening actions and the Careers opening retain their previously requested hidden states. No migration, dependency, production change or commit.
