#!/usr/bin/env bash
# Proves deploy/maintenance/ in a real Apache 2.4 (a throwaway container, HTTPS on a self-signed certificate),
# standing in for the server's Apache, before the kit is ever put on the server (RELEASE.md section 6).
#
#   scripts/test-maintenance-kit.sh
#
# Needs Docker and openssl. Touches no server and no real database.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
kit="$root/deploy/maintenance"
work="$(mktemp -d "${TMPDIR:-/tmp}/maintenance-kit.XXXXXX")"
container="alhidaya-maintenance-kit-$$"
image="${HTTPD_IMAGE:-public.ecr.aws/docker/library/httpd:2.4}"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

mkdir -p "$work/site/.well-known/acme-challenge" "$work/site/application"
# The "old site" the block must hide, and its own rules, which must stay untouched below the block.
echo '<?php echo "old site";' >"$work/site/index.php"
echo 'secret' >"$work/site/application/.env"
echo 'token' >"$work/site/.well-known/acme-challenge/test-token"
printf '# old site rules\nRewriteEngine On\nRewriteRule ^about_us$ /index.php [L]\n' >"$work/original.htaccess"
cp "$work/original.htaccess" "$work/site/.htaccess"

# The same insertion scripts/maintenance.sh performs on the server, applied locally.
cp "$kit/maintenance.html" "$work/site/maintenance.html"
cat "$kit/htaccess.block" "$work/original.htaccess" >"$work/site/.htaccess"

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
LoadModule autoindex_module modules/mod_autoindex.so
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
  -v "$work/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" -v "$work/site:/site:ro" -v "$work:/certs:ro" \
  "$image" >/dev/null
http_port="$(docker port "$container" 80/tcp | head -n1 | sed 's/.*://')"
https_port="$(docker port "$container" 443/tcp | head -n1 | sed 's/.*://')"
for _ in $(seq 1 30); do
  curl -sk -o /dev/null "https://127.0.0.1:$https_port/maintenance.html" && break
  sleep 1
done

fail=0
expect() { # expect "what" "<expected>" "<actual>"
  if [ "$2" = "$3" ]; then printf '  ok    %s\n' "$1"; else printf '  FAIL  %s (wanted %s, got %s)\n' "$1" "$2" "$3"; fail=1; fi
}
code() { curl -sk -o /dev/null -w '%{http_code}' "$@"; }
https="https://127.0.0.1:$https_port"

expect "home page answers 503" 503 "$(code "$https/")"
expect "a deep link answers 503" 503 "$(code "$https/services/home-nursing-care")"
expect "the old home script answers 503" 503 "$(code "$https/index.php")"
expect "the old site's secrets file answers 503" 503 "$(code "$https/application/.env")"
expect "an old-site rewrite target answers 503" 503 "$(code "$https/about_us")"
expect "a form POST answers 503" 503 "$(code -X POST -d x=1 "$https/api/enquiries")"
expect "a HEAD request answers 503" 503 "$(code -I "$https/")"
expect "the notice itself is served" 200 "$(code "$https/maintenance.html")"
expect "an SSL challenge file stays reachable" 200 "$(code "$https/.well-known/acme-challenge/test-token")"
expect "plain HTTP is sent to HTTPS" 301 "$(code "http://127.0.0.1:$http_port/")"
expect "plain HTTP challenge is not redirected" 200 "$(code "http://127.0.0.1:$http_port/.well-known/acme-challenge/test-token")"

headers="$(curl -sk -D - -o /dev/null "$https/")"
body="$(curl -sk "$https/")"
for header in 'retry-after: 3600' 'cache-control: no-store' 'x-robots-tag: noindex'; do
  printf '%s' "$headers" | tr -d '\r' | grep -qi "^$header$" && result=yes || result=no
  expect "503 carries '$header'" yes "$result"
done
printf '%s' "$body" | grep -q 'We are updating our website' && result=yes || result=no
expect "the 503 body is the notice" yes "$result"

# Turning it off removes only the block: the old rules come back byte for byte.
awk '/^# BEGIN MAINTENANCE/{skip=1} !skip{print} /^# END MAINTENANCE/{skip=0}' "$work/site/.htaccess" >"$work/off.htaccess"
cmp -s "$work/off.htaccess" "$work/original.htaccess" && result=yes || result=no
expect "removing the block restores the original .htaccess exactly" yes "$result"
cp "$work/off.htaccess" "$work/site/.htaccess"
expect "with the block removed the old home script answers again" 200 "$(code "$https/index.php")"

if [ "$fail" -eq 0 ]; then echo "RESULT: maintenance kit verified in Apache"; else echo "RESULT: maintenance kit FAILED"; exit 1; fi
