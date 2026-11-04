"""
PoC 4: Leadership View — Pipeline & Coverage Dashboard
Huntington Capital Markets - AI Initiative

Terminal-rendered dashboard showing pipeline composition, sector concentration,
and sponsor activity for Michelle Mills' Monday morning briefing.
No API calls — pure computation over hardcoded pipeline data.

Usage:
    python leadership_view.py
    python leadership_view.py --section pipeline
    python leadership_view.py --section heatmap
    python leadership_view.py --json
"""

import argparse
import json
import os
import sys
from datetime import date
from collections import defaultdict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common.sponsors import SPONSORS, SPONSOR_NAMES

PIPELINE = [
    {"deal": "AssuredPartners Refi", "sponsor": "GTCR", "product": "LevFin", "sector": "Insurance", "size_mm": 4200, "fee_mm": 6.2, "stage": "Active", "probability": 0.85, "banker": "Eric Welsh"},
    {"deal": "GTCR Fund XIV Healthcare Platform", "sponsor": "GTCR", "product": "LevFin", "sector": "Healthcare", "size_mm": 1800, "fee_mm": 6.5, "stage": "Pitched", "probability": 0.40, "banker": "Eric Welsh"},
    {"deal": "Optimal Blue Add-On", "sponsor": "GTCR", "product": "LevFin", "sector": "FinTech", "size_mm": 450, "fee_mm": 1.8, "stage": "Pipeline", "probability": 0.60, "banker": "Eric Welsh"},
    {"deal": "Cornerstone Bldg Refi", "sponsor": "Clayton, Dubilier & Rice", "product": "LevFin", "sector": "Industrials", "size_mm": 3200, "fee_mm": 5.8, "stage": "Active", "probability": 0.80, "banker": "Jeff Tuckle"},
    {"deal": "CD&R Industrial Carve-out", "sponsor": "Clayton, Dubilier & Rice", "product": "LevFin", "sector": "Industrials", "size_mm": 2000, "fee_mm": 7.2, "stage": "Pipeline", "probability": 0.45, "banker": "Jeff Tuckle"},
    {"deal": "Veritiv Exit / Take-Out", "sponsor": "Clayton, Dubilier & Rice", "product": "M&A Advisory", "sector": "Distribution", "size_mm": 2300, "fee_mm": 3.5, "stage": "Monitoring", "probability": 0.30, "banker": "Jeff Tuckle"},
    {"deal": "AmeriLife DDTL", "sponsor": "Stone Point Capital", "product": "LevFin", "sector": "Insurance", "size_mm": 800, "fee_mm": 3.2, "stage": "Active", "probability": 0.75, "banker": "Eric Welsh"},
    {"deal": "Foundation Risk Refi", "sponsor": "Stone Point Capital", "product": "LevFin", "sector": "Insurance", "size_mm": 500, "fee_mm": 1.5, "stage": "Pipeline", "probability": 0.55, "banker": "Eric Welsh"},
    {"deal": "Trident IX Platform", "sponsor": "Stone Point Capital", "product": "LevFin", "sector": "Financial Services", "size_mm": 1200, "fee_mm": 2.8, "stage": "Pipeline", "probability": 0.40, "banker": "Eric Welsh"},
    {"deal": "Nuvei Repricing", "sponsor": "Madison Dearborn Partners", "product": "LevFin", "sector": "FinTech", "size_mm": 4200, "fee_mm": 4.8, "stage": "Pitched", "probability": 0.55, "banker": "Jeff Tuckle"},
    {"deal": "GHX Recap II", "sponsor": "Madison Dearborn Partners", "product": "LevFin", "sector": "Healthcare IT", "size_mm": 500, "fee_mm": 2.5, "stage": "Monitoring", "probability": 0.35, "banker": "Jeff Tuckle"},
    {"deal": "MDP Fund VIII TMT Platform", "sponsor": "Madison Dearborn Partners", "product": "LevFin", "sector": "TMT", "size_mm": 1500, "fee_mm": 5.0, "stage": "Pipeline", "probability": 0.35, "banker": "Jeff Tuckle"},
    # IG DCM deals (diversification)
    {"deal": "Regional Health System Bond", "sponsor": "N/A", "product": "IG DCM", "sector": "Healthcare", "size_mm": 500, "fee_mm": 1.2, "stage": "Active", "probability": 0.90, "banker": "Sarah Chen"},
    {"deal": "Midwest Utility Rev Bond", "sponsor": "N/A", "product": "IG DCM", "sector": "Utilities", "size_mm": 750, "fee_mm": 1.8, "stage": "Active", "probability": 0.85, "banker": "Dave Kessler"},
    {"deal": "Permian Basin E&P Senior Notes", "sponsor": "N/A", "product": "IG DCM", "sector": "Oil & Gas", "size_mm": 600, "fee_mm": 1.4, "stage": "Pipeline", "probability": 0.65, "banker": "Dave Kessler"},
    # ECM deals
    {"deal": "Tech IPO Advisory", "sponsor": "N/A", "product": "ECM", "sector": "Technology", "size_mm": 300, "fee_mm": 4.5, "stage": "Pipeline", "probability": 0.25, "banker": "Anna Wright"},
    {"deal": "Healthcare REIT Follow-On", "sponsor": "N/A", "product": "ECM", "sector": "Healthcare", "size_mm": 350, "fee_mm": 2.8, "stage": "Pipeline", "probability": 0.35, "banker": "Anna Wright"},
    # M&A Advisory
    {"deal": "MM Industrials Sell-Side", "sponsor": "N/A", "product": "M&A Advisory", "sector": "Industrials", "size_mm": 350, "fee_mm": 3.5, "stage": "Active", "probability": 0.70, "banker": "Mike Torres"},
    {"deal": "Healthcare IT Platform Sale", "sponsor": "N/A", "product": "M&A Advisory", "sector": "Healthcare IT", "size_mm": 650, "fee_mm": 5.2, "stage": "Pitched", "probability": 0.45, "banker": "Sarah Chen"},
]


