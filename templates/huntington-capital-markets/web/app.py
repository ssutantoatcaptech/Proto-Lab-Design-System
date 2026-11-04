"""
Huntington Capital Markets AI — Web Demo
Flask application serving all four PoCs through a polished web interface.

Usage:
    python3 web/app.py
    Open http://localhost:5000
"""

import json
import logging
import os
import sys
import time
import markdown
from datetime import date, datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
from flask import Flask, render_template, request, jsonify, Response, stream_with_context

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common.sponsors import SPONSORS, SPONSOR_NAMES
from common.market import MARKET_CONTEXT, SECTOR_MARKET_CONDITIONS, MARKET_METADATA
from common.clients import MIDDLE_MARKET_CLIENTS
from common.llm import get_client, model_id, thinking_param, serialize_response, use_bedrock
from common.db import init_db, insert_feedback, get_all_feedback, insert_scout_result, insert_briefing, get_briefings_for_sponsor, get_briefing_by_id, insert_action, get_all_actions, get_briefings_count, get_recent_briefings, search_all, seed_portfolio_debt, get_portfolio_debt, get_opportunity_states, upsert_opportunity_state
from agents.definitions.intelligence_analyst import SYSTEM_PROMPT as INTEL_ANALYST_PROMPT
from agents.definitions.compliance_risk_reviewer import SYSTEM_PROMPT as COMPLIANCE_PROMPT
from agents.definitions.md_reviewer import SYSTEM_PROMPT as MD_REVIEWER_PROMPT

app = Flask(__name__)

_client = None

# Stub calendar data for mocked "logged in as" experience.
# In production this would pull from Salesforce or Microsoft Outlook (Graph API).
STUB_CALENDAR = {
    "Eric Welsh": [
        {
            "sponsor": "GTCR",
            "title": "GTCR Quarterly Check-In",
            "date": "Thu Oct 2",
            "time": "2:00 PM",
            "call_type": "Quarterly Check-in",
            "prep": [
                "Their new fund ($8B+) is actively investing in healthcare and fintech",
                "AssuredPartners loan can be repriced to save them money, $6.2M fee for us",
                "Rumored $600M+ healthcare acquisition, could need new financing from us",
            ],
        },
        {
            "sponsor": "Stone Point Capital",
            "title": "Stone Point — Fund Update",
            "date": "Tue Oct 7",
            "time": "10:00 AM",
            "call_type": "Fund Update",
            "prep": [
                "AmeriLife is looking at 3 smaller insurance companies to acquire",
                "Foundation Risk Partners has a $500M loan due Q2 2027, may want a bigger one",
                "Insurance deals are at an all-time high this quarter, good timing for them",
            ],
        },
    ],
    "Jeff Tuckle": [
        {
            "sponsor": "Madison Dearborn Partners",
            "title": "MDP — New Business Pitch",
            "date": "Thu Oct 2",
            "time": "11:00 AM",
            "call_type": "New Business Pitch",
            "prep": [
                "Their $6.5B fund focuses on telecom, media, and financial services",
                "We could co-lead the financing on their next big acquisition",
            ],
        },
        {
            "sponsor": "Clayton, Dubilier & Rice",
            "title": "CD&R Portfolio Review",
            "date": "Mon Apr 28",
            "time": "9:00 AM",
            "call_type": "Portfolio Review",
            "prep": [
                "Cornerstone Building Brands has a $3.2B loan due 2027, repricing window is closing",
                "Rumor: they may sell the siding division, which could speed up refinancing talks",
                "Their fund has several deals in the pipeline worth $4.5M in fees to us",
            ],
        },
    ],
}

STUB_SECTOR_NEWS = [
    {"headline": "Insurance Distribution M&A Hits Record Pace in Q3",
     "sector": "Financial Services", "sentiment": "Bullish", "source": "Bloomberg",
     "url": "https://www.bloomberg.com/news/insurance-ma-q3-2026",
     "summary": "Over 230 insurance brokerage deals closed in Q3 2026, surpassing prior records. PE sponsors driving 80% of volume.",
     "time_ago": "2h ago"},
    {"headline": "GTCR Exploring Healthcare Platform Acquisition",
     "sponsor": "GTCR", "sector": "Healthcare Services", "sentiment": "Bullish", "source": "Reuters",
     "url": "https://www.reuters.com/business/gtcr-healthcare-platform-2026",
     "summary": "Sources indicate GTCR Fund XIV is in late-stage diligence on a $600M+ healthcare services platform.",
     "time_ago": "5h ago"},
    {"headline": "Blackstone Evaluating Copeland Stake Sale",
     "sector": "Industrial", "sentiment": "Carve-out Speculation", "source": "WSJ",
     "url": "https://www.wsj.com/articles/blackstone-copeland-stake-2026",
     "summary": "Multiple secondary funds have been approached about Blackstone's Copeland (ex-Emerson) stake. No formal process launched.",
     "time_ago": "8h ago"},
    {"headline": "CLO Formation Pace Slows in September",
     "sector": "Market-Wide", "sentiment": "Neutral", "source": "Bloomberg",
     "url": "https://www.bloomberg.com/news/clo-formation-sept-2026",
     "summary": "CLO issuance dipped 12% month-over-month. Analysts expect modest spread widening in leveraged loans through Q4.",
     "time_ago": "1d ago"},
    {"headline": "CD&R Cornerstone Building: Strategic Review Rumored",
     "sponsor": "CD&R", "sector": "Building Products", "sentiment": "Carve-out Speculation", "source": "Internal",
     "url": "",
     "summary": "Industry sources suggest CD&R may explore a partial sale or IPO of Cornerstone Building Brands' siding division.",
     "time_ago": "1d ago"},
]

SIGNAL_SOURCE_MAP = {
    "MATURITY WALL": "Bloomberg",
    "FUND LIFECYCLE": "CRM",
    "PORTFOLIO ACTIVITY": "CRM",
    "EXIT SIGNAL": "SEC Filing",
}


def get_api_client():
    return get_client()


@app.route("/")
def index():
    return render_template(
        "index.html",
        sponsors=SPONSORS,
        sponsor_names=SPONSOR_NAMES,
        clients=MIDDLE_MARKET_CLIENTS,
        using_bedrock=use_bedrock(),
        bankers=list(STUB_CALENDAR.keys()),
    )


# ── CALENDAR ──────────────────────────────────────────────────────────────────

def _public_state(row):
    """Shape a stored opportunity_state row for the front end."""
    if not row:
        return {"pursued": False, "call_at": None, "followup_at": None, "dismissed": False}
    return {
        "pursued": bool(row.get("pursued")),
        "call_at": row.get("call_at"),
        "followup_at": row.get("followup_at"),
        "dismissed": bool(row.get("dismissed")),
    }


def _scheduled_call_events(banker):
    """Calls the banker scheduled from Scanner cards, shaped like STUB_CALENDAR events."""
    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS
    by_id = {o["opportunity_id"]: o for opps in SCANNER_RESULTS.values() for o in opps}
    events = []
    for opp_id, st in get_opportunity_states().items():
        if not st.get("call_at") or st.get("dismissed"):
            continue
        if banker and st.get("banker") and st["banker"] != banker:
            continue
        try:
            dt = datetime.fromisoformat(st["call_at"])
        except (TypeError, ValueError):
            continue
        opp = by_id.get(opp_id, {})
        sponsor = st.get("sponsor") or opp.get("sponsor", "")
        events.append({
            "sponsor": sponsor,
            "title": f"{sponsor} — {opp.get('recommended_product', 'Coverage call')}",
            "date": dt.strftime("%a %b ") + str(dt.day),
            "time": dt.strftime("%I:%M %p").lstrip("0"),
            "call_type": "Coverage Call",
            "prep": [opp["action"]] if opp.get("action") else [],
            "opportunity_id": opp_id,
            "scheduled": True,
            "_sort": dt.isoformat(),
        })
    return events


def _calendar_for(banker):
    """Stub calendar plus calls scheduled from the Scanner, in date order."""
    stubs = [dict(e) for e in STUB_CALENDAR.get(banker, [])]
    year = date.today().year
    for e in stubs:
        try:
            e["_sort"] = datetime.strptime(f"{e['date']} {year}", "%a %b %d %Y").isoformat()
        except ValueError:
            e["_sort"] = "9999"
    merged = sorted(stubs + _scheduled_call_events(banker), key=lambda e: e["_sort"])
    for e in merged:
        e.pop("_sort", None)
    return merged


@app.route("/api/calendar")
def calendar():
    """Return the banker's calendar. Stub Salesforce/Outlook events plus calls scheduled here."""
    banker = request.args.get("banker", "Eric Welsh")
    return jsonify({"banker": banker, "events": _calendar_for(banker)})


@app.route("/api/opportunity/<opp_id>/state", methods=["POST"])
def set_opportunity_state(opp_id):
    """Update a banker's state on a Scanner opportunity: pursued, call, follow-up, dismissed."""
    data = request.json or {}
    banker = data.get("banker") or "Eric Welsh"
    sponsor = data.get("sponsor") or ""
    patch = {k: data[k] for k in ("pursued", "call_at", "followup_at", "dismissed") if k in data}
    state = upsert_opportunity_state(opp_id, sponsor, banker, patch)

    logged = None
    if patch.get("dismissed"):
        logged = "dismiss"
    elif patch.get("call_at"):
        logged = "schedule_call"
    elif patch.get("followup_at"):
        logged = "followup_30d"
    elif patch.get("pursued"):
        logged = "pursue"
    if logged:
        insert_action(tool="scanner", sponsor=sponsor, item=data.get("product", ""), action=logged, banker=banker)

    return jsonify({"status": "ok", "state": _public_state(state)})


# ── BRIEFING PACK ─────────────────────────────────────────────────────────────

def _build_debt_calendar_text(sponsor_name: str) -> str:
    """Format Bloomberg debt data as a text block for AI prompts."""
    rows = get_portfolio_debt(sponsor_name)
    if not rows:
        return "No Bloomberg debt data available for this sponsor."
    today = date.today()
    lines = ["PORTFOLIO DEBT CALENDAR (Source: Bloomberg Terminal, pulled 6:30 AM ET):"]
    lines.append(f"{'Company':<28} {'Instrument':<26} {'Amount':>8} {'Maturity':>12} {'Cpn':>6} {'Mkt':>6} {'Save':>6} {'Lev':>5}")
    lines.append("-" * 100)
    for r in rows:
        mat = r["maturity_date"]
        save = r["coupon_spread_bps"] - r["market_spread_bps"]
        lines.append(
            f"{r['company']:<28} {r['debt_instrument']:<26} ${r['debt_amount_mm']:>6.0f}M "
            f"{mat:>12} SOFR+{r['coupon_spread_bps']:>3} SOFR+{r['market_spread_bps']:>3} "
            f"{'+' if save > 0 else ''}{save:>3}bps {r['current_leverage_x']:>4.1f}x"
        )
    return "\n".join(lines)


def _build_pipeline_text(sponsor_name: str) -> str:
    """Pull Huntington's existing pipeline with this sponsor from leadership data."""
    try:
        from poc4_leadership_view.leadership_view import PIPELINE
        sponsor_deals = [d for d in PIPELINE if d.get("sponsor") == sponsor_name]
        if not sponsor_deals:
            return "No active pipeline on record with this sponsor."
        total_fees = sum(d["fee_mm"] for d in sponsor_deals)
        wtd = sum(d["fee_mm"] * d["probability"] for d in sponsor_deals)
        lines = [f"HUNTINGTON PIPELINE WITH {sponsor_name.upper()} ({len(sponsor_deals)} deals, ${total_fees:.1f}M fees, ${wtd:.1f}M prob-weighted):"]
        for d in sorted(sponsor_deals, key=lambda x: x["fee_mm"], reverse=True):
            lines.append(f"  • {d['deal']:<35} ${d['fee_mm']:.1f}M  {d['stage']:<10}  {d['probability']:.0%}  {d['banker']}")
        return "\n".join(lines)
    except Exception:
        return "Pipeline data unavailable."


