#!/usr/bin/env bash
# Puts one built release on the client's server and switches the site to it (docs/RELEASE.md D2 and E6/E7).
# The release workflow (.github/workflows/release.yml) runs it; it can also be run by hand from a checkout.
#
#   scripts/release-deploy.sh --app alhidaya-site --domain alhidaya.qa --public-url https://alhidaya.qa \
#       --archive release.tar.gz --release-id 20261114-143000-91da200 [--keep 2] [--no-migrate]
#
# What it does, in order, stopping at the first failure:
#   1. checks the account has the disk quota for it (a release unpacks to about twice its archive; the account has
#      1 GB), uploads the archive over SSH and has the server check its SHA-256, refuse anything unsafe and unpack it
#      into a NEW folder under <app>/releases/ (scripts/release-remote.sh space, prepare);
#   2. saves the database (release-remote.sh dump);
#   3. migrates it as the migration user through an SSH tunnel to the server's own MySQL with Drizzle Kit, the same
#      tool and the same files as development. The migration login is read from the server's secrets file over this
#      same SSH session at the moment it is needed: it is never stored in GitHub, written to disk or printed;
#   4. switches `current`, restarts the app and checks the site on its own domain; if the site does not answer, it
#      switches back by itself (release-remote.sh activate);
#   5. only when that worked, deletes releases older than the newest <keep>;
#   6. with --public-url, checks the live site the way a visitor reaches it (over the internet, from wherever this
#      runs): the home page, robots.txt and one media file. If the maintenance page is up, the window's release-check
#      token (read over SSH, never printed) lets this request through. A failure here fails the run but changes nothing:
#      the release itself already passed its own check, so this points at the network, not at the release.
# If a step before the switch fails, the unpacked release is removed again and the site never changed.
#
# Settings come from the environment: RELEASE_SSH_HOST, RELEASE_SSH_PORT, RELEASE_SSH_USER, SSH_KEY_FILE (the private
# key), optionally SSH_KNOWN_HOSTS_FILE (default: the user's own known_hosts).
set -euo pipefail

app="" domain="" archive="" release="" keep=2 migrate=yes public_url=""
while [ $# -gt 0 ]; do
  case "$1" in
    --app) app="$2"; shift 2 ;;
    --domain) domain="$2"; shift 2 ;;
    --archive) archive="$2"; shift 2 ;;
    --release-id) release="$2"; shift 2 ;;
    --keep) keep="$2"; shift 2 ;;
    --public-url) public_url="$2"; shift 2 ;;
    --no-migrate) migrate=no; shift ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done
for name in app domain archive release; do
  [ -n "${!name}" ] || { echo "missing --${name/release/release-id}" >&2; exit 2; }
