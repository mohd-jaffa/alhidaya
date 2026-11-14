#!/usr/bin/env bash
# Runs ON the client's server, sent over SSH by scripts/release-deploy.sh (docs/RELEASE.md, D2 and E6/E7).
#
#   release-remote.sh space    <app> <need-mb>            refuse early when the account's disk quota is too small
#   release-remote.sh prepare  <app> <release> <sha256>   check the uploaded archive and unpack it beside the others
#   release-remote.sh dump     <app> <release>            save the database before it is migrated
#   release-remote.sh activate <app> <release> <domain>   switch `current`, restart, check the site; undo by itself
#   release-remote.sh restart  <app> <domain>             restart the live release and check the site again
#   release-remote.sh abort    <app> <release>            remove a release that was unpacked but never switched to
#   release-remote.sh prune    <app> <keep>               keep the newest <keep> releases (and the live one)
#
# <app> is the app folder under the account's home (`alhidaya-rehearsal`, later the live one). Its layout:
#
#   <app>/app.js            the one stable startup file; it requires ./current/server.js
#   <app>/current           a link to releases/<release>, replaced in one atomic rename
#   <app>/releases/<id>/    one unpacked release each (the standalone build); never edited, never overwritten
#   <app>/tmp/restart.txt   touched to make Passenger start the app again
#
# It never prints a secret: the database login is read from ~/alhidaya-data/.secrets.env inside this shell. It only
# ever writes inside <app>/ and ~/alhidaya-data/db-backups/, and it removes nothing but releases it names.
set -euo pipefail
umask 027

HEALTH_TRIES="${HEALTH_TRIES:-12}"
HEALTH_WAIT="${HEALTH_WAIT:-5}"
SECRETS="${SECRETS:-$HOME/alhidaya-data/.secrets.env}"
BACKUPS="${BACKUPS:-$HOME/alhidaya-data/db-backups}"
MAINTENANCE_TOKEN="${MAINTENANCE_TOKEN_FILE:-$HOME/alhidaya-data/.maintenance-token}"

die() {
  echo "release-remote: $*" >&2
  exit 1
}

command_name="${1:-}"
app="${2:-}"
release="${3:-}"

# Everything that reaches a path or a command is checked first: no slashes, no dots, no surprises.
[[ "$app" =~ ^[a-z][a-z0-9-]{2,40}$ ]] || die "the app folder name is not valid"
dir="$HOME/$app"
[ -f "$dir/app.js" ] && [ -d "$dir/releases" ] || die "$app is not an app folder here (app.js or releases/ is missing)"

check_release() {
  [[ "$release" =~ ^[0-9]{8}-[0-9]{6}-[0-9a-f]{7,40}$ ]] || die "the release id is not valid"
}

current_target() { readlink "$dir/current" 2>/dev/null || true; }

