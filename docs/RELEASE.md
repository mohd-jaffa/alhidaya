# Release v1.0.0: backup, deploy and rollback plan

|             |                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Status      | **IN PROGRESS, 2026-11-14.** Payment confirmed (Q1). **Phase B (backup) done and verified**; nothing on the server has been changed yet. Next: your "backups received" (B6) and the items in §3.2. |
| Target      | alhidaya.qa on the client's HostCarts cPanel server (`asian-node010.hostcarts.com`, Singapore)     |
| Access      | SSH port 2200, user `alhidaya`, key `~/.ssh/alhidaya_cpanel_rsa` (already authorised)              |
| Version     | `package.json` 0.1.0 → **1.0.0** in the release commit; the tag and GitHub release are `v1.0.0`   |
| Authorities | Plan D44, D48, D50, §21, §35.3, tracker R8.1 to R8.7 · AGENTS.md §23                               |

**How to read this file.** _Who_ is **Me** (the agent), **You** or **Both**. **GATE** marks a step that changes the
server: I stop and wait for your explicit "go" before it (plan D44). Tick each box with the date when it is done.

---

## 1. Rules for this release

1. **Payment gate (D48).** No server change, and no backup either, until you confirm full payment. The read-only
   checks in §2 were allowed before it.
2. **Every server change is confirmed first (D44).** Each GATE below is one confirmation.
3. **The old site and its database stay intact.** I never delete or edit them. The cutover only _moves_ the old files
   aside (instant, reversible). Deleting them is a separate GATE that only you can trigger, and only after a quiet
   period (§8).
4. **Backups hold secrets and personal data** (the old site's `.env`, 95 applicants' CVs). They go to
   `backups/` in the project root, which is git-ignored, folder mode `700`, files `600`. They are never committed,
   pushed, uploaded to CI or pasted anywhere.
5. **No credential goes into chat, the repository, the plan, the changelog or a log.** §3.2 says how each one reaches
   me instead.
6. **Nothing is built on the server** (1 GB memory). GitHub builds; the server only receives the result.
7. **One live site at a time.** The cutover happens behind the maintenance page (§6), in one window.

---

## 2. What the server looks like now (read-only check, 2026-11-14)

