#!/usr/bin/env bash
# Runs ON THE SERVER, fed over SSH by scripts/backup-old-site.sh (RELEASE.md Phase B):
#
#   ssh ... 'bash -s -- dump'   < scripts/old-site-db.remote.sh   > alhidaya_hidaya.sql
#   ssh ... 'bash -s -- counts' < scripts/old-site-db.remote.sh   > row-counts.tsv
#
# The old site's own stored database login is read here, inside the remote shell, and handed to mysqldump
# through the environment. It is never printed, never written to a file, never sent back. Nothing is
# written on the server.
set -euo pipefail

mode="${1:?usage: bash -s -- dump|counts}"
env_file="$HOME/public_html/application/.env"
[ -r "$env_file" ] || { echo "the old site's settings file is not readable" >&2; exit 3; }

read_setting() {
  local line value
  line=$(grep -E "^$1=" "$env_file" | head -n1) || true
  value=${line#*=}
  value=${value%$'\r'}
  value=${value#\"}; value=${value%\"}
  value=${value#\'}; value=${value%\'}
  printf '%s' "$value"
}

db_host=$(read_setting DB_HOST); db_host=${db_host:-127.0.0.1}
db_port=$(read_setting DB_PORT); db_port=${db_port:-3306}
db_name=$(read_setting DB_DATABASE)
db_user=$(read_setting DB_USERNAME)
MYSQL_PWD=$(read_setting DB_PASSWORD)
export MYSQL_PWD
[ -n "$db_name" ] && [ -n "$db_user" ] || { echo "the old site's database settings are incomplete" >&2; exit 4; }

case "$mode" in
  dump)
    # One consistent snapshot, with its routines, triggers and events; --databases makes it self-contained.
    mysqldump -h "$db_host" -P "$db_port" -u "$db_user" \
      --single-transaction --routines --triggers --events --no-tablespaces --set-gtid-purged=OFF \
      --default-character-set=utf8mb4 --databases "$db_name"
    ;;
  counts)
    # Exact row count of every table, tab-separated, for the restore drill to compare.
    mysql -h "$db_host" -P "$db_port" -u "$db_user" -N -B "$db_name" \
      -e "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name" |
      while IFS= read -r table; do
        count=$(mysql -h "$db_host" -P "$db_port" -u "$db_user" -N -B "$db_name" -e "SELECT COUNT(*) FROM \`$table\`")
        printf '%s\t%s\n' "$table" "$count"
      done
    ;;
  *)
    echo "unknown mode" >&2
    exit 2
    ;;
esac
