"""
PoC 2: PE Bolt-On Scout
Huntington Capital Markets - AI Initiative

Matches Huntington's middle market client book against PE sponsor
acquisition criteria to identify bolt-on acquisition introductions.
Produces ranked match lists with banker-ready rationales.

Architecture:
  Turn 1 (Sonnet): Score all sponsor-company pairs (throughput)
  Turn 2 (Opus):   Generate detailed rationale for top matches
  Turn 3 (Opus):   Format per-sponsor "Top 5 Introductions" view

Usage:
    python bolt_on_scout.py --sponsor "GTCR"
    python bolt_on_scout.py --all
    python bolt_on_scout.py --company "CrossPoint Insurance Group"
"""

import argparse
import json
import logging
import os
import sys
from dataclasses import dataclass, field, asdict
from datetime import date
from typing import Optional
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common.sponsors import SPONSORS, SPONSOR_NAMES
from common.clients import MIDDLE_MARKET_CLIENTS
from common.market import SECTOR_MARKET_CONDITIONS
from common.llm import get_client, model_id, thinking_param


@dataclass
class BoltOnMatch:
    sponsor_name: str
    target_company: str
    overall_score: float
    sector_fit: float
    size_fit: float
    geography_fit: float
    ownership_fit: float
    strategic_fit: float
    platform_target: str
    rationale: str = ""
    huntington_role: str = ""
    estimated_deal_size_mm: float = 0
    estimated_fee_mm: float = 0


def build_scoring_prompt(sponsor_name: str) -> str:
    """Build the prompt for Turn 1: batch scoring all companies against one sponsor."""
    sponsor = SPONSORS[sponsor_name]
    target = sponsor["target_profile"]

    companies_text = ""
    for i, c in enumerate(MIDDLE_MARKET_CLIENTS):
        signals = "; ".join(c["transaction_signals"])
        diffs = "; ".join(c["key_differentiators"])
        companies_text += f"""
Company {i+1}: {c['company_name']}
  Sector: {c['sector']} | Revenue: ${c['revenue_mm']}M | EBITDA: ${c['ebitda_mm']}M | Margin: {c['ebitda_margin']:.1%}
  Growth: {c['growth_yoy']:.0%} YoY | Ownership: {c['ownership_type']} | Location: {c['geography']}
  Employees: {c['employee_count']} | Banker: {c['huntington_banker']}
  Transaction Signals: {signals}
  Differentiators: {diffs}
"""

    platforms = ", ".join(
        pc["name"] for pc in sponsor["portfolio_companies"]
        if "(sold)" not in pc["name"].lower()
    )

    portfolio_detail = ""
    for pc in sponsor["portfolio_companies"]:
        if "(sold)" not in pc["name"].lower():
            portfolio_detail += f"  - {pc['name']} ({pc['sector']}, Revenue: {pc['revenue']}) — {pc['notes']}\n"

    return f"""Score the following {len(MIDDLE_MARKET_CLIENTS)} Huntington middle market clients as potential bolt-on acquisition targets for {sponsor_name}.

SPONSOR PROFILE:
  Fund: {sponsor['fund_vintage']}
  Strategy: {sponsor['strategy']}
  Investment Themes: {', '.join(sponsor['investment_themes'])}
  Target Revenue: {target['revenue_range']}
  Target EBITDA: {target['ebitda_range']}
  Geography: {target['geography']}
  Deal Types: {target['ownership']}

CURRENT PORTFOLIO PLATFORMS (bolt-on targets must complement one of these):
{portfolio_detail}

CRITICAL SCORING INSTRUCTIONS:
- The MOST important factor is strategic_fit: does this company directly complement an existing platform company above, or directly align with one of {sponsor_name}'s stated investment themes?
- A company that is a perfect bolt-on for one of the portfolio platforms above should score 8-10 on strategic_fit
- A company that has NO connection to any portfolio platform AND does not fit the investment themes should score 2-4 on strategic_fit, even if sector/size/geography look good
- {sponsor_name}'s strategy is: {sponsor['strategy']}
- Different sponsors have VERY different portfolios and themes. Score strictly against THIS sponsor's specific platforms and themes, not general PE attractiveness.
- Be harsh on companies that don't fit — a score of 3-4 is appropriate for poor fits. Not every company is a 6+.

COMPANIES TO EVALUATE:
{companies_text}

For EACH company, output a JSON object with these fields:
- company_name: string
- overall_score: float (1-10, where 10 = perfect fit for THIS sponsor specifically)
- sector_fit: float (1-10, alignment with {sponsor_name}'s investment themes)
- sector_fit_reason: string (one sentence explaining the sector score)
- size_fit: float (1-10, within target revenue/EBITDA range)
- size_fit_reason: string (one sentence explaining the size score — cite actual numbers)
- geography_fit: float (1-10)
- geography_fit_reason: string (one sentence explaining the geography score)
- ownership_fit: float (1-10, higher if transaction signals suggest readiness)
- ownership_fit_reason: string (one sentence explaining the ownership score — cite a specific signal)
- strategic_fit: float (1-10, FIT WITH A SPECIFIC EXISTING PLATFORM — this is the most important score)
- strategic_fit_reason: string (one sentence explaining the strategic score — name the specific portfolio company)
- platform_target: string (name the specific portfolio company this bolts onto, or "New Platform" if standalone — be specific)
- brief_rationale: string (2-3 sentences: why this is or isn't a fit for {sponsor_name} SPECIFICALLY, referencing the platform company and investment theme)

Return a JSON array of all {len(MIDDLE_MARKET_CLIENTS)} scored companies, sorted by overall_score descending.
Return ONLY the JSON array, no other text."""