@app.route("/api/briefing/analyze", methods=["POST"])
def analyze_briefing():
    """Phase 1: AI analyzes all available data and returns targeted questions for the banker."""
    data = request.json
    sponsor_name = data.get("sponsor")
    call_type = data.get("call_type", "Quarterly Check-in")
    banker = data.get("banker", "Demo User")

    from poc1_sponsor_briefing.briefing_poc import build_sponsor_context, build_market_context

    sponsor_context = build_sponsor_context(sponsor_name)
    market_context = build_market_context(sponsor_name)
    debt_calendar = _build_debt_calendar_text(sponsor_name)
    pipeline_text = _build_pipeline_text(sponsor_name)

    prompt = f"""You are preparing a pre-meeting briefing pack for a {call_type} with {sponsor_name}.
You have access to the following data pulled from internal systems.

{sponsor_context}

{debt_calendar}

{pipeline_text}

MARKET CONDITIONS:
{market_context}

Based on this data, identify 4-6 specific questions you need the banker to answer that CANNOT be derived
from the available data above. These questions should fill the gaps that would materially improve the briefing.

Focus on:
- Meeting logistics (who is attending from the sponsor side)
- Primary objective for this specific call
- Competitive intelligence (which other banks are actively pitching this sponsor right now)
- Recent developments not in the CRM (leadership changes, new deals in market, strategy shifts)
- Which portfolio company or opportunity to prioritize on this call
- Any sensitivities or topics to avoid

Return ONLY a JSON array of question objects. No other text. Format:
[
  {{"id": "q1", "question": "...", "context": "..."}},
  ...
]
Where:
- "question": the specific question to display to the banker (concise, direct)
- "context": 1 sentence explaining why this matters for the briefing (shown as helper text)
"""

    try:
        client = get_api_client()
        response = client.messages.create(
            model=model_id("sonnet"),
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        text = next(b.text for b in response.content if b.type == "text")
        # Strip markdown code fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        questions = json.loads(text.strip())
        return jsonify({"sponsor": sponsor_name, "questions": questions})
    except Exception as e:
        # Fallback questions if AI call fails
        fallback = [
            {"id": "q1", "question": f"Who from {sponsor_name} is on this call?",
             "context": "Knowing who's attending helps calibrate the level of detail and which relationships to reference."},
            {"id": "q2", "question": "What's the primary ask — what do we need to walk out with?",
             "context": "The primary objective drives the structure of talking points and the close."},
            {"id": "q3", "question": "Which bank is most active with this sponsor right now?",
             "context": "Competitive intel shapes how aggressively we position and what we lead with."},
            {"id": "q4", "question": "Any recent developments not in our system?",
             "context": "CRM data has a lag — anything recent that changes the picture."},
            {"id": "q5", "question": "Which opportunity should we lead with?",
             "context": "Determines the opening and which idea gets the most airtime."},
        ]
        return jsonify({"sponsor": sponsor_name, "questions": fallback})


@app.route("/api/briefing", methods=["POST"])
def generate_briefing():
    """Phase 3: Generate full 8-section briefing pack incorporating banker answers."""
    data = request.json
    sponsor_name = data.get("sponsor")
    call_type = data.get("call_type", "Quarterly Check-in")
    banker = data.get("banker", "Demo User")
    banker_answers = data.get("banker_answers", {})  # {q_id: answer_text}

    from poc1_sponsor_briefing.briefing_poc import build_sponsor_context, build_market_context
    from poc2_bolt_on_scout.bolt_on_scout import score_matches, generate_rationales

    client = get_api_client()
    sponsor_context = build_sponsor_context(sponsor_name)
    market_context = build_market_context(sponsor_name)
    debt_calendar = _build_debt_calendar_text(sponsor_name)
    pipeline_text = _build_pipeline_text(sponsor_name)

    # Format banker answers as context block
    banker_intel = ""
    if banker_answers:
        lines = ["BANKER INTELLIGENCE (provided by coverage banker before this call):"]
        for q_id, answer in banker_answers.items():
            if answer and answer.strip():
                lines.append(f"  • {answer.strip()}")
        banker_intel = "\n".join(lines)
    market_insights = data.get("market_insights", []) or []
    if market_insights:
        lines = [banker_intel] if banker_intel else []
        lines.append("MARKET INSIGHTS THE BANKER FLAGGED FOR THIS BRIEFING (weave these into the relevant sections):")
        for m in market_insights:
            detail = m.get("summary") or m.get("insight") or ""
            lines.append(f"  • {m.get('headline', '')} ({m.get('source', '')}) — {detail}")
        banker_intel = "\n".join(lines)

    system_prompt = f"""You are a Managing Director-level capital markets banker at Huntington National Bank.
You are generating a pre-meeting briefing pack for a {call_type} with {sponsor_name}.

This is a CONFIDENTIAL INTERNAL document. Be candid. Include:
- Specific fee estimates and deal sizing
- Competitive observations (which banks are competition and why)
- Honest relationship assessment (gaps, what's working, what needs to change)
- Prioritized recommendations — not everything, just what matters most

Write in crisp investment banking style. Short sentences.
Reference specific companies, deal sizes, spreads, and market comps by name.
Generic analysis is useless — the MD needs specifics they can act on in a 30-minute call.

FORMATTING RULES (follow strictly):
- Use ### H3 headings for each sub-section (never bold text as a pseudo-header)
- Under each H3, use short paragraphs or bullet lists as appropriate
- Use tables when comparing multiple items with parallel fields
- Use > blockquotes for key insights, pull quotes, or critical callouts
- Use **bold** only for emphasis within sentences, never as a standalone header
- Indent nested details as sub-bullets under parent bullets
- Keep hierarchy: H3 heading > paragraph or bullet list > nested details
- Never put a heading inside a bullet list; headings always stand alone

IMPORTANT — TONE ON HUNTINGTON:
Never frame Huntington's capabilities, team, or relationships negatively.
If a coverage gap exists, frame it as an opportunity (e.g., "opportunity to deepen at the MD level") — never as a deficit or weakness.
Huntington is a top-tier regional capital markets bank competing aggressively for sponsor wallet share. Write from that position of confidence.

DATA AVAILABLE:
{sponsor_context}

{debt_calendar}

{pipeline_text}

MARKET CONDITIONS:
{market_context}

{banker_intel}"""

    today_str = date.today().strftime("%B %d, %Y")

    # Build all 8 section prompts in a single conversation thread
    section_defs = [
        {
            "key": "situation_brief",
            "label": "Situation Brief",
            "prompt": f"""Generate the SITUATION BRIEF for this {call_type} with {sponsor_name} on {today_str}.

Begin with a single bold line:
**TL;DR:** [One sentence: why this call matters and what we need to walk out with.]

Then cover:
- Why are we meeting today (specific trigger: maturity event, fund deployment stage, new opportunity)
- What we need to walk out with (be specific about the mandate or commitment we're seeking)
- Relationship momentum in one sentence (what's working and where we're building)
- The single biggest external or market risk to this call going well (not internal)

Be direct. No hedging. 100-150 words max."""
        },
        {
            "key": "relationship_scorecard",
            "label": "Relationship Scorecard",
            "prompt": f"""Generate the RELATIONSHIP SCORECARD section.

Begin with a single bold line:
**TL;DR:** [One sentence on relationship health and the single most important thing to change or protect.]

Then produce these sub-sections using ### headings:

### Coverage Team
List Huntington bankers covering this sponsor with their role and last contact.

### Pipeline Summary
Total deal count, fee pipeline ($M), probability-weighted fees. Stage breakdown: Active / Pitched / Pipeline / Monitoring. Use a table if 3+ deals.

### Wallet Share Assessment
Estimate of Huntington's share of this sponsor's total deal flow. Key deals we've won, where we have momentum. Where we have the greatest opportunity to increase engagement. Use a blockquote for the key insight.

### Relationship Heat
Rate overall relationship health: Strong / Developing / Building. 1-2 sentences on what's driving that rating and what we're doing to strengthen it. Use a blockquote for the rating.

### Competitive Landscape
Which banks are also active with this sponsor. Frame as market context Huntington is navigating, not as a threat."""
        },
        {
            "key": "fund_intelligence",
            "label": "Fund Intelligence",
            "prompt": f"""Generate the FUND INTELLIGENCE section.

Begin with a single bold line:
**TL;DR:** [One sentence on fund deployment stage and what that means for deal urgency right now.]

Then cover these sub-sections using ### headings:

### Current Fund Status
Fund name, vintage year, committed capital. Estimated % deployed and $ remaining. Deployment pace and expected fully-deployed date. Use a table for fund metrics if helpful.

### LP Dynamics
Years since fund close and DPI pressure context. New fund raise signals or timing. How LP pressure translates to urgency on exits or distributions.

### Investment Focus
Top 2-3 themes where they're most actively seeking new platforms. Target company profile (size, sector, deal type). Any strategy evolution vs. prior fund.

### Key Decision Makers
Which partners make the call on financing decisions. Who at the sponsor has the most influence on bank selection."""
        },
        {
            "key": "maturity_calendar",
            "label": "Portfolio Maturity & Refi Calendar",
            "prompt": f"""Generate the PORTFOLIO MATURITY & REFI CALENDAR section.

Begin with a single bold line:
**TL;DR:** [One sentence naming the most urgent opportunity — company, amount, and why it can't wait.]

Then produce a markdown table with these exact columns:
| Company | Instrument | Amount | Maturity | Current | Market | Savings | Leverage | Action |

Where:
- Amount = face value in $M
- Current = current coupon (e.g., "SOFR+375")
- Market = current market spread for comparable credits (e.g., "SOFR+310")
- Savings = annual interest savings from repricing (in $M, calculated as: savings_bps/10000 × amount)
- Leverage = current leverage multiple
- Action = one of: 🔴 URGENT REFI / 🟡 REFI WINDOW / 🟢 MONITOR / ♻️ RECAP CANDIDATE

Sort by urgency (URGENT first). After the table, add a 3-bullet summary:
- Most time-sensitive opportunity and why
- Largest fee opportunity
- One dividend recap candidate with rationale"""
        },
        {
            "key": "proactive_ideas",
            "label": "Proactive Financing Ideas",
            "prompt": f"""Generate 2-3 PROACTIVE FINANCING IDEAS to pitch on this call.

Begin with a single bold line:
**TL;DR:** [One sentence naming the lead idea and the total fee opportunity across all ideas.]

For each idea, use this structure with ### headings:

### Idea [N]: [Company Name] — [Transaction Type]

#### Why Now
1-2 sentences on market timing or company-specific trigger.

#### Proposed Structure
| Detail | Value |
|---|---|
| Product | [Term Loan B / HY Bond / Revolver / ABL / etc.] |
| Size | $[X]M |
| Huntington Role | [Lead Left / Co-Lead / Participant] |
| Proposed Spread | [SOFR+XXX or fixed X.XX%] |

#### Market Comps
| Transaction | Sponsor | Size | Spread | Date |
|---|---|---|---|---|
| [Comp 1] | [PE firm] | $[X]M | [spread] | [Q/Year] |
| [Comp 2] | [PE firm] | $[X]M | [spread] | [Q/Year] |

> **Fee Estimate:** $[X.X]M–$[Y.Y]M ([basis points] on $[size]M) | **Probability:** [High/Medium/Low]

Only include ideas with genuine market timing. Do not pad with generic suggestions."""
        },
        {
            "key": "bolton_introductions",
            "label": "Bolt-On Introduction Candidates",
            "prompt": f"""Generate the BOLT-ON INTRODUCTION CANDIDATES section.

Begin with a single bold line:
**TL;DR:** [One sentence naming the strongest intro and why it's a natural fit right now.]

Based on {sponsor_name}'s investment themes and portfolio, identify 2-3 companies from Huntington's
middle market client book that would make strong bolt-on acquisition candidates for this sponsor's
existing portfolio companies.

For each candidate, use a ### heading:

### [Company Name] — [Sector], $[Revenue]M revenue, [Geography]
- **Why it fits:** Specific portfolio company it bolts onto + strategic rationale
- **Transaction signal:** What suggests they may be ready
- **Huntington's role:** Sell-side advisory or financing for the acquirer
- **Estimated deal size:** $[X]M–$[Y]M

> These are warm introductions only Huntington can make because we bank both sides."""
        },
        {
            "key": "market_conditions",
            "label": "Market Conditions — Relevant to This Sponsor",
            "prompt": f"""Generate the MARKET CONDITIONS section, filtered specifically to {sponsor_name}'s portfolio sectors.

Begin with a single bold line:
**TL;DR:** [One sentence on whether now is a good or bad time to transact and why.]

Do NOT include generic market commentary. Use ### headings for each area:

### Leveraged Loan Technicals
CLO demand, spread tightening/widening, leverage availability relevant to their sectors.

### Recent Comparable Transactions
Use a table for 2-3 recent comparable transactions that validate or challenge our pitch pricing.

### Macro Factors
Rate outlook, regulatory environment directly affecting their capital structures.

### Sector Deal Volume
One data point on deal volume in their sector (YTD vs. prior year).

Keep it tight. This is the "why now" evidence for the ideas section."""
        },
        {
            "key": "talking_points",
            "label": "MD Talking Points",
            "prompt": f"""Generate the MD TALKING POINTS — the final section the MD reads right before the call.

Begin with a single bold line:
**TL;DR:** [One sentence: the primary ask on this call in plain language.]

Structure using ### headings:

### Opening (30 seconds)
A specific, warm opener referencing something recent and relevant to this sponsor. Not "great to connect." Reference a deal, a market event, or a fund milestone. Write the actual sentence the MD should say as a blockquote.

### Discussion Agenda
Numbered list in priority order. Each item: Topic, then lead question in quotes.

### Mandate Discovery Questions
Questions designed to surface deals they haven't told us about. Write each question as a blockquote.

### The Ask
Exact language for what we're requesting at the end of this call. Be specific: "I'd like to send you our detailed proposal on [X] by [date]" not "let's stay in touch." Write the actual ask as a blockquote.

### Call Sensitivities
One bullet per topic, state the risk, not just the topic. Keep brief."""
        },
    ]

    def stream_sections():
        try:
            logging.info("=== BRIEFING PACK GENERATION STARTED ===")
            logging.info("Sponsor: %s | Call type: %s | Banker: %s", sponsor_name, call_type, banker)
            logging.info("Auth method: %s", "Bedrock" if use_bedrock() else "Direct Anthropic API")
            try:
                logging.info("Client type: %s", type(client).__name__)
            except Exception as cred_err:
                logging.warning("Could not inspect client credentials: %s", cred_err)

            agent_t0_total = time.time()
            messages = []
            sections = {}
            intelligence_summary = ""

            # ── STAGE 1: Intelligence Analyst pre-pass ──────────────────────────
            yield json.dumps({
                "type": "agent_start",
                "agent": "Intelligence Analyst",
                "agent_id": "intelligence",
                "stage": 1,
                "label": f"Reading {sponsor_name} fund data, portfolio maturities & CRM history...",
            }) + "\n"
            logging.info("=== AGENT: Intelligence Analyst ===")
            t0 = time.time()
            intel_task = f"""Sponsor: {sponsor_name}
Call Type: {call_type}

{sponsor_context}

{debt_calendar}

{pipeline_text}

MARKET CONDITIONS:
{market_context}

{banker_intel}

Produce a structured intelligence brief covering: fund status & deployment stage, relationship context & recency, portfolio catalysts (maturities, M&A, leverage), and market conditions. Flag any data gaps explicitly (e.g., stale CRM data, missing leverage info).

Keep to 300-400 words — this is context for the section authors, not a final deliverable.
On the final line, write exactly one sentence starting with "FLAG:" identifying the single most notable gap, risk, or tension in the data. If there are no notable issues, write "FLAG: No material gaps identified." """
            intel_response = client.messages.create(
                model=model_id("sonnet"),
                max_tokens=800,
                system=INTEL_ANALYST_PROMPT,
                messages=[{"role": "user", "content": intel_task}],
            )
            intel_duration = time.time() - t0
            intelligence_summary = next(b.text for b in intel_response.content if b.type == "text")
            logging.info("Intelligence Analyst completed in %.1fs", intel_duration)

            # Extract FLAG line for agent_challenge event
            flag_text = None
            for line in intelligence_summary.splitlines():
                if line.strip().startswith("FLAG:"):
                    flag_text = line.strip()[len("FLAG:"):].strip()
                    break

            yield json.dumps({
                "type": "agent_complete",
                "agent": "Intelligence Analyst",
                "agent_id": "intelligence",
                "stage": 1,
                "duration_s": round(intel_duration, 1),
            }) + "\n"

            if flag_text and flag_text.lower() != "no material gaps identified.":
                yield json.dumps({
                    "type": "agent_challenge",
                    "agent": "Intelligence Analyst",
                    "agent_id": "intelligence",
                    "text": flag_text,
                }) + "\n"

            # ── STAGE 2: Section generation (enriched with intel summary) ───────
            total_sections = len(section_defs)
            yield json.dumps({
                "type": "agent_start",
                "agent": "Section Authors",
                "agent_id": "sections",
                "stage": 2,
                "label": f"Writing section 1 of {total_sections - 1}...",
            }) + "\n"

            # Inject intelligence summary into the system prompt
            enriched_system = system_prompt + f"""

INTELLIGENCE ANALYST BRIEF (use as additional context — do not quote directly):
{intelligence_summary}"""

            for i, sec in enumerate(section_defs):
                # Compliance pass happens before talking_points (last section)
                if sec["key"] == "talking_points" and sections:
                    # ── STAGE 3: Compliance Reviewer ────────────────────────────
                    yield json.dumps({
                        "type": "agent_start",
                        "agent": "Compliance Reviewer",
                        "agent_id": "compliance",
                        "stage": 3,
                        "label": f"Checking MNPI exposure & call sensitivities for {sponsor_name}...",
                    }) + "\n"
                    logging.info("=== AGENT: Compliance Reviewer ===")
                    t0 = time.time()
                    compliance_task = f"""Review the following briefing sections for a {call_type} call with {sponsor_name}.

SITUATION BRIEF:
{sections.get('situation_brief', '')}

PROACTIVE FINANCING IDEAS:
{sections.get('proactive_ideas', '')}

Identify call sensitivities using NOTE / FLAG / AVOID ratings. Be brief — 3-5 bullets max.
If everything is clean, write exactly: "No material sensitivities identified." """
                    compliance_response = client.messages.create(
                        model=model_id("sonnet"),
                        max_tokens=400,
                        system=COMPLIANCE_PROMPT,
                        messages=[{"role": "user", "content": compliance_task}],
                    )
                    compliance_duration = time.time() - t0
                    compliance_notes = next(b.text for b in compliance_response.content if b.type == "text")
                    logging.info("Compliance Reviewer completed in %.1fs", compliance_duration)

                    yield json.dumps({
                        "type": "agent_complete",
                        "agent": "Compliance Reviewer",
                        "agent_id": "compliance",
                        "stage": 3,
                        "duration_s": round(compliance_duration, 1),
                    }) + "\n"

                    # Surface any FLAG or AVOID items as challenges
                    for line in compliance_notes.splitlines():
                        stripped = line.strip()
                        challenge_text = None
                        if stripped.startswith("FLAG:"):
                            challenge_text = stripped[5:].strip()
                        elif stripped.startswith("AVOID:"):
                            challenge_text = stripped[6:].strip()
                        if challenge_text:
                            yield json.dumps({
                                "type": "agent_challenge",
                                "agent": "Compliance Reviewer",
                                "agent_id": "compliance",
                                "text": challenge_text,
                                "severity": "avoid" if stripped.startswith("AVOID:") else "flag",
                            }) + "\n"

                    # Inject compliance notes into the talking_points prompt
                    if "No material sensitivities" not in compliance_notes:
                        sec = dict(sec)
                        sec["prompt"] = sec["prompt"] + f"""

COMPLIANCE REVIEW NOTES (incorporate into Call Sensitivities — do not ignore):
{compliance_notes}"""

                yield json.dumps({"type": "section_start", "label": sec["label"], "key": sec["key"], "index": i}) + "\n"
                if sec["key"] != "leave_behind":
                    section_num = i + 1
                    yield json.dumps({
                        "type": "agent_update",
                        "agent_id": "sections",
                        "label": f"Writing {sec['label']} ({section_num}/{total_sections - 1})...",
                    }) + "\n"

                logging.info("--- Section %d/%d: %s ---", i + 1, len(section_defs), sec["label"])
                messages.append({"role": "user", "content": sec["prompt"]})
                t0 = time.time()
                response = client.messages.create(
                    model=model_id("opus"),
                    max_tokens=2500,
                    system=enriched_system,
                    messages=messages,
                    **thinking_param(),
                )
                logging.info("Section '%s' completed in %.1fs", sec["label"], time.time() - t0)
                text = next(b.text for b in response.content if b.type == "text")
                html = markdown.markdown(text, extensions=["tables", "fenced_code"])
                messages.append({"role": "assistant", "content": serialize_response(response)})
                sections[sec["key"]] = text

                yield json.dumps({
                    "type": "section_complete",
                    "label": sec["label"],
                    "key": sec["key"],
                    "index": i,
                    "html": html,
                    "markdown": text
                }) + "\n"

                # ── MD Review pass — fires after proactive_ideas ────────────
                if sec["key"] == "proactive_ideas":
                    yield json.dumps({
                        "type": "agent_start",
                        "agent": "MD Reviewer",
                        "agent_id": "md",
                        "stage": 2.5,
                        "label": f"Reviewing deal ideas for {sponsor_name}...",
                    }) + "\n"
                    logging.info("=== AGENT: MD Reviewer ===")
                    t0_md = time.time()
                    md_task = f"""Sponsor: {sponsor_name}
Call Type: {call_type}

SITUATION BRIEF:
{sections.get('situation_brief', '')}

PROACTIVE FINANCING IDEAS:
{sections.get('proactive_ideas', '')}

Send back ONE pointed challenge to sharpen the remaining sections."""
                    md_response = client.messages.create(
                        model=model_id("sonnet"),
                        max_tokens=150,
                        system=MD_REVIEWER_PROMPT,
                        messages=[{"role": "user", "content": md_task}],
                    )
                    md_duration = time.time() - t0_md
                    md_challenge = next(b.text for b in md_response.content if b.type == "text").strip()
                    logging.info("MD Reviewer completed in %.1fs: %s", md_duration, md_challenge)

                    yield json.dumps({
                        "type": "agent_complete",
                        "agent": "MD Reviewer",
                        "agent_id": "md",
                        "stage": 2.5,
                        "duration_s": round(md_duration, 1),
                    }) + "\n"
                    yield json.dumps({
                        "type": "agent_challenge",
                        "agent": "MD Reviewer",
                        "agent_id": "md",
                        "text": md_challenge,
                        "severity": "md",
                    }) + "\n"

                    # Inject MD direction into enriched system so remaining sections respond
                    enriched_system = enriched_system + f"""

MD REVIEW DIRECTION (incorporate into remaining sections — do not quote directly):
{md_challenge}"""

                    # Signal sections row is resuming with MD direction absorbed
                    yield json.dumps({
                        "type": "agent_update",
                        "agent_id": "sections",
                        "label": "Incorporating MD direction...",
                    }) + "\n"

            yield json.dumps({
                "type": "agent_complete",
                "agent": "Section Authors",
                "agent_id": "sections",
                "stage": 2,
                "duration_s": round(time.time() - agent_t0_total - intel_duration, 1),
            }) + "\n"

            # Generate leave-behind (clean client-facing version from same conversation)
            messages.append({
                "role": "user",
                "content": f"""Now generate a CLIENT-FACING LEAVE-BEHIND for {sponsor_name}.

This is a clean 3-section document suitable to email to the sponsor after the meeting.
STRIP OUT all internal commentary — no fee estimates, no competitive observations, no wallet share gaps, no [INTERNAL] sections.

Structure:
## Market Observations
3-4 bullet points on current conditions most relevant to their portfolio sectors.

## Financing Ideas for Your Consideration
The 2-3 ideas from the briefing, reformatted as clean proposals. Remove internal probability ratings and fee estimates. Keep: deal rationale, proposed structure, market comps.

## Huntington Capital Markets — How We Can Help
2-3 sentences on our relevant capabilities and a recent deal in their sector.

Keep the whole document to under 400 words. Professional but not salesy."""
            })

            lb_response = client.messages.create(
                model=model_id("sonnet"),
                max_tokens=1500,
                system=enriched_system,
                messages=messages,
            )
            lb_text = next(b.text for b in lb_response.content if b.type == "text")
            lb_html = markdown.markdown(lb_text, extensions=["tables", "fenced_code"])
            sections["leave_behind"] = lb_text

            yield json.dumps({
                "type": "section_complete",
                "label": "Client Leave-Behind",
                "key": "leave_behind",
                "index": len(section_defs),
                "html": lb_html,
                "markdown": lb_text
            }) + "\n"

            insert_briefing(sponsor_name, call_type, banker, sections)
            total_agent_s = round(time.time() - agent_t0_total, 1)
            yield json.dumps({
                "type": "complete",
                "sponsor": sponsor_name,
                "date": date.today().isoformat(),
                "agent_total_s": total_agent_s,
            }) + "\n"

        except Exception as e:
            logging.exception("BRIEFING PACK FAILED: %s", e)
            yield json.dumps({"type": "error", "message": f"Error: {str(e)}"}) + "\n"

    return Response(stream_with_context(stream_sections()), mimetype="application/x-ndjson")


@app.route("/api/briefing/export-pptx", methods=["POST"])
def export_briefing_pptx():
    """Generate and return a .pptx leave-behind for download."""
    from common.pptx_builder import build_leave_behind_pptx
    data = request.json
    sponsor = data.get("sponsor", "Sponsor")
    call_type = data.get("call_type", "Quarterly Check-in")
    banker = data.get("banker", "Huntington Capital Markets")
    leave_behind_md = data.get("leave_behind_markdown", "")
    call_date = data.get("call_date", date.today().strftime("%B %d, %Y"))

    pptx_bytes = build_leave_behind_pptx(sponsor, call_type, banker, leave_behind_md, call_date)
    filename = f"Huntington_{sponsor.replace(' ', '_').replace(',', '')}_{date.today().isoformat()}.pptx"
    return Response(
        pptx_bytes,
        mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.route("/api/history/briefings")
def briefing_history():
    """Return past briefings for a sponsor so the UI can offer a 'Load' button."""
    sponsor = request.args.get("sponsor", "")
    rows = get_briefings_for_sponsor(sponsor)
    return jsonify({"sponsor": sponsor, "briefings": rows})


@app.route("/api/history/briefings/<int:briefing_id>")
def load_briefing(briefing_id):
    """Load a specific past briefing by ID."""
    row = get_briefing_by_id(briefing_id)
    if not row:
        return jsonify({"error": "Not found"}), 404
    # Re-render sections as HTML
    for label, text in row["sections"].items():
        row["sections"][label] = {
            "markdown": text,
            "html": markdown.markdown(text, extensions=["tables", "fenced_code"]),
        }
    return jsonify(row)


# ── BOLT-ON SCOUT (sponsor-first) ─────────────────────────────────────────────

@app.route("/api/boltonscout", methods=["POST"])
def bolt_on_scout():
    """Run the Bolt-On Scout for a sponsor (sponsor-first mode)."""
    data = request.json
    sponsor_name = data.get("sponsor")
    top_n = int(data.get("top_n", 5))

    if sponsor_name not in SPONSORS:
        return jsonify({"error": f"Unknown sponsor: {sponsor_name}"}), 400

    from poc2_bolt_on_scout.bolt_on_scout import score_matches, generate_rationales

    client = get_api_client()

    def generate():
        try:
            yield json.dumps({"type": "status", "step": 1, "total_steps": 2, "message": f"Scoring {len(MIDDLE_MARKET_CLIENTS)} companies against {sponsor_name} criteria..."}) + "\n"

            scores = score_matches(client, sponsor_name)
            scores.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
            top_matches = scores[:top_n]

            yield json.dumps({"type": "scores", "matches": top_matches}) + "\n"
            yield json.dumps({"type": "status", "step": 2, "total_steps": 2, "message": "Generating banker-ready rationales..."}) + "\n"

            rationales = generate_rationales(client, sponsor_name, top_matches)

            enriched = []
            for score_entry in top_matches:
                rationale_entry = next(
                    (r for r in rationales if r["company_name"] == score_entry["company_name"]),
                    {},
                )
                enriched.append({**score_entry, **rationale_entry})

            insert_scout_result(sponsor_name, "", enriched)

            yield json.dumps({"type": "complete", "sponsor": sponsor_name, "matches": enriched, "date": date.today().isoformat(), "market_metadata": MARKET_METADATA}) + "\n"
        except Exception as e:
            yield json.dumps({"type": "error", "message": f"Error: {str(e)}"}) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/x-ndjson")


# ── SPONSOR MATCH (company-first / reverse search) ────────────────────────────

@app.route("/api/sponsormatch", methods=["POST"])
def sponsor_match():
    """
    Reverse lookup: given a middle market company, rank all PE sponsors by fit.
    Entry point: RM says 'my client is ready to sell — who wants them?'
    """
    data = request.json
    company_name = data.get("company")

    company = next(
        (c for c in MIDDLE_MARKET_CLIENTS if c["company_name"].lower() == company_name.lower()),
        None,
    )
    if not company:
        return jsonify({"error": f"Company '{company_name}' not found in client book."}), 404

    from poc2_bolt_on_scout.bolt_on_scout import reverse_score, generate_reverse_rationales

    client = get_api_client()

    def generate():
        try:
            yield json.dumps({"type": "status", "step": 1, "total_steps": 2, "message": f"Matching {company_name} against {len(SPONSORS)} sponsors..."}) + "\n"

            scores = reverse_score(client, company_name)

            yield json.dumps({"type": "scores", "matches": scores}) + "\n"
            yield json.dumps({"type": "status", "step": 2, "total_steps": 2, "message": "Generating pitch rationales..."}) + "\n"

            enriched = generate_reverse_rationales(client, company_name, scores[:4])

            insert_scout_result("", company_name, enriched)

            yield json.dumps({
                "type": "complete",
                "company": company_name,
                "company_profile": company,
                "matches": enriched,
                "date": date.today().isoformat(),
                "market_metadata": MARKET_METADATA,
            }) + "\n"
        except Exception as e:
            yield json.dumps({"type": "error", "message": f"Error: {str(e)}"}) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/x-ndjson")


# ── OPPORTUNITY SCANNER ────────────────────────────────────────────────────────

@app.route("/api/scanner")
def scanner():
    """Return pre-rendered scanner results."""
    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS

    states = get_opportunity_states()
    sponsor = request.args.get("sponsor")
    if sponsor:
        results = SCANNER_RESULTS.get(sponsor, [])
        for opp in results:
            opp["source"] = SIGNAL_SOURCE_MAP.get(opp.get("signal_type", ""), "Scanner")
            opp["state"] = _public_state(states.get(opp["opportunity_id"]))
        return jsonify({"sponsor": sponsor, "opportunities": results})

    all_results = []
    for name in SPONSOR_NAMES:
        for opp in SCANNER_RESULTS.get(name, []):
            opp["source"] = SIGNAL_SOURCE_MAP.get(opp.get("signal_type", ""), "Scanner")
            opp["state"] = _public_state(states.get(opp["opportunity_id"]))
            all_results.append(opp)
    return jsonify({
        "scan_date": date.today().isoformat(),
        "total": len(all_results),
        "total_fees_mm": sum(o["estimated_fee_mm"] for o in all_results),
        "opportunities": all_results,
    })


# ── LEADERSHIP VIEW ────────────────────────────────────────────────────────────

@app.route("/api/leadership")
def leadership():
    """Return leadership dashboard data."""
    from poc4_leadership_view.leadership_view import PIPELINE
    from collections import defaultdict

    products = defaultdict(lambda: {"count": 0, "deal_value": 0, "fee_value": 0, "weighted_fee": 0})
    sectors = defaultdict(lambda: {"count": 0, "fee_value": 0, "weighted_fee": 0})
    sponsors_agg = defaultdict(lambda: {"deals": 0, "fees": 0, "weighted": 0})
    stages = defaultdict(list)

    for d in PIPELINE:
        p = products[d["product"]]
        p["count"] += 1
        p["deal_value"] += d["size_mm"]
        p["fee_value"] += d["fee_mm"]
        p["weighted_fee"] += d["fee_mm"] * d["probability"]

        s = sectors[d["sector"]]
        s["count"] += 1
        s["fee_value"] += d["fee_mm"]
        s["weighted_fee"] += d["fee_mm"] * d["probability"]

        sp = d.get("sponsor", "N/A")
        if sp == "N/A":
            sp = "Non-Sponsor"
        sa = sponsors_agg[sp]
        sa["deals"] += 1
        sa["fees"] += d["fee_mm"]
        sa["weighted"] += d["fee_mm"] * d["probability"]

        stages[d["stage"]].append(d)

    return jsonify({
        "date": date.today().isoformat(),
        "pipeline": PIPELINE,
        "products": dict(products),
        "sectors": dict(sectors),
        "sponsors": dict(sponsors_agg),
        "stages": {k: v for k, v in stages.items()},
        "totals": {
            "deals": len(PIPELINE),
            "fees": sum(d["fee_mm"] for d in PIPELINE),
            "weighted": sum(d["fee_mm"] * d["probability"] for d in PIPELINE),
        },
    })


# ── Q&A ────────────────────────────────────────────────────────────────────────

def _mock_qa_response(question, context):
    """Return a mock HTML response for the AI assistant when the LLM is unavailable."""
    import re
    q = question.lower()

    # Context-aware responses (when user selected an element)
    if context and "selected this element" in context:
        element_text = context.split('"')[1] if '"' in context else ""
        et = element_text.lower()

        if "assuredpartners" in et or "apax" in et:
            return ("<p><strong>AssuredPartners (GTCR / APAX)</strong> is one of the largest independent insurance "
                    "brokerage platforms in the US with 200+ completed acquisitions.</p>"
                    "<ul><li><strong>Term Loan B:</strong> $4.2B maturing Nov 2027 at SOFR+375bps (6.5x leverage)</li>"
                    "<li><strong>Revolver:</strong> $400M maturing Nov 2026 (needs immediate attention)</li></ul>"
                    "<p>Key risk: the RCF matures 12 months ahead of the TLB. We recommend a concurrent refi "
                    "to clean up the capital structure. Market spreads are ~65bps inside current coupon.</p>")

        if "usi" in et or "kkr" in et:
            return ("<p><strong>USI Insurance Services (KKR)</strong> has the most urgent maturity in our book.</p>"
                    "<ul><li><strong>TLB:</strong> $3.2B maturing <strong>Nov 2026</strong> (under 2 months). SOFR+325bps at 6.1x.</li>"
                    "<li><strong>Senior Notes:</strong> $800M maturing May 2027 at 5.75% fixed</li></ul>"
                    "<p>This is a <strong>critical</strong> refinancing window. KKR will need to move before Nov. "
                    "Recommend positioning for lead-left on a combined TLB refi + notes tender. Estimated fee: $4.5M+.</p>")

        if "nuvei" in et or "madison" in et:
            return ("<p><strong>Nuvei Corporation (Madison Dearborn / Advent)</strong> was taken private in 2024 "
                    "for $6.3B CAD.</p>"
                    "<ul><li><strong>TLB:</strong> $3.6B at SOFR+375bps (5.3x leverage, Feb 2029 maturity)</li>"
                    "<li><strong>Senior Notes:</strong> $600M at 7.00% fixed (Feb 2031)</li></ul>"
                    "<p>Current spreads are 30-50bps wide of comparable payments credits. "
                    "A repricing opportunity exists that could save the sponsor ~$12-18M annually.</p>")

        if "cornerstone" in et or "building" in et:
            return ("<p><strong>Cornerstone Building Brands (CD&R)</strong> is the largest US exterior building products manufacturer.</p>"
                    "<ul><li><strong>TLB:</strong> $3.2B maturing Apr 2028 at SOFR+350bps</li>"
                    "<li><strong>Senior Notes:</strong> $800M at 6.50% fixed (Apr 2029)</li>"
                    "<li>5.5x leverage on $581M EBITDA</li></ul>"
                    "<p>CD&R operational improvement is tracking ahead of plan. Housing starts tailwind supports "
                    "a potential repricing in Q1 2027.</p>")

        if "high" in et or "critical" in et or "urgency" in et:
            return ("<p>This is flagged as a <strong>high-priority signal</strong> in our scanner, "
                    "meaning it requires action within the next 30-60 days.</p>"
                    "<p>High-urgency signals are triggered by:</p>"
                    "<ul><li>Maturity walls within 18 months</li>"
                    "<li>Active fund closings creating deployment pressure</li>"
                    "<li>Competitive mandates where other banks are already pitching</li></ul>"
                    "<p>Recommend scheduling a coverage call this week to discuss positioning.</p>")

        if "fee" in et or "$" in et:
            return ("<p>Fee estimates are calculated based on market-standard benchmarks:</p>"
                    "<ul><li><strong>Refinancing:</strong> 25-50bps on commitment (varies by leverage)</li>"
                    "<li><strong>New money TLB:</strong> 100-200bps arrangement fee</li>"
                    "<li><strong>Advisory:</strong> 0.5-1.0% of transaction value</li>"
                    "<li><strong>Dividend recap:</strong> 75-125bps on incremental debt</li></ul>"
                    "<p>Confidence scores reflect deal probability based on CRM activity, "
                    "market timing, and sponsor relationship strength.</p>")

        # Generic selected-element response
        return (f"<p>Based on the selected content, here's what I can tell you:</p>"
                f"<p>This relates to our active coverage pipeline. The data is sourced from "
                f"CRM records (Salesforce), market data (Bloomberg), and our proprietary "
                f"scanner signals.</p>"
                f"<p>Would you like me to pull up the full sponsor briefing, or dive into "
                f"specific metrics like leverage, maturity dates, or fee estimates?</p>")

    # Keyword-matched general responses
    if "healthcare" in q and ("carve" in q or "carve-out" in q):
        return ("<p><strong>Healthcare Carve-out Opportunities</strong></p>"
                "<p>Three sponsors are actively seeking healthcare carve-outs:</p>"
                "<ul><li><strong>GTCR</strong> — raised Fund XIV ($11.5B) with healthcare as a primary thesis. "
                "Targeting specialty pharma services, HST, and payor platforms. Recent add-on pipeline for Maravai LifeSciences.</li>"
                "<li><strong>CD&R</strong> — Covetrus ($1.8B TLB) positions them in vet distribution + SaaS. "
                "Exploring strategic options that could include a healthcare platform bolt-on.</li>"
                "<li><strong>Madison Dearborn</strong> — Global Healthcare Exchange ($850M TLB, 5.1x leverage) "
                "is a natural acquirer of healthcare IT adjacencies.</li></ul>"
                "<p>From our client book, <strong>Great Lakes Home Health</strong> ($320M rev, $48M EBITDA) "
                "and <strong>Carolinas Physician Network</strong> ($390M rev, $58M EBITDA) are both showing "
                "transaction signals that align with PE interest.</p>")

    if "maturity" in q and "2027" in q:
        return ("<p><strong>2027 Maturity Wall Summary</strong></p>"
                "<p>Six instruments across four sponsors mature in 2027, representing "
                "<strong>$11.6B in principal</strong> and an estimated <strong>$18.7M in refi fees</strong>:</p>"
                "<table><thead><tr><th>Sponsor</th><th>Company</th><th>Instrument</th><th>Amount</th><th>Maturity</th></tr></thead>"
                "<tbody>"
                "<tr><td>KKR</td><td>USI Insurance</td><td>TLB</td><td>$3.2B</td><td><strong>Nov 2026</strong> ⚠️</td></tr>"
                "<tr><td>GTCR</td><td>AssuredPartners</td><td>RCF</td><td>$400M</td><td>Nov 2026</td></tr>"
                "<tr><td>Stone Point</td><td>Foundation Risk</td><td>TLB</td><td>$500M</td><td>Jun 2027</td></tr>"
                "<tr><td>Stone Point</td><td>AmeriLife</td><td>TLB + DDTL</td><td>$3.0B</td><td>Aug 2027</td></tr>"
                "<tr><td>Madison Dearborn</td><td>GHX</td><td>TLB</td><td>$850M</td><td>Sep 2027</td></tr>"
                "<tr><td>GTCR</td><td>AssuredPartners</td><td>TLB</td><td>$4.2B</td><td>Nov 2027</td></tr>"
                "<tr><td>GTCR</td><td>Maravai</td><td>TLB</td><td>$500M</td><td>Oct 2027</td></tr>"
                "</tbody></table>"
                "<p><strong>Immediate priority:</strong> USI (KKR) matures in under 2 months. "
                "AssuredPartners RCF (GTCR) is next at Nov 2026.</p>")

    if "fee pipeline" in q or "fee" in q and "sponsor" in q:
        return ("<p><strong>Fee Pipeline by Sponsor</strong></p>"
                "<table><thead><tr><th>Sponsor</th><th># Opps</th><th>Total Fees</th><th>Avg Confidence</th></tr></thead>"
                "<tbody>"
                "<tr><td>GTCR</td><td>4</td><td><strong>$21.0M</strong></td><td>72%</td></tr>"
                "<tr><td>CD&R</td><td>3</td><td><strong>$16.5M</strong></td><td>68%</td></tr>"
                "<tr><td>Madison Dearborn</td><td>3</td><td><strong>$12.3M</strong></td><td>65%</td></tr>"
                "<tr><td>Stone Point</td><td>3</td><td><strong>$7.5M</strong></td><td>70%</td></tr>"
                "<tr><td>KKR</td><td>2</td><td><strong>$6.5M</strong></td><td>75%</td></tr>"
                "<tr><td>Blackstone</td><td>2</td><td><strong>$5.2M</strong></td><td>60%</td></tr>"
                "</tbody></table>"
                "<p><strong>Total pipeline: $69.0M</strong> across 13 active signals. "
                "Risk-adjusted (confidence-weighted): ~$47M.</p>"
                "<p>GTCR is the highest-value relationship at $21M, driven by the AssuredPartners "
                "refi ($6.2M) and Fund XIV platform deal ($8.5M).</p>")

    if "kkr" in q or "usi" in q:
        return ("<p><strong>KKR / USI Insurance Services</strong></p>"
                "<p>USI is our <strong>most time-sensitive opportunity</strong>:</p>"
                "<ul><li>$3.2B Term Loan B matures <strong>November 2026</strong> (SOFR+325, 6.1x leverage)</li>"
                "<li>$800M Senior Secured Notes mature May 2027 (5.75% fixed)</li>"
                "<li>524.6M EBITDA supports current structure but leverage is elevated</li></ul>"
                "<p><strong>Recommendation:</strong> Position for lead-left on a combined refi. "
                "Market conditions favor a repricing to ~SOFR+290 (35bps savings = ~$11M annual interest reduction). "
                "Estimated total fee: <strong>$4.5M</strong> on the TLB alone, plus potential notes tender advisory.</p>"
                "<p>This is an anchor relationship opportunity for Huntington's KKR coverage.</p>")

    if "gtcr" in q:
        return ("<p><strong>GTCR Coverage Summary</strong></p>"
                "<p>GTCR is our highest-value sponsor relationship with <strong>$21.0M in pipeline fees</strong> across 4 active signals:</p>"
                "<ol><li><strong>Fund XIV Platform ($8.5M)</strong> — New $11.5B fund deploying. Targeting healthcare, "
                "financial services, technology. Likely 2-3 platform deals in next 12 months.</li>"
                "<li><strong>AssuredPartners Refi ($6.2M)</strong> — $4.2B TLB + $400M RCF. Maturity wall Nov 2027. "
                "Market spreads 65bps inside current coupon. Co-owned with APAX.</li>"
                "<li><strong>Optimal Blue Add-on ($1.8M)</strong> — Active bolt-on pipeline in mortgage tech adjacencies. "
                "$1.65B TLB at SOFR+350.</li>"
                "<li><strong>Maravai Exit Signal ($4.5M)</strong> — Public (MRVI). GTCR reducing stake. "
                "Potential take-private or secondary transaction.</li></ol>"
                "<p>Key contact: <strong>Collin Roche</strong> (Managing Partner) via Eric Welsh coverage.</p>")

    if "stone point" in q:
        return ("<p><strong>Stone Point Capital Overview</strong></p>"
                "<p>Three active signals totaling <strong>$7.5M in fees</strong>:</p>"
                "<ul><li><strong>AmeriLife ($3.2M)</strong> — $2.2B TLB + $800M DDTL maturing Aug 2027. "
                "60+ acquisitions completed. 8 acquisition targets in H2 2026 pipeline. Co-owned with Thomas H. Lee.</li>"
                "<li><strong>Platform Acquisition ($2.8M)</strong> — Fund VII deploying in insurance and financial services.</li>"
                "<li><strong>Foundation Risk Partners ($1.5M)</strong> — $500M TLB maturing Jun 2027. "
                "SE-focused brokerage outgrown current facility. Upsizing + extension needed.</li></ul>"
                "<p>Stone Point is one of the top insurance-focused PE firms. Strong overlap with our "
                "client <strong>CrossPoint Insurance Group</strong> ($210M rev, $63M EBITDA) for bolt-on introductions.</p>")

    if "cd&r" in q or "clayton" in q or "dubilier" in q:
        return ("<p><strong>Clayton, Dubilier & Rice Coverage</strong></p>"
                "<p>Three signals totaling <strong>$16.5M in pipeline fees</strong>:</p>"
                "<ul><li><strong>Cornerstone Building Brands Refi ($5.8M)</strong> — $3.2B TLB + $800M notes. "
                "Operational improvement tracking ahead. Housing starts tailwind.</li>"
                "<li><strong>New Acquisition ($7.2M)</strong> — Fund XII actively deploying. "
                "Targeting industrial/building products and healthcare adjacencies.</li>"
                "<li><strong>Covetrus Exit ($3.5M)</strong> — $1.8B TLB. Vet distribution + SaaS. "
                "Exploring strategic options including potential sale process.</li></ul>"
                "<p>Key contacts: <strong>Nate Jorgensen</strong> (Partner, Industrials), "
                "<strong>Rob Wagman</strong> (Operating Partner). Covered by Jeff Tuckle.</p>")

    if "spread" in q or "rate" in q or "market" in q and "condition" in q:
        return ("<p><strong>Current Market Conditions</strong></p>"
                "<ul><li><strong>Base rate:</strong> SOFR at 4.80% (Fed holding steady, 1-2 cuts expected by year-end)</li>"
                "<li><strong>Investment-grade spreads:</strong> 95-115bps (tight, historical lows)</li>"
                "<li><strong>Leveraged loan spreads:</strong> 275-375bps for B/B+ credits (compressed 50bps YTD)</li>"
                "<li><strong>High-yield bonds:</strong> 350-500bps (strong demand, new issuance up 35% YoY)</li>"
                "<li><strong>CLO formation:</strong> Slowing in Q3, but demand still outpacing supply for BB/B tranches</li></ul>"
                "<p><strong>Key theme:</strong> This is a borrower-friendly environment. Sponsors with near-term "
                "maturities should refinance now before potential rate volatility in Q4. Several of our portfolio "
                "positions are 30-65bps wide of current market, creating natural repricing opportunities.</p>")

    if "client" in q or "middle market" in q or "bolt-on" in q or "introduction" in q:
        return ("<p><strong>Middle Market Client Book — Bolt-on Candidates</strong></p>"
                "<p>12 companies in our proprietary client book with active transaction signals:</p>"
                "<table><thead><tr><th>Company</th><th>Sector</th><th>Revenue</th><th>EBITDA</th><th>Signal</th></tr></thead>"
                "<tbody>"
                "<tr><td>Great Lakes Home Health</td><td>Healthcare</td><td>$320M</td><td>$48M</td><td>Exploring strategic options</td></tr>"
                "<tr><td>Carolinas Physician Network</td><td>Healthcare</td><td>$390M</td><td>$58M</td><td>PE interest, consolidation play</td></tr>"
                "<tr><td>CrossPoint Insurance</td><td>Insurance</td><td>$210M</td><td>$63M</td><td>Add-on candidate for AmeriLife/AssuredPartners</td></tr>"
                "<tr><td>Midwest Precision Fasteners</td><td>Industrial</td><td>$185M</td><td>$32M</td><td>Founder considering exit</td></tr>"
                "<tr><td>Heartland Payment Solutions</td><td>FinTech</td><td>$95M</td><td>$18M</td><td>Growth equity or acquisition target</td></tr>"
                "</tbody></table>"
                "<p>These are Huntington's <strong>competitive differentiator</strong> — regional middle-market "
                "relationships that national banks can't replicate. Each maps to at least one covered sponsor's "
                "active investment thesis.</p>")

    # Default / fallback
    return ("<p>Based on our current intelligence across <strong>6 covered sponsors</strong>, "
            "<strong>13 active scanner signals</strong>, and <strong>$69M in pipeline fees</strong>, "
            "here are the key themes:</p>"
            "<ul><li><strong>Immediate action:</strong> USI (KKR) maturity in Nov 2026 and AssuredPartners RCF (GTCR)</li>"
            "<li><strong>Largest opportunity:</strong> GTCR Fund XIV platform deals ($8.5M+) and CD&R new acquisition ($7.2M)</li>"
            "<li><strong>Market timing:</strong> Leveraged loan spreads compressed 50bps YTD — optimal window for repricings</li>"
            "<li><strong>Client introductions:</strong> 12 middle-market companies with active transaction signals</li></ul>"
            "<p>What specific area would you like to explore?</p>")


QA_TOOLS = [
    {
        "name": "search_scanner",
        "description": "Search the Opportunity Scanner for active signals across covered PE sponsors. Returns financing opportunities with urgency, estimated fees, and recommended products. Use this when the user asks about opportunities, signals, pipeline, maturities, or refinancing.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sponsor": {"type": "string", "description": "Filter by sponsor name (e.g. 'GTCR', 'KKR'). Leave empty for all sponsors."},
                "urgency": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"], "description": "Filter by urgency level."},
                "signal_type": {"type": "string", "description": "Filter by signal type (e.g. 'MATURITY WALL', 'FUND LIFECYCLE', 'EXIT SIGNAL')."},
            },
            "required": [],
        },
    },
    {
        "name": "get_portfolio_debt",
        "description": "Retrieve Bloomberg-sourced debt instruments for a specific PE sponsor. Returns maturity dates, coupon spreads, leverage, EBITDA, and market spread data. Use this for detailed debt profile, leverage, or maturity questions.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sponsor": {"type": "string", "description": "Sponsor name (e.g. 'GTCR', 'KKR', 'Blackstone')."},
            },
            "required": ["sponsor"],
        },
    },
    {
        "name": "get_sponsor_profile",
        "description": "Retrieve full CRM profile for a PE sponsor: AUM, fund vintage, investment themes, target profile, portfolio companies, key partners, and recent deals. Use this for relationship, strategy, or coverage questions.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sponsor": {"type": "string", "description": "Sponsor name (e.g. 'GTCR', 'Clayton, Dubilier & Rice')."},
            },
            "required": ["sponsor"],
        },
    },
    {
        "name": "search_clients",
        "description": "Search Huntington's middle-market client book for companies that match specific criteria. Use this when the user asks about bolt-on candidates, acquisition targets, or middle-market companies in a sector.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sector": {"type": "string", "description": "Filter by sector (e.g. 'Healthcare', 'Manufacturing')."},
                "min_revenue_mm": {"type": "number", "description": "Minimum revenue in $M."},
                "max_revenue_mm": {"type": "number", "description": "Maximum revenue in $M."},
            },
            "required": [],
        },
    },
]