| Area           | Found                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Disk           | Quota **1,024 MB**, **295 MB used**, 729 MB free (shared with mail and databases)                                                              |
| Old site       | Laravel 9 on PHP 8.1 in `public_html` (258 MB: `application` 152 MB, `upload/CV` 23 MB, `.well-known.zip` 78 MB)                              |
| Applications   | **95 CVs** now in `public_html/upload/CV` (83 at the 2026-10-28 check): the old site is **still receiving applications**                      |
| Database       | One database, `alhidaya_hidaya` (about 220 KB), one user. cPanel allows two, so the new site takes the second                                  |
| Domains        | `alhidaya.qa` (+ `www`, `mail`) on IP 15.235.174.14, HTTPS by AutoSSL (Let's Encrypt). **No subdomains yet**                                   |
| Mail           | Only the mailbox `noreply@alhidaya.qa` lives on the server. Real mail is Microsoft 365 (MX); cPanel routing must stay **Remote**              |
| Cron           | No jobs                                                                                                                                       |
| Node           | Not on the default SSH path. `cloudlinux-selector`, `selectorctl` and `uapi` are available; Node 22 is offered by the selector (plan §21.1)   |
| Tools          | `tar`, `gzip`, `sha256sum`, `mysqldump` 8.0.46 present. **`rsync` is missing**                                                                 |
| New build size | The standalone build is about 116 MB, so two releases fit the 250 MB budget                                                                    |

**What differs from the plan, and what it changes**

- **`rsync` is not on the server.** Plan §35.3's "rsync over SSH" becomes "tar over SSH" (`tar | ssh … tar -x`), then a
  SHA-256 check on the server before the switch.
- **The old site is live and growing** (12 more CVs in 17 days). So the backup is taken twice: now, and again inside
  the cutover window (§5, E3).
- **`.well-known.zip` (a full copy of the old site including its `.env`) is still public** at
  `https://alhidaya.qa/.well-known.zip` (plan §40.1, open since 2026-10-28). The cutover removes it from the web as a
  side effect; the secrets in it should still be changed (§3.2, item 9).
- **Cloudflare Web Analytics is not wired in the code** (only the security policy allows its host). See §3.1, Q5.
- **The seed refuses to run against anything but a local site.** The launch content therefore comes from Q4's export
  (`scripts/content-export.mts`), not the seed.
- **The build ships things a release must not hold** (plan §35.3): 120 server-side source maps, six traced TypeScript
  files from `src/lib/storage`, and a `public/media/.htaccess` the build writes. `scripts/check-deploy-output.mjs
  --prune` removes them and then fails the release if anything forbidden is left (env files, keys, maps, source,
  tests, docs, Git data, uploads). A secret is never pruned silently; it fails the release.

---

## 3. What I need from you

### 3.1 Decisions (asked in chat; the answer is written here)

| #   | Question                                                                                                                                                                  | Recommended default                                                                                   | Answer |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| Q1  | Is full payment confirmed, so D48 is lifted (backups and server steps may start)?                                                                                          | (no default: a fact only you know)                                                                    | **Yes, full payment confirmed (2026-11-14).** D48 is lifted; each server change still waits for your "go". |
| Q2  | How do I dump the old database without you pasting its password?                                                                                                           | Run `mysqldump` on the server; the old app's own stored login is read inside the remote shell, never printed or downloaded | **Dump on the server (2026-11-14).** The old app's stored login is read inside the remote shell only. |
| Q3  | What happens to the old site after the cutover?                                                                                                                            | Moved aside, not served, kept ~14 days, deleted only when you say so (D50 changes: the clean-up moves from before to after the deploy) | **Move aside, delete later (2026-11-14).** Supersedes D50's order: the old site is cleared after the deploy, only on your word. |
| Q4  | Where does the launch content come from: a fresh seed (drafts you publish one by one) or a copy of your local, approved content and photos?                                | Copy the local content tables and the 60 MB media folder, so the site launches exactly as the client approved it | **Copy the local approved content and media (2026-11-14).** Supersedes the plan's Q30 fresh seed. |
| Q5  | Cloudflare Web Analytics: build it before v1.0.0, or ship without and add it in v1.0.1?                                                                                    | Ship v1.0.0 as tested; add analytics right after launch (agent default)                               | default |

### 3.2 Items and credentials

None of these is pasted into chat unless stated.

| #   | Item                                                                                                  | Why                                                       | How it reaches me                                                                                  | Needed before |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| 1   | "Full payment confirmed" (Q1)                                                                          | D48 gate                                                  | A chat answer                                                                                      | Phase B       |
| 2   | Old DB login, only if you pick the "local file" option in Q2                                           | Dump                                                      | You write it into `backups/.old-db.cnf` (mode 600); I never display it                              | B3            |
| 3   | **Turnstile** site key and secret key for `alhidaya.qa`, `www.alhidaya.qa` and `preview.alhidaya.qa`   | The forms refuse real visitors on test keys (plan R8.4)   | `cp deploy/production.env.template .env.production`, fill in the three values, `chmod 600` (git-ignored)  | Phase D       |
| 4   | **`noreply@alhidaya.qa` password**, changed first in cPanel (the old one may be in the public zip)     | The site's mail login (plan Q24)                          | Same `.env.production`                                                                             | Phase D       |
| 5   | The admin's email and name: **info@alhidaya.qa, "Al Hidaya Admin"** (answered 2026-11-14)             | The one admin account                                     | Answered. The **password** you type yourself at a hidden prompt on the day, never in chat           | D3            |
| 6   | ~~The rehearsal host name~~ **`preview.alhidaya.qa`** (answered 2026-11-14; plan Q22)                  | The hidden pre-switch check                               | Answered                                                                                           | D1            |
| 7   | A **cPanel login**, only for steps the command line cannot do (DKIM/DMARC records, if `uapi` refuses) | DNS TXT records in the Zone Editor                        | You do those clicks yourself, following §4 steps; or tell me and I ask for the minimum             | C6            |
| 8   | **GitHub secrets** for the release workflow (deploy key, host, port, user, paths)                     | The release uploads over SSH                              | I create the deploy key pair locally and set the secrets with `gh`; you only authorise the public key if I ask (D46) | Phase C       |
| 9   | **Change the secrets in the old site's `.env`** (DB password, mail password, `APP_KEY`, API keys)     | They sit in a public zip (plan §40.1)                     | You do it in cPanel, or after the cutover when the old DB is deleted. I do not touch them          | After cutover |

I generate these myself, on the server, and never display them: the Better Auth secret, the IP-hash secret, the cron
secret and the two new database passwords.

### 3.3 What you do by hand

- Answer §3.1 and supply items 3 to 6.
- Be reachable during the cutover window (about 60 minutes): I ask for a "go" at each GATE.
- Type the admin password at the hidden prompt (D3).
- After the release: give the backup to the client (D50), and tell me when the old site may be deleted (§8).

---

## 4. Checkpoints

### Phase A: Prepare (local, no server change)

- [x] **A1** Me. `/backups/` and `/release-content/` are git-ignored (2026-11-14). _Verified:_ `git check-ignore` prints both.
- [ ] **A2** Me. Build the missing release pieces with tests, in one commit: `scripts/backup-old-site.sh` (streaming
      backup + verification: **done**), `scripts/check-deploy-output.mjs` (**done, tested**) (no source, source maps or env files), the
      **release workflow** `.github/workflows/release.yml` (re-runs CI on the tag, builds once, uploads over SSH with
      tar, verifies SHA-256, migrates, switches, restarts, can roll back), the **maintenance kit** (§6, done and tested
      2026-11-14), the cron and `docs/RELEASE.md` steps. _Verify:_ lint, typecheck, tests and 100% coverage pass; `actionlint` clean.
- [ ] **A3** Me. **Content copy (Q4: copy).** _Export done 2026-11-14_ (`scripts/content-export.mts`, read-only on your
      local database): 12 documents, 20 records, 75 media rows and the **487 media files they name (18.5 MB**, of the
      60 MB folder; the rest are unreferenced leftovers) into `release-content/` (git-ignored) as an auditable
      `content.sql`; `site_operations` has no local row, so production starts on the defaults (enquiries to
      `info@`, applications to `hr@`, plan Q17). Never exported: `auth_*`, sessions, logs, enquiries, applications.
      _Still to do:_ the import step (server `mysql` client as the app user, media by tar over SSH) and a trial on a
      scratch database.
- [ ] **A4** Me. Release readiness: CI green on `main`, working tree clean, `package.json` still `0.1.0` until the
      release commit, a rollback-ready `changelog.md` entry drafted.
- [ ] **A5** You. Q1 answered; Q2 to Q6 answered; items 3 to 6 supplied.

### Phase B: Back up everything (GATE: payment confirmed; read-only on the server)

Nothing is written on the server: the data is streamed over SSH straight to your machine, so the 729 MB of free quota
is not touched. Destination: `backups/2026-11-14-pre-v1.0.0/` (§7 lists the contents).

- [x] **B1** (2026-11-14) Me. Inventory snapshot (server config as JSON/text): domains, email accounts, DB and DB users, SSL
      hosts, crontab, the DNS zone, PHP version, the docroot `.htaccess`, a fingerprint of the live site (status and
      content hash of `/` and five sample pages), `df`/quota, file counts.
- [x] **B2** (2026-11-14) Me. **Files:** the whole home folder as one `tar.gz`, minus `tmp/` (cache), `.cagefs/`, `.trash/` and
      `ssl/keys` (private keys, re-issued by AutoSSL; say if you want them).
- [x] **B3** (2026-11-14) Me. **Database:** `mysqldump --single-transaction --routines --triggers --events` of `alhidaya_hidaya`,
      gzipped, plus a per-table exact row count taken in the same session.
- [x] **B4** (2026-11-14) Me. **Verify:** `gzip -t`; the archive's file list and byte total equal the server's; the dump ends with
      its "Dump completed" line; a `MANIFEST.sha256` of every backup file.
- [x] **B5** (2026-11-14) Me. **Restore drill:** extract to a scratch folder and import the dump into a **throwaway** MySQL 8
      container (not your dev database); the table row counts must equal B3's. Log in `restore-drill.log`; scratch removed.
- [x] **B6** (2026-11-14) You. Confirmed you hold the backup ("Yes, I have it").

**Result (2026-11-14, `scripts/verify-backup.sh`, log in `restore-drill.log`):** every file matches
`MANIFEST.sha256`; both archives are intact; the server listed **11,839 files (228.8 MB)** and the archive holds
**11,839 at the same sizes (0 differences)**, including all **95 CVs**; the archive extracts; the database restored
into a throwaway MySQL 8.0.46 with **all 9 tables' exact row counts equal** (`career_applications` 47,
`tbl_contacts` 54, `services` 8, `users` 1, `migrations` 10, `roles` 1, `tbl_careers` 1, `tbl_home_banners` 1,
`password_resets` 0). The live site's fingerprint was recorded for the rollback comparison. The backup is
**177 MB** at `backups/2026-11-14-pre-v1.0.0/` (folder `700`, files `600`). Note for the check itself: macOS `tar`
folds `._*` resource-fork entries into metadata when extracting, so the file comparison reads the archive's raw
entry list instead of an extracted tree.