# Reads one login (MIGRATION_DATABASE_URL or DATABASE_URL) from the secrets file into db_user, db_host, db_port and
# db_name, and exports the password as MYSQL_PWD for the mysql tools. Never prints any of it. Call it in a subshell
# when the password should not outlive the command.
db_login() { # db_login <VARIABLE NAME>
  local url
  [ -r "$SECRETS" ] || return 1
  url="$(grep -m1 "^$1=" "$SECRETS" | cut -d= -f2- | tr -d "\"'")"
  [[ "$url" =~ ^mysql://([^:@/]+):([^@/]+)@([^/:]+)(:([0-9]+))?/([A-Za-z0-9_]+)$ ]] || return 1
  db_user="${BASH_REMATCH[1]}" db_host="${BASH_REMATCH[3]}" db_port="${BASH_REMATCH[5]:-3306}" db_name="${BASH_REMATCH[6]}"
  export MYSQL_PWD="${BASH_REMATCH[2]}"
}

# How many page documents (PAGE:HOME and the like) the site's database holds, or "unknown". Migration 0007 seeds one
# TYPOGRAPHY document, so "no content yet" cannot mean an empty table; it means no page has been saved.
document_count() (
  db_login DATABASE_URL || {
    echo unknown
    exit 0
  }
  mysql -N -B -h "$db_host" -P "$db_port" -u "$db_user" "$db_name" -e "SELECT COUNT(*) FROM documents WHERE \`key\` LIKE 'PAGE:%'" 2>/dev/null || echo unknown
)

# The address a check connects to: the server's own, never 127.0.0.1. Apache's virtual host for a domain answers on the
# server's address; the loopback address reaches its DEFAULT host, which shows cPanel's page for any name (found in the
# first rehearsal, 2026-11-14: / answered 200 and /robots.txt 404, both from cPanel). HEALTH_IP overrides it.
health_ip() {
  local ip
  if [ -n "${HEALTH_IP:-}" ]; then
    echo "$HEALTH_IP"
    return
  fi
  for ip in $(hostname -I 2>/dev/null); do
    case "$ip" in 127.* | *:*) ;; *)
      echo "$ip"
      return
      ;;
    esac
  done
  echo 127.0.0.1
}

# The site answers on its own domain, reached through this server's own address, so public DNS is not needed. While
# the maintenance page is up, the window's release-check token (scripts/maintenance.sh) lets this request through.
# Healthy means: /robots.txt answers 200, and / answers with a page that carries the headers only the app adds (the
# Apache docroot cannot fake them): 200 with a page, or, while the database holds no page at all (the first
# rehearsal, before the launch content is loaded), 404, which is the site's own "no page yet" answer and proves the
# database was reached. A 5xx, an Apache page or no answer is never healthy.
health() { # health <domain>
  local domain="$1" body headers code robots tries app_header ip header=()
  [[ "$domain" =~ ^[a-z0-9.-]+$ ]] || die "the domain is not valid"
  ip="$(health_ip)"
  [ -r "$MAINTENANCE_TOKEN" ] && header=(-H "X-Release-Check: $(tr -d '\n' <"$MAINTENANCE_TOKEN")")
  body="$(mktemp)"
  headers="$(mktemp)"
  for tries in $(seq 1 "$HEALTH_TRIES"); do
    code="$(curl -sk -D "$headers" -o "$body" -w '%{http_code}' --max-time 30 --resolve "$domain:443:$ip" ${header[@]+"${header[@]}"} "https://$domain/" || true)"
    robots="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 30 --resolve "$domain:443:$ip" ${header[@]+"${header[@]}"} "https://$domain/robots.txt" || true)"
    app_header=no
    grep -qi '^content-security-policy:' "$headers" && app_header=yes
    if [ "$robots" = 200 ] && [ "$app_header" = yes ]; then
      if [ "$code" = 200 ] && grep -qi '</html>' "$body"; then
        rm -f "$body" "$headers"
        echo "  healthy after $tries check(s): / answers 200 with a page, /robots.txt answers 200"
        return 0
      fi
      if [ "$code" = 404 ] && [ "$(document_count)" = 0 ]; then
        rm -f "$body" "$headers"
        echo "  healthy after $tries check(s): the database holds no pages yet, so / answers 404 as it should; /robots.txt answers 200"
        return 0
      fi
    fi
    echo "  check $tries of $HEALTH_TRIES: / answered ${code:-none} (app headers: $app_header), /robots.txt answered ${robots:-none}"
    sleep "$HEALTH_WAIT"
  done
  rm -f "$body" "$headers"
  return 1
}

# Is anything answering for the domain? Used only to confirm a rollback: the placeholder release has none of the app's
# own headers, so it could never pass health(), but it does answer /robots.txt.
alive() { # alive <domain>
  local domain="$1" tries code ip header=()
  ip="$(health_ip)"
  [ -r "$MAINTENANCE_TOKEN" ] && header=(-H "X-Release-Check: $(tr -d '\n' <"$MAINTENANCE_TOKEN")")
  for tries in $(seq 1 "$HEALTH_TRIES"); do
    code="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 30 --resolve "$domain:443:$ip" ${header[@]+"${header[@]}"} "https://$domain/robots.txt" || true)"
    [ "$code" = 200 ] && return 0
    sleep "$HEALTH_WAIT"
  done
  return 1
}