def _execute_tool(tool_name, tool_input):
    """Execute a tool call and return the result as a string."""
    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS

    if tool_name == "search_scanner":
        all_opps = [opp for opps in SCANNER_RESULTS.values() for opp in opps]
        sponsor_filter = tool_input.get("sponsor", "")
        urgency_filter = tool_input.get("urgency", "")
        signal_filter = tool_input.get("signal_type", "")
        if sponsor_filter:
            all_opps = [o for o in all_opps if sponsor_filter.lower() in o["sponsor"].lower()]
        if urgency_filter:
            all_opps = [o for o in all_opps if o["urgency"] == urgency_filter]
        if signal_filter:
            all_opps = [o for o in all_opps if signal_filter.lower() in o["signal_type"].lower()]
        results = []
        for o in all_opps:
            results.append({
                "sponsor": o["sponsor"], "signal_type": o["signal_type"],
                "urgency": o["urgency"], "signal": o["signal"],
                "recommended_product": o["recommended_product"],
                "estimated_fee_mm": o["estimated_fee_mm"],
                "confidence": o["confidence"], "action": o["action"],
            })
        return json.dumps({"tool": "scanner", "count": len(results), "opportunities": results})

    elif tool_name == "get_portfolio_debt":
        sponsor = tool_input.get("sponsor", "")
        from common.db import get_portfolio_debt as db_get_debt
        rows = db_get_debt(sponsor)
        if not rows:
            for name in SPONSOR_NAMES:
                if sponsor.lower() in name.lower():
                    rows = db_get_debt(name)
                    break
        instruments = []
        for r in rows:
            instruments.append({
                "company": r["company"], "instrument": r["debt_instrument"],
                "amount_mm": r["debt_amount_mm"], "maturity": r["maturity_date"],
                "coupon_bps": r["coupon_spread_bps"], "base_rate": r["base_rate"],
                "leverage_x": r["current_leverage_x"], "ebitda_mm": r["ebitda_mm"],
                "market_spread_bps": r["market_spread_bps"], "notes": r["notes"],
            })
        return json.dumps({"tool": "portfolio_debt", "sponsor": sponsor, "count": len(instruments), "instruments": instruments})

    elif tool_name == "get_sponsor_profile":
        sponsor = tool_input.get("sponsor", "")
        profile = SPONSORS.get(sponsor)
        if not profile:
            for name in SPONSOR_NAMES:
                if sponsor.lower() in name.lower():
                    profile = SPONSORS[name]
                    sponsor = name
                    break
        if profile:
            return json.dumps({"tool": "sponsor_profile", "sponsor": sponsor, "profile": profile}, default=str)
        return json.dumps({"tool": "sponsor_profile", "error": f"Sponsor '{sponsor}' not found."})

    elif tool_name == "search_clients":
        sector_filter = tool_input.get("sector", "").lower()
        min_rev = tool_input.get("min_revenue_mm", 0)
        max_rev = tool_input.get("max_revenue_mm", float("inf"))
        matches = []
        for c in MIDDLE_MARKET_CLIENTS:
            if sector_filter and sector_filter not in c["sector"].lower():
                continue
            if c["revenue_mm"] < min_rev or c["revenue_mm"] > max_rev:
                continue
            matches.append({
                "company": c["company_name"], "sector": c["sector"],
                "revenue_mm": c["revenue_mm"], "ebitda_mm": c["ebitda_mm"],
                "geography": c["geography"], "ownership": c["ownership_type"],
                "signals": c["transaction_signals"],
            })
        return json.dumps({"tool": "client_search", "count": len(matches), "clients": matches})

    return json.dumps({"error": f"Unknown tool: {tool_name}"})


