#!/usr/bin/env bash
# Runs ON the client's server, sent over SSH by scripts/content-import.sh (docs/RELEASE.md Q4, D3).
#
#   content-import.remote.sh db    <sql-file> <documents> <records> <media> <site_operations>
#   content-import.remote.sh media <folder> <file-count>
#
# Both paths are relative to the account's home folder.
#
# `db` loads the launch content (scripts/content-export.mts) into an EMPTY content database as the app's own user
# (data rights only: it needs no schema rights), in one transaction, then counts every table against what was
# exported. It refuses to touch a content table that already holds a row, so it can never overwrite what the admin
# has written. The one exception is the TYPOGRAPHY row that migration 0007 itself creates (no editor, never
# changed): the exported, approved TYPOGRAPHY replaces it, inside the same transaction. If the counts differ
# afterwards, the four tables (empty before, bar that row) are emptied again.
# `media` fixes the modes of the copied media folder (folders 755, files 644) and counts its files.
# The database login is read from ~/alhidaya-data/.secrets.env inside this shell and never printed.
set -euo pipefail
umask 027

SECRETS="${SECRETS:-$HOME/alhidaya-data/.secrets.env}"
die() {
  echo "content-import: $*" >&2
  exit 1
}

case "${1:-}" in
  db)
    [[ "${2:-}" =~ ^[A-Za-z0-9._/-]+$ ]] && [[ "$2" != *..* ]] || die "the SQL file's path is not a plain relative path"
    sql="$HOME/$2"
    [ -f "$sql" ] || die "the SQL file was not uploaded"
    for position in 3 4 5 6; do
      [[ "${!position:-}" =~ ^[0-9]{1,6}$ ]] || die "the expected counts must be numbers"
    done
    expected_documents="$3" expected_records="$4" expected_media="$5" expected_operations="$6"
    [ -r "$SECRETS" ] || die "the server's secrets file is not readable"
    url="$(grep -m1 '^DATABASE_URL=' "$SECRETS" | cut -d= -f2- | tr -d "\"'")"
    [[ "$url" =~ ^mysql://([^:@/]+):([^@/]+)@([^/:]+)(:([0-9]+))?/([A-Za-z0-9_]+)$ ]] || die "the app's login is not in the expected form"
    user="${BASH_REMATCH[1]}" host="${BASH_REMATCH[3]}" port="${BASH_REMATCH[5]:-3306}" database="${BASH_REMATCH[6]}"
    export MYSQL_PWD="${BASH_REMATCH[2]}"
    sql_run() { mysql -N -B -h "$host" -P "$port" -u "$user" --default-character-set=utf8mb4 "$database" "$@"; }
    count() { sql_run -e "SELECT COUNT(*) FROM \`$1\`"; }

    replace_seed=""
    for table in documents records media site_operations; do
      rows="$(count "$table")"
      [ "$rows" = 0 ] && continue
      seeded="$(sql_run -e "SELECT COUNT(*) FROM documents WHERE \`key\` = 'TYPOGRAPHY' AND updated_by IS NULL")"
      if [ "$table" = documents ] && [ "$rows" = 1 ] && [ "$seeded" = 1 ]; then
        replace_seed="DELETE FROM \`documents\` WHERE \`key\` = 'TYPOGRAPHY' AND \`updated_by\` IS NULL;"
        continue
      fi
      die "$table already holds $rows row(s); the import never overwrites content"
    done
    echo "  the four content tables are empty${replace_seed:+ (bar the TYPOGRAPHY row the migration made, which the export replaces)}"
    if ! awk -v inject="$replace_seed" '{ print } /^START TRANSACTION;$/ && inject != "" { print inject }' "$sql" | sql_run; then
      for table in site_operations records documents media; do sql_run -e "DELETE FROM \`$table\`" || true; done
      die "the import failed; the content tables were emptied again"
    fi
    wrong=0
    for pair in "documents:$expected_documents" "records:$expected_records" "media:$expected_media" "site_operations:$expected_operations"; do
      table="${pair%%:*}" want="${pair##*:}"
      got="$(count "$table")"
      if [ "$got" = "$want" ]; then echo "  $table: $got rows, as exported"; else
        echo "  $table: $got rows, expected $want" >&2
        wrong=1
      fi
    done
    if [ "$wrong" -ne 0 ]; then
      for table in site_operations records documents media; do sql_run -e "DELETE FROM \`$table\`" || true; done
      die "the counts differ from the export; the content tables were emptied again"
    fi
    rm -f "$sql"
    echo "  imported, counted, and the SQL file removed from the server"
    ;;

  media)
    want="${3:-}"
    [[ "$want" =~ ^[0-9]{1,6}$ ]] || die "the expected file count must be a number"
    [[ "${2:-}" =~ ^(public_html|alhidaya-data)/[A-Za-z0-9._/-]+$ ]] && [[ "$2" != *..* ]] || die "the media folder must be a plain path inside public_html or alhidaya-data"
    folder="$HOME/$2"
    [ -d "$folder" ] || die "the media folder is not there"
    [ -f "$folder/.htaccess" ] || die "the media folder has no .htaccess: nothing may be served without its rules"
    find "$folder" -type d -exec chmod 755 {} +
    find "$folder" -type f -exec chmod 644 {} +
    got="$(find "$folder" -type f ! -name .htaccess | wc -l | tr -d ' ')"
    [ "$got" = "$want" ] || die "the media folder holds $got files, expected $want"
    echo "  media folder: $got files ($(du -sm "$folder" | cut -f1) MB), folders 755, files 644, .htaccess in place"
    ;;

  *)
    die "usage: content-import.remote.sh db|media ..."
    ;;
esac
