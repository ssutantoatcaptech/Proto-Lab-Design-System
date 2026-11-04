"""
PoC 1: Sponsor Briefing Pack Automation
Huntington Capital Markets - AI Initiative

Generates a 2-3 page briefing pack for a Private Equity sponsor
by aggregating CRM data, news, recent deal activity, and market context,
then producing a structured briefing + a slide-ready summary.

Usage:
    python briefing_poc.py --sponsor "GTCR"
    python briefing_poc.py --interactive
    python briefing_poc.py --sponsor "GTCR" --output-dir ./output
"""

import argparse
import json
import os
import sys
from datetime import date
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common.sponsors import SPONSORS, SPONSOR_NAMES
from common.market import MARKET_CONTEXT, SECTOR_MARKET_CONDITIONS
from common.llm import get_client, model_id, thinking_param, serialize_response


def build_sponsor_context(sponsor_name: str) -> str:
    """Build a rich text context block from sponsor CRM data."""
    sponsor = SPONSORS.get(sponsor_name)
    if not sponsor:
        return f"Limited CRM data on file for {sponsor_name}. Please enrich with live data."

    portfolio_text = "\n".join(
        f"  - {c['name']} ({c['sector']}) | Revenue: {c['revenue']} | Leverage: {c['leverage']}\n"
        f"    Notes: {c['notes']}"
        for c in sponsor["portfolio_companies"]
    )

    deals_text = "\n".join(f"  - {d}" for d in sponsor["recent_deals"])
    themes_text = "\n".join(f"  - {t}" for t in sponsor["investment_themes"])
    partners_text = ", ".join(sponsor["key_partners"])

    target = sponsor["target_profile"]
    target_text = (
        f"  Revenue: {target['revenue_range']} | EBITDA: {target['ebitda_range']}\n"
        f"  Geography: {target['geography']} | Deal Types: {target['ownership']}"
    )

    return f"""
SPONSOR PROFILE: {sponsor['fund_name']}
AUM: {sponsor['aum']} | HQ: {sponsor['hq']}
Current Fund: {sponsor['fund_vintage']}
Strategy: {sponsor['strategy']}
Relationship: {sponsor['relationship_status']}

KEY PARTNERS: {partners_text}

INVESTMENT THEMES:
{themes_text}

TARGET PROFILE:
{target_text}

PORTFOLIO COMPANIES:
{portfolio_text}

RECENT DEAL ACTIVITY:
{deals_text}

HUNTINGTON OPPORTUNITY PIPELINE:
  {sponsor.get('huntington_opportunity', 'Under assessment')}
"""


def build_market_context(sponsor_name: str = None) -> str:
    """Build sector-filtered market conditions summary."""
    themes_text = "\n".join(f"  - {t}" for t in MARKET_CONTEXT["themes"])

    base = f"""
CURRENT MARKET CONDITIONS (as of {date.today().strftime('%B %Y')}):
Leveraged Loan Pricing: {MARKET_CONTEXT['leveraged_loan_rate']}
High Yield Spreads: {MARKET_CONTEXT['high_yield_spread']}
LBO Leverage: {MARKET_CONTEXT['lbo_leverage_market']}
Deal Volume YTD: {MARKET_CONTEXT['deal_volume_ytd']}
Investor Appetite: {MARKET_CONTEXT['investor_appetite']}
Rate Environment: {MARKET_CONTEXT['rate_environment']}

MARKET THEMES:
{themes_text}
"""

    if sponsor_name and sponsor_name in SPONSORS:
        sponsor = SPONSORS[sponsor_name]
        relevant_sectors = []
        for theme in sponsor["investment_themes"]:
            for sector_key, sector_data in SECTOR_MARKET_CONDITIONS.items():
                if any(word.lower() in theme.lower() for word in sector_key.split()):
                    if sector_key not in relevant_sectors:
                        relevant_sectors.append(sector_key)

        if relevant_sectors:
            base += "\nSECTOR-SPECIFIC CONDITIONS:\n"
            for sector_name in relevant_sectors:
                s = SECTOR_MARKET_CONDITIONS[sector_name]
                sector_themes = "\n".join(f"      - {t}" for t in s["key_themes"])
                base += f"""
  {sector_name} — Outlook: {s['outlook']}
    Pricing: {s['spread']} | Leverage Available: {s['leverage_available']}
    Key Themes:
{sector_themes}
    Huntington Angle: {s['huntington_angle']}
"""

    return base