@app.route("/api/qa", methods=["POST"])
def qa():
    """Answer questions with tool-calling: scanner, portfolio debt, sponsor profiles, client book."""
    data = request.json
    question = data.get("question", "")
    context = data.get("context", "")
    sponsor = data.get("sponsor", "")

    system_label = f"about {sponsor}" if sponsor else "across all covered sponsors"
    system_prompt = f"""You are a senior Capital Markets analyst at Huntington National Bank.
Answer questions {system_label} concisely and specifically.

You have tools to query live data from Huntington's systems:
- **search_scanner**: Query the Opportunity Scanner for active financing signals
- **get_portfolio_debt**: Pull Bloomberg debt instrument data for a sponsor
- **get_sponsor_profile**: Get CRM profile, strategy, portfolio, and contacts
- **search_clients**: Search Huntington's middle-market client book

USE TOOLS PROACTIVELY. When a user asks about a sponsor, signals, debt, or clients, call the relevant tool first to get current data, then synthesize an answer. You can call multiple tools in one turn.

When answering:
- Reference specific numbers, names, and data points from tool results
- Be concise: the MD is prepping for a call

FORMATTING RULES (follow exactly):
- Use ## H2 headings to group results by category (e.g. "## Maturity Wall", "## Fund Deployment")
- Under each H2, use a markdown table when showing multiple items with comparable fields
- Table columns should match the data type. For scanner results use: | Sponsor | Company | Product | Est. Fee | Urgency |
- For debt instruments use: | Company | Instrument | Amount | Maturity | Spread |
- For client matches use: | Company | Sector | Revenue | EBITDA | Geography |
- After tables, add a brief 1-2 sentence takeaway in a paragraph
- Never use inline dashes to separate fields. Never put "Estimated fees:", "Opportunity:", "Action:" as inline bold labels
- Keep total response under 400 words"""

    messages = []
    if context:
        messages.append({"role": "user", "content": f"Context: {context}"})
        messages.append({"role": "assistant", "content": "Understood. I have the context loaded."})
    messages.append({"role": "user", "content": question})

    tool_calls_made = []

    try:
        client = get_api_client()
        response = client.messages.create(
            model=model_id("sonnet"),
            max_tokens=2048,
            system=system_prompt,
            tools=QA_TOOLS,
            messages=messages,
        )

        max_iterations = 4
        iteration = 0
        while response.stop_reason == "tool_use" and iteration < max_iterations:
            iteration += 1
            tool_blocks = [b for b in response.content if b.type == "tool_use"]
            tool_results = []
            for tb in tool_blocks:
                result_str = _execute_tool(tb.name, tb.input)
                tool_calls_made.append({
                    "tool": tb.name,
                    "input": tb.input,
                    "result": json.loads(result_str),
                })
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tb.id,
                    "content": result_str,
                })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

            response = client.messages.create(
                model=model_id("sonnet"),
                max_tokens=2048,
                system=system_prompt,
                tools=QA_TOOLS,
                messages=messages,
            )

        answer = ""
        for b in response.content:
            if b.type == "text":
                answer += b.text
        html = markdown.markdown(answer, extensions=["tables", "fenced_code"])
        return jsonify({"answer": answer, "html": html, "tool_calls": tool_calls_made})
    except Exception as e:
        logging.warning(f"LLM unavailable for QA, using mock response: {e}")
        mock_html = _mock_qa_response(question, context)
        return jsonify({"answer": "", "html": mock_html, "tool_calls": []})


