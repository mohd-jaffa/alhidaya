#!/usr/bin/env bash
# Proves scripts/release-remote.sh in a throwaway Linux container (the server is Linux: `mv -T`, GNU tar), with stand-ins
# for curl, node, mysql and the selector, before it is ever run on the client's server (docs/RELEASE.md D2).
#
#   scripts/test-release-remote.sh
#
# Needs Docker. Touches no server and no real database.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d "${TMPDIR:-/tmp}/release-remote.XXXXXX")"
image="${RELEASE_TEST_IMAGE:-public.ecr.aws/docker/library/httpd:2.4}"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/stubs"
cp "$root/scripts/release-remote.sh" "$work/release-remote.sh"

# Stand-ins. curl answers like a site: healthy only when the release `current` points at holds a HEALTHY file.
cat >"$work/stubs/curl" <<'EOF'
#!/usr/bin/env bash
out="" url="" write="" dump="" ip=""
while [ $# -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift ;;
    -D) dump="$2"; shift ;;
    -w) write="$2"; shift ;;
    -H) echo "header: $2" >>"$HOME/curl.log"; shift ;;
    --resolve) echo "resolve: $2" >>"$HOME/curl.log"; ip="${2##*:}"; shift ;;
    --max-time) shift ;;
    -*) ;;
    *) url="$1" ;;
  esac
  shift
done
echo "url: $url" >>"$HOME/curl.log"
target="$(readlink "$HOME/alhidaya-test/current" || true)"
if [ "$ip" = 127.0.0.1 ]; then
  # The loopback address reaches Apache's DEFAULT host (cPanel's page), whatever the release: found on the real server.
  case "$url" in */robots.txt) code=404 ;; *) code=200 ;; esac
  body='<html><body>cPanel default page</body></html>'
  [ -n "$dump" ] && printf 'HTTP/1.1 %s\r\nserver: Apache\r\n\r\n' "$code" >"$dump"
elif [ -e "$HOME/alhidaya-test/$target/PLAIN" ]; then
  # The placeholder release: answers 200 to anything, with none of the app's own headers.
  code=200; body='placeholder'
  [ -n "$dump" ] && printf 'HTTP/1.1 200\r\nx-robots-tag: noindex\r\n\r\n' >"$dump"
elif [ -e "$HOME/alhidaya-test/$target/HEALTHY" ]; then
  # A running app: the home page answers FAKE_HOME_CODE (200 unless a test says otherwise) and adds its own header.
  case "$url" in */robots.txt) code=200 ;; *) code="${FAKE_HOME_CODE:-200}" ;; esac
  body='<html><body>ok</body></html>'
  [ -n "$dump" ] && printf 'HTTP/1.1 %s\r\ncontent-security-policy: default-src self\r\n\r\n' "$code" >"$dump"
elif [ -e "$HOME/alhidaya-test/$target/APACHE" ]; then
  # No app behind Apache: the docroot answers 404 for the page and for robots.txt, with no header of the app's.
  code=404; body='not found'
  [ -n "$dump" ] && printf 'HTTP/1.1 404\r\nserver: Apache\r\n\r\n' >"$dump"
else
  code=502; body='bad gateway'
  [ -n "$dump" ] && : >"$dump"
