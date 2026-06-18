# Al-Quran API (Single-File, No-Frills Server)

## Setup

```bash
npm install mysql2
```

Set these environment variables (or the defaults below will be used):

```
DB_HOST=127.0.0.1
DB_USER=dev
DB_PASSWORD=test111
DB_NAME=AlQuran
```

## Run

```bash
node index.js
```

The server listens on an OS-assigned port (or set `PORT` explicitly).

## Endpoints

| Method | Route                   | Description                        |
|--------|--------------------------|------------------------------------|
| GET    | `/health`                | Health check                       |
| GET    | `/api/surahs`            | List all 114 surahs                |
| GET    | `/api/surahs/search?q=`  | Search surahs via keywords table   |
| GET    | `/api/surah/:suraNo`     | Get all verses for a surah         |
| GET    | `/api/search?q=`         | Search surah name or translations  |

## Database

Requires MySQL with a database named `AlQuran` containing at least a `quran` table.
