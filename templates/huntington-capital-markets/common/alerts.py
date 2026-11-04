"""Portfolio Alerts: mandate patterns across the sponsor book.

Rule for every alert here, and for any data set that feeds it: an alert names a
mandate and the Capital Markets desk that owns it, never a loan balance. Fees
come from arranging, advising and hedging, not from lending.

Each pattern takes the data the home endpoint already has and returns either an
alert dict (rendered as-is by the Portfolio Alerts tab) or None when it does not
fire. Patterns are data-driven so a revised data set changes the alerts without
touching copy here.
"""
from datetime import date
import re

REPRICING_MIN_BPS = 50          # coupon spread above market before a repricing is worth pitching
REPRICING_HORIZON_MONTHS = 24   # maturities inside this window carry an extension mandate too
RECAP_MAX_LEVERAGE = 4.5        # room to layer on a recap tranche
RECAP_MIN_MONTHS_TO_MATURITY = 24


def _fees_by_sponsor(opps):
    fees = {}
    for o in opps:
        fees[o["sponsor"]] = fees.get(o["sponsor"], 0.0) + float(o.get("estimated_fee_mm", 0) or 0)
    return fees


def _months_out(iso_date):
    try:
        return (date.fromisoformat(iso_date) - date.today()).days / 30.4
    except (TypeError, ValueError):
        return None


SHORT_NAMES = {
    "Clayton, Dubilier & Rice": "CD&R",
    "Madison Dearborn Partners": "MDP",
    "Stone Point Capital": "Stone Point",
}


def _short(name):
    return SHORT_NAMES.get(name, name.split(",")[0].split(" (")[0])


def _sponsor_rows(names, fees):
    return [{"name": n, "fee": f"${fees.get(n, 0):.1f}M"} for n in names]


def _fmt_notional(mm):
    return f"${mm / 1000:.1f}B" if mm >= 1000 else f"${mm:.0f}M"


# ── Patterns ──────────────────────────────────────────────────────────────────

def repricing_window(ctx):
    rows = [
        r for r in ctx["debt_rows"]
        if r.get("base_rate") != "Fixed"
        and (r["coupon_spread_bps"] - r["market_spread_bps"]) >= REPRICING_MIN_BPS
        and (_months_out(r["maturity_date"]) or 999) <= REPRICING_HORIZON_MONTHS
    ]
    if not rows:
        return None
    rows.sort(key=lambda r: (r["coupon_spread_bps"] - r["market_spread_bps"]) * r["debt_amount_mm"], reverse=True)
    sponsors = list(dict.fromkeys(r["sponsor"] for r in rows))
    savings = [r["coupon_spread_bps"] - r["market_spread_bps"] for r in rows]
    notional = sum(r["debt_amount_mm"] for r in rows)
    wall_fees = _fees_by_sponsor([o for o in ctx["opps"] if o.get("signal_type") == "MATURITY WALL"])
    fees = sum(wall_fees.get(s, 0) for s in sponsors)
    top = rows[0]
    return {
        "id": "repricing-window",
        "icon": "repricing",
        "color": "#012d2a",
        "product_line": "LevFin · Arranger",
        "title": f"{len(rows)} sponsor credits are priced {min(savings)} to {max(savings)} bps above market",
        "summary": (f"{_fmt_notional(notional)} of term debt across {len(sponsors)} sponsors is paying more than today's market "
                    f"rate, with maturities inside {REPRICING_HORIZON_MONTHS} months. Each one can be repriced and extended, "
                    f"worth about ${fees:.1f}M in fees if Huntington leads the amendments."),
        "why_it_matters": "Huntington earns the fee for arranging the repricing, not for lending the money.",
        "sponsors_impacted": len(sponsors),
        "metrics": [
            {"value": f"${fees:.1f}M", "label": "Arrangement fees"},
            {"value": _fmt_notional(notional), "label": "Term debt in scope"},
            {"value": f"{max(savings)} bps", "label": "Widest to market"},
        ],
        "sponsors": _sponsor_rows(sponsors, wall_fees),
        "actions": [
            f"Lead with {_short(top['sponsor'])}: {top['company']} {top['debt_instrument']} is "
            f"{top['coupon_spread_bps'] - top['market_spread_bps']} bps wide on {_fmt_notional(top['debt_amount_mm'])}",
            "Bring a term sheet for the amendment. Sponsors are extending and repricing aggressively right now.",
            "Pair each repricing with a maturity extension so one process earns both fees",
        ],
    }