# Section key → (label, responsible agent name)
_SECTION_AGENTS = {
    "situation_brief":        ("Situation Brief",                  "Relationship Strategist"),
    "relationship_scorecard": ("Relationship Scorecard",           "Relationship Strategist"),
    "fund_intelligence":      ("Fund Intelligence",                "Intelligence Analyst"),
    "maturity_calendar":      ("Portfolio Maturity & Refi Calendar", "Deal Originator"),
    "proactive_ideas":        ("Proactive Financing Ideas",        "Deal Originator"),
    "bolton_introductions":   ("Bolt-On Introduction Candidates",  "Bolt-On Connector"),
    "market_conditions":      ("Market Conditions",                "Market Analyst"),
    "talking_points":         ("MD Talking Points",                "MD Reviewer"),
}


@app.route("/api/briefing/revise", methods=["POST"])
def revise_section():
    """Identify which section to revise and regenerate it with banker direction."""
    from poc1_sponsor_briefing.briefing_poc import build_sponsor_context, build_market_context

    data = request.json
    instruction = data.get("instruction", "").strip()
    context = data.get("context", "")          # full briefing markdown
    sponsor = data.get("sponsor", "")
    sections_md = data.get("sections", {})     # {key: markdown_text}

    if not instruction or not sponsor:
        return jsonify({"error": "Missing instruction or sponsor"}), 400

    client = get_api_client()

    # Step 1 — classify which section the banker wants revised
    section_list = "\n".join(
        f'  "{k}": {v[0]}' for k, v in _SECTION_AGENTS.items()
    )
    classify_resp = client.messages.create(
        model=model_id("sonnet"),
        max_tokens=20,
        system="You are a routing assistant. Reply with only the section key — nothing else.",
        messages=[{"role": "user", "content": f"""A banker gave this revision instruction for a briefing about {sponsor}:
"{instruction}"

Which section key best matches? Choose exactly one from:
{section_list}

Reply with only the key."""}],
    )
    raw_key = next(b.text for b in classify_resp.content if b.type == "text").strip().strip('"').strip("'")
    section_key = raw_key if raw_key in _SECTION_AGENTS else "talking_points"
    section_label, agent_name = _SECTION_AGENTS[section_key]

    # Step 2 — regenerate the targeted section
    original = sections_md.get(section_key, "")
    sponsor_data = build_sponsor_context(sponsor)
    market_data = build_market_context(sponsor)

    revise_resp = client.messages.create(
        model=model_id("sonnet"),
        max_tokens=2000,
        system=f"""You are a senior Capital Markets analyst at Huntington National Bank.
A banker has asked you to revise one section of a pre-call briefing pack for {sponsor}.
Revise it precisely per the instruction — improve the specific aspect requested without rewriting unrelated content.
Preserve the exact markdown formatting of the original section (tables, bold TL;DR, bullets, etc.).
Do not add a section title — start directly with the content.""",
        messages=[
            {"role": "user", "content": f"""FULL BRIEFING CONTEXT:
{context}

---
SOURCE DATA:
{sponsor_data}
{market_data}

---
SECTION TO REVISE: {section_label}

ORIGINAL CONTENT:
{original}

---
BANKER INSTRUCTION: {instruction}

Produce the revised section now."""},
        ],
    )
    revised_text = next(b.text for b in revise_resp.content if b.type == "text")
    revised_html = markdown.markdown(revised_text, extensions=["tables", "fenced_code"])

    return jsonify({
        "section_key": section_key,
        "section_label": section_label,
        "agent_name": agent_name,
        "markdown": revised_text,
        "html": revised_html,
    })