def build_rationale_prompt(sponsor_name: str, top_matches: list[dict]) -> str:
    """Build the prompt for Turn 2: detailed rationales for top matches."""
    sponsor = SPONSORS[sponsor_name]

    matches_text = ""
    for m in top_matches:
        company = next(
            (c for c in MIDDLE_MARKET_CLIENTS if c["company_name"] == m["company_name"]),
            None
        )
        if not company:
            continue

        signals = "\n    ".join(f"- {s}" for s in company["transaction_signals"])
        diffs = "\n    ".join(f"- {d}" for d in company["key_differentiators"])

        sector_conditions = ""
        for sector_key, sector_data in SECTOR_MARKET_CONDITIONS.items():
            if any(word.lower() in company["sector"].lower() for word in sector_key.split()):
                themes = "\n      ".join(f"- {t}" for t in sector_data["key_themes"])
                sector_conditions = f"""
    Sector Market Conditions ({sector_key}):
      Outlook: {sector_data['outlook']} | Spread: {sector_data['spread']}
      Leverage: {sector_data['leverage_available']}
      {themes}"""
                break

        matches_text += f"""
  {m['company_name']} (Score: {m['overall_score']}/10)
    Sector: {company['sector']} | Revenue: ${company['revenue_mm']}M | EBITDA: ${company['ebitda_mm']}M
    Ownership: {company['ownership_type']} | Location: {company['geography']}
    Bolt-on Target For: {m['platform_target']}
    Banker: {company['huntington_banker']}

    Transaction Signals:
    {signals}

    Differentiators:
    {diffs}
    {sector_conditions}
"""

    return f"""Generate detailed, banker-ready rationales for the top {len(top_matches)} bolt-on introduction opportunities between {sponsor_name} and Huntington's middle market clients.

SPONSOR: {sponsor['fund_name']} | Strategy: {sponsor['strategy']}
Fund: {sponsor['fund_vintage']}

TOP MATCHES:
{matches_text}

For EACH match, produce a JSON array with:
- company_name: string
- rationale: string (3-4 sentences explaining the strategic fit, why NOW is the right time, and what makes this introduction compelling for the sponsor)
- huntington_role: string (Huntington's specific role — e.g., "Sell-side M&A advisor", "Staple financing provider", "Introduction + debt financing", etc.)
- estimated_deal_size_mm: float (estimated enterprise value based on sector multiples)
- estimated_fee_mm: float (Huntington's estimated fee opportunity)
- talking_point: string (one sentence the Huntington banker should use when making the introduction)

Be specific. Reference sector multiples, transaction signals, and market timing.
Return ONLY the JSON array."""


def build_top5_prompt(sponsor_name: str, enriched_matches: list[dict]) -> str:
    """Build the prompt for Turn 3: formatted Top 5 view."""
    sponsor = SPONSORS[sponsor_name]

    matches_json = json.dumps(enriched_matches[:5], indent=2)

    return f"""Format the following top 5 bolt-on introduction opportunities for {sponsor_name}
into a polished, MD-ready summary document.

SPONSOR: {sponsor['fund_name']}
DATE: {date.today().isoformat()}

MATCH DATA:
{matches_json}

Format as a clean text document with this structure:

HEADER: "TOP 5 INTRODUCTIONS THIS QUARTER" with sponsor name and date

For each introduction (ranked 1-5):
- Company name and sector
- Key metrics (revenue, EBITDA, growth)
- Which platform it bolts onto
- Why now (1-2 sentences referencing transaction signals)
- Huntington's role and estimated fee
- Recommended next step

End with a SUMMARY section: total pipeline value, total fee opportunity, and recommended priority actions.

Write in investment banking memo style. Be concise and actionable."""


