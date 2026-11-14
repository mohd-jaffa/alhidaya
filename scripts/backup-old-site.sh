#!/usr/bin/env bash
# Streams a complete backup of the old site from the cPanel server to this machine (RELEASE.md Phase B).
#
#   scripts/backup-old-site.sh [label]        label defaults to pre-v1.0.0
#
# READ-ONLY on the server: everything is streamed straight over SSH, so no file is written there and the
# 1 GB quota is untouched. Compression happens here, not on the server's single shared core.
# The result is secrets and applicants' CVs: backups/ is git-ignored, mode 700, files 600.
# Verify it afterwards with scripts/verify-backup.sh.
set -euo pipefail
umask 077

SSH_HOST="${SSH_HOST:-alhidaya.qa}"
SSH_PORT="${SSH_PORT:-2200}"
SSH_USER="${SSH_USER:-alhidaya}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/alhidaya_cpanel_rsa}"
SITE="https://${SSH_HOST}"

label="${1:-pre-v1.0.0}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/backups/$(date +%F)-$label"

rssh() {
  ssh -p "$SSH_PORT" -i "$SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes -o ServerAliveInterval=15 \
    "$SSH_USER@$SSH_HOST" "$@"
}

mkdir -p "$root/backups" "$dest/server-config"
chmod 700 "$root/backups" "$dest" "$dest/server-config"
echo "Backup folder: backups/$(basename "$dest")"

# ---- 1. Inventory: the server's settings as they are now (cPanel list/get calls, read-only) ----
echo "[1/5] Server inventory"
uapi_json() { rssh "uapi --output=json $2" >"$dest/server-config/$1.json" 2>"$dest/server-config/$1.err" || true; }
uapi_json quota "Quota get_quota_info"
uapi_json domains "DomainInfo domains_data"
uapi_json mailboxes "Email list_pops"
uapi_json databases "Mysql list_databases"
uapi_json database-users "Mysql list_users"
uapi_json ssl-hosts "SSL installed_hosts"
uapi_json php-versions "LangPHP php_get_vhost_versions"
uapi_json dns-zone "DNS parse_zone zone=${SSH_HOST}"
rssh 'crontab -l 2>&1; echo "---"; php -v 2>&1 | head -1; echo "---"; ls -lA ~/.ssh 2>&1 | awk "{print \$1, \$NF}"' \
  >"$dest/server-config/cron-php-sshfiles.txt" 2>&1 || true
rssh 'cat ~/public_html/.htaccess' >"$dest/server-config/docroot.htaccess" 2>/dev/null || true
find "$dest/server-config" -name '*.err' -size 0 -delete
# The zone as the public resolvers see it (public information).
for name in "$SSH_HOST" "www.$SSH_HOST" "mail.$SSH_HOST" "_dmarc.$SSH_HOST" "default._domainkey.$SSH_HOST"; do
  for type in A AAAA CNAME MX TXT NS; do
    printf '%s %s\n' "$name" "$type"
    # dig exits 9 when a resolver does not answer; this record list is informational, so never fatal.
    { dig +short +time=3 +tries=1 "$name" "$type" 2>/dev/null || true; } | sed 's/^/    /'
  done
done >"$dest/server-config/dns-public.txt"
# What the live site answers now, so a rollback can be compared to it (status, redirect, size, body hash).
{
  printf 'taken %s\n' "$(date -u +%FT%TZ)"
  for path in / /about_us /contact-us /service-detail/child-care /profile.pdf /robots.txt; do
    body="$(mktemp)"
    meta="$(curl -sS -o "$body" -w '%{http_code} redirect=%{redirect_url} bytes=%{size_download}' "$SITE$path" || echo 'curl-failed')"
    printf '%-40s %s sha256=%s\n' "$path" "$meta" "$(shasum -a 256 <"$body" | cut -d' ' -f1)"
    rm -f "$body"
  done
} >"$dest/server-config/site-fingerprint.txt"
# The server's own list of files and sizes, for the completeness check.
rssh 'cd "$HOME" && find . -xdev \( -path ./tmp -o -path ./.cagefs -o -path ./.trash -o -path ./ssl/keys \) -prune -o -type f -printf "%s\t%p\n"' |
  LC_ALL=C sort -t "$(printf '\t')" -k2 >"$dest/server-config/remote-files.tsv"
echo "      $(wc -l <"$dest/server-config/remote-files.tsv" | tr -d ' ') files on the server"