def bar(value: float, max_value: float, width: int = 30) -> str:
    """Create a Unicode block bar."""
    if max_value == 0:
        return ""
    filled = int(value / max_value * width)
    return "\u2588" * filled + "\u2591" * (width - filled)


def section_pipeline_by_product():
    """Pipeline composition by product line."""
    products = defaultdict(lambda: {"count": 0, "deal_value": 0, "fee_value": 0, "weighted_fee": 0})

    for d in PIPELINE:
        p = products[d["product"]]
        p["count"] += 1
        p["deal_value"] += d["size_mm"]
        p["fee_value"] += d["fee_mm"]
        p["weighted_fee"] += d["fee_mm"] * d["probability"]

    total_fee = sum(p["fee_value"] for p in products.values())
    total_weighted = sum(p["weighted_fee"] for p in products.values())
    max_fee = max(p["fee_value"] for p in products.values())

    lines = []
    lines.append(f"\n{'=' * 70}")
    lines.append("  PIPELINE COMPOSITION BY PRODUCT LINE")
    lines.append(f"  As of {date.today().isoformat()}")
    lines.append(f"{'=' * 70}\n")

    lines.append(f"  {'Product':<16} {'Deals':>5}  {'Deal Value':>11}  {'Fees':>8}  {'Wtd Fees':>9}  {'Mix':>5}  {'Bar'}")
    lines.append(f"  {'─' * 16} {'─' * 5}  {'─' * 11}  {'─' * 8}  {'─' * 9}  {'─' * 5}  {'─' * 30}")

    for product in ["LevFin", "M&A Advisory", "IG DCM", "ECM"]:
        if product not in products:
            continue
        p = products[product]
        pct = p["fee_value"] / total_fee * 100 if total_fee else 0
        lines.append(
            f"  {product:<16} {p['count']:>5}  ${p['deal_value']:>9,.0f}M  ${p['fee_value']:>6.1f}M  ${p['weighted_fee']:>7.1f}M  {pct:>4.0f}%  {bar(p['fee_value'], max_fee)}"
        )

    lines.append(f"  {'─' * 16} {'─' * 5}  {'─' * 11}  {'─' * 8}  {'─' * 9}  {'─' * 5}")
    lines.append(
        f"  {'TOTAL':<16} {sum(p['count'] for p in products.values()):>5}  "
        f"${sum(p['deal_value'] for p in products.values()):>9,.0f}M  "
        f"${total_fee:>6.1f}M  ${total_weighted:>7.1f}M  100%"
    )

    levfin_pct = products["LevFin"]["fee_value"] / total_fee * 100 if total_fee else 0
    lines.append(f"\n  KEY INSIGHT: LevFin represents {levfin_pct:.0f}% of fee pipeline.")
    if levfin_pct > 70:
        lines.append("  \u26a0  Concentration risk — diversification into IG DCM and M&A Advisory recommended")

    return "\n".join(lines)