# ── FEEDBACK ───────────────────────────────────────────────────────────────────

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    """Record banker feedback on AI-generated content."""
    data = request.json
    entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "tool": data.get("tool"),
        "sponsor": data.get("sponsor"),
        "section": data.get("section", ""),
        "item": data.get("item", ""),
        "rating": data.get("rating"),
        "action": data.get("action", ""),
        "comment": data.get("comment", ""),
        "banker": data.get("banker", "Demo User"),
    }
    insert_feedback(entry)

    if entry.get("action"):
        insert_action(
            tool=entry["tool"] or "",
            sponsor=entry["sponsor"] or "",
            item=entry["item"] or "",
            action=entry["action"],
            banker=entry["banker"],
        )

    all_feedback = get_all_feedback()
    return jsonify({"status": "recorded", "total_feedback": len(all_feedback)})


@app.route("/api/feedback")
def get_feedback():
    """Return all feedback for the Leadership View activity feed."""
    from collections import Counter
    feedback = get_all_feedback()
    actions = get_all_actions()

    tool_counts = Counter(f["tool"] for f in feedback)
    action_counts = Counter(f["action"] for f in feedback if f["action"])
    rating_counts = Counter(f["rating"] for f in feedback if f["rating"])

    return jsonify({
        "entries": feedback[:20],
        "total": len(feedback),
        "by_tool": dict(tool_counts),
        "by_action": dict(action_counts),
        "by_rating": dict(rating_counts),
    })