### Phase C: Prepare the server (GATE: payment confirmed; each sub-step confirmed)

The old site keeps serving throughout this phase.

- [ ] **C1** Me. **Production database** (second slot): create it, the **app user** (data rights only) and the
      **migration user** (schema rights), strong random passwords, both only on localhost.
- [ ] **C2** Me. **Folders:** `~/alhidaya-data/cvs` (mode `700`, outside `public_html`), `~/alhidaya-app/releases/`,
      the media folder with its `.htaccess` (no listing, no scripts, images and PDF only, `nosniff`; folders `755`,
      files `644`). The media folder is created at the cutover inside the docroot (E4); during rehearsal it sits in the
      rehearsal host's own docroot.
- [ ] **C3** Me. **Node.js app** with `cloudlinux-selector` (Node 22, production, one Passenger process, D119).
- [ ] **C4** Me. **App environment** set in the selector: `NODE_ENV`, `NEXT_PUBLIC_SITE_URL`, the two database URLs,
      SMTP, the three secrets, Turnstile, `MEDIA_DIR`, `MEDIA_URL`, `CV_DIR`. `SERVE_MEDIA` and `KIT_PREVIEW` stay unset.
- [ ] **C5** Me. **Cron:** daily `POST /api/cron/retention` and `POST /api/cron/mail-retry` every 10 minutes, each with
      the bearer `CRON_SECRET` read from the server's environment, never written into the crontab text.
