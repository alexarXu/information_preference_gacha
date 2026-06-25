# Evolution Gacha Machine (BDM)

An online behavioral experiment built with **psiTurk** (Flask) and **jsPsych 7.3**. Participants place BDM bids on information cues displayed on gacha machines across three environments (NI / TA / CA) and three cue types (Exact / Rating / Machine).

## Project structure

| Path | Purpose |
|------|---------|
| `config.txt` | psiTurk HIT, database, and server configuration |
| `herokuapp.py` | Production entry point (`python herokuapp.py`) |
| `Procfile` / `runtime.txt` / `requirements.txt` | Heroku deployment |
| `custom.py` | Custom Flask routes (extensible) |
| `static/js/task.js` | Main experiment timeline and block design |
| `static/js/utils.js` | Trial generation, reward sampling, environment helpers |
| `static/js/instructions.js` / `questions.js` | Instructions and comprehension checks |
| `static/js/psiturk.js` | psiTurk client (from the PsiTurk package; vendored in the repo) |
| `static/js/jspsych-7.3/plugin-gacha-BDM-slider.js` | Gacha trial plugin |
| `templates/trialStages/` | Fixation / gachaChoice templates |
| `templates/exp.html` | Experiment page (script load order) |
| `static/css/mystyles.css` | Gacha and trial styling |
| `static/videos/instructions/` | Instruction videos |
| `static/images/instructions/` | Instruction figures |

## Local development

```bash
cd information_preference_gacha
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
psiturk debug   # default http://localhost:22362
```

Open the debug link: `http://localhost:22362/ad?mode=debug`

For quick local testing, `isLocalDevHost` (`config.js`) automatically enables `LOCAL_DEV_FAST_REAL_BLOCKS` on `localhost` (2+2 blocks, skips practice and debrief). This is disabled automatically after deploying to Heroku.

## UI testing without starting psiTurk

| File | Description |
|------|-------------|
| `test_gacha_standalone.html` | Full gacha trial test (NI/TA/CA, timing, exit/stay) |
| `test_gacha.html` | Single trial with mock psiTurk |

## Deployment

See [HEROKU_DEPLOY.md](./HEROKU_DEPLOY.md). Production requires `ON_CLOUD=1` and `DATABASE_URL` (Heroku Postgres injects this automatically).

## Key experiment parameters

Core logic lives in `static/js/task.js`:

- `BLOCK_ENVIRONMENTS`, `BLOCK_INFO_TYPES` — 18-block design
- `meanHigh`, `meanLow`, `sdLow`, `sdHigh` — reward distributions
- `gachaSliderMax`, `totalSessionTimeBudget` — BDM slider and TA timing

The table name `infoBandit_BDM_Blocks` in `config.txt` is kept for historical compatibility.

## References

- [psiTurk documentation](https://psiturk.readthedocs.io/en/stable/)
- [jsPsych 7.3](https://www.jspsych.org/7.3/)