fi
[ -n "$out" ] && [ "$out" != /dev/null ] && printf '%s' "$body" >"$out"
[ -n "$write" ] && printf '%s' "$code"
exit 0
EOF
cat >"$work/stubs/node" <<'EOF'
#!/usr/bin/env bash
# `node --check <file>`: fails for a file that says SYNTAX-ERROR.
[ "$1" = "--check" ] && ! grep -q 'SYNTAX-ERROR' "$2"
EOF
cat >"$work/stubs/hostname" <<'EOF'
#!/usr/bin/env bash
# `hostname -I`: a loopback address, the server's own, and an IPv6 one; the check must pick the server's own.
echo "${FAKE_HOSTNAME_I:-127.0.0.1 203.0.113.7 fe80::1}"
EOF
cat >"$work/stubs/cloudlinux-selector" <<'EOF'
#!/usr/bin/env bash
echo "selector $*" >>"$HOME/selector.log"
echo '{"result": "success"}'
EOF
cat >"$work/stubs/uapi" <<'EOF'
#!/usr/bin/env bash
echo '{"result":{"data":{"megabytes_remain":'"${FAKE_REMAIN:-700.43}"',"megabyte_limit":1024}}}'
EOF
cat >"$work/stubs/mysql" <<'EOF'
#!/usr/bin/env bash
case "$*" in *"FROM documents"*) echo "${FAKE_DOCS:-5}" ;; *) echo "${FAKE_TABLES:-3}" ;; esac
EOF
cat >"$work/stubs/mysqldump" <<'EOF'
#!/usr/bin/env bash
echo "-- fake dump of $*"
echo "-- password seen by the dump: ${MYSQL_PWD:+yes}"
EOF
chmod +x "$work/stubs/"*