def section_sector_heatmap():
    """Sector concentration analysis."""
    sectors = defaultdict(lambda: {"count": 0, "fee_value": 0, "weighted_fee": 0})

    for d in PIPELINE:
        s = sectors[d["sector"]]
        s["count"] += 1
        s["fee_value"] += d["fee_mm"]
        s["weighted_fee"] += d["fee_mm"] * d["probability"]

    sorted_sectors = sorted(sectors.items(), key=lambda x: x[1]["fee_value"], reverse=True)
    total_fee = sum(s["fee_value"] for _, s in sorted_sectors)
    max_fee = max(s["fee_value"] for _, s in sorted_sectors)

    lines = []
    lines.append(f"\n{'=' * 70}")
    lines.append("  SECTOR CONCENTRATION ANALYSIS")
    lines.append(f"{'=' * 70}\n")

    lines.append(f"  {'Sector':<20} {'Deals':>5}  {'Fees':>8}  {'Wtd':>8}  {'Conc.':>5}  {'Heatmap'}")
    lines.append(f"  {'─' * 20} {'─' * 5}  {'─' * 8}  {'─' * 8}  {'─' * 5}  {'─' * 25}")

    for sector, data in sorted_sectors:
        pct = data["fee_value"] / total_fee * 100
        heat = bar(data["fee_value"], max_fee, 25)
        warn = " \u26a0" if pct > 25 else ""
        lines.append(
            f"  {sector:<20} {data['count']:>5}  ${data['fee_value']:>6.1f}M  ${data['weighted_fee']:>6.1f}M  {pct:>4.0f}%  {heat}{warn}"
        )

    top_sector = sorted_sectors[0][0] if sorted_sectors else "N/A"
    top_pct = sorted_sectors[0][1]["fee_value"] / total_fee * 100 if sorted_sectors else 0
    lines.append(f"\n  Top sector: {top_sector} ({top_pct:.0f}% of fee pipeline)")

    insurance_fees = sum(
        s["fee_value"] for name, s in sorted_sectors
        if "insurance" in name.lower()
    )
    if insurance_fees / total_fee > 0.15:
        lines.append(f"  Insurance vertical: ${insurance_fees:.1f}M in fees — leverage Huntington's vertical expertise")

    return "\n".join(lines)


def section_sponsor_activity():
    """Sponsor activity heatmap."""
    sponsor_data = defaultdict(lambda: {"deals": 0, "fees": 0, "weighted": 0, "stages": defaultdict(int)})

    for d in PIPELINE:
        s = d.get("sponsor", "N/A")
        if s == "N/A":
            s = "Non-Sponsor"
        sd = sponsor_data[s]
        sd["deals"] += 1
        sd["fees"] += d["fee_mm"]
        sd["weighted"] += d["fee_mm"] * d["probability"]
        sd["stages"][d["stage"]] += 1

    sorted_sponsors = sorted(sponsor_data.items(), key=lambda x: x[1]["fees"], reverse=True)
    max_fees = max(s["fees"] for _, s in sorted_sponsors)

    lines = []
    lines.append(f"\n{'=' * 70}")
    lines.append("  SPONSOR COVERAGE ACTIVITY")
    lines.append(f"{'=' * 70}\n")

    lines.append(f"  {'Sponsor':<28} {'Deals':>5}  {'Fees':>8}  {'Active':>6} {'Pitched':>7} {'Pipeline':>8}  {'Activity'}")
    lines.append(f"  {'─' * 28} {'─' * 5}  {'─' * 8}  {'─' * 6} {'─' * 7} {'─' * 8}  {'─' * 20}")

    for name, data in sorted_sponsors:
        short_name = name[:28]
        stages = data["stages"]
        lines.append(
            f"  {short_name:<28} {data['deals']:>5}  ${data['fees']:>6.1f}M  "
            f"{stages.get('Active', 0):>6} {stages.get('Pitched', 0):>7} {stages.get('Pipeline', 0) + stages.get('Monitoring', 0):>8}  "
            f"{bar(data['fees'], max_fees, 20)}"
        )

    lines.append(f"\n  COVERAGE GAPS:")
    total_sponsor_fees = sum(s["fees"] for n, s in sorted_sponsors if n != "Non-Sponsor")
    total_nonsponsor = sponsor_data.get("Non-Sponsor", {}).get("fees", 0)
    sponsor_pct = total_sponsor_fees / (total_sponsor_fees + total_nonsponsor) * 100 if (total_sponsor_fees + total_nonsponsor) else 0
    lines.append(f"  Sponsor-originated: {sponsor_pct:.0f}% of fee pipeline")
    lines.append(f"  Non-sponsor (IG DCM, ECM, direct M&A): {100 - sponsor_pct:.0f}%")

    return "\n".join(lines)