- [ ] **C6** Both. **Mail:** the `noreply@` password rotated (item 4); mail routing confirmed **Remote**; DKIM and
      DMARC `p=none` records added in cPanel's Zone Editor (R8.3). MX, SPF and the existing records are not touched.
- [ ] **C7** Me. **Deploy key:** the release workflow's own key pair (item 8), authorised for the `alhidaya` user only.

### Phase D: Rehearse on a hidden host (GATE: each sub-step confirmed)

The same build that will go live runs first on the rehearsal host (plan Q22, R8.5), while the old site still serves
`alhidaya.qa`. The host sits in its own docroot **outside** `public_html`, so the old site's `.htaccess` rules cannot
reach it, and it sends `X-Robots-Tag: noindex`.

- [ ] **D1** Me. Create the rehearsal host and its AutoSSL certificate; its docroot is `~/rehearsal-site`.
- [ ] **D2** Me. Run the release workflow in **rehearsal** mode from the exact commit that will be tagged
      (`workflow_dispatch`, target `rehearsal`): CI, build once, upload, SHA-256 check, migrate, switch, restart.
- [ ] **D3** Both. Load the launch content (Q4), create the admin account (you type the password), publish.
- [ ] **D4** Me. **Smoke test on the rehearsal host:** every public page 200 with no console error; the 301 map; sitemap
      and robots; the three forms end to end (mail reaches `info@` and `hr@` in Microsoft 365, **not junk**); a CV
      upload lands in the private folder (`700`/`600`) and is **not** web-reachable; a media file is served by Apache
      with long cache headers; admin sign-in, a CV download is audited; both cron routes answer with the bearer and
      refuse without it; error pages carry no stack or SQL; security headers present.
- [ ] **D5** Me. **Prove the unknowns** (§9): the switch and restart mechanism, memory (one process within 1 GB), the
      migration path, cache invalidation after a publish.
- [ ] **D6** Me. Clean the rehearsal's test enquiries, applications and CVs from the production database (counts
      shown to you first).
- [ ] **D7** You. Open the rehearsal host and accept it ("rehearsal approved").

### Phase E: Cutover (GATE: your "go for cutover"; window about 60 minutes, at a quiet time you choose)

Time zone: Qatar (UTC+3). You may postpone at any step; rollback is §5.

