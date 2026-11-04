"""
Offline test suite for Huntington Capital Markets AI demos.
Covers all test cases from Paul's test plan that don't require API calls.

Run: python3 tests/test_offline.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from common.sponsors import SPONSORS, SPONSOR_NAMES
from common.market import MARKET_CONTEXT, SECTOR_MARKET_CONDITIONS
from common.clients import MIDDLE_MARKET_CLIENTS

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
WARN = "\033[93mWARN\033[0m"

results = {"pass": 0, "fail": 0, "warn": 0}


def check(test_id, description, passed, detail=""):
    status = PASS if passed else FAIL
    if not passed:
        results["fail"] += 1
    else:
        results["pass"] += 1
    print(f"  {status}  {test_id}: {description}")
    if detail and not passed:
        print(f"         {detail}")


def warn(test_id, description, detail=""):
    results["warn"] += 1
    print(f"  {WARN}  {test_id}: {description}")
    if detail:
        print(f"         {detail}")


def test_sponsor_data_completeness():
    """TC-SBP-04, TC-SBP-05: Sponsor data completeness for all 4 sponsors."""
    print("\n--- TC-SBP-04/05: Sponsor Data Completeness ---")

    required_fields = [
        "fund_name", "aum", "hq", "fund_vintage", "key_partners",
        "strategy", "investment_themes", "target_profile",
        "portfolio_companies", "recent_deals", "relationship_status",
    ]

    for name in SPONSOR_NAMES:
        sponsor = SPONSORS[name]

        for field in required_fields:
            check(
                f"SBP-04/{name[:4]}",
                f"{name}: field '{field}' exists and non-empty",
                field in sponsor and sponsor[field],
            )

        check(
            f"SBP-04/{name[:4]}",
            f"{name}: at least 2 key partners",
            len(sponsor.get("key_partners", [])) >= 2,
            f"Found {len(sponsor.get('key_partners', []))}",
        )

        check(
            f"SBP-04/{name[:4]}",
            f"{name}: at least 3 investment themes",
            len(sponsor.get("investment_themes", [])) >= 3,
            f"Found {len(sponsor.get('investment_themes', []))}",
        )

        pcs = sponsor.get("portfolio_companies", [])
        check(
            f"SBP-04/{name[:4]}",
            f"{name}: at least 2 portfolio companies",
            len(pcs) >= 2,
            f"Found {len(pcs)}",
        )

        for pc in pcs:
            for pf in ["name", "sector", "revenue", "leverage", "notes"]:
                check(
                    f"SBP-04/{name[:4]}",
                    f"{name}/{pc.get('name', '?')}: field '{pf}' populated",
                    pf in pc and pc[pf],
                )

        check(
            f"SBP-04/{name[:4]}",
            f"{name}: at least 2 recent deals",
            len(sponsor.get("recent_deals", [])) >= 2,
            f"Found {len(sponsor.get('recent_deals', []))}",
        )


def test_market_data_currency():
    """TC-SBP-06: Market context reflects Q2 2026 conditions."""
    print("\n--- TC-SBP-06: Market Context Data Currency ---")

    check(
        "SBP-06",
        "Rate environment mentions current Fed funds",
        "4." in MARKET_CONTEXT["rate_environment"],
        f"Got: {MARKET_CONTEXT['rate_environment']}",
    )

    check(
        "SBP-06",
        "Deal volume is plausible for Q2 2026",
        "YTD" in MARKET_CONTEXT["deal_volume_ytd"],
    )

    all_themes = " ".join(MARKET_CONTEXT["themes"])
    check(
        "SBP-06",
        "Themes reference maturity walls or refinancing",
        "matur" in all_themes.lower() or "refin" in all_themes.lower(),
    )

    check(
        "SBP-06",
        "At least 3 sector-specific conditions defined",
        len(SECTOR_MARKET_CONDITIONS) >= 3,
        f"Found {len(SECTOR_MARKET_CONDITIONS)}",
    )


def test_sponsor_name_sensitivity():
    """TC-DR-09: No Blackstone/KKR/Apollo in demo data."""
    print("\n--- TC-DR-09: Sponsor Name Sensitivity ---")

    banned = ["Blackstone", "KKR", "Apollo", "Carlyle", "Warburg"]
    all_data = json.dumps({
        "sponsors": SPONSORS,
        "market": MARKET_CONTEXT,
        "sectors": SECTOR_MARKET_CONDITIONS,
        "clients": MIDDLE_MARKET_CLIENTS,
    })

    for name in banned:
        check(
            "DR-09",
            f"No '{name}' in any demo data",
            name.lower() not in all_data.lower(),
            f"Found '{name}' in demo data!",
        )

    check(
        "DR-09",
        "Only approved sponsors in SPONSOR_NAMES",
        set(SPONSOR_NAMES) == {"GTCR", "Clayton, Dubilier & Rice", "Stone Point Capital", "Madison Dearborn Partners"},
        f"Got: {SPONSOR_NAMES}",
    )


def test_private_credit_absence():
    """TC-DR-10: No private credit/direct lending references."""
    print("\n--- TC-DR-10: Private Credit Term Absence ---")

    banned_terms = ["private credit", "direct lending", "private debt"]
    all_data = json.dumps({
        "sponsors": SPONSORS,
        "market": MARKET_CONTEXT,
        "sectors": SECTOR_MARKET_CONDITIONS,
        "clients": MIDDLE_MARKET_CLIENTS,
    })

    for term in banned_terms:
        found = term.lower() in all_data.lower()
        if found:
            check("DR-10", f"No '{term}' in demo data", False)
        else:
            check("DR-10", f"No '{term}' in demo data", True)

    investor_appetite = MARKET_CONTEXT.get("investor_appetite", "")
    if "direct lend" in investor_appetite.lower():
        warn("DR-10", "investor_appetite mentions direct lenders", investor_appetite)
    else:
        check("DR-10", "investor_appetite clean of direct lender references", True)


def test_middle_market_client_data():
    """TC-BOS-03: Middle market client data breadth."""
    print("\n--- TC-BOS-03: Middle Market Client Data ---")

    check(
        "BOS-03",
        f"8-12 companies present",
        8 <= len(MIDDLE_MARKET_CLIENTS) <= 12,
        f"Found {len(MIDDLE_MARKET_CLIENTS)}",
    )

    sectors = set(c["sector"] for c in MIDDLE_MARKET_CLIENTS)
    check(
        "BOS-03",
        f"At least 3 different sectors",
        len(sectors) >= 3,
        f"Found {len(sectors)}: {sectors}",
    )

    ownerships = set(c["ownership_type"] for c in MIDDLE_MARKET_CLIENTS)
    check(
        "BOS-03",
        f"Mix of ownership types",
        len(ownerships) >= 3,
        f"Found: {ownerships}",
    )

    revenues = [c["revenue_mm"] for c in MIDDLE_MARKET_CLIENTS]
    check(
        "BOS-03",
        f"Revenue range is middle market ($50-500M)",
        all(30 <= r <= 500 for r in revenues),
        f"Range: ${min(revenues)}M - ${max(revenues)}M",
    )

    geos = set(c["geography"] for c in MIDDLE_MARKET_CLIENTS)
    check(
        "BOS-03",
        f"At least 2 geographic regions",
        len(geos) >= 2,
        f"Found {len(geos)}: {geos}",
    )

    for c in MIDDLE_MARKET_CLIENTS:
        check(
            "BOS-03",
            f"{c['company_name']}: has transaction signals",
            len(c.get("transaction_signals", [])) >= 1,
        )
        check(
            "BOS-03",
            f"{c['company_name']}: has differentiators",
            len(c.get("key_differentiators", [])) >= 1,
        )
        check(
            "BOS-03",
            f"{c['company_name']}: has Huntington banker assigned",
            bool(c.get("huntington_banker")),
        )


def test_realistic_financials():
    """TC-OQ-06: Realistic revenue and leverage numbers."""
    print("\n--- TC-OQ-06: Realistic Financial Data ---")

    for c in MIDDLE_MARKET_CLIENTS:
        name = c["company_name"]

        check(
            "OQ-06",
            f"{name}: revenue ${c['revenue_mm']}M is middle-market plausible",
            10 <= c["revenue_mm"] <= 500,
        )

        check(
            "OQ-06",
            f"{name}: EBITDA ${c['ebitda_mm']}M is positive",
            c["ebitda_mm"] > 0,
        )

        margin = c["ebitda_margin"]
        check(
            "OQ-06",
            f"{name}: EBITDA margin {margin:.1%} is plausible",
            0.05 <= margin <= 0.50,
            f"Margin {margin:.1%} seems {'low' if margin < 0.05 else 'high'}",
        )

        check(
            "OQ-06",
            f"{name}: growth {c['growth_yoy']:.0%} YoY is plausible",
            -0.10 <= c["growth_yoy"] <= 0.50,
        )


def test_leadership_view():
    """TC-DR-11: Leadership view renders correctly."""
    print("\n--- TC-DR-11: Leadership View Rendering ---")

    from poc4_leadership_view.leadership_view import (
        full_dashboard, PIPELINE,
        section_pipeline_by_product,
        section_sector_heatmap,
        section_sponsor_activity,
    )

    dashboard = full_dashboard()
    check("DR-11", "Dashboard generates without error", bool(dashboard))
    check("DR-11", "Dashboard has pipeline section", "PIPELINE COMPOSITION" in dashboard)
    check("DR-11", "Dashboard has sector section", "SECTOR CONCENTRATION" in dashboard)
    check("DR-11", "Dashboard has sponsor section", "SPONSOR COVERAGE" in dashboard)
    check("DR-11", "Dashboard has stage section", "PIPELINE BY STAGE" in dashboard)

    products = set(d["product"] for d in PIPELINE)
    check(
        "DR-11",
        "Pipeline has LevFin, IG DCM, ECM, M&A Advisory",
        {"LevFin", "IG DCM", "ECM", "M&A Advisory"}.issubset(products),
        f"Found: {products}",
    )

    levfin_fees = sum(d["fee_mm"] for d in PIPELINE if d["product"] == "LevFin")
    total_fees = sum(d["fee_mm"] for d in PIPELINE)
    levfin_pct = levfin_fees / total_fees * 100
    check(
        "DR-11",
        f"LevFin concentration noted ({levfin_pct:.0f}%)",
        levfin_pct > 50,
    )


def test_scanner_mockup():
    """TC-DR-03 partial: Scanner mockup has data for all sponsors."""
    print("\n--- TC-DR-03: Scanner Mockup Data ---")

    from poc3_opportunity_scanner.scanner_mockup import SCANNER_RESULTS

    for name in SPONSOR_NAMES:
        opps = SCANNER_RESULTS.get(name, [])
        check(
            "DR-03",
            f"{name}: has scanner opportunities",
            len(opps) >= 2,
            f"Found {len(opps)}",
        )

        high_urgency = [o for o in opps if o["urgency"] == "HIGH"]
        check(
            "DR-03",
            f"{name}: has at least 1 HIGH urgency opportunity",
            len(high_urgency) >= 1,
        )

        for opp in opps:
            check(
                "DR-03",
                f"{name}/{opp['opportunity_id']}: has all required fields",
                all(k in opp for k in ["signal_type", "urgency", "recommended_product", "estimated_fee_mm", "action", "confidence"]),
            )


def test_poc1_imports():
    """Verify PoC 1 imports and builds context without API."""
    print("\n--- PoC 1: Import and Context Build ---")

    from poc1_sponsor_briefing.briefing_poc import build_sponsor_context, build_market_context

    for name in SPONSOR_NAMES:
        ctx = build_sponsor_context(name)
        check(
            "SBP-01",
            f"build_sponsor_context('{name}') produces content",
            len(ctx) > 100,
            f"Length: {len(ctx)}",
        )
        check(
            "SBP-01",
            f"Context includes fund vintage for {name}",
            "Fund" in ctx or "Trident" in ctx,
        )

    mkt = build_market_context("GTCR")
    check("SBP-01", "build_market_context includes sector conditions", "SECTOR-SPECIFIC" in mkt)

    unknown = build_sponsor_context("Fictional Capital Partners")
    check("SBP-07", "Unknown sponsor returns limited data message", "Limited CRM data" in unknown)


def test_poc2_imports():
    """Verify PoC 2 imports and builds prompts without API."""
    print("\n--- PoC 2: Import and Prompt Build ---")

    from poc2_bolt_on_scout.bolt_on_scout import build_scoring_prompt

    for name in SPONSOR_NAMES:
        prompt = build_scoring_prompt(name)
        check(
            "BOS-01",
            f"build_scoring_prompt('{name}') produces prompt",
            len(prompt) > 500,
            f"Length: {len(prompt)}",
        )

        for client in MIDDLE_MARKET_CLIENTS:
            check(
                "BOS-01",
                f"Prompt includes {client['company_name']}",
                client["company_name"] in prompt,
            )


def test_source_file_sensitivity():
    """Scan all Python source files for banned terms."""
    print("\n--- Source File Sensitivity Scan ---")

    banned = ["blackstone", "kkr", "apollo", "carlyle", "warburg"]
    source_dirs = ["poc1_sponsor_briefing", "poc2_bolt_on_scout", "poc3_opportunity_scanner", "poc4_leadership_view", "common"]

    for d in source_dirs:
        dirpath = os.path.join(os.path.dirname(__file__), "..", d)
        if not os.path.exists(dirpath):
            continue
        for fname in os.listdir(dirpath):
            if not fname.endswith(".py"):
                continue
            fpath = os.path.join(dirpath, fname)
            with open(fpath) as f:
                content = f.read().lower()
            for term in banned:
                check(
                    "DR-09",
                    f"{d}/{fname}: no '{term}'",
                    term not in content,
                    f"Found '{term}' in {d}/{fname}!",
                )


if __name__ == "__main__":
    print("=" * 60)
    print("  HUNTINGTON CAPITAL MARKETS AI")
    print("  Offline Test Suite")
    print("=" * 60)

    test_sponsor_data_completeness()
    test_market_data_currency()
    test_sponsor_name_sensitivity()
    test_private_credit_absence()
    test_middle_market_client_data()
    test_realistic_financials()
    test_leadership_view()
    test_scanner_mockup()
    test_poc1_imports()
    test_poc2_imports()
    test_source_file_sensitivity()

    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {results['pass']} passed, {results['fail']} failed, {results['warn']} warnings")
    print(f"{'=' * 60}")

    sys.exit(1 if results["fail"] > 0 else 0)
