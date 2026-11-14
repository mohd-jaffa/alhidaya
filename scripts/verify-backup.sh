#!/usr/bin/env bash
# Proves a backup from scripts/backup-old-site.sh is whole and restorable (RELEASE.md B4 and B5):
#
#   scripts/verify-backup.sh backups/<folder>
#
#   1. every file matches MANIFEST.sha256, and both archives are intact;
#   2. the files extracted equal the server's own list of files and sizes (only logs may differ);
#   3. the database dump restores into a THROWAWAY MySQL container (never the dev database) and every
#      table's exact row count equals the server's.
# Nothing is sent anywhere. The scratch copy (it holds the CVs) and the container are removed at the end.
# The result is written to restore-drill.log in the backup folder.
set -euo pipefail
umask 077

dir="${1:?usage: scripts/verify-backup.sh backups/<folder>}"
dir="$(cd "$dir" && pwd)"
IMAGE="${MYSQL_IMAGE:-public.ecr.aws/docker/library/mysql:8.0.46}"
TAB="$(printf '\t')"

exec > >(tee "$dir/restore-drill.log") 2>&1
echo "Verifying $(basename "$dir") on $(date -u +%FT%TZ)"

scratch="$(mktemp -d "${TMPDIR:-/tmp}/backup-drill.XXXXXX")"
container="alhidaya-restore-drill-$$"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  chmod -R u+rwX "$scratch" 2>/dev/null || true
  rm -rf "$scratch"
}
trap cleanup EXIT

fail=0
check() { # check "what" <exit status>
  if [ "$2" -eq 0 ]; then echo "  ok    $1"; else echo "  FAIL  $1"; fail=1; fi
}

echo "[1/3] Checksums and archives"
(cd "$dir" && shasum -a 256 -c MANIFEST.sha256 --quiet) && s=0 || s=$?
check "every file matches MANIFEST.sha256" "$s"
gzip -t "$dir/home-alhidaya.tar.gz" && s=0 || s=$?
check "home-alhidaya.tar.gz is an intact gzip stream" "$s"
gzip -t "$dir/alhidaya_hidaya.sql.gz" && s=0 || s=$?
check "alhidaya_hidaya.sql.gz is an intact gzip stream" "$s"
gunzip -c "$dir/alhidaya_hidaya.sql.gz" | tail -n 3 | grep -q 'Dump completed' && s=0 || s=$?
check "the dump ends with its 'Dump completed' line" "$s"

echo "[2/3] Files: the archive against the server's own list"
# The archive's raw entry list (name and size), read without extracting: macOS tar folds "._*" resource-fork
# entries into their base file's metadata on extraction, so a comparison of an extracted tree would miss them.
python3 -I - "$dir/home-alhidaya.tar.gz" >"$scratch/local.unsorted.tsv" <<'PY'
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:gz") as archive:
    for member in archive:
        if member.isfile():
            name = member.name if member.name.startswith("./") else "./" + member.name
            print(f"{member.size}\t{name}")
PY
LC_ALL=C sort -t "$TAB" -k2,2 "$scratch/local.unsorted.tsv" >"$scratch/local.tsv"
LC_ALL=C sort -t "$TAB" -k2,2 "$dir/server-config/remote-files.tsv" >"$scratch/remote.tsv"
echo "  server list: $(wc -l <"$scratch/remote.tsv" | tr -d ' ') files, $(awk -F'\t' '{s+=$1} END {printf "%.1f MB", s/1048576}' "$scratch/remote.tsv")"
echo "  archive:     $(wc -l <"$scratch/local.tsv" | tr -d ' ') files, $(awk -F'\t' '{s+=$1} END {printf "%.1f MB", s/1048576}' "$scratch/local.tsv")"
# Files missing from the archive, extra in it, or of another size. Logs and shell history may move while the
# archive streams; any other difference fails the check.
LC_ALL=C join -t "$TAB" -1 2 -2 2 -a 1 -a 2 -e '-' -o '0,1.1,2.1' "$scratch/remote.tsv" "$scratch/local.tsv" |
  awk -F'\t' '$2 != $3' >"$scratch/differences.tsv"
tolerated='(^|/)(logs?|error_log|\.lastlogin|\.bash_history)(/|$)|\.log$|/storage/(logs|framework)/'
grep -v -E "$tolerated" "$scratch/differences.tsv" >"$scratch/real-differences.tsv" || true
echo "  differences: $(wc -l <"$scratch/differences.tsv" | tr -d ' ') ($(wc -l <"$scratch/real-differences.tsv" | tr -d ' ') beyond logs and history)"
head -n 10 "$scratch/real-differences.tsv" | sed 's/^/    /'
[ ! -s "$scratch/real-differences.tsv" ] && s=0 || s=1
check "the archive holds every file the server listed, at its size" "$s"
grep -q "$TAB./public_html/index.php\$" "$scratch/local.tsv" && s=0 || s=1
check "the old site's index.php is in the archive" "$s"
grep -q "$TAB./public_html/application/.env\$" "$scratch/local.tsv" && s=0 || s=1
check "the old site's settings file is in the archive (contents not read)" "$s"
echo "  CVs in the archive: $(grep -c "$TAB./public_html/upload/CV/" "$scratch/local.tsv" || true)"
# And that it really restores: a full extraction into the scratch folder (removed at the end).
mkdir "$scratch/files"
tar -xzf "$dir/home-alhidaya.tar.gz" -C "$scratch/files" && s=0 || s=$?
check "the archive extracts without an error" "$s"

echo "[3/3] Database: restore into a throwaway MySQL and compare row counts"
password="$(openssl rand -hex 16)"
docker run -d --rm --name "$container" -e MYSQL_ROOT_PASSWORD="$password" "$IMAGE" >/dev/null
for _ in $(seq 1 90); do
  docker exec -e MYSQL_PWD="$password" "$container" mysqladmin ping -h 127.0.0.1 --silent >/dev/null 2>&1 && break
  sleep 2
done
gunzip -c "$dir/alhidaya_hidaya.sql.gz" |
  docker exec -i -e MYSQL_PWD="$password" "$container" mysql -u root --default-character-set=utf8mb4 && s=0 || s=$?
check "the dump imports without an error" "$s"
database="$(gunzip -c "$dir/alhidaya_hidaya.sql.gz" | grep -m1 -E '^CREATE DATABASE' | sed -E 's/.*`([^`]+)`.*/\1/')"
: >"$scratch/restored-counts.tsv"
while IFS="$TAB" read -r table _; do
  count="$(docker exec -e MYSQL_PWD="$password" "$container" mysql -u root -N -B "$database" -e "SELECT COUNT(*) FROM \`$table\`" 2>&1 || echo 'error')"
  printf '%s\t%s\n' "$table" "$count" >>"$scratch/restored-counts.tsv"
done <"$dir/server-config/row-counts.tsv"
diff "$dir/server-config/row-counts.tsv" "$scratch/restored-counts.tsv" && s=0 || s=$?
check "every table's exact row count equals the server's ($(wc -l <"$dir/server-config/row-counts.tsv" | tr -d ' ') tables)" "$s"
sed 's/^/    /' "$dir/server-config/row-counts.tsv"

if [ "$fail" -eq 0 ]; then echo "RESULT: backup verified"; else echo "RESULT: NOT verified"; exit 1; fi
