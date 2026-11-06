# Hydration investigation — D180

2026-11-05. Local only; no commit, deployment or client-server changes.

## Reported warning

The supplied Home and `/admin/login` logs show extra attributes named
`__gcrremoteframetoken` on `<html>` and `__gcruniqueid` on forms/controls.
They are absent from the application source and raw development-server HTML.
The supplied differences name no application class, label, value or React ID mismatch.

Disposable Chromium comparison on the existing local development server:

| Route | Browser DOM annotation | Raw server contains annotation | Hydration diagnostic | Interactive handler |
|---|---|---|---|---|
| `/` | None | No | None | Menu opens |
| `/` | Controlled `__gcr…` insertion before hydration | No | Exact reported warning | Menu opens |
| `/admin/login` | None | No | None | Password visibility toggles |
| `/admin/login` | Controlled `__gcr…` insertion before hydration | No | Exact reported warning | Password visibility toggles |

This reproduces the mechanism in the reports: browser-side inspection/extension code
changes the HTML before React hydrates it. The exact installed tool was not identified.
The application cannot prevent a browser extension or inspection tool from mutating its DOM.
The warning can recur in a browser that continues to inject these attributes; use a clean
browser context or disable that tool's page annotations to stop this particular warning.

React documents the identical-render requirement, development-only attribute diagnostics,
and the limits of warning suppression in [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot).
Its [hydration error explanation](https://react.dev/errors/418) explicitly includes browser extensions.
The local Next 16 server/client-boundary guide was also reviewed.

## Regression protection

- New E2E guard checks every fixed public route, eight services, job/application routes,
  missing page, signed-out admin screens and signed-in lists/editors at phone and desktop widths.
- Capture hydration console diagnostics and all uncaught JavaScript exceptions before navigation.
  Verify raw HTML contains no `__gcr…` annotations and require the expected HTTP status.
- Exercise mobile menu and password visibility handlers rather than treating SSR screenshots
  as evidence of hydration. Observe post-paint execution as well.
- Add `npm run test:hydration` and a development-mode CI pass for public/auth screens;
  detailed attribute-only warnings are development-only. This uses the same guarded local
  test database/seed and browser profiles; local use may reuse the existing development server.
- Preserve real diagnostics. No new `suppressHydrationWarning`, attribute scrubber,
  client-only form, rendering workaround, runtime script or dependency is added.
  The pre-existing single-level body suppression remains unchanged.

## Validation

- Built-app guard: **4 tests passed**, covering 23 public/auth and 34 signed-in admin routes on each of phone and desktop (**114 navigations**). No hydration diagnostics, browser-added attributes in SSR, unexpected statuses or uncaught errors.
- Development guard: **2 tests passed**, covering 23 public/auth routes at both sizes (**46 navigations**). No hydration warnings or uncaught errors, including Home and admin login.
- Controlled reproduction: both clean pages pass; both deliberately annotated pages reproduce the supplied warning and remain interactive. [Evidence](2026-11-05-hydration-reproduction.json).
- Lint, typecheck and formatting pass; no dependency or runtime bundle changes. Production source, styles and build assets are unchanged, so the preceding D179 1,309-test/100% unit/local-DB coverage, accessibility, responsive and performance evidence remains applicable.
- Detailed route rows accompany this report in the `2026-11-05-built-*` and `2026-11-05-development-*` JSON artifacts. CI is configured to run the new checks; no remote CI or deployment was triggered.
- Existing local dev server was reused without changing its configuration or user content; disposable browser contexts and test accounts were used. The review preview is restored separately.
