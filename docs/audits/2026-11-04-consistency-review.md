# App consistency and approved refinements — D172–D179

2026-11-04, with the requested map-shadow follow-up on 2026-11-05. Local review only. No staging, commit, push, deployment or client-server changes. Existing drafts, font choices and the user's unsaved Font Manager tab are preserved.

## Verified findings and fixes

| Area | Finding | Result |
|---|---|---|
| Public navigation | Text-only, legal and application routes used different navbar heights/surfaces. | Shared soft-white 64/76/100 px phone/tablet/laptop geometry; only photo openings overlap it. |
| Brand | Header/footer logos could stretch in constrained columns; shine mask did not match contain fitting. | Contain-fit logo and centred contain mask; original colours and shine timing retained. |
| Touch targets | Narrow admin menu buttons and short standalone links could fall below 44 px. | Menu, editor back links, pagination, activity/media destinations and footer links retain full targets. |
| Enlarged text | The admin header, fields, switches and reorder controls could overflow at doubled text on a narrow phone. | Shrinkable logo, zero-minimum grid tracks, bounded controls and wrapping actions/switches. |
| Motion | Client logos interpolated filters on hover. | Static grayscale/colour state change; no animated filter. Existing loop and pause conditions remain. |
| Services gap | A redundant section gap separated the image opening and green catalogue. | The catalogue meets the opening; hidden sections remain omitted by published/preview reads. |

## Approved design work

- Home quote icons: WhatsApp-green square; navy Call/Email squares.
- Contact: off-white rounded channel cards, bold terms and independent first-hover/focus lift. Deep blue continues behind Reach us and the rounded green message panel; white form/map shadows and all form behaviour remain.
- Careers: approved nurse-photo accent with a visible two-layer shadow and no border. Green-gradient rounded card on mist, compact outer spacing, full-width mobile introduction, unchanged job/application links. Fixed-width decorative dots cycle one/two/three; reduced motion is static. Photo uses the existing draft/preview/publish and media workflow. No SQL migration.
- About/Services Talk to us: rounded off-white channel cards, navy Phone/Email squares, shorter Call us label.
- No service category labels, grouped catalogues, audience selector/list terms or category share-image caption. Historical stored values remain compatible; services and order are preserved.
- Contact map: Google satellite replaces the authored street diagram, with an accessible lazy iframe, rounded frame and dedicated two-layer navy shadow. Published business/area query or confirmed admin pin; no guessed coordinates, API key or SDK. Narrow and enlarged-text sizing explicitly constrains the frame to its column while retaining at least 200 px in each dimension. Privacy disclosure added to seed and local review content, preserving unrelated drafts with a recovery copy.
- About: approved Promise triptych replaces the points. Blue/green/mist panels reveal in sequence. Only the subtle diagonal sheen moves on hover; cards never lift, scale or tilt. Description and image in Who we are share a top edge on wide screens; mobile and Home retain their order/layout.

## Verification

Build `xi6uZU75_ddlMNiFdwfpo`. Lint, typecheck and formatting pass. Full unit, database-contract and local-MySQL integration coverage: **1,309 tests in 365 files passed**, with 100% statements (4,869), branches (3,162), functions (1,799) and lines (4,328).

Responsive matrices passed: 612 public/admin layout states at nine phone/tablet/landscape/laptop sizes, 405 supported-font/size cases across Contact cards, Careers and About values, plus 33 routes at 320 px with doubled text. Public heading/link parity and axe matrices passed. The final map matrix adds normal/doubled text at eight widths.

The D179 focused run passed 46 journeys and skipped nine duplicate-project cases. Its new map matrix caught the aspect ratio imposing a 300 px intrinsic width on a 320 px phone; explicit full width and zero minimum width corrected it. The corrected map and stronger shadow pass the final Contact follow-up: **7 passed, 1 duplicate-project skip**, including all sixteen width/text-size map cases. Live Google satellite rendering and the visible two-layer shadow were reviewed in disposable Chromium at 390 and 1440 px. [Phone](2026-11-05-contact-map-390.png), [desktop](2026-11-05-contact-map-1440.png), [provider/frame evidence](2026-11-05-contact-map-live.json).

All twenty public routes pass the initial JavaScript budget; maximum 173,402 / 174,080 gzip bytes. All twelve performance checks pass on the final build: mobile Lighthouse/runtime and desktop scroll across Home, About, Services, Careers, Contact and Privacy, with live Google requests enabled. Maximum mobile lab LCP **722.46 ms**, scripted INP bound **64 ms**, combined CLS **0.04192**, minimum Lighthouse category **99**; no scroll long task at the observer threshold was recorded. [Performance evidence](2026-11-04-consistency-performance.json), [all-route initial JS](2026-11-04-consistency-route-js.json). No budget was raised.

The complete pre-About-delta browser run passed 242 journeys with 56 duplicate-project skips. Its two Contact assertions still expected the superseded pastel-blue backdrop; they were updated to the user's approved deep blue and are included in the final follow-up. All publishing journeys passed in the clean run. Earlier cache interference was avoided by stopping the review server while the test server uses the same standalone folder/cache with its separate local test database.

## Scope and practical limits

Responsive evidence uses emulated Chromium at 320/360/390/414/640/768/844-landscape/1024/1440 px, plus a narrow 200% text check. Uniform font matrices cover all fifteen families, not every mixed assignment permutation. Inline prose links and deliberately overlapped/carousel content are treated according to their actual interaction geometry. Physical Safari/iOS/Android, screen-reader review, server-region latency and client-owned launch facts remain separate release checks.

The user explicitly requested the Google map, superseding D34’s no-embed choice for Contact. Google receives map connection information as disclosed in Privacy. No new dependency, design setting, upload type or production operation was introduced. Five Values concept boards were delivered; the user approved concept one. Other concepts remain review artifacts.

## Handoff

R6C.32/.33/.35/.36/.37/.39/.40/.41 are complete for local review (2026-11-05). The local preview is restored at `http://localhost:3210`. Nothing was staged, committed, pushed or deployed.
