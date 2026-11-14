#!/usr/bin/env bash
# Proves deploy/production/htaccess.block (the live site's HTTPS and www rules) in a real Apache 2.4, alone and beneath
# the maintenance block, before it is put on the server (docs/RELEASE.md E4).
#
#   scripts/test-site-rules.sh
#
# Needs Docker and openssl. Touches no server and no real database.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d "${TMPDIR:-/tmp}/site-rules.XXXXXX")"
container="alhidaya-site-rules-$$"
image="${HTTPD_IMAGE:-public.ecr.aws/docker/library/httpd:2.4}"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

mkdir -p "$work/site/.well-known/acme-challenge"
echo 'hello from the site' >"$work/site/hello.txt"
echo 'token' >"$work/site/.well-known/acme-challenge/test-token"
cp "$root/deploy/maintenance/maintenance.html" "$work/site/maintenance.html"
token="$(openssl rand -hex 16)"
cp "$root/deploy/production/htaccess.block" "$work/site/.htaccess"

openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=localhost" \
  -keyout "$work/key.pem" -out "$work/cert.pem" >/dev/null 2>&1
cat >"$work/httpd.conf" <<'EOF'
ServerRoot "/usr/local/apache2"
Listen 80
Listen 443
LoadModule mpm_event_module modules/mod_mpm_event.so
LoadModule unixd_module modules/mod_unixd.so
LoadModule authz_core_module modules/mod_authz_core.so
LoadModule mime_module modules/mod_mime.so
LoadModule dir_module modules/mod_dir.so
LoadModule alias_module modules/mod_alias.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
LoadModule log_config_module modules/mod_log_config.so
LoadModule socache_shmcb_module modules/mod_socache_shmcb.so
LoadModule ssl_module modules/mod_ssl.so
User daemon
Group daemon
ServerName localhost
DocumentRoot "/site"
TypesConfig conf/mime.types
ErrorLog /proc/self/fd/2
<Directory "/site">
  AllowOverride All
  Require all granted
</Directory>
<VirtualHost *:443>
  SSLEngine on
  SSLCertificateFile /certs/cert.pem
  SSLCertificateKeyFile /certs/key.pem
</VirtualHost>
EOF

docker run -d --rm --name "$container" -p 127.0.0.1:0:80 -p 127.0.0.1:0:443 \
  -v "$work/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" -v "$work/site:/site" -v "$work:/certs:ro" \
  "$image" >/dev/null
http_port="$(docker port "$container" 80/tcp | head -n1 | sed 's/.*://')"
https_port="$(docker port "$container" 443/tcp | head -n1 | sed 's/.*://')"
for _ in $(seq 1 30); do
  curl -sk -o /dev/null "https://127.0.0.1:$https_port/hello.txt" && break
  sleep 1
done

fail=0
expect() { # expect "what" "<expected>" "<actual>"
  if [ "$2" = "$3" ]; then printf '  ok    %s\n' "$1"; else printf '  FAIL  %s (wanted %s, got %s)\n' "$1" "$2" "$3"; fail=1; fi
}
code() { curl -sk -o /dev/null -w '%{http_code}' "$@"; }
where() { curl -sk -o /dev/null -D - "$@" | tr -d '\r' | grep -i '^location:' | sed 's/^[Ll]ocation: //'; }
https="https://127.0.0.1:$https_port"
http="http://127.0.0.1:$http_port"
APEX=(-H "Host: alhidaya.qa")
WWW=(-H "Host: www.alhidaya.qa")

echo "the live rules on their own"
expect "the apex over HTTPS is served" 200 "$(code "${APEX[@]}" "$https/hello.txt")"
expect "www over HTTPS goes to the apex (301)" 301 "$(code "${WWW[@]}" "$https/hello.txt")"
expect "...keeping the path and the query" "https://alhidaya.qa/hello.txt?x=1" "$(where "${WWW[@]}" "$https/hello.txt?x=1")"
expect "the apex over HTTP goes to HTTPS (301)" 301 "$(code "${APEX[@]}" "$http/hello.txt")"
expect "...to the apex" "https://alhidaya.qa/hello.txt" "$(where "${APEX[@]}" "$http/hello.txt")"
expect "www over HTTP goes to HTTPS on the apex in one step" "https://alhidaya.qa/about?x=1" "$(where "${WWW[@]}" "$http/about?x=1")"
expect "an SSL challenge over HTTP is not redirected (apex)" 200 "$(code "${APEX[@]}" "$http/.well-known/acme-challenge/test-token")"
expect "an SSL challenge over HTTP is not redirected (www)" 200 "$(code "${WWW[@]}" "$http/.well-known/acme-challenge/test-token")"
expect "a POST is redirected too, never answered over HTTP" 301 "$(code -X POST -d x=1 "${APEX[@]}" "$http/api/enquiries")"

echo "beneath the maintenance block (the cutover window)"
sed "s/@BYPASS_TOKEN@/$token/g" "$root/deploy/maintenance/htaccess.block" | cat - "$root/deploy/production/htaccess.block" >"$work/site/.htaccess"
expect "visitors still get the notice (503) on the apex" 503 "$(code "${APEX[@]}" "$https/hello.txt")"
# www is sent on to the apex (the maintenance notice is an internal redirect, which the live rules then see): one hop, and
# the apex answers the notice.
expect "...and www is sent to the apex, where the notice shows" "https://alhidaya.qa/maintenance.html" "$(where "${WWW[@]}" "$https/hello.txt")"
expect "the window's token passes the maintenance block to the site" 200 "$(code "${APEX[@]}" -H "X-Release-Check: $token" "$https/hello.txt")"
expect "...and www with the token still goes to the apex" 301 "$(code "${WWW[@]}" -H "X-Release-Check: $token" "$https/hello.txt")"
expect "an SSL challenge stays reachable during maintenance" 200 "$(code "${APEX[@]}" "$http/.well-known/acme-challenge/test-token")"

echo "taking the maintenance block off leaves the live rules"
awk '/^# BEGIN MAINTENANCE/{skip=1} !skip{print} /^# END MAINTENANCE/{skip=0}' "$work/site/.htaccess" >"$work/off.htaccess"
cmp -s "$work/off.htaccess" "$root/deploy/production/htaccess.block" && result=yes || result=no
expect "what is left is exactly the live block" yes "$result"
cp "$work/off.htaccess" "$work/site/.htaccess"
expect "the apex is served again" 200 "$(code "${APEX[@]}" "$https/hello.txt")"

if [ "$fail" -eq 0 ]; then echo "RESULT: site rules verified in Apache"; else echo "RESULT: site rules FAILED"; exit 1; fi
