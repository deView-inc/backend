# Локальный бэкенд deView для фронтенд-разработки

Конфиг поднимает полный инстанс бэкенда одной командой: API, Postgres, Redis, LiveKit (видеозвонки) и Egress (запись комнат).

## Требования

1. Docker Desktop или Docker Engine (с Compose v2).
2. Актуальный файл `.env` в `./infra/dev/.env`. Его выдаёт бэкенд-команда, в git он не лежит.
3. Файл `./infra/dev/livekit.yaml` (есть в репозитории). Перед первым запуском прочитай раздел «Настройка видеозвонков».
4. Доступ к `ghcr.io` и `docker.io`, чтобы скачать образы. Если registry недоступен (ошибки вида `EOF` при pull), включи VPN или прокси на уровне системы.

## Переменные `.env`

Новые переменные, которые нужны для видеозвонков и записи:

| Переменная             | Значение для dev                    | Комментарий                                           |
| ---------------------- | ----------------------------------- | ----------------------------------------------------- |
| `LIVEKIT_API_KEY`      | `devkey`                            | Должен совпадать у API, LiveKit и Egress              |
| `LIVEKIT_API_SECRET`   | случайная ASCII-строка, 32+ символа | Например: `openssl rand -hex 24`                      |
| `LIVEKIT_URL`          | `ws://livekit:7880`                 | Адрес LiveKit внутри docker-сети (его использует API) |
| `LIVEKIT_PUBLIC_URL`   | `ws://localhost:7880`               | Адрес LiveKit для браузера                            |
| `S3_RECORDINGS_BUCKET` | `recordings`                        | Бакет для записей                                     |
| `S3_EGRESS_ENDPOINT`   | `http://host.docker.internal:9000`  | Адрес MinIO с точки зрения контейнера Egress          |

Уже существующие `S3_*` переменные (аватары) не меняются.

## Запуск

Из корня проекта:

```sh
docker compose -f ./infra/dev/compose.dev.yaml --profile infra up --pull always -d -V
```

Проверка:

```sh
docker compose -f ./infra/dev/compose.dev.yaml --profile infra ps
curl -i http://localhost:3001/v1/health
```

## Что внутри

| Сервис   | Адрес                                              |
| -------- | -------------------------------------------------- |
| API      | http://localhost:3001 (префикс `/v1`)              |
| Swagger  | http://localhost:3001/docs                         |
| Postgres | localhost:6000 (логин, пароль и база из `.env`)    |
| Redis    | localhost:7000 (порт задаётся `REDIS_PORT`)        |
| LiveKit  | ws://localhost:7880 (TCP 7881, UDP 7882)           |
| Egress   | только внутри docker-сети, наружу порты не открыты |

Особенности:

- Миграции БД применяются автоматически при старте API.
- API не стартует, пока Postgres и Redis не станут `healthy`.
- Все контейнеры работают в сети `deView-gateway`.

## Настройка видеозвонков

### 1. Укажи IP своей машины в LiveKit

LiveKit работает в контейнере и по умолчанию сообщает браузеру внутренний адрес контейнера (`172.x`). С хоста он недоступен, поэтому соединение обрывается с ошибкой `ICE failed` / `could not establish pc connection`.

Узнай LAN-IP машины:

```sh
# Linux
ip route get 1.1.1.1 | grep -oP 'src \K\S+'
```

Впиши его в `infra/dev/livekit.yaml` (не коммить свой IP в общий репозиторий):

```yaml
port: 7880
rtc:
    tcp_port: 7881
    udp_port: 7882
    use_external_ip: false
    node_ip: 192.168.X.X # твой LAN-IP
redis:
    address: redis:6379
```

Перезапусти LiveKit:

```sh
docker compose -f ./infra/dev/compose.dev.yaml --profile infra up -d --force-recreate livekit egress
docker compose -f ./infra/dev/compose.dev.yaml --profile infra logs livekit | grep nodeIP
```

В логе `nodeIP` должен быть твой LAN-IP, а не `172.x`. Нужен именно LAN-IP, не `127.0.0.1`: Egress ходит к LiveKit из своего контейнера и до `127.0.0.1` хоста не достучится.

IP может поменяться при смене сети (дом, офис, VPN), тогда повтори шаг.

### 2. Порты и файрвол

Должны быть доступны `7880/tcp`, `7881/tcp` и `7882/udp`. Для ufw:

```sh
sudo ufw allow 7881/tcp && sudo ufw allow 7882/udp
```

Если включён VPN в режиме TUN и видео не идёт, отключи его на время проверки или добавь локальные сети в исключения.