def generate_briefing(client, sponsor_name: str, additional_context: str = "") -> dict:
    """
    Multi-turn generation of a sponsor briefing pack.
    Returns a dict with sections: executive_summary, portfolio_analysis,
    opportunity_ideas, market_context, talking_points.
    """
    sponsor_context = build_sponsor_context(sponsor_name)
    market_context = build_market_context(sponsor_name)

    system_prompt = f"""You are a senior Capital Markets analyst at Huntington National Bank,
preparing briefing materials for a Managing Director ahead of a client call with a Private Equity sponsor.

Your output should be clear, concise, and actionable — the MD will use this to drive a 30-minute
call with the sponsor's partners. Be specific about financing opportunities, not generic.

Write in a professional investment banking style. Use bullet points for readability.
Focus on Huntington's middle-market and leveraged finance capabilities.

IMPORTANT: Reference specific portfolio companies by name, cite specific leverage ratios and deal sizes,
and tie recommendations to current market conditions. Generic advice is useless — the MD needs specifics."""

    messages = []

    # Turn 1: Executive summary
    messages.append({
        "role": "user",
        "content": f"""Generate an EXECUTIVE SUMMARY section for a sponsor briefing pack on {sponsor_name}.

SPONSOR DATA:
{sponsor_context}

{additional_context}

The executive summary should be 3-4 bullet points covering:
- Who they are, their strategy, and why they matter to Huntington
- Current fund status and where they are in the deployment cycle
- Top 1-2 specific financing opportunities for Huntington to pursue NOW (name the portfolio company and deal type)
- Relationship status and recommended next steps

Be concise — this goes on the first page."""
    })

    response1 = client.messages.create(
        model=model_id("opus"),
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
        **thinking_param(),
    )
    exec_summary = next(b.text for b in response1.content if b.type == "text")
    messages.append({"role": "assistant", "content": serialize_response(response1)})

    # Turn 2: Portfolio deep-dive + proactive financing ideas
    messages.append({
        "role": "user",
        "content": f"""Now generate the PORTFOLIO ANALYSIS & FINANCING OPPORTUNITIES section.

MARKET CONDITIONS:
{market_context}

For each portfolio company with active debt:
- Flag any refinancing needs, upcoming maturities, or dividend recap opportunities
- Suggest the specific Huntington product (term loan, HY bond, revolver amendment, ABL, etc.)
- Note deal sizing estimate and approximate fee opportunity for Huntington
- Reference current market pricing for their sector

Then list 3 PROACTIVE IDEAS we should pitch to {sponsor_name} on this call.
Each idea must:
- Name a specific portfolio company or new deal opportunity
- Cite the market condition that makes it timely
- Estimate the deal size and Huntington's potential role (lead left, co-lead, participant)
- Include an approximate fee range"""
    })

    response2 = client.messages.create(
        model=model_id("opus"),
        max_tokens=2000,
        system=system_prompt,
        messages=messages,
        **thinking_param(),
    )
    portfolio_opps = next(b.text for b in response2.content if b.type == "text")
    messages.append({"role": "assistant", "content": serialize_response(response2)})

    # Turn 3: Talking points & call prep
    messages.append({
        "role": "user",
        "content": f"""Finally, generate CALL TALKING POINTS for the MD.

Produce:
1. Opening (reference something specific to {sponsor_name}'s recent activity — a deal, a fund close, a market development in their sector)
2. 3-4 discussion topics in priority order, each with a specific question to ask
3. Key questions to uncover new mandates (be specific to their investment themes and fund cycle stage)
4. Closing / follow-up commitment with a concrete next step

Keep it punchy — these are speaker notes, not paragraphs."""
    })

    response3 = client.messages.create(
        model=model_id("opus"),
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
        **thinking_param(),
    )
    talking_points = next(b.text for b in response3.content if b.type == "text")

    return {
        "sponsor": sponsor_name,
        "generated_date": date.today().isoformat(),
        "executive_summary": exec_summary,
        "portfolio_analysis_and_opportunities": portfolio_opps,
        "talking_points": talking_points,
        "market_context": market_context.strip(),
    }


def format_briefing_pack(briefing: dict) -> str:
    """Format the briefing dict as a clean branded document."""
    separator = "\n" + "=" * 70 + "\n"
    thin_sep = "\n" + "-" * 70 + "\n"

    return f"""
{'=' * 70}
  HUNTINGTON NATIONAL BANK
  CAPITAL MARKETS & SPONSOR COVERAGE
{'=' * 70}

  SPONSOR BRIEFING PACK
  {briefing['sponsor'].upper()}

  Date:        {briefing['generated_date']}
  Prepared by: AI-Assisted Briefing Tool
  Coverage:    Sponsor Coverage Group
  Classification: INTERNAL — NOT FOR DISTRIBUTION

{'=' * 70}

EXECUTIVE SUMMARY
{thin_sep}
{briefing['executive_summary']}
{separator}

PORTFOLIO ANALYSIS & FINANCING OPPORTUNITIES
{thin_sep}
{briefing['portfolio_analysis_and_opportunities']}
{separator}

MARKET CONDITIONS SNAPSHOT
{thin_sep}
{briefing['market_context']}
{separator}

MD CALL TALKING POINTS
{thin_sep}
{briefing['talking_points']}
{separator}

DISCLAIMER: This briefing was AI-generated from internal CRM data and
market inputs. The MD should verify all facts and add relationship-specific
color before the call. Not for external distribution.

Huntington Capital Markets | AI-Assisted Briefing Tool v1.0
{'=' * 70}
"""


