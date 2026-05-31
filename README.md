# Tipovačka

Euro 2024 betting pool — Angular frontend + FastAPI backend + SQLite.

## Quick start (Docker)

```bash
docker compose up --build
```

- App: http://localhost:8080
- API: http://localhost:8000/api

Default logins (password from `SEED_PASSWORD`, default `tipovacka`): `ondro`, `jergi`, `kubo`, `tabi`, `ivo`, `plcho`, `mato`.

## Local development

**API:**

```bash
cd Backend
pip install -r requirements.txt
set DATABASE_URL=sqlite:///./data/tipovacka.db
set PYTHONPATH=.
uvicorn app.main:app --reload --port 8000
```

**Client:**

```bash
cd Client
npm install
npm start
```

Open http://localhost:4200 (proxies `/api` to port 8000).

## Database schema

| Table | Columns |
|-------|---------|
| `matches` | `match_number`, `home`, `away`, `kickoff_at`, `home_score`, `away_score` (NULL until played) |
| `tickets` | `id`, `user_id`, `winner1`, `winner2`, `top_scorer` |
| `predictions` | `id`, `ticket_id`, `match_id`, `home_score`, `away_score` |

Matches are seeded from [`Backend/app/seed_matches.py`](Backend/app/seed_matches.py) (explicit inserts). To regenerate from the CSV after schedule changes: `python Backend/scripts/gen_seed_matches.py`. After schema changes, delete `data/tipovacka.db` and restart the API to re-seed.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:////data/tipovacka.db` | SQLite path |
| `JWT_SECRET` | (required in prod) | JWT signing key |
| `SEED_PASSWORD` | `tipovacka` | Password for seeded users |
| `CORS_ORIGINS` | `http://localhost:4200,http://localhost` | Comma-separated origins |