- [ ] **E1** Both. "Go for cutover" and the time. The old site's fingerprint is recorded again.
- [ ] **E2** Me. **Maintenance page on:** `scripts/maintenance.sh on` puts `maintenance.html` and a marked 503 block
      at the top of the live `.htaccess` (the old rules stay below it, untouched); _verify_ every URL returns the
      notice (§6).
- [ ] **E3** Me. **Final backup** into `backups/2026-11-14-final-before-switch/`: the database again and the CV/upload
      folders (the files and the DB are the only things that can have changed), then the same B4 checks.
- [ ] **E4** Me. **Move the old site aside:** everything in `public_html` except `.well-known/` (AutoSSL) and
      `maintenance.html` → `~/old-site-2026-11-14/` (same filesystem, instant). The old `.htaccess` goes with it
      (block included), then `scripts/maintenance.sh on` writes the block onto a fresh `.htaccess`.
      `.well-known.zip` leaves the web here.
- [ ] **E5** Me. Create the media folder and its `.htaccess` in the docroot; copy the media files (Q4).
- [ ] **E6** Me. Release `v1.0.0`: version bump commit, annotated tag, GitHub release; the workflow re-runs CI on the
      tag, then promotes the **already-rehearsed build** to production (SHA-256 verified).
- [ ] **E7** Me. Migrate the production database (the migration user), restart, switch the Node app to `alhidaya.qa`
      and `www`.
