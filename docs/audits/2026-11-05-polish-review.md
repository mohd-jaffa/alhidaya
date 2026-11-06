# Impeccable polish — D181

2026-11-05. Public Persuade and admin Operate surfaces; preserve Theme 6, the scoped green admin theme, approved content and all earlier user refinements. No commit, push, deployment or client-server action.

## Method and scope

Used the installed Impeccable 4.8.0 skill at `/Users/jaffa/.claude/skills/impeccable/SKILL.md`: context once for the public entry, polish playbook, full DESIGN.md, both surface briefs and craft floor before UI edits. Neither public nor admin target had a current critique snapshot to process; no snapshot was closed. No concept change or new product decision was needed.

Inspected 27 current public/auth renders at 390/768/1440 px, including Home, About, Services, service detail, Careers, Contact, quote, general application and sign-in. Baseline geometry had no document overflow. Checked approved typography, image fade, contact colours/shadows, icon alignment, card shapes, footer, real content and browser-surface styling. Existing design remains the visual authority; no added animation or factual copy.

## Verified refinements

| Classification | Evidence | Narrow fix |
|---|---|---|
| Local layout defect | At 640 px with the current published service names, the Mother & Newborn card was 91.5 px tall beside the 88 px Pediatric card. Longer allowed titles and selected fonts make the difference larger. | Compact card and reveal wrapper fill their grid row; original columns, spacing, thumbnail crop, title styles and reveal order remain. |
| Missing pending state / blocked task | Preview looked enabled while other editor actions were disabled. A clean saved draft could still be previewed during publishing because the idle guard followed the early clean-draft return. The new regression first failed on this state. | Shared editor Preview has aria-disabled, dimming and no sequential focus while saving/publishing/discarding. Normal and auxiliary activation are blocked until idle. Completion/failure restores it, preserving unsaved input and save-before-preview. |

A follow-up locks the editor’s controls during pending writes using a named native fieldset with zero minimum width. This prevents edits racing server-response-driven resets. Native disabled semantics cover keyboard and pointer input, with controls and values restored on failure. The shared button style gives aria-disabled the existing disabled treatment. No new dependency, data change, migration, design setting, font or asset.

## Verification

Build `b5oPv85kuNL77P04KTIWA`. Full unit, DB-contract and local-MySQL integration suite: **1,310 tests passed in 365 files**, 100% statements (4,872), branches (3,170), functions (1,800) and lines (4,331). Targeted tests pass (19). Lint and typecheck pass.

Scoped detector scans of the changed UI files report zero findings; configured Claude hooks do not run on Codex tool edits. [Detector result](2026-11-05-polish-detector.json). Visual and interaction checks supplement this result.

Final built browser suite: **20 passed, 10 duplicate-project skips**. This includes:

- 612 public/admin/editor/dialog layout states at nine responsive sizes, with heading/link parity and axe checks; 33 narrow-phone routes at doubled text.
- 180 compact-card/title/font/width cases across the catalogue and a service detail; all fifteen faces retain row alignment with no clipping or document overflow.
- 900 public font/template/width cases, mixed semantic roles and delayed font loading; save/private-preview/publish/discard remains working.
- 114 public/auth/admin hydration navigations with no mismatches or uncaught errors.
- Slow-save failure recovery on phone and desktop: Preview unavailable, native fields disabled, no outdated popup, entered choice preserved and controls restored after failure. [Phone](2026-11-05-polish-preview-phone.png), [desktop](2026-11-05-polish-preview-desktop.png).

Final actual-content captures after images decode: 390/640/768/1440 px catalogue and related cards. At 640 px the Pediatric and Mother & Newborn pair now both measure 91.5 px, with zero document overflow. [Catalogue](2026-11-05-polish-catalogue-640.png), [related cards](2026-11-05-polish-related-390.png), [geometry](2026-11-05-polish-live-layouts.json).

All six relevant performance checks pass on the final build: Home, Services and School nurse staffing, mobile Lighthouse/runtime and desktop scroll. Maximum lab LCP **714.85 ms**, scripted INP bound **64 ms**, combined CLS **0.001813**; all Lighthouse categories **100** and no scroll task at the observer threshold recorded. All twenty public initial JavaScript budgets pass, maximum **173,402 / 174,080 gzip bytes**. [Performance](2026-11-05-polish-performance.json), [all-route JavaScript](2026-11-05-polish-route-js.json). No thresholds changed.

Final lint, typecheck, format and whitespace checks pass. The local review preview is restored at `http://localhost:3210`. Nothing staged, committed, pushed or deployed.

## Limits

Chromium emulation verifies phone, intermediate and laptop geometry and reduced motion; it does not replace physical iOS/Safari/Android, screen-reader or production-region release checks. Font stress cases exercise all fifteen faces, rather than every possible mixed-role assignment. Third-party Google content remains provider-controlled.