restart_app() { # restart_app <domain>
  local domain="$1" answer
  mkdir -p "$dir/tmp"
  touch "$dir/tmp/restart.txt"
  if command -v cloudlinux-selector >/dev/null 2>&1; then
    answer="$(cloudlinux-selector restart --json --interpreter nodejs --domain "$domain" --app-root "$app" 2>&1 || true)"
    case "$answer" in
      *'"result": "success"'* | *'"result":"success"'*) echo "  the selector restarted the app" ;;
      *) echo "  the selector did not confirm the restart; Passenger was asked through tmp/restart.txt" ;;
    esac
  fi
}

# Points `current` at <target> (a name inside releases/, or empty to leave it), in one rename.
point_current() { # point_current <release id>
  [ -d "$dir/releases/$1" ] || die "releases/$1 is not there"
  ln -sfn "releases/$1" "$dir/current.$$"
  mv -T "$dir/current.$$" "$dir/current"
}

case "$command_name" in
  space)
    need="${3:-}"
    [[ "$need" =~ ^[0-9]{1,5}$ ]] || die "the space needed must be a number of MB"
    # The account has a hard quota (1 GB): an unpack that runs out of it would leave a half-written release.
    remain="$(uapi --output=json Quota get_quota_info 2>/dev/null | grep -o '"megabytes_remain":[0-9.]*' | cut -d: -f2 | cut -d. -f1 || true)"
    if [ -z "$remain" ]; then
      echo "  the quota could not be read; going on"
      exit 0
    fi
    echo "  $remain MB of the quota are left; this release needs about $need MB"
    [ "$remain" -ge "$need" ] || die "not enough disk quota left (need $need MB, have $remain MB): remove an old release or the old rehearsal first"
    ;;

  prepare)
    check_release
    sha="${4:-}"
    [[ "$sha" =~ ^[0-9a-f]{64}$ ]] || die "the SHA-256 is not valid"
    archive="$dir/releases/.incoming-$release.tar.gz"
    [ -f "$archive" ] || die "the archive was not uploaded"
    [ ! -e "$dir/releases/$release" ] || {
      rm -f "$archive"
      die "releases/$release already exists; a release is never overwritten"
    }
    actual="$(sha256sum "$archive" | cut -d' ' -f1)"
    if [ "$actual" != "$sha" ]; then
      rm -f "$archive"
      die "the archive's SHA-256 differs from the one built (the upload was damaged); it was removed"
    fi
    echo "  archive SHA-256 matches"
    # Nothing outside the release folder, whatever the archive says.
    if tar -tzf "$archive" | grep -E '^/|(^|/)\.\.(/|$)' >/dev/null; then
      rm -f "$archive"
      die "the archive holds an absolute or parent path; it was removed"
    fi
    mkdir "$dir/releases/$release"
    if ! tar -xzf "$archive" -C "$dir/releases/$release" --no-same-owner; then
      rm -rf "${dir:?}/releases/$release" "$archive"
      die "the archive could not be unpacked"
    fi
    rm -f "$archive"
    for required in server.js package.json .next/static public; do
      [ -e "$dir/releases/$release/$required" ] || {
        rm -rf "${dir:?}/releases/$release"
        die "the release is missing $required; it was removed"
      }
    done
    for forbidden in .env .env.production .env.local; do
      [ ! -e "$dir/releases/$release/$forbidden" ] || {
        rm -rf "${dir:?}/releases/$release"
        die "the release holds $forbidden; it was removed"
      }
    done
    node_bin="${NODE_BIN:-$HOME/nodevenv/$app/22/bin/node}"
    "$node_bin" --check "$dir/releases/$release/server.js" || {
      rm -rf "${dir:?}/releases/$release"
      die "server.js does not load; the release was removed"
    }
    echo "  unpacked releases/$release ($(du -sm "$dir/releases/$release" | cut -f1) MB), server.js loads"
    ;;

  dump)
    check_release
    db_login MIGRATION_DATABASE_URL || die "the migration login is missing or not in the expected form"
    tables="$(mysql -N -B -h "$db_host" -P "$db_port" -u "$db_user" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$db_name'")"
    if [ "$tables" = 0 ]; then
      echo "  the database is empty: nothing to save"
      exit 0
    fi
    mkdir -p "$BACKUPS"
    chmod 700 "$BACKUPS"
    target="$BACKUPS/$release-before-migration.sql.gz"
    (umask 077 && mysqldump -h "$db_host" -P "$db_port" -u "$db_user" --single-transaction --routines --triggers \
      --default-character-set=utf8mb4 --set-gtid-purged=OFF "$db_name" | gzip -9 >"$target")
    gzip -t "$target"
    echo "  saved $tables tables to ~/alhidaya-data/db-backups/$(basename "$target") ($(du -k "$target" | cut -f1) KB)"
    # Keep the newest five only.
    # shellcheck disable=SC2012
    ls -1t "$BACKUPS"/*-before-migration.sql.gz 2>/dev/null | tail -n +6 | while read -r old; do rm -f "$old"; done
    ;;

  activate)
    check_release
    domain="${4:-}"
    [ -d "$dir/releases/$release" ] || die "releases/$release is not there: run prepare first"
    previous="$(current_target)"
    previous="${previous#releases/}"
    echo "  switching current: ${previous:-nothing} -> $release"
    point_current "$release"
    restart_app "$domain"
    if health "$domain"; then
      echo "  release $release is live on $domain"
      exit 0
    fi
    echo "  the site is NOT healthy on release $release: rolling back"
    if [ -n "$previous" ] && [ -d "$dir/releases/$previous" ]; then
      point_current "$previous"
      restart_app "$domain"
      if alive "$domain"; then
        die "ROLLED BACK to $previous, which answers; release $release was not accepted (it stays unpacked for inspection)"
      fi
      die "ROLLED BACK to $previous, but it does not answer either: look at the app's log"
    fi
    die "nothing to roll back to; release $release does not answer"
    ;;

  restart)
    domain="${3:-}"
    echo "  restarting $app on $domain"
    restart_app "$domain"
    health "$domain" || die "the site does not answer after the restart: look at the app's log"
    ;;

  abort)
    check_release
    [ "$(current_target)" != "releases/$release" ] || die "releases/$release is the live one; it is not removed"
    rm -rf "${dir:?}/releases/$release" "$dir/releases/.incoming-$release.tar.gz"
    echo "  removed releases/$release"
    ;;

  prune)
    keep="${3:-}"
    [[ "$keep" =~ ^[1-9][0-9]?$ ]] || die "keep must be a number from 1 to 99"
    live="$(current_target)"
    live="${live#releases/}"
    # Only folders named like a release; the placeholder and anything else are left alone.
    removed=0
    while read -r old; do
      [ "$old" = "$live" ] && continue
      rm -rf "${dir:?}/releases/$old"
      echo "  removed releases/$old"
      removed=$((removed + 1))
    done < <(
      # shellcheck disable=SC2012
      ls -1 "$dir/releases" | grep -E '^[0-9]{8}-[0-9]{6}-[0-9a-f]{7,40}$' | sort -r | tail -n +"$((keep + 1))"
    )
    echo "  kept the newest $keep and the live one; removed $removed"
    ;;

  *)
    die "usage: release-remote.sh prepare|dump|activate|abort|prune <app> ..."
    ;;
esac