# ── SEARCH ────────────────────────────────────────────────────────────────────

@app.route("/api/search")
def search():
    """Full-text search across all DB tables plus static sponsor/client data."""
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"results": []})

    results = search_all(q)

    # Also search static sponsor names and client names
    q_lower = q.lower()
    for name in SPONSOR_NAMES:
        if q_lower in name.lower():
            results.insert(0, {
                "type": "Sponsor",
                "title": name,
                "meta": "CRM profile · Click to open Briefing",
                "tab": "briefing",
            })

    for client in MIDDLE_MARKET_CLIENTS:
        cn = client["company_name"]
        sector = client.get("sector", "")
        if q_lower in cn.lower() or q_lower in sector.lower():
            results.append({
                "type": "Client",
                "title": cn,
                "meta": f"{sector} · {client.get('geography', '')}",
                "tab": "sponsormatch",
            })

    seen = set()
    unique = []
    for r in results:
        key = (r["type"], r["title"])
        if key not in seen:
            seen.add(key)
            unique.append(r)
        if len(unique) >= 20:
            break

    return jsonify({"query": q, "results": unique})


@app.route("/api/home")
def home_data():
    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS
    from common.db import get_all_portfolio_debt

    all_opps = [opp for opps in SCANNER_RESULTS.values() for opp in opps]
    total_fees = sum(o["estimated_fee_mm"] for o in all_opps)
    top_signals = sorted(
        [o for o in all_opps if o["urgency"] == "HIGH"],
        key=lambda o: o["estimated_fee_mm"], reverse=True
    )[:3]
    for sig in top_signals:
        sig["source"] = SIGNAL_SOURCE_MAP.get(sig.get("signal_type", ""), "Scanner")
    recent_actions = get_all_actions()[:10]
    recent_briefings = get_recent_briefings(5)

    # Maturity alerts: portfolio debt within 30 months, enriched with scanner signals
    cutoff = (date.today().replace(year=date.today().year + 2, month=min(date.today().month + 6, 12))).isoformat()
    debt_rows = get_all_portfolio_debt()
    maturity_wall_signals = {o["sponsor"]: o for o in all_opps if o.get("signal_type") == "MATURITY WALL"}
    maturity_alerts = []
    for row in debt_rows:
        if row["maturity_date"] > cutoff:
            continue
        matching = maturity_wall_signals.get(row["sponsor"])
        if matching and row["company"].split()[0].lower() in matching["signal"].lower():
            row["scanner_signal"] = matching
            row["priority"] = "critical"
        else:
            try:
                mat = date.fromisoformat(row["maturity_date"])
                months_out = (mat - date.today()).days / 30
                row["priority"] = "critical" if months_out <= 18 else "high"
            except (ValueError, TypeError):
                row["priority"] = "high"
        row["spread_savings_bps"] = row["coupon_spread_bps"] - row["market_spread_bps"]
        row["source"] = "Bloomberg"
        if matching:
            row["confidence"] = matching.get("confidence", 0)
        maturity_alerts.append(row)

    # The Signals feed: the Scanner's top opportunities, every one scored, ranked
    # by urgency then fee. Portfolio loans are not mixed in here; they live on
    # the Portfolio Alerts tab, where economics are not expected.
    urgency_rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    high_signals = []
    for o in sorted(all_opps, key=lambda o: (urgency_rank.get(o["urgency"], 3), -o["estimated_fee_mm"])):
        o["source"] = SIGNAL_SOURCE_MAP.get(o.get("signal_type", ""), "Scanner")
        high_signals.append(o)
        if len(high_signals) >= 6:
            break

    # Calendar
    banker = request.args.get("banker", "Eric Welsh")
    calendar_events = _calendar_for(banker)

    # Market summary
    market_summary = {
        "rate_env": MARKET_CONTEXT.get("rate_environment", ""),
        "top_themes": MARKET_CONTEXT.get("themes", [])[:2],
    }

    # Portfolio Alerts: mandate patterns across the book (common/alerts.py)
    from common.alerts import build_alerts
    book_insights = build_alerts(all_opps, debt_rows, SPONSORS, MARKET_CONTEXT)

    return jsonify({
        "stats": {
            "total_opportunities": len(all_opps),
            "total_fees_mm": round(total_fees, 1),
            "sponsors_covered": len(SPONSOR_NAMES),
            "briefings_generated": get_briefings_count(),
        },
        "top_signals": top_signals,
        "maturity_alerts": maturity_alerts,
        "high_signals": high_signals,
        "book_insights": book_insights,
        "calendar_events": calendar_events,
        "banker": banker,
        "sector_news": STUB_SECTOR_NEWS,
        "mi_summary": "Insurance M&A hit record pace in Q3 with PE sponsors driving 80% of deal volume. This is directly relevant to your Stone Point (AmeriLife bolt-ons) and GTCR (AssuredPartners) coverage, both of which are positioned to benefit from distribution consolidation trends. Separately, GTCR Fund XIV is in late-stage diligence on a $600M+ healthcare services platform, which could generate new financing mandates in the next 30 to 60 days. CLO formation dipped 12% in September and investor appetite for leveraged loans is softening. If this trend continues into Q4, expect modest spread widening, which may narrow the repricing window for Cornerstone Building Brands ($3.2B TLB, 2027) and Nuvei ($4.2B, 2028). CD&R is also rumored to be exploring a partial sale of Cornerstone's siding division, which could accelerate refinancing conversations. Bottom line: the next 4 to 6 weeks present a critical action window for your top maturity wall opportunities before market conditions shift.",
        "market_summary": market_summary,
        "recent_actions": recent_actions,
        "recent_briefings": recent_briefings,
    })


_copilot_cache = {}

MOCK_MORNING_BRIEF = (
    '<div class="brief-item">'
    '<span class="brief-label brief-label--urgent">Urgent</span>'
    '<span><strong>GTCR</strong> quarterly check-in is <strong>Thursday at 2 PM</strong> and no briefing pack has been generated. '
    'Your lead pitch: <strong>AssuredPartners</strong> <code>$4.2B</code> TLB repricing (SOFR+375 vs market 300-325) '
    'could save <code>$25-30M</code>/yr with <code>$6.2M</code> in fees to Huntington. '
    'Generate the briefing today.</span>'
    '</div>'
    '<div class="brief-item">'
    '<span class="brief-label brief-label--signal">Signal</span>'
    '<span>Insurance M&amp;A hit record pace in Q3: 230+ deals, PE sponsors driving 80% of volume. '
    'Directly benefits two of your coverage relationships: <strong>Stone Point</strong> (AmeriLife bolt-ons) '
    'and <strong>GTCR</strong> (AssuredPartners cross-sell). Stone Point call is <strong>next Tuesday</strong>.</span>'
    '</div>'
    '<div class="brief-item">'
    '<span class="brief-label brief-label--signal">Signal</span>'
    '<span><strong>CD&amp;R</strong> Fund XII (<code>$16B</code>, 35% deployed) has 2 active industrial LOIs. '
    'Cornerstone siding division partial sale rumor could accelerate their <code>$3.2B</code> TLB refi (matures 2027-2028). '
    'Jeff Tuckle is on point.</span>'
    '</div>'
    '<div class="brief-item brief-item--action">'
    '<span class="brief-label brief-label--action">Action</span>'
    '<span>CLO formation dipped 12% in September. Current spread compression window is 4 to 6 weeks '
    'before conditions tighten. Prioritize: (1) GTCR briefing pack today, (2) Stone Point prep by Friday, '
    '(3) flag Cornerstone timing to Jeff.</span>'
    '</div>'
)