def interactive_mode(client):
    """Run an interactive session where the user can ask follow-up questions."""
    print("\n" + "=" * 55)
    print("  Huntington Capital Markets")
    print("  Sponsor Briefing Pack Generator")
    print("=" * 55)

    print("\nAvailable sponsors:")
    for i, name in enumerate(SPONSOR_NAMES, 1):
        sponsor = SPONSORS[name]
        print(f"  {i}. {name} ({sponsor['aum']} AUM) — {sponsor['fund_vintage']}")
    print("\n  Or type a sponsor name not in the list")

    sponsor_input = input("\nSelect sponsor (number or name): ").strip()
    if sponsor_input.isdigit():
        idx = int(sponsor_input) - 1
        if 0 <= idx < len(SPONSOR_NAMES):
            sponsor_name = SPONSOR_NAMES[idx]
        else:
            print("Invalid selection.")
            return
    else:
        sponsor_name = sponsor_input

    additional = input("\nAdditional context for this call? (Enter to skip): ").strip()

    print(f"\nGenerating briefing pack for {sponsor_name}...")
    print("(Using multi-turn adaptive thinking — ~30 seconds)\n")

    briefing = generate_briefing(client, sponsor_name, additional)
    pack = format_briefing_pack(briefing)
    print(pack)

    # Follow-up Q&A
    print("\n" + "=" * 55)
    print("  BRIEFING COMPLETE — Follow-up Q&A Mode")
    print("  Ask questions about this sponsor or type 'quit' to exit")
    print("=" * 55 + "\n")

    qa_messages = [
        {
            "role": "user",
            "content": f"Here is the sponsor briefing for {sponsor_name}:\n\n{pack}"
        },
        {
            "role": "assistant",
            "content": f"I have the full briefing pack for {sponsor_name}. What would you like to explore further?"
        }
    ]

    system_qa = """You are a senior Capital Markets analyst at Huntington National Bank.
Answer follow-up questions about the sponsor briefing concisely and specifically.
Reference specific data points from the briefing. If asked about a topic not in the briefing,
say so clearly rather than speculating."""

    while True:
        question = input("MD > ").strip()
        if question.lower() in ("quit", "exit", "q"):
            print("\nSession ended. Briefing saved.")
            break
        if not question:
            continue

        qa_messages.append({"role": "user", "content": question})
        resp = client.messages.create(
            model=model_id("opus"),
            max_tokens=512,
            system=system_qa,
            messages=qa_messages,
        )
        answer = next(b.text for b in resp.content if b.type == "text")
        qa_messages.append({"role": "assistant", "content": answer})
        print(f"\nAnalyst > {answer}\n")


def batch_mode(client, sponsor_name: str, output_dir: str = "."):
    """Generate and save a briefing pack to markdown and JSON files."""
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating briefing for {sponsor_name}...")
    briefing = generate_briefing(client, sponsor_name)

    slug = sponsor_name.replace(" ", "_").replace(",", "").replace("&", "and")

    md_path = os.path.join(output_dir, f"briefing_{slug}.md")
    with open(md_path, "w") as f:
        f.write(format_briefing_pack(briefing))
    print(f"  Markdown: {md_path}")

    json_path = os.path.join(output_dir, f"briefing_{slug}.json")
    with open(json_path, "w") as f:
        json.dump(briefing, f, indent=2)
    print(f"  JSON:     {json_path}")

    return briefing


def main():
    parser = argparse.ArgumentParser(
        description="Huntington Capital Markets — Sponsor Briefing Pack Generator"
    )
    parser.add_argument("--sponsor", type=str, help="Sponsor name (e.g. 'GTCR', 'Clayton, Dubilier & Rice')")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive Q&A mode")
    parser.add_argument("--output-dir", type=str, default="./output", help="Directory for output files")
    args = parser.parse_args()

    client = get_client()

    if args.interactive or not args.sponsor:
        interactive_mode(client)
    else:
        briefing = batch_mode(client, args.sponsor, args.output_dir)
        print("\n" + format_briefing_pack(briefing))


if __name__ == "__main__":
    main()