На Docker Desktop (macOS, Windows) проброс UDP менее надёжен. Если после настройки `node_ip` соединение не поднимается, напиши в чат бэкенда.

## API комнат

Все запросы требуют заголовок `Authorization: Bearer <accessToken>`. Id комнаты в URL нужно кодировать через `encodeURIComponent`, он может содержать не-ASCII символы.

### Получить токен для входа в комнату

```
POST /v1/rooms/:roomId/token
```

Ответ `200`:

```json
{ "token": "<livekit jwt>", "wsUrl": "ws://localhost:7880" }
```

Подключайся по `wsUrl` из ответа, не хардкодь адрес:

```ts
const { token, wsUrl } = await apiRequest<RoomTokenResponse>(
    `/v1/rooms/${encodeURIComponent(roomId)}/token`,
    { auth: true, method: 'POST' },
);
await room.connect(wsUrl, token);
```

### Запись комнаты

```
POST /v1/rooms/:roomId/record/start        -> { "egressId": "EG_..." }
POST /v1/rooms/record/stop/:egressId       -> { "success": true }
```

Запись сохраняется в MinIO в бакет `recordings` как `<roomId>_<timestamp>.mp4`. Нужен запущенный MinIO на `:9000` с созданным бакетом `recordings` и опубликованный в комнате трек (камера или микрофон). Без MinIO запись не запустится, но токены и сами звонки работают.

Известные ограничения: эндпоинты записи пока не проверяют права пользователя (любой авторизованный может запустить или остановить запись), и повторный `start` для той же комнаты создаст вторую запись. Не полагайся на это поведение, оно будет изменено.

## Как тестировать без камеры и микрофона

1. Фейковые устройства в Firefox/Zen: открой `about:config`, поставь `media.navigator.streams.fake` в `true` и перезагрузи страницу. Браузер будет отдавать тестовое видео и звук.
2. Для второго участника открой комнату в другом профиле или в приватном окне под другим пользователем. Одинаковый `identity` вытесняет первого участника.
3. Публикация демо-потока без браузера (нужен `lk` из livekit-cli):
    ```sh
    lk room join --url ws://localhost:7880 --api-key devkey --api-secret <секрет> --publish-demo <имя-комнаты>
    ```

В коде фронта устройства нужно включать отдельно от входа в комнату, чтобы отсутствие камеры не ломало подключение:

```ts
await room.connect(wsUrl, token);
await room.localParticipant.setMicrophoneEnabled(true).catch(console.warn);
await room.localParticipant.setCameraEnabled(true).catch(console.warn);
```

## Решение проблем

| Симптом                                                      | Причина и решение                                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot POST /v1/rooms/...` (404)                            | На :3001 отвечает старый образ API. Выполни `docker compose ... pull api` или дождись сборки нового образа в CI, затем `up -d --force-recreate api`                 |
| `401 AUTH_FAILED`                                            | Нет заголовка `Authorization` или токен просрочен                                                                                                                   |
| `ICE failed`, `could not establish pc connection`            | Не задан `node_ip` в `livekit.yaml`, закрыты порты 7881/7882 или мешает VPN. См. раздел «Настройка видеозвонков»                                                    |
| `NotFoundError: The object can not be found here`            | В системе нет камеры или микрофона. Используй фейковые устройства и `.catch` вокруг `setCameraEnabled`                                                              |
| `wsUrl` равен `ws://livekit:7880`                            | Бэкенд отдаёт внутренний адрес. Должен отдаваться `LIVEKIT_PUBLIC_URL`, сообщи бэкенд-команде                                                                       |
| Запись не появляется в MinIO                                 | Нет бакета `recordings`, неверный `S3_EGRESS_ENDPOINT` или в комнате нет треков. Логи: `docker compose -f ./infra/dev/compose.dev.yaml --profile infra logs egress` |
| `TLS connect error ... unexpected eof` при pull или запросах | Сетевая проблема (блокировка registry). Нужен VPN или прокси                                                                                                        |
| Контейнеры не стартуют после смены `.env`                    | Пересоздай их: `up -d --force-recreate`                                                                                                                             |

## Сброс

Полная очистка БД и томов:

```sh
docker compose -f ./infra/dev/compose.dev.yaml --profile infra down -v
```

Обновление до свежего образа API:

```sh
docker compose -f ./infra/dev/compose.dev.yaml --profile infra pull api
docker compose -f ./infra/dev/compose.dev.yaml --profile infra up -d --force-recreate api
```
