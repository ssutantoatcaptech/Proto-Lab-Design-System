# Templates

Whole prototypes from CapTech work, in two kinds:

- **Starter:** built on Proto-Lab. Clone it and build on it.
- **Reference:** a snapshot of past work with its own styling, copied in as plain files (no git history). Read it for
  patterns worth turning into CapTech blocks; don't copy its CSS. The source repo stays where the original evolves.

| Template | Kind | What it is | Source |
|---|---|---|---|
| [`huntington-capital-markets`](huntington-capital-markets/) | Reference | Capital Markets AI demo: sponsor briefing, bolt-on scout, opportunity scanner and leadership view. Flask app with Claude via Bedrock. | `njewell2/huntington-capital-markets-demo`, branch `Pauls_POC` |

## Adding a template

1. Copy it into `templates/<slug>/` without `.git`, virtualenvs, `node_modules`, secrets or client strategy material.
2. Add a `TEMPLATE.md` with its kind and an intake: contributors, source and commit, client brand (yes or no), and the
   patterns worth harvesting.
3. Add an entry to `apps/docs/lib/templates.ts` and a screenshot at `apps/docs/public/templates/<slug>.jpg`.
