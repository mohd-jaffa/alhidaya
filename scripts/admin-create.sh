#!/usr/bin/env bash
# Makes the live site's one admin account, with a password only you know (docs/RELEASE.md E11, plan D14).
#
#   scripts/admin-create.sh                     # info@alhidaya.qa, "Al Hidaya Admin"
#   scripts/admin-create.sh --email you@x.qa --name "Your Name"
#
# Run it in your own terminal (in Claude Code: type `! scripts/admin-create.sh`). It asks for the password twice, unseen;
# nothing is typed on the command line, so it never reaches the shell history. How it works: it opens an SSH tunnel to the
# server's own MySQL, reads the app's database login from the server's secrets file over that SSH session into
# environment variables of ONE command (never printed, never written to disk), and runs `npm run admin:create` against
# the live database. Public sign-up does not exist, so this is the only way an account is made.
set -euo pipefail

email="info@alhidaya.qa" name="Al Hidaya Admin"
while [ $# -gt 0 ]; do
  case "$1" in
    --email) email="$2"; shift 2 ;;
    --name) name="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

host="${SSH_HOST:-alhidaya.qa}" port="${SSH_PORT:-2200}" user="${SSH_USER:-alhidaya}"
key="${SSH_KEY:-$HOME/.ssh/alhidaya_cpanel_rsa}" tunnel_port="${TUNNEL_PORT:-33308}"
ssh_options=(-p "$port" -i "$key" -o BatchMode=yes -o IdentitiesOnly=yes)
cd "$(dirname "$0")/.."

secrets="$(ssh "${ssh_options[@]}" "$user@$host" 'cat "$HOME/alhidaya-data/.secrets.env"')"
get() { printf '%s\n' "$secrets" | grep -m1 "^$1=" | cut -d= -f2- | tr -d "\"'"; }
login="$(get DATABASE_URL)"
if [[ ! "$login" =~ ^mysql://([^:@/]+):([^@/]+)@[^/]+/([A-Za-z0-9_]+)$ ]]; then
  echo "the server's database login is not in the expected form" >&2
  exit 1
fi
db_user="${BASH_REMATCH[1]}" db_password="${BASH_REMATCH[2]}" db_name="${BASH_REMATCH[3]}"

ssh "${ssh_options[@]}" -o ExitOnForwardFailure=yes -N -L "127.0.0.1:$tunnel_port:127.0.0.1:3306" "$user@$host" &
tunnel_pid=$!
trap 'kill "$tunnel_pid" 2>/dev/null || true' EXIT
for _ in $(seq 1 15); do
  (exec 3<>"/dev/tcp/127.0.0.1/$tunnel_port") 2>/dev/null && break
  kill -0 "$tunnel_pid" 2>/dev/null || { echo "the SSH tunnel did not come up" >&2; exit 1; }
  sleep 1
done

echo "Making the admin account $email on the LIVE database. Choose a password of 12 to 128 characters."
DATABASE_URL="mysql://$db_user:$db_password@127.0.0.1:$tunnel_port/$db_name" \
  NEXT_PUBLIC_SITE_URL="https://alhidaya.qa" \
  BETTER_AUTH_SECRET="$(get BETTER_AUTH_SECRET)" HASH_SECRET="$(get HASH_SECRET)" CRON_SECRET="$(get CRON_SECRET)" \
  TURNSTILE_SITE_KEY="1x00000000000000000000AA" TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA" \
  MEDIA_DIR="$(mktemp -d)/media" CV_DIR="$(mktemp -d)/cvs" \
  npm run --silent admin:create -- --email "$email" --name "$name"
