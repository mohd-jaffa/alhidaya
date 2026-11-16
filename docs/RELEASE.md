# Release v1.0.0: backup, deploy and rollback plan

|             |                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Status      | **LIVE, 2026-11-14.** `v1.0.0` was released by its tag and the new site has served alhidaya.qa since 12:16 UTC. Production Turnstile keys went live on 2026-11-16. The old site remains available for recovery. |
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
| DNS           | **The world's DNS is HostCarts' own nameservers** (`ns1`/`ns2.alhidaya.qa` → 115.84.171.158, zone serial 2026082510), **not this cPanel** (its copy has serial 2026093001 and has diverged). Records added in cPanel's Zone Editor do **not** reach the internet. `alhidaya.qa` already resolves to this server (15.235.174.14), so the cutover needs no DNS change |
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
| Q6  | How does `preview.alhidaya.qa` get its public DNS record (HostCarts runs the world's DNS, not this cPanel)?                                                                | You (or the client) ask HostCarts to add `preview A 15.235.174.14`; or skip it and I rehearse by address only | **No DNS record: you cannot reach HostCarts (2026-11-14), and I have no access to their nameservers.** The rehearsal host is tested by address (`curl --resolve`, a browser with the name mapped), which needs no DNS; its certificate stays cPanel's self-signed one because AutoSSL cannot validate a name the world cannot resolve. To look at it yourself, add the line `15.235.174.14 preview.alhidaya.qa` to your Mac's `/etc/hosts` and accept the certificate warning; or I send screenshots. **The cutover needs no DNS change at all** (`alhidaya.qa` and `www` already point to this server), and DKIM/DMARC stay optional (SPF already passes). |
| Q7  | Go for the first rehearsal: push `main` and run the release workflow (D2)? | Yes | **Superseded (2026-11-14):** the user dropped the rehearsal and asked for the new site live, released by a version tag. |
| Q8  | When is the `noreply@` password changed? | Right before the rehearsal mail test | **Right before the rehearsal mail test (2026-11-14); I generate it on the server** and never show it. The old site may send through that mailbox, so it is changed as late as the test allows. |

### 3.2 Items and credentials

None of these is pasted into chat unless stated.

| #   | Item                                                                                                  | Why                                                       | How it reaches me                                                                                  | Needed before |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| 1   | "Full payment confirmed" (Q1)                                                                          | D48 gate                                                  | A chat answer                                                                                      | Phase B       |
| 2   | Old DB login, only if you pick the "local file" option in Q2                                           | Dump                                                      | You write it into `backups/.old-db.cnf` (mode 600); I never display it                              | B3            |
| 3   | **Turnstile** site key and secret key for `alhidaya.qa`, `www.alhidaya.qa` and `preview.alhidaya.qa`   | The forms refuse real visitors on test keys (plan R8.4)   | `cp deploy/production.env.template .env.production`, fill in the three values, `chmod 600` (git-ignored)  | The cutover (E6, when the live app's settings are written); you add them later, the rehearsal runs on Cloudflare's test keys (Q7) |
| 4   | ~~`noreply@alhidaya.qa` password~~ **I generate it** (Q8), on the server, with `uapi`, and never display it | The site's mail login (plan Q24)                          | Nothing from you; you may read or reset it in cPanel any time                                       | Phase D       |
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

- [x] **C1** (2026-11-14) Me. **Production database** (second slot): `alhidaya_site`, the **app user** `alhidaya_app`
      (SELECT, INSERT, UPDATE, DELETE only) and the **migration user** `alhidaya_mig` (all rights on that database
      only), random passwords generated on the server and never shown. They sit in `~/alhidaya-data/.secrets.env`
      (mode 600, folder 700) with the Better Auth, IP-hash and cron secrets, for C4. _Verified:_ both log in from
      127.0.0.1 (as `@localhost`); `SHOW GRANTS` is as intended. The old database and its user are untouched.
- [x] **C2** (2026-11-14) Me. **Private folder:** `~/alhidaya-data/cvs` (mode `700`, outside `public_html`). _Still to
      do with the app (C3/C4):_ the release folders, and the media folder with its `.htaccess` (no listing, no scripts,
      images and PDF only, `nosniff`; folders `755`, files `644`), made by the app itself. During rehearsal the media
      folder sits in the rehearsal host's docroot; the live one is made at the cutover (E5).
- [x] **C3** (2026-11-14, rehearsal app) Me. **Node.js app** with `cloudlinux-selector` (Node 22.22.0, production, one
      Passenger process, D119). Created for `preview.alhidaya.qa`: app folder `~/alhidaya-rehearsal` (outside
      `public_html`), `app.js` the one stable startup file (it requires `./current/server.js`), `releases/` and a
      `current` link, today pointing at a one-line placeholder release that answers 200 with `noindex`. _Proven:_ Apache
      and Passenger answer for the host over HTTP and HTTPS (by address; the certificate is cPanel's self-signed one
      until AutoSSL can validate). The production app is created the same way at E6.
- [~] **C4** Me. **App environment** set in the selector: `NODE_ENV`, `NEXT_PUBLIC_SITE_URL`, the app's database URL,
      SMTP, the three secrets, Turnstile, `MEDIA_DIR`, `MEDIA_URL`, `CV_DIR`. `SERVE_MEDIA` and `KIT_PREVIEW` stay unset.
      _Done for the rehearsal app (2026-11-14):_ every value except SMTP, with Cloudflare's public always-pass test
      keys for Turnstile (the site's real keys replace them, item 3) and `NEXT_PUBLIC_SITE_URL=https://preview.alhidaya.qa`.
      The migration login is **not** in the app's environment (AGENTS.md §9: only the release workflow uses it).
      _Still to do:_ `SMTP_*` when you supply the new `noreply@` password (item 4). The selector writes these values into
      the host's `.htaccess` (inside `<IfModule Litespeed>`, so Apache ignores them) as well as its own settings; Apache
      never serves `.ht*` files, which D4 proves.
- [ ] **C5** Me. **Cron:** daily `POST /api/cron/retention` and `POST /api/cron/mail-retry` every 10 minutes, each with
      the bearer `CRON_SECRET` read from the server's environment, never written into the crontab text.
- [ ] **C6** Both. **Mail:** the `noreply@` password rotated (item 4); mail routing confirmed **Remote**; DKIM and
      DMARC `p=none` records (R8.3) added **at HostCarts' DNS, not in cPanel's Zone Editor** (§2: cPanel's zone is not
      the one the world reads). MX, SPF and the existing records are not touched. Optional for launch: SPF already
      passes for this server through its `+a`, so DKIM and DMARC improve inbox placement but do not block it.
- [x] **C7** (2026-11-14) Me. **Deploy key:** a dedicated ed25519 pair made on this Mac (`~/.ssh/alhidaya_release_ed25519`,
      no passphrase, used only by the workflow); the public half was appended to the `alhidaya` user's
      `authorized_keys` with `no-agent-forwarding,no-X11-forwarding` (the file was copied to
      `authorized_keys.before-release-key` first; your own key is untouched) and a login with it was tested. The private
      half, the host's three public keys (checked equal to the ones this Mac already trusts), host, port and user are
      GitHub repository secrets (`RELEASE_SSH_KEY`, `RELEASE_SSH_KNOWN_HOSTS`, `RELEASE_SSH_HOST`, `RELEASE_SSH_PORT`,
      `RELEASE_SSH_USER`), set with `gh` and never printed. Remove the key line from `authorized_keys` and delete the
      secrets to revoke it.

### Phase D: Rehearse on a hidden host (DROPPED, 2026-11-14)

The user: "no need of rehearsal or anything", "i want the new site live". What the first rehearsal run proved on the
real server before it was dropped: the release uploads, verifies (SHA-256), unpacks and loads; Drizzle Kit migrates
`alhidaya_site` through the SSH tunnel; the switch, restart and health check work; the app runs under Passenger with
its settings and answers with its own headers (`/robots.txt` 200, `/` 404 while no page exists). It also found three
tooling bugs (§9 items 13, 14) that are fixed and tested, and two open questions (items 15, 16) that the cutover
resolves with the real site behind the maintenance page. The rehearsal app, its releases, the `preview.alhidaya.qa`
subdomain and its folder were **removed from the server** (2026-11-14); nothing of the old site was touched (its
`.htaccess` is byte-identical to the backup's, and it still answers).

### Phase E: Cutover (the user's go is given: "i want the new site live"; the window is about 20 minutes)

Time zone: Qatar (UTC+3). Rollback is §5. **The release is a version tag** (`.github/workflows/release.yml`, D201): you
create `v1.0.0`; it checks (about three minutes, side by side: the tag and version, static gates, unit tests, build; main's own long CI does **not** gate a release, so you never wait for it), then deploys to `alhidaya.qa`. Everything the tag cannot do for the first release is done here.

- [x] **E1** Me. **Before the window (the live site is not affected):** push the tag workflow to `main` (main's long CI
      runs on its own and does not hold the release back); stage the launch content with
      `scripts/content-import.sh --media-dir alhidaya-data/media --no-restart`: the 487 media files into
      `~/alhidaya-data/media` (outside `public_html`; the app serves `/media/` itself with `SERVE_MEDIA=true`, D202) and
      the content rows into the empty `alhidaya_site`, counted against the export.
- [x] **E2** Me. **Final backup** into `backups/2026-11-14-final-before-switch/` (the old site still receives
      applications), verified as in B4/B5.
- [x] **E3** Me. **Maintenance page on:** `scripts/maintenance.sh on`; every URL answers the notice (§6).
- [x] **E4** Me. **Move the old site aside:** everything in `public_html` except `.well-known/`, `maintenance.html` and
      `.htaccess` → `~/old-site-2026-11-14/` (same filesystem, instant); the old `.htaccess` goes with it and a fresh one
      keeps the maintenance block above `deploy/production/htaccess.block` (plain HTTP to HTTPS, and `www` to
      `alhidaya.qa` with a 301: the site refuses a form posted from any other address; SSL challenges excepted; proven
      in Apache by `scripts/test-site-rules.sh`). `.well-known.zip` leaves the web here.
- [x] **E5** Me. **Create the live Node.js app** (`alhidaya-site`, `alhidaya.qa`, Node 22, one Passenger process) with
      the settings of C4 (the live address, the app's database login, the secrets, `MEDIA_DIR=~/alhidaya-data/media`,
      `SERVE_MEDIA=true`, Turnstile's public test keys until you add the real ones, the mail login: `mail.alhidaya.qa`
      port 465 over TLS, its certificate checked valid for that name), a new password for `noreply@alhidaya.qa`
      generated on the server and never shown (the mailbox login is tested before it is used), and the two cron jobs
      (C5: the bearer is read from the server's secrets file when the job runs, never written into the crontab).
- [x] **E6** You. **Create the tag `v1.0.0`** on the commit I name (`git tag -a v1.0.0 -m "v1.0.0" <commit> && git push
      origin v1.0.0`, or publish a GitHub release). I give you the release notes.
- [x] **E7** Me. Watch the run: checks, build, upload, SHA-256, migrate, switch, health check (switched back by itself if
      it fails), and the check of the live site from the internet with the window's token.
- [x] **E8** Me. **Smoke test on the real domain** with the window's token, maintenance still in front of visitors: every
      public page, the 301 map, sitemap, robots, a media file, the three forms, a CV upload (stored `700`/`600`, not
      web-reachable), admin sign-in, both cron routes with and without the bearer, error pages without stack or SQL.
- [x] **E9** Me. **Maintenance page off.**
- [x] **E10** Me. Final checks on the public domain; watch the app for 30 minutes (5xx, memory, restarts).
- [~] **E11** You. "Cutover accepted" or "roll back". Create the admin account first (you type the password at a hidden
      prompt: `scripts/admin-create.sh`, which asks twice and prints nothing secret).

**How the cutover went (2026-11-14, UTC).** Maintenance page on 11:03 (it then stayed on far longer than the planned
25 minutes, about 73 minutes, mostly waiting between steps); final backup (the first full backup plus an increment: a
full re-copy timed out mid-stream, so the files changed since the first backup and a fresh database dump were taken, row
counts equal to the morning's); old site moved aside 11:55; live app, mail password and cron jobs set up; you pushed
`v1.0.0` at 12:01; checks passed at 12:06, deploy at 12:12 (health check and a check from the internet, including a
media file); my smoke test behind the page passed (every page, the 301 map, robots, sitemap, media caching, security
headers, the admin API refusing without a session, the cron routes, both forms end to end: the enquiry and a CV
application were saved, mailed and the CV stored `700`/`600` outside the web root and unreachable; the test records and
the test CV were then deleted); maintenance page off 12:16.


### Phase F: After launch

- [ ] **F1** Me. `v1.0.0` tag and release notes; the plan's tracker rows R8.1 to R8.7 set to DONE; `changelog.md`;
      decisions recorded.
- [ ] **F2** You. Submit the sitemap in Google Search Console (R8.6) when you are ready.
- [ ] **F3** Me. Day 1, day 3 and day 7 checks: disk use, errors, mail retries, cron ran.
- [ ] **F4** Both. The speed check from Qatar and the Cloudflare-proxy decision (D25, R8.5).
- [ ] **F5** You. Hand the backup to the client (D50), then say when the old site and database may be deleted (§8).
- [x] **F6** Me, confirmed by the owner on 2026-11-16. Replace `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in the live cPanel Node.js app and restart it. The Careers, Quote and Contact pages served the production site key. Cloudflare recognised the configured secret in a Siteverify probe, and the live Careers widget issued a token in the browser. GitHub builds and local tests use Cloudflare's test keys.

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

## 9. Unknowns, as found (the rehearsal was dropped; the rest are settled at the cutover)

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
7. **`NEXT_PUBLIC_SITE_URL` is read twice.** Next writes `process.env.NEXT_PUBLIC_SITE_URL` into the build
   (`publicSiteUrl()`: the sitemap, robots.txt, canonical URLs and JSON-LD), while sign-in, the origin check and mail
   links read it at run time. The release is therefore **built once with `https://alhidaya.qa`** and the rehearsal app
   overrides only the run-time value with the preview host; the rehearsal's sitemap and canonicals name alhidaya.qa,
   which is what the live site will say (the rehearsal host is `noindex`). D4 checks both.
8. **Settings written into `.htaccess`.** The selector keeps the app's environment in the host's `.htaccess` (and its
   own settings). `maintenance.sh` and any copy of that file therefore hold secrets: they stay `.ht*` files (never
   served), mode 644 or tighter, and are never downloaded into the backup folder unredacted.

9. **An empty database answers 404 on `/`** (the pages show only published content), so the first rehearsal deploy,
   before the content is loaded, would fail a plain "home page is 200" check. The server-side check therefore accepts
   404 **only** while no page document (`PAGE:%`) exists (migration 0007 seeds one `TYPOGRAPHY` row, so the table is
   never empty), and only with `/robots.txt` at 200 and the app's own headers (Apache cannot fake them); any 5xx, or
   a 404 once a page exists, switches back. Found by running the pruned build
   against a freshly migrated scratch MySQL.
10. **The app caches what it read.** Content written straight into the database is invisible to a running app until
    it restarts, so `content-import.sh` ends with a restart and a health check.
11. **Disk.** The account's quota is 1 GB (about 295 MB used before this release). A release is about 121 MB unpacked
    and 65 MB packed; `release-deploy.sh` refuses early when the quota cannot take it, keeps the newest two releases per
    app and never deletes the live one. Plan for it: rehearsal app about 140 MB (release plus media), then it is removed
    before the live app (about 140 MB, and a second release when v1.0.1 comes).
12. **The SSH tunnel to the server's MySQL works** with the release key (checked 2026-11-14: the MySQL 8.0.46 greeting
    arrived through `-L`), so migrations use Drizzle Kit itself, not hand-applied SQL.

13. **Apache's loopback address is the wrong place to check from.** `curl --resolve host:443:127.0.0.1` on the server
    reaches Apache's _default_ host (cPanel's page: `/` 200, `/robots.txt` 404) for any name; the server's own address
    (`hostname -I`, 15.235.174.14) reaches the domain's own virtual host. The first rehearsal's health check used the
    loopback address and saw only cPanel's page, so it rolled back a release that was fine (the safety net worked; the
    check was aimed wrongly). Checks now use the server's own address, or `HEALTH_IP`.
14. **"No content yet" cannot mean an empty table.** Migration 0007 seeds one `TYPOGRAPHY` document, so the rule is "no
    `PAGE:%` document exists" (item 9). A rollback is now confirmed by "`/robots.txt` answers 200" (the placeholder has
    none of the app's headers and could never pass the full check).

15. **OPEN: the preview host answers 404 for every path over IPv4 from my network, and correctly over IPv6/NAT64 and
    from the server itself** (same Apache address, same headers, same build: checked with `curl -4` and `curl -6`
    against `15.235.174.14`, and through an SSH tunnel). The 404 is the app's own page, reached with a path outside
    `/api` even for `/api/cron/retention`, so the request is changed before the app sees it. Not understood yet; it must
    be understood before the preview host is shown to anyone, and before the cutover (the live site must answer over
    IPv4). To find out: the web server's access log for this vhost, and what rewrites the path.
16. **OPEN: static files in the docroot are not served by Apache on the preview host.** `/php.ini` (a real file in
    `rehearsal-site`) answers the app's 404 page, so Passenger takes every request. The plan has Apache serve
    `/media/...` straight from the docroot (plan §21.3); D4 must prove that with a real media file after the content
    import, or the media folder must be reached another way (`SERVE_MEDIA`, or Passenger's public folder).

---

## 10. Sign-off log

| Checkpoint            | Date | Confirmed by |
| --------------------- | ---- | ------------ |
| Q1 payment confirmed  | 2026-11-14 | You (chat answer) |
| B6 backups received   | 2026-11-14 | You (chat answer) |
| C: server prepared    |      |              |
| D7 rehearsal approved |      |              |
| E1 go for cutover     | 2026-11-14 | You (chat answer) |
| E11 cutover accepted  |      |              |
| F5 old site deletion  |      |              |
| F6 live Turnstile keys | 2026-11-16 | You (chat answer) |
