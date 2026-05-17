# Боевой сервер — доступ и что в Docker

## Данные как есть

| Поле | Значение |
|------|-----------|
| IP | `5.129.199.253` |
| Пользователь | `root` |
| Пароль (если вход без ключа) | `h7wwEVZqzPrD@t` |
| SSH ключ | файл `./id_ed25519` в корне этого репозитория |

## Одна команда SSH (из корня репозитория)

```bash
ssh -i ./id_ed25519 -o StrictHostKeyChecking=accept-new root@5.129.199.253
```

## GitHub

Репозиторий с конфигами контейнеров с боя: [oblikfeo/12345](https://github.com/oblikfeo/12345)

Папка **`production/`** — снимок с сервера:

- `docker-compose.yml` — сервисы `nginx`, `php`, `mysql`, `ozvmru`
- `php/Dockerfile`, `ozvm.ru/Dockerfile`
- `nginx/nginx.conf`, `nginx/sites-enabled/*.conf`
- `CONTAINERS.md` — таблица контейнеров

Исходники сайтов и БД в git не кладём — только то, что нужно воспроизвести стек.

## Скачать живые файлы с боя сюда

На сервере корень проекта: **`/var/www`** (`docker-compose.yml`, каталоги `api.ozvm.ru`, `ozvm.ru`, `nginx`, `php`, `mysql_data`, …).

Пример через rsync (Git Bash / WSL / Linux):

```bash
rsync -avz -e "ssh -i ./id_ed25519 -o StrictHostKeyChecking=accept-new" \
  root@5.129.199.253:/var/www/ ./prod-www/
```

Большой `mysql_data` при необходимости исключить — см. `production/pull-from-prod.example.sh`.