done
[ -f "$archive" ] || { echo "the archive $archive does not exist" >&2; exit 2; }
# These reach a remote path and a remote command: only plain names, checked again on the server.
[[ "$app" =~ ^[a-z][a-z0-9-]{2,40}$ ]] || { echo "--app is not a plain folder name" >&2; exit 2; }
[[ "$release" =~ ^[0-9]{8}-[0-9]{6}-[0-9a-f]{7,40}$ ]] || { echo "--release-id is not valid" >&2; exit 2; }
[[ "$domain" =~ ^[a-z0-9.-]+$ ]] || { echo "--domain is not a plain host name" >&2; exit 2; }
[[ "$keep" =~ ^[1-9][0-9]?$ ]] || { echo "--keep must be a number from 1 to 99" >&2; exit 2; }
[ -z "$public_url" ] || [[ "$public_url" =~ ^https://[a-z0-9.-]+$ ]] || { echo "--public-url must be https://host" >&2; exit 2; }
: "${RELEASE_SSH_HOST:?RELEASE_SSH_HOST is not set}" "${RELEASE_SSH_USER:?RELEASE_SSH_USER is not set}"
: "${SSH_KEY_FILE:?SSH_KEY_FILE is not set}"

here="$(cd "$(dirname "$0")" && pwd)"
remote_script="$here/release-remote.sh"
tunnel_port="${TUNNEL_PORT:-33306}"
ssh_options=(-p "${RELEASE_SSH_PORT:-2200}" -i "$SSH_KEY_FILE" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes)
[ -n "${SSH_KNOWN_HOSTS_FILE:-}" ] && ssh_options+=(-o "UserKnownHostsFile=$SSH_KNOWN_HOSTS_FILE")
target="$RELEASE_SSH_USER@$RELEASE_SSH_HOST"

rssh() { ssh "${ssh_options[@]}" "$target" "$@"; }
# The remote script is sent as the shell's own input, with its command and arguments after it.
remote() { rssh bash -s -- "$@" <"$remote_script"; }

tunnel_pid=""
cleanup() {
  [ -z "$tunnel_pid" ] || kill "$tunnel_pid" 2>/dev/null || true
}
trap cleanup EXIT

step() { printf '\n== %s\n' "$*"; }

sha="$(shasum -a 256 "$archive" 2>/dev/null | cut -d' ' -f1 || true)"
[ -n "$sha" ] || sha="$(sha256sum "$archive" | cut -d' ' -f1)"
echo "release $release, $(du -m "$archive" | cut -f1) MB, SHA-256 $sha"

step "1. check the space, upload and unpack"
remote space "$app" "$(($(du -m "$archive" | cut -f1) * 3 + 50))"
rssh "umask 027; cat > \"\$HOME/$app/releases/.incoming-$release.tar.gz\"" <"$archive"
remote prepare "$app" "$release" "$sha" || {
  echo "the release was not accepted by the server; the site did not change" >&2
  exit 1
}

abort_release() {
  echo "removing the unpacked release; the site did not change" >&2
  remote abort "$app" "$release" || true
}

step "2. save the database"
remote dump "$app" "$release" || {
  abort_release
  exit 1
}

if [ "$migrate" = yes ]; then
  step "3. migrate the database as the migration user (through an SSH tunnel)"
  login="$(rssh 'grep -m1 "^MIGRATION_DATABASE_URL=" "$HOME/alhidaya-data/.secrets.env" | cut -d= -f2-')"
  login="${login//\"/}"
  login="${login//\'/}"
  if [[ ! "$login" =~ ^mysql://([^:@/]+):([^@/]+)@[^/]+/([A-Za-z0-9_]+)$ ]]; then
    echo "the server's migration login is not in the expected form" >&2
    abort_release
    exit 1
  fi
  db_user="${BASH_REMATCH[1]}" db_password="${BASH_REMATCH[2]}" db_name="${BASH_REMATCH[3]}"
  login=""
  # GitHub hides the value in its logs from here on.
  [ -z "${GITHUB_ACTIONS:-}" ] || echo "::add-mask::$db_password"
  ssh "${ssh_options[@]}" -o ExitOnForwardFailure=yes -N -L "127.0.0.1:$tunnel_port:127.0.0.1:3306" "$target" &
  tunnel_pid=$!
  tunnel_up=no
  for _ in $(seq 1 15); do
    if ! kill -0 "$tunnel_pid" 2>/dev/null; then break; fi
    if (exec 3<>"/dev/tcp/127.0.0.1/$tunnel_port") 2>/dev/null; then tunnel_up=yes; break; fi
    sleep 1
  done
  if [ "$tunnel_up" != yes ]; then
    echo "the SSH tunnel to the server's MySQL did not come up" >&2
    abort_release
    exit 1
  fi
  if ! MIGRATION_DATABASE_URL="mysql://$db_user:$db_password@127.0.0.1:$tunnel_port/$db_name" npx drizzle-kit migrate; then
    echo "the migration failed; nothing was switched" >&2
    abort_release
    exit 1
  fi
  db_password=""
  cleanup
  tunnel_pid=""
else
  step "3. migration skipped (--no-migrate)"
fi

step "4. switch, restart and check"
remote activate "$app" "$release" "$domain"

step "5. tidy old releases"
remote prune "$app" "$keep"

if [ -n "$public_url" ]; then
  step "6. check the live site from outside"
  token="$(rssh 'cat "$HOME/alhidaya-data/.maintenance-token" 2>/dev/null || true')"
  header=()
  if [ -n "$token" ]; then
    [ -z "${GITHUB_ACTIONS:-}" ] || echo "::add-mask::$token"
    header=(-H "X-Release-Check: $token")
    echo "  the maintenance page is up: the check carries this window's token"
  fi
  public_ok=no
  for attempt in 1 2 3 4 5 6; do
    page="$(mktemp)"
    code="$(curl -sS -o "$page" -w '%{http_code}' --max-time 30 ${header[@]+"${header[@]}"} "$public_url/" || true)"
    robots="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 ${header[@]+"${header[@]}"} "$public_url/robots.txt" || true)"
    media_url="$(grep -o '/media/[0-9]\{4\}-[0-9]\{2\}/[A-Za-z0-9._-]*' "$page" | head -n1 || true)"
    media="skipped (the home page names none)"
    [ -z "$media_url" ] || media="$(curl -sS -o /dev/null -w '%{http_code} %{content_type}' --max-time 30 ${header[@]+"${header[@]}"} "$public_url$media_url" || true)"
    echo "  try $attempt: / $code, /robots.txt $robots, media $media"
    if [ "$code" = 200 ] && [ "$robots" = 200 ] && grep -qi '</html>' "$page" && { [ -z "$media_url" ] || [[ "$media" == "200 image/"* ]]; }; then
      public_ok=yes
    fi
    rm -f "$page"
    [ "$public_ok" = yes ] && break
    sleep 10
  done
  [ "$public_ok" = yes ] || {
    echo "the release is live and passed its own check, but $public_url does not answer correctly from here" >&2
    exit 1
  }
fi

printf '\nRelease %s is live on %s.\n' "$release" "$domain"