cat >"$work/inner.sh" <<'INNER'
#!/usr/bin/env bash
set -uo pipefail
export HOME=/work/home PATH="/work/stubs:$PATH"
export HEALTH_TRIES=2 HEALTH_WAIT=0 NODE_BIN=/work/stubs/node SECRETS=/work/home/alhidaya-data/.secrets.env
SCRIPT=/work/release-remote.sh
APP=alhidaya-test
fail=0
ok() { printf '  ok    %s\n' "$1"; }
bad() { printf '  FAIL  %s\n' "$1"; fail=1; }
expect() { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (wanted '$2', got '$3')"; fi; }
status() { "$@" >/work/out.txt 2>&1 && echo 0 || echo 1; }
run() { bash "$SCRIPT" "$@"; }

fresh() { # a new app folder with a live placeholder release
  rm -rf "$HOME" && mkdir -p "$HOME/$APP/releases/0-placeholder" "$HOME/alhidaya-data"
  echo "require('./current/server.js');" >"$HOME/$APP/app.js"
  echo "// placeholder" >"$HOME/$APP/releases/0-placeholder/server.js"
  touch "$HOME/$APP/releases/0-placeholder/HEALTHY"
  ln -s releases/0-placeholder "$HOME/$APP/current"
  printf 'DATABASE_URL=mysql://alhidaya_app:appsecretpw1@127.0.0.1:3306/alhidaya_site\nMIGRATION_DATABASE_URL=mysql://alhidaya_mig:s3cretpassw0rd@127.0.0.1:3306/alhidaya_site\n' >"$HOME/alhidaya-data/.secrets.env"
}
build() { # build <id> [extra files...]  → /work/<id>.tar.gz, prints its sha256
  local id="$1"; shift
  rm -rf "/work/build-$id" && mkdir -p "/work/build-$id/.next/static" "/work/build-$id/public"
  echo "// server" >"/work/build-$id/server.js"; echo '{}' >"/work/build-$id/package.json"
  echo a >"/work/build-$id/.next/static/a.js"; echo b >"/work/build-$id/public/b.txt"
  for extra in "$@"; do mkdir -p "/work/build-$id/$(dirname "$extra")"; echo x >"/work/build-$id/$extra"; done
  tar -czf "/work/$id.tar.gz" -C "/work/build-$id" .
  sha256sum "/work/$id.tar.gz" | cut -d' ' -f1
}
upload() { cp "/work/$1.tar.gz" "$HOME/$APP/releases/.incoming-$1.tar.gz"; }

R1=20261114-100000-aaaaaaa
R2=20261114-110000-bbbbbbb
R3=20261114-120000-ccccccc
R4=20261114-130000-ddddddd

echo "prepare"
fresh; sha="$(build $R1)"; upload $R1
expect "a good archive is unpacked" 0 "$(status run prepare $APP $R1 "$sha")"
[ -f "$HOME/$APP/releases/$R1/server.js" ] && ok "server.js is in the new release folder" || bad "server.js is missing"
[ ! -e "$HOME/$APP/releases/.incoming-$R1.tar.gz" ] && ok "the uploaded archive is removed afterwards" || bad "the archive is still there"
expect "the live release did not move" "releases/0-placeholder" "$(readlink "$HOME/$APP/current")"

fresh; build $R1 >/dev/null; upload $R1
expect "a wrong SHA-256 is refused" 1 "$(status run prepare $APP $R1 0000000000000000000000000000000000000000000000000000000000000000)"
[ ! -e "$HOME/$APP/releases/$R1" ] && [ ! -e "$HOME/$APP/releases/.incoming-$R1.tar.gz" ] && ok "a refused archive leaves no folder and no archive" || bad "a refused archive left something"

fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; upload $R1
expect "an existing release is never overwritten" 1 "$(status run prepare $APP $R1 "$sha")"
grep -q 'already exists' /work/out.txt && ok "and it says why" || bad "no reason given"

fresh; mkdir -p /work/escape && echo x >/work/escape/evil
tar -czf /work/$R2.tar.gz -P -C /work --transform 's,^,../outside/,' escape/evil 2>/dev/null
sha="$(sha256sum /work/$R2.tar.gz | cut -d' ' -f1)"; upload $R2
expect "an archive with a parent path is refused" 1 "$(status run prepare $APP $R2 "$sha")"
grep -q 'parent path' /work/out.txt && ok "it was the path check that refused it" || bad "refused for another reason: $(head -c 200 /work/out.txt)"
[ ! -e "$HOME/outside" ] && ok "nothing was written outside the release folder" || bad "something escaped"

fresh; rm -rf /work/build-$R2; mkdir -p /work/build-$R2/.next/static /work/build-$R2/public; echo '{}' >/work/build-$R2/package.json
tar -czf /work/$R2.tar.gz -C /work/build-$R2 .; sha="$(sha256sum /work/$R2.tar.gz | cut -d' ' -f1)"; upload $R2
expect "a release without server.js is refused" 1 "$(status run prepare $APP $R2 "$sha")"
[ ! -e "$HOME/$APP/releases/$R2" ] && ok "and removed" || bad "and left behind"

fresh; sha="$(build $R2 .env.production)"; upload $R2
expect "a release holding an env file is refused" 1 "$(status run prepare $APP $R2 "$sha")"
[ ! -e "$HOME/$APP/releases/$R2" ] && ok "and removed" || bad "and left behind"

fresh; sha="$(build $R2)"; echo 'SYNTAX-ERROR' >/work/build-$R2/server.js; tar -czf /work/$R2.tar.gz -C /work/build-$R2 .
sha="$(sha256sum /work/$R2.tar.gz | cut -d' ' -f1)"; upload $R2
expect "a server.js that does not load is refused" 1 "$(status run prepare $APP $R2 "$sha")"

fresh
expect "an app name with a path in it is refused" 1 "$(status run ../etc $R1 x)"
expect "a release id with a path in it is refused" 1 "$(status run abort $APP ../../x)"
expect "an unknown folder is refused" 1 "$(status run prepare no-such-app $R1 x)"
expect "an unknown command is refused" 1 "$(status run frobnicate $APP)"

echo "space"
fresh
expect "enough quota is accepted" 0 "$(status run space $APP 245)"
expect "too little quota is refused before anything is uploaded" 1 "$(FAKE_REMAIN=120.5 status run space $APP 245)"
grep -q 'not enough disk quota' /work/out.txt && ok "and it says why" || bad "no reason given"
expect "a nonsense size is refused" 1 "$(status run space $APP lots)"

echo "activate"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
expect "a healthy release goes live" 0 "$(status run activate $APP $R1 preview.alhidaya.qa)"
expect "current points at it" "releases/$R1" "$(readlink "$HOME/$APP/current")"
[ -d "$HOME/$APP/releases/0-placeholder" ] && ok "the previous release stays for rollback" || bad "the previous release is gone"
grep -q 'selector restart' "$HOME/selector.log" && ok "the app was restarted through the selector" || bad "no restart"
[ -f "$HOME/$APP/tmp/restart.txt" ] && ok "and through tmp/restart.txt" || bad "no restart.txt"
grep -q 'url: https://preview.alhidaya.qa/robots.txt' "$HOME/curl.log" && ok "it checked the page and robots.txt on the domain" || bad "no check"

sha="$(build $R2)"; upload $R2; run prepare $APP $R2 "$sha" >/dev/null 2>&1   # no HEALTHY file: it will not answer
expect "an unhealthy release is not kept" 1 "$(status run activate $APP $R2 preview.alhidaya.qa)"
grep -q 'ROLLED BACK to '"$R1" /work/out.txt && ok "it says it rolled back, and to what" || bad "no rollback message"
expect "current is back on the previous release" "releases/$R1" "$(readlink "$HOME/$APP/current")"
[ -d "$HOME/$APP/releases/$R2" ] && ok "the bad release stays unpacked for inspection" || bad "the bad release was removed"

fresh; rm -rf "$HOME/$APP/current" "$HOME/$APP/releases/0-placeholder"
sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1
expect "with nothing to roll back to, an unhealthy first release fails plainly" 1 "$(status run activate $APP $R1 preview.alhidaya.qa)"
grep -q 'nothing to roll back to' /work/out.txt && ok "and says so" || bad "no message"

fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
printf 'abcdef0123456789abcdef0123456789\n' >"$HOME/alhidaya-data/.maintenance-token"
: >"$HOME/curl.log"; out="$(run activate $APP $R1 preview.alhidaya.qa 2>&1)"
grep -q 'header: X-Release-Check: abcdef0123456789abcdef0123456789' "$HOME/curl.log" && ok "during maintenance the check carries the window's token" || bad "token not sent"
printf '%s' "$out" | grep -q abcdef0123456789 && bad "the token was printed" || ok "the token is never printed"

echo "health: where the check connects"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
: >"$HOME/curl.log"; run activate $APP $R1 preview.alhidaya.qa >/dev/null 2>&1
grep -q 'resolve: preview.alhidaya.qa:443:203.0.113.7' "$HOME/curl.log" && ok "the check connects to the server's own address" || bad "wrong address: $(grep resolve "$HOME/curl.log" | head -1)"
grep -q 'resolve: .*:127.0.0.1' "$HOME/curl.log" && bad "the check used the loopback address" || ok "never the loopback address (Apache's default host)"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
: >"$HOME/curl.log"; HEALTH_IP=198.51.100.9 run activate $APP $R1 preview.alhidaya.qa >/dev/null 2>&1
grep -q 'resolve: preview.alhidaya.qa:443:198.51.100.9' "$HOME/curl.log" && ok "HEALTH_IP overrides the address" || bad "override ignored"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
expect "a check that lands on Apache's default host (loopback) is never healthy, however good the release" 1 "$(HEALTH_IP=127.0.0.1 status run activate $APP $R1 preview.alhidaya.qa)"
fresh; rm -f "$HOME/$APP/releases/0-placeholder/HEALTHY"; touch "$HOME/$APP/releases/0-placeholder/PLAIN"; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1
expect "an unhealthy first release fails, rolling back to the plain placeholder" 1 "$(status run activate $APP $R1 preview.alhidaya.qa)"
grep -q 'ROLLED BACK to 0-placeholder, which answers' /work/out.txt && ok "and the placeholder counts as answering" || bad "rollback verdict wrong: $(tail -2 /work/out.txt)"
expect "current is back on the placeholder" "releases/0-placeholder" "$(readlink "$HOME/$APP/current")"

echo "health: an empty database"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
expect "a 404 for / is healthy while the database holds no page" 0 "$(FAKE_HOME_CODE=404 FAKE_DOCS=0 status run activate $APP $R1 preview.alhidaya.qa)"
grep -q 'holds no pages yet' /work/out.txt && ok "and it says why" || bad "no reason given"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/HEALTHY"
expect "a 404 for / is NOT healthy once the database holds a page" 1 "$(FAKE_HOME_CODE=404 FAKE_DOCS=12 status run activate $APP $R1 preview.alhidaya.qa)"
expect "a 500 for / is never healthy, content or not" 1 "$(FAKE_HOME_CODE=500 FAKE_DOCS=0 status run activate $APP $R1 preview.alhidaya.qa)"
fresh; rm -f "$HOME/$APP/releases/0-placeholder/HEALTHY"; touch "$HOME/$APP/releases/0-placeholder/APACHE"; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1; touch "$HOME/$APP/releases/$R1/APACHE"
expect "an Apache 404 without the app's headers is not healthy, even on an empty database" 1 "$(FAKE_DOCS=0 status run activate $APP $R1 preview.alhidaya.qa)"
fresh
expect "restart restarts the live release and checks it" 0 "$(status run restart $APP preview.alhidaya.qa)"
grep -q 'selector restart' "$HOME/selector.log" && ok "through the selector" || bad "no restart"
rm -f "$HOME/$APP/releases/0-placeholder/HEALTHY"
expect "restart fails plainly when the site does not answer" 1 "$(status run restart $APP preview.alhidaya.qa)"

echo "abort and prune"
fresh; sha="$(build $R1)"; upload $R1; run prepare $APP $R1 "$sha" >/dev/null 2>&1
expect "an unpacked, unused release can be aborted" 0 "$(status run abort $APP $R1)"
[ ! -e "$HOME/$APP/releases/$R1" ] && ok "and is gone" || bad "and is still there"
expect "the live release cannot be aborted" 1 "$(status run abort $APP 0-placeholder)"

fresh
for id in $R1 $R2 $R3 $R4; do mkdir -p "$HOME/$APP/releases/$id"; touch "$HOME/$APP/releases/$id/HEALTHY"; done
ln -sfn "releases/$R2" "$HOME/$APP/current"
run prune $APP 2 >/work/out.txt 2>&1
left="$(ls -1 "$HOME/$APP/releases" | tr '\n' ' ')"
expect "prune keeps the newest two, the live one and the placeholder" "0-placeholder $R2 $R3 $R4 " "$left"
expect "prune refuses a nonsense count" 1 "$(status run prune $APP 0)"

echo "dump"
fresh
out="$(run dump $APP $R1 2>&1)"
f="$HOME/alhidaya-data/db-backups/$R1-before-migration.sql.gz"
[ -f "$f" ] && gzip -t "$f" && ok "a database with tables is saved as a valid gzip" || bad "no dump"
expect "the dump file is private (600)" 600 "$(stat -c %a "$f")"
expect "the dump folder is private (700)" 700 "$(stat -c %a "$HOME/alhidaya-data/db-backups")"
printf '%s' "$out" | grep -q s3cretpassw0rd && bad "the password was printed" || ok "the password is never printed"
gunzip -c "$f" | grep -q 'password seen by the dump: yes' && ok "the dump was given the login through the environment" || bad "no login"
gunzip -c "$f" | grep -q s3cretpassw0rd && bad "the password is inside the dump" || ok "the password is not inside the dump"
rm -f "$f"; FAKE_TABLES=0 run dump $APP $R1 >/work/out.txt 2>&1
[ ! -e "$f" ] && ok "an empty database is not dumped" || bad "an empty database was dumped"
for i in 1 2 3 4 5 6 7; do touch -d "2026-11-0$i" "$HOME/alhidaya-data/db-backups/2026110$i-000000-aaaaaaa-before-migration.sql.gz" 2>/dev/null || true; done
run dump $APP $R3 >/dev/null 2>&1
expect "only the newest five dumps are kept" 5 "$(ls -1 "$HOME/alhidaya-data/db-backups" | wc -l | tr -d ' ')"

[ "$fail" -eq 0 ] && echo "RESULT: release-remote verified" || echo "RESULT: release-remote FAILED"
exit "$fail"
INNER

docker run --rm -v "$work:/work" --entrypoint bash "$image" /work/inner.sh
