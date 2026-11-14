#!/usr/bin/env bash
# Turns the maintenance page on or off on the live server (RELEASE.md section 6).
#
#   scripts/maintenance.sh on | off | status
#
# `on` and `off` WRITE to the server: run them only at the checkpoint the owner approved (E2 on; E9 or a rollback
# off). The page is two things in the site's document root: `maintenance.html`, and a marked block at the very top
# of `.htaccess` that answers every request with HTTP 503. Everything else in `.htaccess` is left exactly as it was
# (the old site's rules now, the Node.js app's later), and the first untouched copy is kept once as
# `.htaccess.before-maintenance`. `on` also makes a new random release-check token for this window: a request
# carrying it as the `X-Release-Check` header passes the block (the release's health check and smoke test); the token
# is written only into the rules and into ~/alhidaya-data/.maintenance-token (mode 600), and is never printed.
set -euo pipefail

SSH_HOST="${SSH_HOST:-alhidaya.qa}"
SSH_PORT="${SSH_PORT:-2200}"
SSH_USER="${SSH_USER:-alhidaya}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/alhidaya_cpanel_rsa}"
DOCROOT="${DOCROOT:-public_html}" # relative to the account's home folder

action="${1:?usage: scripts/maintenance.sh on|off|status}"
kit="$(cd "$(dirname "$0")/.." && pwd)/deploy/maintenance"

rssh() {
  ssh -p "$SSH_PORT" -i "$SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes "$SSH_USER@$SSH_HOST" "$@"
}

# What a visitor gets: status codes for the home page, a deep link, www, and a form post.
probe() {
  local code
  for target in "https://$SSH_HOST/" "https://$SSH_HOST/services/home-nursing-care" "https://www.$SSH_HOST/"; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$target" || echo 000)"
    printf '  GET  %-55s %s\n' "$target" "$code"
  done
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -X POST -d 'x=1' "https://$SSH_HOST/api/enquiries" || echo 000)"
  printf '  POST %-55s %s\n' "https://$SSH_HOST/api/enquiries" "$code"
}

case "$action" in
  on)
    # The notice first, so the rule's ErrorDocument target exists the moment the rule starts to answer.
    rssh "cat > \"\$HOME/$DOCROOT/maintenance.html.tmp\" && mv -f \"\$HOME/$DOCROOT/maintenance.html.tmp\" \"\$HOME/$DOCROOT/maintenance.html\"" \
      <"$kit/maintenance.html"
    # The rule block goes up as a file of its own (a script read from stdin cannot also read the block from it),
    # with this window's token in it; the token's own file is written first so the two never disagree.
    token="$(openssl rand -hex 16)"
    printf '%s\n' "$token" | rssh 'umask 077; mkdir -p "$HOME/alhidaya-data" && cat > "$HOME/alhidaya-data/.maintenance-token"'
    sed "s/@BYPASS_TOKEN@/$token/g" "$kit/htaccess.block" | rssh "cat > \"\$HOME/$DOCROOT/.htaccess.block.tmp\""
    # Keep the first untouched .htaccess, then put the block above the rest in one atomic rename.
    rssh "bash -s" <<REMOTE
set -euo pipefail
cd "\$HOME/$DOCROOT"
touch .htaccess
[ -e .htaccess.before-maintenance ] || cp -p .htaccess .htaccess.before-maintenance
awk '/^# BEGIN MAINTENANCE/{skip=1} !skip{print} /^# END MAINTENANCE/{skip=0}' .htaccess > .htaccess.rest.tmp
cat .htaccess.block.tmp .htaccess.rest.tmp > .htaccess.new.tmp
mv -f .htaccess.new.tmp .htaccess
rm -f .htaccess.block.tmp .htaccess.rest.tmp
REMOTE
    ;;
  off)
    rssh "bash -s" <<REMOTE
set -euo pipefail
cd "\$HOME/$DOCROOT"
if [ -e .htaccess ]; then
  awk '/^# BEGIN MAINTENANCE/{skip=1} !skip{print} /^# END MAINTENANCE/{skip=0}' .htaccess > .htaccess.new.tmp
  mv -f .htaccess.new.tmp .htaccess
fi
rm -f maintenance.html maintenance.html.tmp "\$HOME/alhidaya-data/.maintenance-token"
REMOTE
    ;;
  status) ;;
  *)
    echo "usage: scripts/maintenance.sh on|off|status" >&2
    exit 2
    ;;
esac

echo "Maintenance page, as visitors see it now:"
probe
