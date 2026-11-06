# Footer care background — D166

Status: ready for user review (2026-11-04); final nurse-only implementation verified, uncommitted.

## Final scope

The user first approved combining the two attached pale-blue line-art concepts, then required the extra nursing-tool artwork to match exactly or be omitted. The provided files are flattened footer mockups. Use the explicitly authorized fallback: remove the approximate tool drawings and their CSS/tokens; retain only the very faint outline nurse/older-patient care scene. No claim of pixel-identical extraction or generation.

All footer content, links, destinations, social-count behavior, copyright and the ten-second D165 logo shine remain. The original coloured logo is a separate element. The background is static, `aria-hidden`, pointer-transparent and clipped to the upper footer. Copyright stays plain. Desktop art sits along the lower-left, moved below the description; phone art shifts to the lower-right. No extra controls, fields, migration, dependency, data/write behavior or client runtime.

The selected image is a local 1320 × 489 WebP, 67,854 bytes, lazy-loaded with empty alt text. The clear source contours are rendered at low opacity with multiply blending against the existing footer base. Asset provenance, generation method and selected prompt are in [the illustration README](../../src/assets/brand/illustrations/README.md). The rejected transparent output had an unwanted blue wash and does not ship.

## Verification

Thirteen focused footer/token/sidecar tests pass. Affected `SiteFooter` and `FooterArtwork` coverage is 100% statements, branches, functions and lines. This is focused coverage, not a rerun of the historical full-codebase suite. Lint, formatting, typecheck and standalone build pass.

Before/after geometry checks compare all current footer links at 320/390/768/1440 px: same labels, hrefs, x/y, widths, heights and total footer height. The extra full-width artwork wrapper preserves the original content grid; its responsive selectors now use the semantic `.footer-content` class. The logo's phone sizing is scoped specifically to `.footer-logo`, keeping the decorative image independent.

Final built-app browser run on 2026-11-03: 12 passed, covering all 20 public templates with axe on phone/desktop, narrow phones/tablet/landscape, all social-count states, wrapping/44 px targets, pointer access, the absence of extra artwork SVGs, and the preserved logo shine under normal/reduced motion.

Both targeted Home performance cases passed: mobile lab LCP 540.3 ms, scripted INP upper bound 64 ms, CLS 0, all four Lighthouse categories 100, initial JavaScript 173,895 gzip bytes against 174,080, no scrolling long task at the observer threshold, 0% desktop missed-vsync estimate. These Nov 3 measurements precede later D167 menu work; their original build ID was not captured before interruption. See [preserved performance evidence](2026-11-03-footer-art-performance.json). This is targeted local lab evidence, not a new full-route or physical-device certification.

On Nov 4, the local preview initially referenced stale CSS after a newer build. Restarting the old preview process restored matching assets without any source change. Styled [desktop](2026-11-04-footer-art-desktop.png) and [phone](2026-11-04-footer-art-mobile.png) captures were inspected, and all geometry matches the original exactly at 320/390/768/1440 px; see [layout evidence](2026-11-04-footer-art-layouts.json). Later menu changes are preserved. No staging, commit, deployment or client-server action.