def exit_pipeline(ctx):
    exit_opps = [o for o in ctx["opps"] if o.get("signal_type") == "EXIT SIGNAL"]
    candidates = []
    for sponsor, data in ctx["sponsors"].items():
        for pc in data.get("portfolio_companies", []):
            note = (pc.get("notes") or "").lower()
            if re.search(r"reducing (its )?(public )?stake|strategic options|exit signal|ipo", note):
                candidates.append((sponsor, pc["name"].split(" (")[0]))
    sponsors = list(dict.fromkeys([o["sponsor"] for o in exit_opps] + [s for s, _ in candidates]))
    if not sponsors:
        return None
    fees = _fees_by_sponsor(exit_opps)
    total = sum(fees.values())
    companies = [c for _, c in candidates][:3]
    return {
        "id": "exit-pipeline",
        "icon": "exit",
        "color": "#012d2a",
        "product_line": "M&A Advisory · ECM",
        "title": f"{len(sponsors)} sponsors are lining up exits",
        "summary": (f"{', '.join(companies)}{' and others' if len(candidates) > 3 else ''} are weighing a sale, an IPO, "
                    f"or a stake sale. Each one needs a sell-side adviser, financing for the buyer, or a secondary offering. "
                    f"About ${total:.1f}M in fees is visible now."),
        "why_it_matters": ("Advising on an exit and underwriting the buyer are the highest-margin fees in the book, "
                           "and the sponsor picks the bank months before the process starts."),
        "sponsors_impacted": len(sponsors),
        "metrics": [
            {"value": f"${total:.1f}M", "label": "Advisory + underwriting"},
            {"value": str(len(candidates) + len(exit_opps)), "label": "Exit candidates"},
            {"value": str(len(sponsors)), "label": "Sponsors"},
        ],
        "sponsors": _sponsor_rows(sponsors, fees),
        "actions": [
            f"Ask for the sell-side or co-adviser seat on {companies[0] if companies else 'the next exit'} before a process launches",
            "Offer pre-arranged buyer financing so Huntington is in the deal from day one",
            "Where the sponsor holds a public stake, pitch the secondary or block trade",
        ],
    }


def deployment_window(ctx):
    opps = [o for o in ctx["opps"] if o.get("signal_type") == "FUND LIFECYCLE"]
    if not opps:
        return None
    sponsors = list(dict.fromkeys(o["sponsor"] for o in opps))
    fees = _fees_by_sponsor(opps)
    total = sum(fees.values())
    vintages = []
    for s in sponsors:
        v = ctx["sponsors"].get(s, {}).get("fund_vintage", "")
        m = re.search(r"\((\$[\d.]+B)", v)
        if m:
            vintages.append(f"{_short(s)} {m.group(1)}")
    return {
        "id": "deployment-window",
        "icon": "deploy",
        "color": "#012d2a",
        "product_line": "LevFin · Lead-left",
        "title": f"{len(sponsors)} sponsors are deploying new funds",
        "summary": (f"{', '.join(vintages[:3]) if vintages else ', '.join(_short(s) for s in sponsors[:3])} have new funds "
                    f"to put to work. Every acquisition needs a lead bank on the financing, and that seat is decided "
                    f"before the deal is signed. ${total:.1f}M in lead-arranger fees is on the table."),
        "why_it_matters": ("Leading the financing on the first deal puts Huntington first in line for the add-ons, "
                           "recaps and exit that follow."),
        "sponsors_impacted": len(sponsors),
        "metrics": [
            {"value": f"${total:.1f}M", "label": "Lead-left economics"},
            {"value": str(len(opps)), "label": "Platforms in motion"},
            {"value": str(len(sponsors)), "label": "Sponsors deploying"},
        ],
        "sponsors": _sponsor_rows(sponsors, fees),
        "actions": [
            f"Pitch {_short(sponsors[0])} a committed financing package for the next platform, revolver and hedge included",
            "Run Sponsor Match against each fund's target profile and bring two proprietary ideas per sponsor",
            "Ask each deal team who is leading the current financing and where Huntington ranks",
        ],
    }


