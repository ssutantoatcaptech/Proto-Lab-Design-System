# Huntington Capital Markets AI (template)

**Kind: Reference.** Past work with its own styling. Read it for patterns worth turning into CapTech blocks; don't copy its CSS.

## Intake

| | |
|---|---|
| Contributors | Steve Sutanto, Nathan Jewell, Paul Given, Genie Donnelly and others |
| Source | `njewell2/huntington-capital-markets-demo`, branch `Pauls_POC`, commit `8b48fe8` |
| Client brand | Yes. Huntington green palette, DM Sans and Source Serif, no Proto-Lab |
| Worth harvesting | Ranked signal cards (built: `signal-feed`), two-way match with explainable scores (built: `match-finder`), docked AI assistant (built: `ai-agent`), greeting hero with KPI strip, AI briefing with sources |

Snapshot of [`njewell2/huntington-capital-markets-demo`](https://github.com/njewell2/huntington-capital-markets-demo),
branch `Pauls_POC`, commit `8b48fe8` ("Plainer Portfolio Alerts copy and layout"), taken 2026-11-04.

**Left out:** `strategy/` (engagement notes and client decks), and personal editor and Claude settings. Get those from
the source repo if you need them.

## Run it

```sh
cd templates/huntington-capital-markets
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
./start.sh            # http://localhost:5000
```

`start.sh` uses the AWS profile `bedrock-claude`. Log in with `aws sso login --profile bedrock-claude`, or set
`ANTHROPIC_API_KEY` and run `.venv/bin/python3 web/app.py`. Without credentials the page loads but AI sections fail
or show fallback content.

See `CLAUDE.md` in this folder for the project context and the four PoCs.