MOCK_NUDGES = [
    {
        "target_section": "scanner",
        "target_id": "GTCR",
        "type": "cross-reference",
        "text": "GTCR Fund XIV is in late-stage diligence on a $600M+ healthcare platform. Combined with the AssuredPartners repricing, this could generate $4M+ in fees from a single sponsor relationship.",
        "priority": "high",
    },
    {
        "target_section": "scanner",
        "target_id": "Clayton, Dubilier & Rice",
        "type": "timing",
        "text": "CD&R's rumored siding division sale could accelerate Cornerstone refinancing. CLO formation dipped 12% in September. Act within 3 weeks before spread widening narrows the repricing window.",
        "priority": "high",
    },
    {
        "target_section": "scanner",
        "target_id": "Stone Point Capital",
        "type": "cross-reference",
        "text": "Stone Point's AmeriLife bolt-on strategy aligns with 3 companies in your match pipeline. Consider bundling the introduction with a financing pitch for maximum relationship value.",
        "priority": "medium",
    },
    {
        "target_section": "home",
        "target_id": "call-gtcr",
        "type": "prep",
        "text": "GTCR quarterly check-in is Thursday at 2 PM. No briefing pack generated yet. Market conditions shifted since your last conversation (March 2026). Generate a fresh briefing?",
        "priority": "high",
    },
    {
        "target_section": "home",
        "target_id": "call-stone-point",
        "type": "prep",
        "text": "Stone Point coverage call next week. Insurance M&A record pace strengthens the AmeriLife story. Consider refreshing your briefing with Q3 data.",
        "priority": "medium",
    },
    {
        "target_section": "briefing",
        "target_id": "pre-gen",
        "type": "stale",
        "text": "Found 2 prior briefings for GTCR (last: April 22). Market conditions shifted since then. CLO formation slowed 12%. Recommend a fresh generation.",
        "priority": "medium",
    },
    {
        "target_section": "briefing",
        "target_id": "post-proactive",
        "type": "annotation",
        "text": "The AssuredPartners repricing idea is your strongest pitch. Market comps from Q3 validate pricing at SOFR+225, 40bps tighter than current spread.",
        "priority": "medium",
    },
    {
        "target_section": "sponsormatch",
        "target_id": "top-result",
        "type": "pitch-angle",
        "text": "Lead with CrossPoint's founder retirement timeline. Stone Point's AmeriLife team is specifically seeking distribution platforms in the Southeast.",
        "priority": "medium",
    },
]


def _generate_morning_brief(home_data):
    """Generate AI morning brief from home data, or return mock."""
    try:
        client = get_client()
        top_signals = home_data.get("top_signals", [])[:3]
        maturity_alerts = home_data.get("maturity_alerts", [])[:3]
        calendar = home_data.get("calendar_events", [])[:3]
        news = home_data.get("sector_news", [])[:3]

        context = (
            f"Top signals: {json.dumps(top_signals, default=str)}\n"
            f"Maturity alerts: {json.dumps(maturity_alerts, default=str)}\n"
            f"Upcoming calls: {json.dumps(calendar, default=str)}\n"
            f"Market news: {json.dumps(news, default=str)}\n"
            f"Stats: {json.dumps(home_data.get('stats', {}))}"
        )

        resp = client.messages.create(
            model=model_id(),
            max_tokens=400,
            system=(
                "You are an AI copilot for Eric Welsh, a senior capital markets banker at "
                "Huntington National Bank covering PE sponsor relationships. Write a morning briefing "
                "as 3-4 structured HTML items. Each item uses this exact pattern: "
                '<div class="brief-item"><span class="brief-label brief-label--TYPE">LABEL</span>'
                "<span>content here</span></div> "
                "where TYPE is urgent, signal, or action and LABEL is Urgent, Signal, or Action. "
                "Wrap sponsor/entity names in <strong>, dollar amounts in <code>. "
                "End with one Action item (brief-item--action class on the div). "
                "Lead with the most time-critical item. Use Urgent ONLY for items within 2 weeks "
                "(upcoming calls, imminent deadlines). Use Signal for market trends and maturities "
                "months away. Today is " + date.today().strftime("%B %d, %Y") + ". "
                "Be direct, no pleasantries. Write as a smart junior analyst would speak to a senior banker."
            ),
            messages=[{"role": "user", "content": f"Generate today's morning brief based on:\n{context}"}],
        )
        return resp.content[0].text
    except Exception as e:
        logging.warning(f"Copilot brief AI call failed, using mock: {e}")
        return MOCK_MORNING_BRIEF


@app.route("/api/copilot/brief")
def copilot_brief():
    banker = request.args.get("banker", "Eric Welsh")
    cache_key = f"brief-{banker}-{date.today().isoformat()}"

    if cache_key in _copilot_cache:
        return jsonify(_copilot_cache[cache_key])

    try:
        home_resp = home_data()
        home_json = home_resp.get_json()
        brief_text = _generate_morning_brief(home_json)
    except Exception as e:
        logging.warning(f"Copilot brief generation failed: {e}")
        brief_text = MOCK_MORNING_BRIEF

    result = {
        "morning_brief": brief_text,
        "nudges": MOCK_NUDGES,
        "banker": banker,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    _copilot_cache[cache_key] = result
    return jsonify(result)


@app.route("/api/sponsor/<name>")
def sponsor_profile(name):
    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS
    profile = SPONSORS.get(name)
    if not profile:
        for sname in SPONSORS:
            if sname.lower() == name.lower():
                profile = SPONSORS[sname]
                name = sname
                break
    if not profile:
        return jsonify({"error": "Sponsor not found"}), 404

    opps = SCANNER_RESULTS.get(name, [])
    total_fee = sum(o["estimated_fee_mm"] for o in opps)

    return jsonify({
        "name": name,
        "aum": profile.get("aum", ""),
        "hq": profile.get("hq", ""),
        "fund_name": profile.get("fund_name", ""),
        "fund_vintage": profile.get("fund_vintage", ""),
        "strategy": profile.get("strategy", ""),
        "investment_themes": profile.get("investment_themes", []),
        "relationship_status": profile.get("relationship_status", ""),
        "huntington_opportunity": profile.get("huntington_opportunity", ""),
        "key_partners": profile.get("key_partners", []),
        "portfolio_companies": profile.get("portfolio_companies", []),
        "recent_deals": profile.get("recent_deals", []),
        "target_profile": profile.get("target_profile", {}),
        "stats": {
            "opportunities": len(opps),
            "total_fee_mm": round(total_fee, 1),
            "high_urgency": len([o for o in opps if o["urgency"] == "HIGH"]),
        },
    })


def seed_demo_data():
    """Pre-seed briefings and actions so the dashboard isn't empty on first visit."""
    from common.db import get_db
    db = get_db()
    briefing_count = db.execute("SELECT COUNT(*) FROM briefings").fetchone()[0]
    action_count = db.execute("SELECT COUNT(*) FROM actions").fetchone()[0]
    db.close()

    if briefing_count == 0:
        insert_briefing("GTCR", "Quarterly Check-in", "Eric Welsh", {
            "executive_summary": "GTCR continues to be our highest-value sponsor relationship with $21M in pipeline fees across 4 active signals. Fund XIV ($11.5B, 2024 vintage) is 35% deployed with active interest in healthcare, financial services, and technology platforms.",
            "fund_intelligence": "Fund XIV has closed 3 platform investments YTD. AssuredPartners remains the largest portfolio company with $4.2B TLB maturing Nov 2027. Optimal Blue ($1.65B TLB) showing active bolt-on pipeline in mortgage tech adjacencies.",
            "proactive_ideas": "1) Lead AssuredPartners refi — market spreads 65bps inside current coupon, potential $6.2M fee. 2) Position for Fund XIV platform deal financing — healthcare and fintech sectors. 3) Introduce Great Lakes Home Health as bolt-on target for healthcare thesis.",
        })
        insert_briefing("Stone Point Capital", "Deal Review", "Eric Welsh", {
            "executive_summary": "Stone Point has $7.5M in active pipeline across 3 signals. AmeriLife ($2.2B TLB + $800M DDTL) is the anchor relationship with 8 acquisition targets in H2 2026 pipeline. Foundation Risk Partners needs facility upsizing.",
            "fund_intelligence": "Fund VII is mid-deployment in insurance and financial services. AmeriLife has completed 60+ acquisitions and the DDTL is specifically earmarked for bolt-on M&A. Wilshire Advisors SaaS transition ongoing.",
            "proactive_ideas": "1) Finance AmeriLife bolt-on pipeline — 8 targets identified, DDTL capacity available. 2) Upsize and extend Foundation Risk Partners facility — revenue has outgrown $500M TLB. 3) Introduce CrossPoint Insurance Group ($210M rev) as bolt-on candidate.",
        })
        insert_briefing("KKR", "Urgent Coverage Call", "Eric Welsh", {
            "executive_summary": "CRITICAL: USI Insurance Services $3.2B TLB matures November 2026 — under 2 months. This is the most time-sensitive opportunity in our book. $800M Senior Notes mature May 2027. Combined refi + tender could yield $4.5M+ in fees.",
            "fund_intelligence": "KKR acquired USI in 2017. The insurance brokerage platform has grown significantly under KKR ownership. Current leverage at 6.1x on $524.6M EBITDA. Market spreads at SOFR+290 are 35bps inside current SOFR+325 coupon.",
            "proactive_ideas": "1) IMMEDIATE: Position for lead-left on USI combined TLB refi + notes tender. 2) Propose clean capital structure with single maturity date. 3) Estimated annual interest savings of $11M from repricing. This is an anchor relationship opportunity.",
        })
        print("  Demo data seeded: 3 briefings")

    if action_count == 0:
        insert_action("scanner", "GTCR", "AssuredPartners Refi — $4.2B TLB", "pursue", "Eric Welsh")
        insert_action("scanner", "KKR", "USI Insurance — $3.2B TLB Refi", "schedule_call", "Eric Welsh")
        insert_action("scanner", "Stone Point Capital", "AmeriLife DDTL — Bolt-on M&A", "pursue", "Eric Welsh")
        insert_action("briefing", "Clayton, Dubilier & Rice", "Quarterly Briefing Generated", "generated", "Eric Welsh")
        print("  Demo data seeded: 4 actions")


if __name__ == "__main__":
    init_db()
    seed_portfolio_debt()
    seed_demo_data()

    # Validate auth before accepting requests
    try:
        _test_client = get_api_client()
    except Exception as auth_err:
        logging.warning("Could not initialize API client: %s", auth_err)
        if not use_bedrock():
            logging.warning("Set ANTHROPIC_API_KEY environment variable.")
    print("\n" + "=" * 50)
    print("  Huntington Capital Markets AI")
    print("  Web Demo")
    print(f"  Backend: {'AWS Bedrock' if use_bedrock() else 'Anthropic API'}")
    print(f"  Model: {model_id('sonnet')}")
    print("=" * 50)
    print("\n  Open http://localhost:5000\n")
    app.run(debug=False, host="0.0.0.0", port=5000, threaded=True)
