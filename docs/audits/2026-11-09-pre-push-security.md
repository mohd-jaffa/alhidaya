# Pre-push security and CI review — 2026-11-09

Scope: R7.3 / D191, source-level review against the applicable OWASP ASVS level-2 areas, existing security regression tests and the full quality gates. This is not an independent certification or a production penetration test. No client-server mutation, infrastructure/service addition, schema migration or malware-scanning change.

## Findings fixed

1. Browser policy was missing from ordinary documents/static responses. Shared no-sniff, denied framing, restricted browser features, referrer policy and host-only one-year HSTS now apply globally. HTML gets a fresh cryptographic script nonce and strict CSP, including admin and error pages. Root dynamic rendering prevents nonce reuse; existing D76/D119 published-data caching stays intact. Executable scripts have no unsafe-inline/eval allowance in production; the development debugger retains eval. Inline styles remain allowed for existing GSAP/focal CSS. Self-hosted fonts, same-origin media/private training video, Turnstile and approved Google satellite frames stay supported. Analytics must be verified with the eventual real Cloudflare setup (R8); parser-injected scripts also require a nonce or a trusted loader under strict-dynamic.
2. JSON reads previously buffered an unlimited body. They now use the existing streaming limiter, inspect Content-Length and count actual bytes even when the declared size lies or is absent, before decoding/parsing. Invalid UTF-8 is refused. Limits: authenticated content 32 MiB (including the schema's largest JSON-escaped page), public enquiries 64 KiB, authentication/password operations 16 KiB. Upload multipart ceilings remain separate. Failures use the existing catalogue/envelope; no partial data write occurs.
3. Shipped-dependency auditing could interpret a failed/incomplete registry response as an empty finding set. The command now fails closed unless it receives a complete npm audit v2 report with matching finding count and recognized severities. Regression fixtures cover registry errors, malformed/missing output, development-only findings and a moderate runtime finding.

## Existing controls reviewed

| Area | Evidence and boundary |
|---|---|
| Admin authorization / drafts | 53 admin route modules; public forgot/reset operations use their guarded authentication envelope, session POST has its own sign-in/lockout path and session DELETE uses withAdminRoute. Protected route operations, previews, manual assets and private downloads check the server session. Proxy remains a convenience gate. Public feature reads select published content; publish is transactional and invalidates its existing tags/revisions. |
| Sessions / CSRF | Better Auth signup is disabled and its raw HTTP routes are not mounted. Production cookies are Secure, HttpOnly, SameSite=Lax; session expiry, lockout, hashed rate limits, generic reset behavior, single-use reset and session revocation have regression coverage. Every modifying route checks the configured Origin. |
| Uploads / downloads | Signature allowlists, streamed request/file caps, pixel bounds, strict image decode and re-encoding, discarded originals, generated names, disk quotas and path guards. CVs stay private with attachment/no-store/sandbox responses and audited downloads/expiry. PDF/DOC/DOCX signatures are not a malware guarantee; scanning stays the user's deferred Q52 decision. |
| Input / database | Zod schema boundaries, bounded normalized strings, safe href/preview-path rules, parameterized Drizzle operations and DB constraints. No input-built SQL found. Explicit same-origin submission/Turnstile/honeypot/rate controls remain in place. |
| PII / logging / mail | API responses use no-store/request IDs. Key-based secret/PII redaction and captureError tests cover logs/audit. Visitor mail failures do not reveal internals or undo saved submissions. Private retention and mail retry use guarded cron endpoints. |
| Secrets / Git | Main history scan: 2,591 distinct historical text blobs, zero private-key/GitHub-token/AWS-key patterns, zero tracked environment files other than .env.example and zero private upload/data paths. Standalone inspection found no .env/private-key files. Only main will be pushed; recovery branches stay local. Pattern checks do not prove the absence of every possible secret. |
| Deployment boundary | GitHub receives code/CI only. Actions have read-only permissions, immutable official-action references and no persisted checkout credentials. No release/deployment workflow or cPanel mutation is introduced. |

## Verification / CI

`npm run verify` uses the example's isolated local test database and `.data/verify-media` / `.data/verify-cvs`, overriding child-process settings without editing `.env.local`. Independent static/security gates run together; coverage, build and browser suites run serially locally because they share that test database and performance measurements. npm prepare configures only this checkout's pre-push hook, skips CI/non-Git packages and refuses to replace another configured hook directory.

On GitHub, lint, formatting, types, unit, audit, 100% unit/database coverage, build and development hydration can run together. Production E2E and performance depend only on the single build artifact and use isolated runner services. The final aggregate check requires all jobs to succeed. Browser/performance workers remain serial within each job; reports are retained separately.

Local results: 1,401 unit/integration tests across 376 files, all coverage dimensions 100%. Existing 276 E2E cases and all four corrected security cases passed (278 distinct production cases; 62 intentional skips). The security probe inserts hostile HTML into the actual HTTP response rather than through privileged browser evaluation. Both development hydration cases / 46 navigations passed. All 40 performance cases passed: maximum initial JS 173,823 / 174,080 gzip bytes, LCP 555.477 ms, scripted interaction upper bound 72 ms, CLS 0, minimum Lighthouse 96, no observed scroll task above 50 ms. No thresholds were relaxed. Runtime audit: 97 reachable packages clear at moderate or above; the full tree has 15 moderate development-only findings and no high/critical findings.

A separate build with an unreachable database address passed, proving the build job needs no database service. YAML parsing, official action references and read-only repository Actions permissions were verified. The complete pre-push hook runs before upload; the actual GitHub Actions result is linked in the push delivery. Generated browser snapshots stay in per-test report folders, preserving historical committed audit images.

## Launch checks retained

- Full payment and explicit server-change approval before Phase 8.
- Verify actual HTTPS/HSTS, Apache no-execution/media headers/private CV permissions, one Passenger process, and the trusted forwarded-IP boundary on cPanel.
- Real secrets, Turnstile, SMTP/Microsoft 365 routing, analytics compatibility with CSP and cron configuration.
- Q52 malware-scanning decision and existing client/manual-device/screen-reader approvals.

## Hosted-runner fixture correction (D192)

Initial run `42569832244` passed build, static checks, dependency security, unit tests and development hydration. Coverage exposed a cold real-image seed taking longer than its 120-second test timeout; subsequent idempotence cases then raced the still-running seed. The cold setup now completes in a ten-minute `beforeAll` barrier before dependent cases execute. All assertions and coverage/public performance limits stay unchanged. Four cold integration cases passed locally in 73.85 seconds. Final hosted results are linked in delivery.

## Hosted browser portability (D193)

The initial E2E job exposed ten deterministic font/touch probe failures and two settling races; the performance job's mobile samples stopped short on Linux and six Lighthouse performance scores were below 95. A local Linux Chromium probe reproduced the native-scroll and FontFaceSet issues without changing app content: the synthetic horizontal gesture moved 0 pixels, trusted touch input moved 205 pixels; the complete CSS font stack threw NetworkError for a missing OS metric fallback, while the bundled family loaded successfully. Probes now test bundled fonts explicitly and use bounded real touch swipes, retaining all original fit, whole-page and performance assertions. The two timing races now await settled state without relaxing pixel bounds.

Independent Reveal/word GSAP initializers now run in cancellable tasks, rechecking current visibility and keeping their existing context cleanup. No streaming fallback or visual/layout change is retained. Eleven relevant unit tests and static checks passed. The queue adds 119 gzip bytes; Home remains at 173,942 / 174,080. A deliberately constrained Linux stress comparison reduced blocking time (Home 1312 → 904 ms; Contact 1594.5 → 981 ms). Reference-profile coverage, browser, hydration and performance gates remain required and are rerun on the correction.

Development hydration initially hit a stale incremental-cache reload loop after prior build experiments. Removing only `.next/dev` restored both checks (46 route visits, 1.3 minutes), with no hydration errors. Local verification now resets that generated dev cache before the hydration stage; the isolated mobile preview and production artifact are unaffected.

Correction validation: 1,405 unit/database cases across 377 files, all four coverage dimensions 100%; 278 production E2E cases passed with 62 intentional skips; both development hydration cases passed across 46 routes. All 40 unchanged reference-profile performance cases passed: minimum Lighthouse 96, maximum initial JS 173,942 / 174,080 gzip bytes, LCP 690.531 ms, CLS 0, scripted-interaction upper bound 64 ms and no scroll task exceeding 50 ms. Static checks and standalone build passed. The full pre-push hook repeats these checks before uploading the correction; final hosted results are linked in delivery.