def score_matches(client, sponsor_name: str) -> list[dict]:
    """Turn 1: Score all companies against a sponsor using Sonnet for throughput."""
    prompt = build_scoring_prompt(sponsor_name)

    response = client.messages.create(
        model=model_id("sonnet"),
        max_tokens=4000,
        system="You are a Private Equity deal screening analyst. Score acquisition targets precisely based on sponsor criteria. Return only valid JSON.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = next(b.text for b in response.content if b.type == "text")
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logging.error("score_matches: JSON parse failed — raw response: %s", text[:500])
        raise ValueError(f"Scoring response was not valid JSON: {e}") from e


def generate_rationales(client, sponsor_name: str, top_matches: list[dict]) -> list[dict]:
    """Turn 2: Generate detailed rationales using Opus for quality."""
    prompt = build_rationale_prompt(sponsor_name, top_matches)

    response = client.messages.create(
        model=model_id("opus"),
        max_tokens=3000,
        system="You are a senior investment banker at Huntington National Bank writing introduction rationales for PE sponsor meetings. Be specific, reference real market conditions, and quantify opportunities.",
        messages=[{"role": "user", "content": prompt}],
        **thinking_param(),
    )

    text = next(b.text for b in response.content if b.type == "text")
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logging.error("generate_rationales: JSON parse failed — raw response: %s", text[:500])
        raise ValueError(f"Rationale response was not valid JSON: {e}") from e


def format_top5_view(client, sponsor_name: str, enriched_matches: list[dict]) -> str:
    """Turn 3: Format the Top 5 view using Opus for polished output."""
    prompt = build_top5_prompt(sponsor_name, enriched_matches)

    response = client.messages.create(
        model=model_id("opus"),
        max_tokens=2500,
        system="You are a Capital Markets analyst at Huntington National Bank formatting internal memos. Write in professional investment banking style.",
        messages=[{"role": "user", "content": prompt}],
        **thinking_param(),
    )

    return next(b.text for b in response.content if b.type == "text")


def reverse_score(client, company_name: str) -> list[dict]:
    """
    Reverse lookup: given one middle market company, score it against ALL sponsors.
    Returns a list of sponsor match dicts sorted by overall_score descending.
    Used by the standalone Sponsor Match tab (company-first entry mode).
    """
    company = next(
        (c for c in MIDDLE_MARKET_CLIENTS if c["company_name"].lower() == company_name.lower()),
        None,
    )
    if not company:
        return []

    signals = "; ".join(company["transaction_signals"])
    diffs = "; ".join(company["key_differentiators"])

    sponsors_text = ""
    for sname, sponsor in SPONSORS.items():
        target = sponsor["target_profile"]
        portfolio_detail = ""
        for pc in sponsor["portfolio_companies"]:
            if "(sold)" not in pc["name"].lower():
                portfolio_detail += f"    - {pc['name']} ({pc['sector']}, {pc['revenue']}) — {pc['notes']}\n"
        sponsors_text += f"""
Sponsor: {sname}
  Fund: {sponsor['fund_vintage']}
  Strategy: {sponsor['strategy']}
  Investment Themes: {', '.join(sponsor['investment_themes'])}
  Target Revenue: {target['revenue_range']} | EBITDA: {target['ebitda_range']}
  Geography: {target['geography']}
  Current Platforms:
{portfolio_detail}"""

    prompt = f"""Score the following Huntington middle market company as a potential bolt-on acquisition target for each of the PE sponsors listed below.

COMPANY TO EVALUATE:
  Name: {company['company_name']}
  Sector: {company['sector']} | Revenue: ${company['revenue_mm']}M | EBITDA: ${company['ebitda_mm']}M
  Growth: {company['growth_yoy']:.0%} YoY | Ownership: {company['ownership_type']} | Location: {company['geography']}
  Transaction Signals: {signals}
  Key Differentiators: {diffs}

SPONSORS TO SCORE AGAINST:
{sponsors_text}

SCORING INSTRUCTIONS:
- Score how well this ONE company fits each sponsor's acquisition criteria and existing portfolio platforms.
- The MOST important factor is strategic_fit: does this company directly complement an existing portfolio company?
- Be specific — name the portfolio company it bolts onto.
- Be differentiated — scores should vary meaningfully across sponsors based on actual fit.

For EACH sponsor, output a JSON object with:
- sponsor_name: string
- overall_score: float (1-10)
- sector_fit: float (1-10)
- sector_fit_reason: string (one sentence)
- size_fit: float (1-10)
- size_fit_reason: string (one sentence, cite actual numbers)
- geography_fit: float (1-10)
- geography_fit_reason: string (one sentence)
- ownership_fit: float (1-10)
- ownership_fit_reason: string (one sentence, cite a specific signal)
- strategic_fit: float (1-10)
- strategic_fit_reason: string (one sentence, name the specific portfolio company)
- platform_target: string (specific portfolio company or "New Platform")
- brief_rationale: string (2-3 sentences on why this company fits or doesn't fit this specific sponsor)

Return a JSON array of all {len(SPONSORS)} sponsor scores, sorted by overall_score descending.
Return ONLY the JSON array, no other text."""

    response = client.messages.create(
        model=model_id("sonnet"),
        max_tokens=4000,
        system="You are a Private Equity deal screening analyst. Score acquisition targets precisely based on sponsor criteria. Return only valid JSON.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = next(b.text for b in response.content if b.type == "text").strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    scores = json.loads(text)
    scores.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    return scores


def generate_reverse_rationales(client, company_name: str, top_sponsors: list[dict]) -> list[dict]:
    """Generate banker-ready pitch rationales for top sponsor matches in reverse mode."""
    company = next(
        (c for c in MIDDLE_MARKET_CLIENTS if c["company_name"].lower() == company_name.lower()),
        None,
    )
    if not company:
        return top_sponsors

    matches_text = ""
    for m in top_sponsors:
        sname = m["sponsor_name"]
        sponsor = SPONSORS.get(sname, {})
        matches_text += f"""
  {sname} (Score: {m['overall_score']}/10)
    Platform Target: {m.get('platform_target', 'N/A')}
    Strategic Fit Reason: {m.get('strategic_fit_reason', '')}
    Brief Rationale: {m.get('brief_rationale', '')}
"""

    prompt = f"""Generate banker-ready pitch rationales for introducing {company['company_name']} to the following PE sponsors.

COMPANY:
  {company['company_name']} | {company['sector']} | ${company['revenue_mm']}M revenue | ${company['ebitda_mm']}M EBITDA
  Ownership: {company['ownership_type']} | Location: {company['geography']}
  Transaction Signals: {'; '.join(company['transaction_signals'])}
  Key Differentiators: {'; '.join(company['key_differentiators'])}

TOP SPONSOR MATCHES:
{matches_text}

For EACH sponsor, produce a JSON object with:
- sponsor_name: string
- rationale: string (3-4 sentences: why this sponsor specifically, why now, what makes this compelling)
- huntington_role: string (Huntington's role: "Sell-side M&A advisor", "Sell-side + staple financing", "Introduction only", etc.)
- estimated_deal_size_mm: float (estimated EV based on sector multiples)
- estimated_fee_mm: float (Huntington's estimated fee)
- talking_point: string (one sentence the banker uses when calling the sponsor)

Return ONLY the JSON array."""

    response = client.messages.create(
        model=model_id("opus"),
        max_tokens=3000,
        system="You are a senior investment banker at Huntington National Bank. Write concise, specific, banker-ready pitch rationales.",
        messages=[{"role": "user", "content": prompt}],
        **thinking_param(),
    )

    text = next(b.text for b in response.content if b.type == "text").strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    try:
        rationales = json.loads(text)
        enriched = []
        for score_entry in top_sponsors:
            rationale_entry = next(
                (r for r in rationales if r["sponsor_name"] == score_entry["sponsor_name"]),
                {},
            )
            enriched.append({**score_entry, **rationale_entry})
        return enriched
    except json.JSONDecodeError:
        return top_sponsors


def run_bolt_on_scout(client, sponsor_name: str, top_n: int = 5) -> dict:
    """Execute the full 3-turn Bolt-On Scout pipeline for one sponsor."""
    print(f"\n{'=' * 60}")
    print(f"  PE BOLT-ON SCOUT — {sponsor_name}")
    print(f"{'=' * 60}")

    # Turn 1: Score
    print(f"\n  [1/3] Scoring {len(MIDDLE_MARKET_CLIENTS)} companies against {sponsor_name} criteria...")
    scores = score_matches(client, sponsor_name)
    scores.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    top_matches = scores[:top_n]

    print(f"  Top matches:")
    for i, m in enumerate(top_matches, 1):
        print(f"    {i}. {m['company_name']} — Score: {m['overall_score']}/10 ({m.get('platform_target', 'N/A')})")

    # Turn 2: Enrich with rationales
    print(f"\n  [2/3] Generating banker-ready rationales for top {top_n} matches...")
    rationales = generate_rationales(client, sponsor_name, top_matches)

    enriched = []
    for score_entry in top_matches:
        rationale_entry = next(
            (r for r in rationales if r["company_name"] == score_entry["company_name"]),
            {}
        )
        merged = {**score_entry, **rationale_entry}
        enriched.append(merged)

    # Turn 3: Format
    print(f"\n  [3/3] Formatting Top 5 Introductions view...")
    formatted_view = format_top5_view(client, sponsor_name, enriched)

    return {
        "sponsor": sponsor_name,
        "generated_date": date.today().isoformat(),
        "all_scores": scores,
        "top_5_enriched": enriched,
        "formatted_view": formatted_view,
    }


def run_company_view(client, company_name: str) -> str:
    """Per-company view: which sponsors want this company?"""
    company = next(
        (c for c in MIDDLE_MARKET_CLIENTS if c["company_name"].lower() == company_name.lower()),
        None
    )
    if not company:
        return f"Company '{company_name}' not found in client book."

    all_results = []
    for sponsor_name in SPONSOR_NAMES:
        scores = score_matches(client, sponsor_name)
        match = next(
            (s for s in scores if s["company_name"] == company["company_name"]),
            None
        )
        if match:
            all_results.append({
                "sponsor": sponsor_name,
                "score": match["overall_score"],
                "platform_target": match.get("platform_target", "N/A"),
                "brief_rationale": match.get("brief_rationale", ""),
            })

    all_results.sort(key=lambda x: x["score"], reverse=True)

    header = f"""
{'=' * 60}
  WHICH SPONSORS WANT THIS?
  {company['company_name'].upper()}
{'=' * 60}
  Sector: {company['sector']} | Revenue: ${company['revenue_mm']}M | EBITDA: ${company['ebitda_mm']}M
  Ownership: {company['ownership_type']} | Location: {company['geography']}
{'-' * 60}
"""
    for r in all_results:
        header += f"\n  {r['sponsor']}: {r['score']}/10 — Bolt-on for: {r['platform_target']}"
        header += f"\n    {r['brief_rationale']}\n"

    return header


def main():
    parser = argparse.ArgumentParser(
        description="Huntington Capital Markets — PE Bolt-On Scout"
    )
    parser.add_argument("--sponsor", type=str, help="Run scout for one sponsor")
    parser.add_argument("--company", type=str, help="Show which sponsors want a specific company")
    parser.add_argument("--all", action="store_true", help="Run scout for all sponsors")
    parser.add_argument("--output-dir", type=str, default="./output", help="Output directory")
    args = parser.parse_args()

    client = get_client()

    if args.company:
        print(run_company_view(client, args.company))

    elif args.all:
        os.makedirs(args.output_dir, exist_ok=True)
        for sponsor_name in SPONSOR_NAMES:
            result = run_bolt_on_scout(client, sponsor_name)
            print(f"\n{result['formatted_view']}")

            slug = sponsor_name.replace(" ", "_").replace(",", "").replace("&", "and")
            json_path = os.path.join(args.output_dir, f"boltonscout_{slug}.json")
            with open(json_path, "w") as f:
                json.dump(result, f, indent=2, default=str)
            print(f"\n  Saved: {json_path}")

    elif args.sponsor:
        os.makedirs(args.output_dir, exist_ok=True)
        result = run_bolt_on_scout(client, args.sponsor)
        print(f"\n{result['formatted_view']}")

        slug = args.sponsor.replace(" ", "_").replace(",", "").replace("&", "and")
        json_path = os.path.join(args.output_dir, f"boltonscout_{slug}.json")
        with open(json_path, "w") as f:
            json.dump(result, f, indent=2, default=str)
        print(f"\n  Saved: {json_path}")

    else:
        print("\nHuntington Capital Markets — PE Bolt-On Scout")
        print("=" * 50)
        print("\nAvailable sponsors:")
        for i, name in enumerate(SPONSOR_NAMES, 1):
            print(f"  {i}. {name}")
        print("\nAvailable companies:")
        for c in MIDDLE_MARKET_CLIENTS:
            print(f"  - {c['company_name']} ({c['sector']}, ${c['revenue_mm']}M)")
        print("\nUsage:")
        print("  python bolt_on_scout.py --sponsor 'GTCR'")
        print("  python bolt_on_scout.py --company 'CrossPoint Insurance Group'")
        print("  python bolt_on_scout.py --all")


if __name__ == "__main__":
    main()