def recap_candidates(ctx):
    rows = [
        r for r in ctx["debt_rows"]
        if r.get("base_rate") != "Fixed"
        and (r.get("current_leverage_x") or 99) <= RECAP_MAX_LEVERAGE
        and (_months_out(r["maturity_date"]) or 0) >= RECAP_MIN_MONTHS_TO_MATURITY
    ]
    recap_opps = [o for o in ctx["opps"] if o.get("signal_type") == "DIVIDEND RECAP"]
    companies = list(dict.fromkeys(r["company"] for r in rows))
    sponsors = list(dict.fromkeys([r["sponsor"] for r in rows] + [o["sponsor"] for o in recap_opps]))
    if not companies and not recap_opps:
        return None
    fees = _fees_by_sponsor(recap_opps)
    est = sum(fees.values()) + 0.0075 * sum(r["debt_amount_mm"] for r in rows) * 0.5  # half a turn at 75 bps
    lowest = min(rows, key=lambda r: r["current_leverage_x"]) if rows else None
    return {
        "id": "recap-candidates",
        "icon": "recap",
        "color": "#012d2a",
        "product_line": "LevFin · Dividend recap",
        "title": f"{len(companies) + len(recap_opps)} portfolio companies have room for a dividend recap",
        "summary": (f"{', '.join(companies[:3])} are levered at {RECAP_MAX_LEVERAGE:.1f}x or below with years left on their debt. "
                    f"Sponsors are paying themselves dividends while rates are favorable, and each recap is new debt "
                    f"Huntington can arrange. Roughly ${est:.1f}M in fees across {len(sponsors)} sponsors."),
        "why_it_matters": ("A dividend recap is new debt raised to pay the sponsor. Huntington earns the arrangement fee, "
                           "and usually the hedge on top."),
        "sponsors_impacted": len(sponsors),
        "metrics": [
            {"value": f"${est:.1f}M", "label": "Arrangement fees"},
            {"value": f"{lowest['current_leverage_x']:.1f}x" if lowest else "n/a", "label": "Lowest leverage"},
            {"value": str(len(companies) + len(recap_opps)), "label": "Candidates"},
        ],
        "sponsors": _sponsor_rows(sponsors, fees),
        "actions": [
            (f"Open with {_short(lowest['sponsor'])}: {lowest['company']} at {lowest['current_leverage_x']:.1f}x can carry a "
             f"half-turn recap on {_fmt_notional(lowest['debt_amount_mm'])} of existing debt") if lowest else
            "Open with the lowest-levered credit in the book",
            "Size the recap and the hedge together so the pitch shows one fixed all-in cost",
            "Time the launch to CLO demand. Recap debt sells best when new CLOs are pricing",
        ],
    }


