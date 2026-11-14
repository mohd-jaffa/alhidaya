#!/usr/bin/env bash
# Loads the approved launch content onto the client's server (docs/RELEASE.md Q4, D3 and E5): the media files first,
# then the database rows, so a row never names a file that is not there.
#
#   scripts/content-import.sh --media-dir alhidaya-data/media --no-restart [--source release-content]   (before the app exists)
#   scripts/content-import.sh --media-dir alhidaya-data/media --app alhidaya-site --domain alhidaya.qa      (into a running app)
#
# A running app is restarted at the end (scripts/release-remote.sh restart): it keeps what it read from the database in
# memory, so content written straight into the database is only seen after a restart. With --no-restart (the app is
# not set up yet, as at the first release) that step is skipped: the app reads the database afresh when it first starts.
#
# `release-content/` comes from `npx tsx --tsconfig tsconfig.json scripts/content-export.mts` (local database only;
# git-ignored). Needs the same SSH settings as scripts/release-deploy.sh (RELEASE_SSH_HOST, RELEASE_SSH_USER,
# SSH_KEY_FILE, optionally RELEASE_SSH_PORT and SSH_KNOWN_HOSTS_FILE). It refuses a database whose content tables
# already hold rows (scripts/content-import.remote.sh), and it writes only the media folder it is given.
set -euo pipefail

source_dir="release-content" media_dir="" app="" domain="" restart=yes
while [ $# -gt 0 ]; do
  case "$1" in
    --media-dir) media_dir="$2"; shift 2 ;;
    --app) app="$2"; shift 2 ;;
    --domain) domain="$2"; shift 2 ;;
    --no-restart) restart=no; shift ;;
    --source) source_dir="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done
if [ "$restart" = yes ]; then
  [[ "$app" =~ ^[a-z][a-z0-9-]{2,40}$ ]] || { echo "--app is not a plain folder name" >&2; exit 2; }
  [[ "$domain" =~ ^[a-z0-9.-]+$ ]] || { echo "--domain is not a plain host name" >&2; exit 2; }
fi
[ -n "$media_dir" ] || { echo "missing --media-dir (relative to the account's home)" >&2; exit 2; }
[[ "$media_dir" =~ ^(public_html|alhidaya-data)/[A-Za-z0-9._/-]+$ ]] && [[ "$media_dir" != *..* ]] || { echo "--media-dir must be a plain path inside public_html or alhidaya-data" >&2; exit 2; }
for needed in content.sql summary.json media/.htaccess; do
  [ -e "$source_dir/$needed" ] || { echo "$source_dir/$needed is missing: run scripts/content-export.mts first" >&2; exit 2; }
done
: "${RELEASE_SSH_HOST:?RELEASE_SSH_HOST is not set}" "${RELEASE_SSH_USER:?RELEASE_SSH_USER is not set}"
: "${SSH_KEY_FILE:?SSH_KEY_FILE is not set}"

here="$(cd "$(dirname "$0")" && pwd)"
remote_script="$here/content-import.remote.sh"
release_script="$here/release-remote.sh"
ssh_options=(-p "${RELEASE_SSH_PORT:-2200}" -i "$SSH_KEY_FILE" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes)
[ -n "${SSH_KNOWN_HOSTS_FILE:-}" ] && ssh_options+=(-o "UserKnownHostsFile=$SSH_KNOWN_HOSTS_FILE")
target="$RELEASE_SSH_USER@$RELEASE_SSH_HOST"
rssh() { ssh "${ssh_options[@]}" "$target" "$@"; }
remote() { rssh bash -s -- "$@" <"$remote_script"; }

count() { node -e 'const s=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); process.stdout.write(String(process.argv[2]==="files" ? s.mediaFiles : s.counts[process.argv[2]]))' "$source_dir/summary.json" "$1"; }
[ "$(node -e 'process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).missing.length))' "$source_dir/summary.json")" = 0 ] \
  || { echo "the export names media files that were missing locally; fix it first" >&2; exit 1; }

printf '== 1. media files (%s) into %s\n' "$(count files)" "$media_dir"
rssh "umask 022; mkdir -p \"\$HOME/$media_dir\""
# COPYFILE_DISABLE keeps macOS from adding "._*" resource-fork entries; it does nothing elsewhere.
COPYFILE_DISABLE=1 tar -C "$source_dir/media" -cf - . | rssh "tar -xf - -C \"\$HOME/$media_dir\" --no-same-owner"
remote media "$media_dir" "$(count files)"

printf '\n== 2. database rows\n'
rssh 'umask 077; cat > "$HOME/alhidaya-data/content-import.sql"' <"$source_dir/content.sql"
remote db "alhidaya-data/content-import.sql" \
  "$(count documents)" "$(count records)" "$(count media)" "$(count site_operations)"

if [ "$restart" = yes ]; then
  printf '\n== 3. restart the app so it reads the new content\n'
  rssh bash -s -- restart "$app" "$domain" <"$release_script"
else
  printf '\n== 3. no restart (the app is not set up yet; it reads the database when it first starts)\n'
fi

printf '\nThe launch content is on the server.\n'