def section_stage_pipeline():
    """Pipeline by stage with weighted probability."""
    stages = {"Active": [], "Pitched": [], "Pipeline": [], "Monitoring": []}
    for d in PIPELINE:
        if d["stage"] in stages:
            stages[d["stage"]].append(d)

    lines = []
    lines.append(f"\n{'=' * 70}")
    lines.append("  PIPELINE BY STAGE")
    lines.append(f"{'=' * 70}")

    for stage_name in ["Active", "Pitched", "Pipeline", "Monitoring"]:
        deals = stages[stage_name]
        if not deals:
            continue
        total_fee = sum(d["fee_mm"] for d in deals)
        total_wtd = sum(d["fee_mm"] * d["probability"] for d in deals)

        lines.append(f"\n  {stage_name.upper()} ({len(deals)} deals, ${total_fee:.1f}M fees, ${total_wtd:.1f}M weighted)")
        lines.append(f"  {'─' * 60}")
        for d in sorted(deals, key=lambda x: x["fee_mm"], reverse=True):
            lines.append(
                f"    {d['deal']:<30} ${d['fee_mm']:>5.1f}M  {d['probability']:>4.0%}  {d['banker']}"
            )

    return "\n".join(lines)


def leadership_briefing_text():
    """Generate the full leadership briefing."""
    total_fees = sum(d["fee_mm"] for d in PIPELINE)
    total_weighted = sum(d["fee_mm"] * d["probability"] for d in PIPELINE)
    active_fees = sum(d["fee_mm"] for d in PIPELINE if d["stage"] == "Active")
    active_weighted = sum(d["fee_mm"] * d["probability"] for d in PIPELINE if d["stage"] == "Active")

    header = f"""
{'#' * 70}
#{'HUNTINGTON CAPITAL MARKETS':^68}#
#{'LEADERSHIP DASHBOARD':^68}#
#{'AI-Generated Weekly Briefing':^68}#
#{date.today().strftime('%B %d, %Y'):^68}#
{'#' * 70}

  EXECUTIVE SNAPSHOT
  {'─' * 50}
  Total Pipeline:          {len(PIPELINE)} deals
  Total Fee Opportunity:   ${total_fees:.1f}M
  Probability-Weighted:    ${total_weighted:.1f}M
  Active Deals:            {sum(1 for d in PIPELINE if d['stage'] == 'Active')} deals (${active_fees:.1f}M fees, ${active_weighted:.1f}M weighted)

  TOP 3 DEALS BY FEE OPPORTUNITY:
"""
    top3 = sorted(PIPELINE, key=lambda x: x["fee_mm"], reverse=True)[:3]
    for i, d in enumerate(top3, 1):
        header += f"    {i}. {d['deal']} — ${d['fee_mm']:.1f}M ({d['stage']}, {d['probability']:.0%})\n"

    return header


def full_dashboard(sections: list[str] = None):
    """Print the full leadership dashboard."""
    if sections is None:
        sections = ["briefing", "pipeline", "sector", "sponsor", "stage"]

    output = ""
    if "briefing" in sections:
        output += leadership_briefing_text()
    if "pipeline" in sections:
        output += section_pipeline_by_product()
    if "sector" in sections:
        output += section_sector_heatmap()
    if "sponsor" in sections:
        output += section_sponsor_activity()
    if "stage" in sections:
        output += section_stage_pipeline()

    output += f"\n\n{'=' * 70}"
    output += "\n  Generated by Huntington Capital Markets AI | Leadership View v1.0"
    output += f"\n  {date.today().isoformat()} | Internal Use Only"
    output += f"\n{'=' * 70}\n"

    return output


def main():
    parser = argparse.ArgumentParser(
        description="Huntington Capital Markets — Leadership View Dashboard"
    )
    parser.add_argument("--section", type=str, choices=["pipeline", "sector", "sponsor", "stage", "briefing"],
                        help="Show only one section")
    parser.add_argument("--json", action="store_true", help="Output pipeline data as JSON")
    parser.add_argument("--output-dir", type=str, default="./output", help="Output directory")
    args = parser.parse_args()

    if args.json:
        os.makedirs(args.output_dir, exist_ok=True)
        path = os.path.join(args.output_dir, "pipeline_data.json")
        with open(path, "w") as f:
            json.dump(PIPELINE, f, indent=2)
        print(f"Pipeline data saved: {path}")
        return

    if args.section:
        sections = [args.section]
    else:
        sections = None

    print(full_dashboard(sections))


if __name__ == "__main__":
    main()