- [ ] **E8** Me. **Smoke test on the real domain**, with the maintenance page still in front of public visitors for a
      moment (a test header or the server's own address), then the full D4 list again.
- [ ] **E9** Me. **Maintenance page off.** The Node app's `.htaccess` block is the only rule left.
- [ ] **E10** Me. Final checks on the public domain: 301s, sitemap, robots, the three forms, mail delivery, admin.
      Watch the app's logs for 30 minutes (5xx count, memory, restarts).
- [ ] **E11** You. "Cutover accepted" or "roll back".

### Phase F: After launch

- [ ] **F1** Me. `v1.0.0` tag and release notes; the plan's tracker rows R8.1 to R8.7 set to DONE; `changelog.md`;
      decisions recorded.
- [ ] **F2** You. Submit the sitemap in Google Search Console (R8.6) when you are ready.
- [ ] **F3** Me. Day 1, day 3 and day 7 checks: disk use, errors, mail retries, cron ran.
- [ ] **F4** Both. The speed check from Qatar and the Cloudflare-proxy decision (D25, R8.5).
- [ ] **F5** You. Hand the backup to the client (D50), then say when the old site and database may be deleted (§8).

---

## 5. Rollback

**Triggers (any one):** the smoke test fails on the forms, mail, admin or the 301s; the app does not start or
restarts repeatedly; 5xx on public pages; memory over the 1 GB limit; or you say stop. The decision is yours at E11
and mine at E8/E10 if the site is plainly broken.

**What makes it safe:** the old files were only _moved_, the old database was never touched, and the backups are on
your machine. The new site writes only to its own database and folders, so the old site never sees partial data.

| Where it stopped            | Rollback                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before E4                   | `scripts/maintenance.sh off` removes only the block and the notice; the old rules are exactly as they were. The old site never left. Nothing else to do.                                         |
| After E4, new site failing  | 1. Maintenance page on. 2. Export any enquiries and applications from the new database for you. 3. Stop the Node app and remove its `.htaccess` block. 4. `mv` the old files back from `~/old-site-2026-11-14/`, including the old `.htaccess`. 5. Compare with the recorded fingerprint. 6. `scripts/maintenance.sh off`. About 5 minutes. |
| A bad release after launch  | The previous release folder stays (`current` points back) and the app restarts. For v1.0.0 itself there is no previous release, so the row above applies.                                         |
| Server damaged / files lost | Restore from `backups/` (§7): extract the home archive, import the dump with the commands in `README-RESTORE.md`, in that backup folder. The restore drill (B5) proved these commands.               |

After any rollback I write a blocker entry in `changelog.md` (AGENTS.md §30) and we decide the next attempt together.

---

## 6. The maintenance page

A simple, static notice, shown only during the cutover window. Built in step A2 under `deploy/maintenance/`:

- **`maintenance.html`**: one file, inline CSS, the logo as inline SVG, no JavaScript, no external request. In the
  logo's colours on white (D35). It says the site is being updated and gives the WhatsApp, phone and email from
  `src/constants/site.ts`.
- **`htaccess.block`**: a marked block (`# BEGIN MAINTENANCE` … `# END MAINTENANCE`) that answers every request except
  `maintenance.html` and the SSL challenges (`/.well-known/acme-challenge/`, `/.well-known/pki-validation/`, so
  renewal never breaks) with **HTTP 503 and `Retry-After: 3600`**, so search engines treat it as temporary and keep
  the rankings. `Cache-Control: no-store`, `X-Robots-Tag: noindex`; plain HTTP is sent to HTTPS first.
- **`scripts/maintenance.sh on | off | status`** is the only way it is switched: `on` uploads the notice, keeps the
  first untouched `.htaccess` once as `.htaccess.before-maintenance`, and writes the block above the existing rules
  in one atomic rename; `off` cuts out only the marked block and the notice, so whatever else is in `.htaccess` (the
  old site's rules now, the Node app's later) is never disturbed. Both then print what a visitor gets.
- **Proven before the server:** `scripts/test-maintenance-kit.sh` runs the rules in a throwaway Apache over HTTPS
  (17 checks: 503 for the home page, a deep link, the old site's own files and secrets file, a form POST and HEAD;
  the notice and SSL challenge files stay reachable; the headers; HTTP→HTTPS; removing the block restores the
  original `.htaccess` byte for byte), and `tests/contract/maintenance-kit.test.ts` keeps the files honest in CI.
- _Verify at E2:_ the script's own probe shows 503 for `/`, a deep link, `www` and a `POST`; at E9 the probe shows
  the new site.

---

## 7. The backup set

```
backups/2026-11-14-pre-v1.0.0/
├── home-alhidaya.tar.gz       the home folder (old site, uploads, CVs, mail, config), minus cache and ssl keys
├── alhidaya_hidaya.sql.gz     the old database, complete (routines, triggers, events)
├── server-config/             domains, mailboxes, DB users, SSL hosts, cron, DNS zone, PHP, .htaccess, fingerprint
├── MANIFEST.sha256            SHA-256 of every file above
├── restore-drill.log          the B5 result
└── README-RESTORE.md          the exact restore commands
backups/2026-11-14-final-before-switch/   the same, refreshed inside the cutover window (E3)
```

The folder stays on your machine. Please also keep a copy somewhere you control (an encrypted disk): it contains
applicants' CVs.

---

## 8. Keeping the old site, and deleting it later

The 729 MB free quota holds both: the old site (295 MB) and the new one (releases about 230 MB, media 60 MB, CVs
growing to the 250 MB budget). If the quota gets tight I tell you before it blocks anything. The old files stay in
`~/old-site-2026-11-14/` (not served by Apache, outside `public_html`). **I delete them only on your explicit
instruction**, after the client has the backup (D50) and the new site has run quietly for the period you choose
(suggested: 14 days). The old database and its user are deleted in the same separate step.

## 9. Unknowns to retire in the rehearsal

These cannot be proven from here without changing the server, so Phase D exists to prove them before the real domain
is touched:

1. **Passenger and Apache together:** that Apache serves the media folder directly and Passenger serves everything
   else on one domain, with the old site gone from the docroot.
2. **The switch:** the `current` symlink plus Passenger restart (or the selector's own mechanism) with the app root.
3. **Migrations:** the server has no Node and no `drizzle-kit`. The plan is to run them from the GitHub runner through
   an SSH tunnel to the server's local MySQL as the migration user; if the server refuses tunnelling, the generated
   SQL is applied with the server's `mysql` client in order, recording the same journal.
4. **The rehearsal host's sign-in:** Better Auth's base URL and trusted origins come from the site URL, so the
   rehearsal host may need its own runtime value. The build itself stays identical.
5. **Memory:** one Passenger process within 1 GB while sharp resizes an upload.
6. **`uapi` and `cloudlinux-selector` permissions** for the steps above; the fallback for each is a cPanel click you do.

---

## 10. Sign-off log

| Checkpoint            | Date | Confirmed by |
| --------------------- | ---- | ------------ |
| Q1 payment confirmed  | 2026-11-14 | You (chat answer) |
| B6 backups received   | 2026-11-14 | You (chat answer) |
| C: server prepared    |      |              |
| D7 rehearsal approved |      |              |
| E1 go for cutover     |      |              |
| E11 cutover accepted  |      |              |
| F5 old site deletion  |      |              |
