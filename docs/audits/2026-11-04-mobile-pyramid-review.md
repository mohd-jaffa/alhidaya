# Mobile Home services pyramid — D171 / R6C.31

Date: 2026-11-04. Production build: `EJwKWwl5_ArglqaSUt2lQ`. Local review only; nothing staged, committed, pushed, deployed or changed on the client's server.

## Finding and fix

The phone controller deliberately limited the pyramid to three visible cards and placed neighbors 36% of the stage width apart. Laptop used five cards at 18.1% spacing. This changed the composition and clipped most of the phone's rear cards.

Keep five depth positions on both. Phone spacing is now 16%, with the main card at 60 cqw capped at 16 rem. Retain 30 px steps, 88%/76% rear scales, softened photos and the existing full title/link panels. The outer pair peeks through the phone edges; the selected card stays readable and can be opened directly. Laptop sizing/spacing is unchanged. No new dependency, runtime mechanism, content, CMS control or data change.

## Verification

- Full unit, database-contract and local-MySQL integration suite: **1,299 tests in 364 files passed, 100% statements/branches/functions/lines**. Existing mobile resize/RTL regression now verifies five accessible depth positions and the retained 60 px second step. Focus, timers, reduced motion, visibility and cleanup remain covered.
- Built-app E2E: **4 passed, 2 duplicate-project skips**. Existing six-second advancement, manual arrows, keyboard pause, reduced motion and axe checks pass on phone and laptop. Synthesized Chromium touch verifies horizontal swipe, vertical page scrolling across the carousel without selecting a different card, and opening the next tapped service.
- **624 active-card cases:** all eight services through a full wrapped cycle at 320/360/390/414/640 px with all fifteen families, plus 768/1024/1440 px with the default. Five card bounds intersect the viewport; no document overflow, selected label overflow or clipped words; the active card remains at least a 44 px touch target. This tests uniform family assignments, not every possible mixed-family permutation.
- Separate JavaScript-disabled checks on the actual local preview at 390/1440 px retain all eight service names and destinations.
- Lint, typecheck, formatting and production build passed. Scoped Impeccable layout detector returned no findings. Phone 320/390 px and laptop screenshots reviewed: the same five-layer silhouette, centre emphasis, stepped/dimmed rear cards and existing controls are retained. Partially overlapped rear labels become fully readable when their card moves to the centre.

## Performance

Both Home performance gates passed. Mobile Fast 4G / 4× CPU: LCP **596.83 ms**, CLS **0**, scripted INP bound **80 ms**, all Lighthouse categories **100**, initial JavaScript **173,059 / 174,080 gzip bytes**. No observed touch-scroll long task. Laptop scrolling: CLS **0.001813**, no observed long task and **0%** missed-vsync estimate. Detailed measurements: `2026-11-04-mobile-pyramid-performance.json`.

## Artifacts and limits

- `2026-11-04-mobile-pyramid-labels.json`: 624 active-card observations.
- `2026-11-04-mobile-pyramid-320.png`, `2026-11-04-mobile-pyramid-390.png`, `2026-11-04-mobile-pyramid-768.png`, `2026-11-04-mobile-pyramid-1440.png`: screenshots from the actual built app.

Viewport and touch evidence comes from emulated Chromium and CDP-generated touch input; physical iOS/Android and Safari are not certified by this pass. Existing admin work, including unsaved choices in the user's open Font Manager tab, is preserved.