def hedging_exposure(ctx):
    floating = [r for r in ctx["debt_rows"] if r.get("base_rate") != "Fixed" and not r.get("hedged")]
    if not floating:
        return None
    notional = sum(r["debt_amount_mm"] for r in floating)
    sponsors = list(dict.fromkeys(r["sponsor"] for r in floating))
    by_sponsor = {}
    for r in floating:
        by_sponsor[r["sponsor"]] = by_sponsor.get(r["sponsor"], 0) + r["debt_amount_mm"]
    biggest = max(by_sponsor.items(), key=lambda x: x[1])
    rate_env = ctx["market"].get("rate_environment", "")
    est = notional * 0.0004  # roughly 4 bps of notional in swap and cap economics
    return {
        "id": "hedging-exposure",
        "icon": "hedge",
        "color": "#012d2a",
        "product_line": "Rates & FX",
        "title": f"{_fmt_notional(notional)} of sponsor floating-rate debt has no hedge on file",
        "summary": (f"Every term loan in the book floats with SOFR and none has a swap or cap on file. With {rate_env.split(';')[1].strip() if ';' in rate_env else 'cuts priced in'}, "
                    f"sponsors are locking in rates now. That is about ${est:.1f}M in hedging revenue across "
                    f"{len(sponsors)} sponsors."),
        "why_it_matters": "Swaps and caps are pure fee income. No lending, no balance sheet.",
        "sponsors_impacted": len(sponsors),
        "metrics": [
            {"value": f"${est:.1f}M", "label": "Derivatives revenue"},
            {"value": _fmt_notional(notional), "label": "Unhedged notional"},
            {"value": str(len(floating)), "label": "Floating tranches"},
        ],
        "sponsors": _sponsor_rows(sponsors, {s: v * 0.0004 for s, v in by_sponsor.items()}),
        "actions": [
            f"Start with {_short(biggest[0])}: {_fmt_notional(biggest[1])} floating across the portfolio, largest single exposure",
            "Attach a swap or cap proposal to every repricing and recap pitch already in motion",
            "Ask each CFO what their loan agreement requires on hedging and offer to run it",
        ],
    }


def book_concentration(ctx):
    fees = _fees_by_sponsor(ctx["opps"])
    ranked = sorted(fees.items(), key=lambda x: x[1], reverse=True)
    total = sum(fees.values())
    if len(ranked) < 2 or not total:
        return None
    top2_pct = round((ranked[0][1] + ranked[1][1]) / total * 100)
    if top2_pct < 40:
        return None
    return {
        "id": "book-concentration",
        "icon": "concentration",
        "color": "#012d2a",
        "product_line": "Coverage",
        "title": f"{top2_pct}% of your fee pipeline sits with two sponsors",
        "summary": (f"{_short(ranked[0][0])} and {_short(ranked[1][0])} make up {top2_pct}% of your expected fees. "
                    f"If either slows down, your year does too."),
        "why_it_matters": "Deals follow relationships. Widen the base while both are still active.",
        "sponsors_impacted": 2,
        "metrics": [
            {"value": f"${ranked[0][1]:.1f}M", "label": _short(ranked[0][0])},
            {"value": f"${ranked[1][1]:.1f}M", "label": _short(ranked[1][0])},
            {"value": f"{top2_pct}%", "label": "Combined share"},
        ],
        "sponsors": _sponsor_rows([ranked[0][0], ranked[1][0]], fees),
        "actions": [
            f"Put {_short(ranked[2][0]) if len(ranked) > 2 else 'the next-tier sponsors'} on the call schedule this month",
            "Find the second mandate inside each existing relationship before chasing new names",
            "Identify two mid-market sponsors with fresh funds that Huntington has not covered",
        ],
    }


ALERT_PATTERNS = [
    repricing_window,
    exit_pipeline,
    deployment_window,
    recap_candidates,
    hedging_exposure,
    book_concentration,
]


def build_alerts(opps, debt_rows, sponsors, market):
    """Run every pattern over the book and return the alerts that fired."""
    ctx = {"opps": opps, "debt_rows": debt_rows, "sponsors": sponsors, "market": market}
    alerts = []
    for pattern in ALERT_PATTERNS:
        try:
            alert = pattern(ctx)
        except Exception as exc:  # a bad row must not take the whole tab down
            print(f"  alert pattern {pattern.__name__} skipped: {exc}")
            alert = None
        if alert:
            alerts.append(alert)
    return alerts
