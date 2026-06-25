# Heroku deployment

This project ships with everything needed for Heroku: `Procfile`, `runtime.txt`, `requirements.txt`, and `herokuapp.py`.

---

## 1. Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Git](https://git-scm.com/)

Log in:

```bash
heroku login
```

Repo: `https://github.com/alexarXu/information_preference_gacha`

Do **not** commit `participants.db`, `server.log`, `venv/`, or exported data files (listed in `.gitignore`).

---

## 2. Create the Heroku app

From the project directory:

```bash
cd information_preference_gacha
heroku create your-unique-app-name
```

Use a globally unique name (lowercase letters, numbers, hyphens only).

If the app already exists, attach the remote:

```bash
heroku git:remote -a your-unique-app-name
```

---

## 3. Environment variables

```bash
heroku config:set ON_CLOUD=1
heroku addons:create heroku-postgresql:essential-0
```

Heroku sets `DATABASE_URL` automatically. Verify with `heroku config`.

---

## 4. Set the production ad URL in `config.txt`

In `[HIT Configuration]`, comment out the local URL and enable the Heroku block:

```ini
;ad_url = http://localhost:22362/ad
ad_url_domain = your-unique-app-name.herokuapp.com
ad_url_protocol = https
ad_url_port = 443
ad_url_route = pub
```

- `pub` — Prolific / generic recruitment link (recommended)
- `ad` — MTurk ad flow

Commit the change:

```bash
git add config.txt
git commit -m "Set Heroku production ad URL"
```

---

## 5. Deploy

```bash
git push heroku HEAD:main
```

Or connect GitHub in the Heroku Dashboard and enable automatic deploys from `main`.

---

## 6. Verify

```bash
heroku open
heroku logs --tail
```

| URL | Purpose |
|-----|---------|
| `https://your-app.herokuapp.com/pub` | Participant entry (Prolific study link) |
| `https://your-app.herokuapp.com/ad?mode=debug` | Debug mode |
| `https://your-app.herokuapp.com/` | Experiment home |

Logs should show `[startup] DATABASE_URL scheme=postgresql host=...` with no errors.

---

## 7. Data storage and export

| Environment | Storage | Table |
|-------------|---------|-------|
| Local `psiturk debug` | `participants.db` (SQLite) | `infoBandit_BDM_Blocks` |
| Heroku | Heroku Postgres (`DATABASE_URL`) | `infoBandit_BDM_Blocks` |

Query on Heroku:

```bash
heroku pg:psql
```

```sql
SELECT uniqueid, status, beginhit, endhit FROM "infoBandit_BDM_Blocks";
```

Export locally:

```bash
heroku config:get DATABASE_URL
export DATABASE_URL='paste-value-here'
export ON_CLOUD=1
psiturk shell
# then: download_datafiles
```

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| Application Error after deploy | `heroku logs --tail` |
| Database connection failure | Confirm Postgres addon exists; check `DATABASE_URL` |
| Redirect to localhost | `config.txt` still uses local `ad_url` |
| Static asset 404 | Confirm files under `static/` are committed |
| `config.js` 404 on Linux | Filename must be lowercase `config.js` |

---

## Quick reference

```bash
cd information_preference_gacha
heroku login
heroku create your-unique-app-name
heroku config:set ON_CLOUD=1
heroku addons:create heroku-postgresql:essential-0
# edit config.txt → ad_url_domain
git add config.txt && git commit -m "Set Heroku production ad URL"
git push heroku HEAD:main
heroku open && heroku logs --tail
```

Prolific study link: `https://your-unique-app-name.herokuapp.com/pub`
