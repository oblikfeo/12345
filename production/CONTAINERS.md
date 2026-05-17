# Снимок Docker на боевом (2026-05-17)

Активные:

| Имя | Образ | Порты |
|-----|-------|-------|
| nginx | nginx:stable | 80, 443 |
| php | www_php (build ./php) | 9000 |
| mysql | mysql:5.7 | 3306 |
| ozvmru | www_ozvmru (build ./ozvm.ru) | 3000 (внутри сети web) |

Сеть Docker: `www_web` (bridge).

Остановленные одноразовые контейнеры (можно игнорировать): `nifty_snyder`, `optimistic_davinci`, `fervent_villani`, `hungry_poitras` — образы без имени, статус Exited.

Точка сборки на сервере: **`/var/www`** (`docker-compose.yml` в корне).