# ---- 2. Files: the whole home folder (old site, uploads, CVs, mail, settings) ----
echo "[2/5] Files (home folder)"
set +e
rssh 'cd "$HOME" && tar --warning=no-file-changed -cf - --exclude=./tmp --exclude=./.cagefs --exclude=./.trash --exclude=./ssl/keys .' \
  2>"$dest/home-alhidaya.tar.stderr" | gzip -6 >"$dest/home-alhidaya.tar.gz"
status=("${PIPESTATUS[@]}")
set -e
# tar exits 1 when a file changed while it was read (a log); anything else is a failure.
if [ "${status[0]}" -gt 1 ] || [ "${status[1]}" -ne 0 ]; then
  echo "      FAILED: tar exit ${status[0]}, gzip exit ${status[1]}; see home-alhidaya.tar.stderr" >&2
  exit 1
fi
[ -s "$dest/home-alhidaya.tar.stderr" ] || rm -f "$dest/home-alhidaya.tar.stderr"
echo "      $(du -h "$dest/home-alhidaya.tar.gz" | cut -f1) written"

# ---- 3. Database: the old site's, complete, plus exact row counts ----
echo "[3/5] Database"
rssh 'bash -s -- dump' <"$root/scripts/old-site-db.remote.sh" | gzip -6 >"$dest/alhidaya_hidaya.sql.gz"
rssh 'bash -s -- counts' <"$root/scripts/old-site-db.remote.sh" >"$dest/server-config/row-counts.tsv"
echo "      $(du -h "$dest/alhidaya_hidaya.sql.gz" | cut -f1) dump, $(wc -l <"$dest/server-config/row-counts.tsv" | tr -d ' ') tables"

# ---- 4. How to restore ----
echo "[4/5] Restore notes"
cat >"$dest/README-RESTORE.md" <<'EOF'
# Restoring the old Al Hidaya site

This folder holds secrets and applicants' CVs. Keep it private. Everything below that WRITES to the server needs the
owner's explicit go-ahead (RELEASE.md, plan D44).

## What is here

| File                      | What it is                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `home-alhidaya.tar.gz`    | The whole home folder: `public_html` (the old site), uploads, CVs, mail, settings           |
| `alhidaya_hidaya.sql.gz`  | The old database, complete, self-contained (`CREATE DATABASE` + data)                       |
| `server-config/`          | Domains, mailboxes, DB users, SSL hosts, DNS, cron, `.htaccess`, row counts, the live-site fingerprint |
| `MANIFEST.sha256`         | SHA-256 of every file; check with `shasum -a 256 -c MANIFEST.sha256`                        |

Left out on purpose: `tmp/` (cache), `.cagefs/`, `.trash/`, and `ssl/keys` (private keys; AutoSSL issues new ones).

## Look inside without touching the server

```sh
mkdir restored && tar -xzf home-alhidaya.tar.gz -C restored      # the files
gunzip -c alhidaya_hidaya.sql.gz | less                          # the database
```

## Put the old SITE FILES back (writes to the server)

```sh
# from this folder; host, port and user are in RELEASE.md
tar -xzf home-alhidaya.tar.gz -C /tmp/old --no-same-owner         # extract somewhere safe first
tar -C /tmp/old -cf - ./public_html | ssh -p 2200 -i ~/.ssh/alhidaya_cpanel_rsa alhidaya@alhidaya.qa 'tar -xf - -C "$HOME"'
```

Do this only into an emptied `public_html` (the cutover moved the old files to `~/old-site-2026-11-14`; moving them
back with `mv` is faster and is the normal rollback, see RELEASE.md section 5).

## Put the old DATABASE back (writes to the server)

The old database login is in the old site's own settings file inside the archive
(`public_html/application/.env`, keys `DB_USERNAME` and `DB_PASSWORD`). Do not paste it into chat or tickets.

```sh
gunzip -c alhidaya_hidaya.sql.gz | ssh -p 2200 -i ~/.ssh/alhidaya_cpanel_rsa alhidaya@alhidaya.qa \
  'mysql -u <the old DB user> -p'
```

`restore-drill.log` (from `scripts/verify-backup.sh`) shows these files were restored into a throwaway database and
that every table's row count matched the server's.
EOF

# ---- 5. Checksums ----
echo "[5/5] Checksums"
(cd "$dest" && find . -type f ! -name MANIFEST.sha256 -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 >MANIFEST.sha256)
find "$dest" -type f -exec chmod 600 {} +
echo "Done. Next: scripts/verify-backup.sh backups/$(basename "$dest")"
