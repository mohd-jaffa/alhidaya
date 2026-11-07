# D190 — Per-placement image focal points

The user authorized the existing formatting/manual commit first (`afb4d42`), followed by focal points in a separate commit. They chose per-placement framing rather than one shared Media Library setting.

## Implementation

- Existing page and service photo fields expose an inline “Adjust photo framing” disclosure after a photo is selected. Select a subject on the uncropped original using click/tap, or use labelled native x/y percentage ranges. Reset removes the override. Wide, square and portrait examples update immediately; page Preview shows the actual layout.
- Optional whole-percentage coordinates (0–100 on each axis) live beside mediaId in the existing content JSON. Save, authenticated Preview, Publish and Discard retain the owning page/service transaction, audit and cache lifecycle. Independent references to one photo remain independent. Service selections carry their framing into the opening, service lists/related cards and Home pyramid.
- Only explicit coordinates add object-position to the existing responsive image. Legacy references preserve desktop/mobile defaults and intrinsic dimensions. Logos have no framing control and retain their existing contain-fit output. There are no new uploads, tables, migrations, dependencies, image variants, runtime resizing or public interactions.
- The point target has a dual-contrast navy/white ring, native focus, labelled keyboard equivalents and shared pending-fieldset protection. Photo thumbnails now cap their width when text is enlarged; example captions wrap in narrow columns.

## Publishing failure found during regression

The first complete final browser run exposed stale public reads in focal points and existing font/page/footer/client publishing journeys. The installed Next 16.4.3 built-in handler stamps tag expiry using Date.now but checks it against performance.timeOrigin + performance.now. A local deterministic reproduction with a skewed monotonic clock returned false for a just-expired tag; a matching [upstream report](https://github.com/vercel/next.js/issues/99710) describes the same comparison (auto-closed for missing reproduction link, not a confirmed upstream fix).

The existing cache wrapper now appends per-tag publish revisions to its keys and increments exactly the invalidated tags before calling the unchanged revalidateTag API. Revisions are process-shared across route bundles/HMR; the existing bounded Next cache and D119 single-process/memory-only deployment stay. No timestamp wait, disabled cache, relaxed assertion, retry, new cache handler, table or external service. A unit regression deliberately retains stale framework entries and moves the wall clock backwards: the next matching read is fresh, unrelated tags remain cached, and module reloads retain revisions. Final browser gates exercise the affected real publishing flows.

## Validation

Unit coverage includes coordinate edges, empty targets, source independence, reset/replacement, logos, parser validation and rendering. Local-MySQL tests verify JSON draft/published isolation and discard. Browser checks exercise real editor preview/publish/discard, route authorization, invalid points, mouse/touch/keyboard control, independent About/service uses, Home pyramid, crop examples and responsive/enlarged layouts.

## Boundaries

Tests use the separate local database and temporary image/CV folders. Actual published content and private drafts are not edited. Existing physical-device/browser, screen-reader and production-region release checks remain. No push, deployment or client-server change is part of this work.

## Final results

- Unit/DB-contract/local-MySQL: **1,388 tests in 374 files**, 100% statements, branches, functions and lines.
- Production phone/desktop regression: **274 passed, 62 intentional skips, zero failures** (10.6 minutes). The targeted publishing rerun passed 13 cases with one intentional skip.
- Development hydration: two cases / 46 navigations passed, with no mismatches or uncaught errors.
- Mouse/touch/keyboard framing, private preview, publish/discard, invalid-point/auth refusals, independent references and service cards/Home pyramid were verified. Editor and public geometry passed at 320/390/768/1440 px; editor also passed doubled text at 320 px.
- Lint, TypeScript, formatting, standalone build, diff/secret checks and the five-file Impeccable scan passed; no primary design findings. Full-control phone/desktop screenshots were visually reviewed.
- All **40 performance cases passed** on build `JFI8gFRSKn_HhB5BWmAgr`: initial JS ≤173,789 / 174,080 gzip bytes, LCP ≤687.1 ms, scripted INP upper bound ≤64 ms, combined CLS ≤0.0000000, minimum Lighthouse category 96, observed scroll long task maximum 0 ms and desktop missed-vsync estimate 0.0%. No retries or relaxed thresholds.
- All 969 source/test hashes stayed unchanged during the final gates. Final standalone review build runs on port 3210 with the existing Cloudflare URL. Opening the actual service editor confirmed the control without changing its content or draft.

Evidence: [validation](2026-11-07-focal-points-validation.json), [performance](2026-11-07-focal-points-performance.json), [design scan](2026-11-07-focal-points-detector.json), [phone control](2026-11-07-focal-point-phone.png), [desktop control](2026-11-07-focal-point-desktop.png). Local detailed logs: `/private/tmp/alhidaya-focal-*verified.log`; raw browser/performance artifacts stay in ignored `test-results/`.
