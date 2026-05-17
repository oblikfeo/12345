#!/usr/bin/env bash
# Пример: слить /var/www с боя в локальную папку (нужен ssh-ключ).
set -euo pipefail
KEY="${SSH_KEY:-./id_ed25519}"
HOST="${DEPLOY_HOST:-root@5.129.199.253}"
DEST="${1:-./prod-www}"

rsync -avz --progress \
  -e "ssh -i ${KEY} -o StrictHostKeyChecking=accept-new" \
  --exclude 'mysql_data/**' \
  "${HOST}:/var/www/" \
  "${DEST}/"

echo "Готово: ${DEST} (mysql_data исключён — при необходимости убери exclude)"
