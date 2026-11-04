# PoC 1: Sponsor Briefing Pack Automation
**Huntington Capital Markets — AI Initiative**

## What It Does

Generates a structured 2-3 page briefing pack for a Private Equity sponsor ahead of a coverage call. The tool uses a multi-turn Claude conversation to produce three sections sequentially:

1. **Executive Summary** — who they are, fund cycle status, top opportunities, relationship status
2. **Portfolio Analysis & Opportunities** — per-company refinancing/recap flags, deal sizing, product recommendations, plus 3 proactive pitch ideas with market timing rationale
3. **MD Talking Points** — call opener, discussion topics, questions to ask, follow-up commitment

After generation, the MD can ask follow-up questions in an interactive Q&A session.

## Architecture

```
User (MD / Analyst)
        │
        ▼
briefing_poc.py
        │
        ├── common/sponsors.py         ← 4 priority sponsor profiles (CRM stub)
        ├── common/market.py           ← Q2 2026 market conditions + sector data
        │
        ├── build_sponsor_context()    ← Formats sponsor profile with fund vintage, portfolio, deals
        ├── build_market_context()     ← Sector-filtered market conditions per sponsor
        │
        └── generate_briefing()        ← 3-turn Claude Opus conversation
                │
                ├── Turn 1: Executive Summary
                ├── Turn 2: Portfolio Analysis + 3 Proactive Financing Ideas
                └── Turn 3: Call Talking Points
```

## Setup

```bash
# 1. Create virtual environment and install dependencies
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 2. Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# 3. Run
.venv/bin/python briefing_poc.py --interactive
```

## Usage

### Interactive mode (recommended for demo)
```bash
.venv/bin/python briefing_poc.py --interactive
```
Prompts for sponsor selection, generates briefing with sector-filtered market conditions, then enters Q&A mode.

### Batch mode
```bash
.venv/bin/python briefing_poc.py --sponsor "GTCR" --output-dir ./output
```
Saves `briefing_GTCR.md` and `briefing_GTCR.json` to the output directory.

## Demo Sponsors

| Sponsor | AUM | Current Fund | Coverage |
|---|---|---|---|
| GTCR | $40B+ | Fund XIV ($7.5B, 2024) | Eric Welsh (VP) |
| Clayton, Dubilier & Rice | $50B+ | Fund XII ($16B, 2023) | Jeff Tuckle (VP) |
| Stone Point Capital | $18B+ | Trident IX ($4.0B, 2023) | Eric Welsh (VP) |
| Madison Dearborn Partners | $28B+ | Fund VIII ($4.6B, 2021) | Jeff Tuckle (Director) |

## Production Enhancements (Next Steps)

| Enhancement | Description |
|---|---|
| Live CRM data | Replace sponsor stubs with Salesforce API call |
| News feed | Integrate Bloomberg/Refinitiv for real-time deal news |
| Trigger-based refresh | Re-generate when news event or rating change detected |
| Template output | Export to branded PowerPoint using python-pptx |

## KPIs to Measure

- Time to generate vs. manual prep (target: <5 min vs 2-4 hrs)
- MD satisfaction score (target: ≥4/5)
- Number of opportunities flagged that convert to live mandates
