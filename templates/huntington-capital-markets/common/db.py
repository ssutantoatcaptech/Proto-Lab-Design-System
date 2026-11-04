"""
SQLite persistence layer for the Huntington Capital Markets AI demo.
Persists feedback, scout results, briefings, and actions across server restarts.
"""

import json
import os
import sqlite3

DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), '..', 'data', 'huntington.db')
)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            tool TEXT,
            sponsor TEXT,
            section TEXT,
            rating TEXT,
            action TEXT,
            comment TEXT,
            banker TEXT
        );

        CREATE TABLE IF NOT EXISTS scout_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            sponsor TEXT,
            company TEXT,
            results_json TEXT
        );

        CREATE TABLE IF NOT EXISTS briefings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            sponsor TEXT,
            call_type TEXT,
            banker TEXT,
            sections_json TEXT
        );

        CREATE TABLE IF NOT EXISTS actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            tool TEXT,
            sponsor TEXT,
            item TEXT,
            action TEXT,
            banker TEXT
        );

        CREATE TABLE IF NOT EXISTS opportunity_state (
            opportunity_id TEXT PRIMARY KEY,
            sponsor TEXT,
            banker TEXT,
            pursued INTEGER DEFAULT 0,
            call_at TEXT,
            followup_at TEXT,
            dismissed INTEGER DEFAULT 0,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS portfolio_debt (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sponsor TEXT NOT NULL,
            company TEXT NOT NULL,
            ticker TEXT,
            sector TEXT,
            debt_instrument TEXT,
            debt_amount_mm REAL,
            maturity_date TEXT,
            coupon_spread_bps INTEGER,
            base_rate TEXT,
            current_leverage_x REAL,
            ebitda_mm REAL,
            market_spread_bps INTEGER,
            bloomberg_pulled_at TEXT,
            notes TEXT
        );
    """)
    db.commit()
    db.close()
    print(f"  DB initialized at {DB_PATH}")


# Bloomberg-style seed data: (sponsor, company, ticker, sector, instrument,
#  amount_mm, maturity, coupon_bps, base_rate, leverage_x, ebitda_mm, mkt_bps, notes)
_PORTFOLIO_DEBT_SEED = [
    # GTCR
    ("GTCR", "AssuredPartners", "PRIV:APAX-GTCR", "Insurance Brokerage", "Term Loan B",
     4200.0, "2027-11-15", 375, "SOFR", 6.5, 645.0, 310,
     "Co-owned with APAX; 200+ acquisitions; maturity wall approaching Q4 2027"),
    ("GTCR", "AssuredPartners", "PRIV:APAX-GTCR", "Insurance Brokerage", "Revolving Credit Facility",
     400.0, "2026-11-15", 325, "SOFR", 6.5, 645.0, 275,
     "RCF matures 1yr ahead of TLB; renewal concurrent with refi"),
    ("GTCR", "Optimal Blue", "PRIV:OPTBLUE", "Mortgage Technology", "Term Loan B",
     1650.0, "2028-03-31", 350, "SOFR", 5.8, 284.0, 300,
     "Acquired from ICE/Black Knight 2023; active bolt-on pipeline in mortgage tech adjacencies"),
    ("GTCR", "Maravai LifeSciences", "MRVI", "Life Sciences", "Term Loan B",
     500.0, "2027-10-01", 300, "SOFR", 2.1, 238.0, 275,
     "Public (NASDAQ: MRVI); post-COVID normalization; GTCR reducing stake gradually"),
    # CD&R
    ("Clayton, Dubilier & Rice", "Cornerstone Building Brands", "PRIV:CNR", "Building Products", "Term Loan B",
     3200.0, "2028-04-12", 350, "SOFR", 5.5, 581.0, 310,
     "Largest US exterior building products mfr; CD&R operational improvement tracking ahead of plan"),
    ("Clayton, Dubilier & Rice", "Cornerstone Building Brands", "PRIV:CNR", "Building Products", "Senior Secured Notes",
     800.0, "2029-04-15", 650, "Fixed", 5.5, 581.0, 600,
     "HY bond tranche; fixed rate; less urgent than TLB repricing"),
    ("Clayton, Dubilier & Rice", "Veritiv Corporation", "PRIV:VRTV", "Packaging & Distribution", "Term Loan B",
     1200.0, "2030-06-01", 325, "SOFR", 4.1, 292.0, 300,
     "Taken private 2023; long-dated maturity; monitoring for 2027 exit signal"),
    ("Clayton, Dubilier & Rice", "Covetrus", "PRIV:CVET", "Veterinary Distribution", "Term Loan B",
     1800.0, "2029-10-01", 375, "SOFR", 4.3, 419.0, 325,
     "Taken private 2022; vet distribution + SaaS; exploring strategic options"),
    # Stone Point
    ("Stone Point Capital", "AmeriLife", "PRIV:AMRLIFE", "Insurance Distribution", "Term Loan B",
     2200.0, "2027-08-20", 350, "SOFR", 6.8, 323.5, 300,
     "National insurance distribution platform; 60+ acquisitions; co-owned with Thomas H. Lee"),
    ("Stone Point Capital", "AmeriLife", "PRIV:AMRLIFE", "Insurance Distribution", "Delayed Draw Term Loan",
     800.0, "2027-08-20", 375, "SOFR", 6.8, 323.5, 325,
     "DDTL for bolt-on M&A; 8 acquisition targets in H2 2026 pipeline"),
    ("Stone Point Capital", "Foundation Risk Partners", "PRIV:FRP", "Insurance Brokerage", "Term Loan B",
     500.0, "2027-06-15", 375, "SOFR", 5.9, 84.7, 310,
     "SE-focused brokerage; revenue grown above current facility size; upsizing and extension needed"),
    ("Stone Point Capital", "Wilshire Advisors", "PRIV:WILSH", "Investment Analytics", "Term Loan B",
     320.0, "2029-01-15", 325, "SOFR", 4.2, 76.2, 300,
     "Institutional analytics SaaS transition ongoing; long-dated maturity; monitoring"),
    # Madison Dearborn
    ("Madison Dearborn Partners", "Nuvei Corporation", "NVEI", "Payments Technology", "Term Loan B",
     3600.0, "2029-02-14", 375, "SOFR", 5.3, 679.2, 325,
     "Take-private 2024 ($6.3B CAD); Advent-led co-invest; repricing opportunity ~30-50bps vs. current"),
    ("Madison Dearborn Partners", "Nuvei Corporation", "NVEI", "Payments Technology", "Senior Secured Notes",
     600.0, "2031-02-15", 700, "Fixed", 5.3, 679.2, 650,
     "HY notes tranche; monitoring for tender/exchange opportunity alongside TLB repricing"),
    ("Madison Dearborn Partners", "Global Healthcare Exchange", "PRIV:GHX", "Healthcare IT", "Term Loan B",
     850.0, "2027-09-30", 350, "SOFR", 5.1, 166.7, 300,
     "2nd recap candidate as leverage deleverages toward 5.0x; MDP Fund VII vintage (2017) — LP pressure for DPI"),
    ("Madison Dearborn Partners", "LogRhythm/Exabeam", "PRIV:LREX", "Cybersecurity / SIEM", "Term Loan B",
     650.0, "2028-06-15", 425, "SOFR", 4.5, 144.4, 375,
     "Post-merger integration; spread 50bps wide of market; growth capital opportunity for cross-sell build-out"),
    # KKR
    ("KKR", "USI Insurance Services", "PRIV:USI", "Insurance Brokerage", "Term Loan B",
     3200.0, "2026-11-15", 325, "SOFR", 6.1, 524.6, 290,
     "URGENT — matures Nov 2026 (~7 months); refi window open now; KKR anchor relationship opportunity"),
    ("KKR", "USI Insurance Services", "PRIV:USI", "Insurance Brokerage", "Senior Secured Notes",
     800.0, "2027-05-15", 575, "Fixed", 6.1, 524.6, 550,
     "HY notes; may tender concurrent with TLB refi for clean capital structure"),
    # Blackstone
    ("Blackstone", "Copeland", "PRIV:COPELD", "Industrial / HVAC", "Term Loan B",
     4500.0, "2029-05-22", 300, "SOFR", 4.8, 937.5, 275,
     "Carved out from Emerson Electric 2023 ($14B); data center cooling tailwind; long-dated; monitoring"),
    ("Blackstone", "Ancestry.com", "PRIV:ANCS", "Consumer Technology", "Term Loan B",
     1800.0, "2028-10-01", 375, "SOFR", 5.9, 305.1, 325,
     "Consumer SaaS; 18M subscribers; international expansion; spread 50bps wide of comparable SaaS credits"),
]


def seed_portfolio_debt():
    """Seed Bloomberg-style portfolio debt data if the table is empty."""
    db = get_db()
    count = db.execute("SELECT COUNT(*) FROM portfolio_debt").fetchone()[0]
    if count == 0:
        db.executemany(
            """INSERT INTO portfolio_debt
               (sponsor, company, ticker, sector, debt_instrument, debt_amount_mm,
                maturity_date, coupon_spread_bps, base_rate, current_leverage_x,
                ebitda_mm, market_spread_bps, bloomberg_pulled_at, notes)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            [(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9],
              r[10], r[11], "2026-04-27T06:30:00Z", r[12])
             for r in _PORTFOLIO_DEBT_SEED]
        )
        db.commit()
        print(f"  Portfolio debt seeded: {len(_PORTFOLIO_DEBT_SEED)} instruments across 6 sponsors")
    db.close()


def get_portfolio_debt(sponsor: str) -> list:
    """Return all debt instruments for a sponsor, sorted by maturity date ascending."""
    db = get_db()
    rows = db.execute(
        "SELECT * FROM portfolio_debt WHERE sponsor = ? ORDER BY maturity_date ASC",
        (sponsor,)
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


def get_all_portfolio_debt() -> list:
    """Return all portfolio debt instruments sorted by maturity date ascending."""
    db = get_db()
    rows = db.execute(
        "SELECT * FROM portfolio_debt ORDER BY maturity_date ASC"
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


def insert_feedback(entry: dict):
    db = get_db()
    db.execute(
        "INSERT INTO feedback (timestamp, tool, sponsor, section, rating, action, comment, banker) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (entry.get("timestamp"), entry.get("tool"), entry.get("sponsor"),
         entry.get("section"), entry.get("rating"), entry.get("action"),
         entry.get("comment"), entry.get("banker")),
    )
    db.commit()
    db.close()


def get_all_feedback():
    db = get_db()
    rows = db.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
    db.close()
    return [dict(r) for r in rows]


def insert_scout_result(sponsor: str, company: str, results: list):
    import time
    db = get_db()
    db.execute(
        "INSERT INTO scout_results (timestamp, sponsor, company, results_json) VALUES (?, ?, ?, ?)",
        (time.strftime("%Y-%m-%dT%H:%M:%S"), sponsor, company, json.dumps(results)),
    )
    db.commit()
    db.close()


def insert_briefing(sponsor: str, call_type: str, banker: str, sections: dict):
    import time
    db = get_db()
    db.execute(
        "INSERT INTO briefings (timestamp, sponsor, call_type, banker, sections_json) VALUES (?, ?, ?, ?, ?)",
        (time.strftime("%Y-%m-%dT%H:%M:%S"), sponsor, call_type, banker, json.dumps(sections)),
    )
    db.commit()
    db.close()


def get_briefings_for_sponsor(sponsor: str):
    db = get_db()
    rows = db.execute(
        "SELECT id, timestamp, call_type, banker FROM briefings WHERE sponsor = ? ORDER BY id DESC LIMIT 5",
        (sponsor,),
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


def get_briefing_by_id(briefing_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM briefings WHERE id = ?", (briefing_id,)).fetchone()
    db.close()
    if row:
        result = dict(row)
        result["sections"] = json.loads(result.pop("sections_json"))
        return result
    return None


def insert_action(tool: str, sponsor: str, item: str, action: str, banker: str):
    import time
    db = get_db()
    db.execute(
        "INSERT INTO actions (timestamp, tool, sponsor, item, action, banker) VALUES (?, ?, ?, ?, ?, ?)",
        (time.strftime("%Y-%m-%dT%H:%M:%S"), tool, sponsor, item, action, banker),
    )
    db.commit()
    db.close()


def get_all_actions():
    db = get_db()
    rows = db.execute("SELECT * FROM actions ORDER BY id DESC").fetchall()
    db.close()
    return [dict(r) for r in rows]


STATE_FIELDS = ("pursued", "call_at", "followup_at", "dismissed")


def get_opportunity_states():
    """All per-opportunity banker state, keyed by opportunity_id."""
    db = get_db()
    rows = db.execute("SELECT * FROM opportunity_state").fetchall()
    db.close()
    return {r["opportunity_id"]: dict(r) for r in rows}


def upsert_opportunity_state(opportunity_id: str, sponsor: str, banker: str, patch: dict):
    """Merge a partial update into the stored state and return the full row."""
    import time
    db = get_db()
    row = db.execute(
        "SELECT * FROM opportunity_state WHERE opportunity_id = ?", (opportunity_id,)
    ).fetchone()
    state = dict(row) if row else {
        "opportunity_id": opportunity_id, "sponsor": sponsor, "banker": banker,
        "pursued": 0, "call_at": None, "followup_at": None, "dismissed": 0,
    }
    for key in STATE_FIELDS:
        if key in patch:
            value = patch[key]
            if key in ("pursued", "dismissed"):
                state[key] = 1 if value else 0
            else:
                state[key] = value or None
    if sponsor:
        state["sponsor"] = sponsor
    if banker:
        state["banker"] = banker
    state["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    db.execute(
        """INSERT OR REPLACE INTO opportunity_state
           (opportunity_id, sponsor, banker, pursued, call_at, followup_at, dismissed, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (state["opportunity_id"], state.get("sponsor"), state.get("banker"), state["pursued"],
         state["call_at"], state["followup_at"], state["dismissed"], state["updated_at"]),
    )
    db.commit()
    db.close()
    return state


def get_briefings_count() -> int:
    db = get_db()
    count = db.execute("SELECT COUNT(*) FROM briefings").fetchone()[0]
    db.close()
    return count


def get_recent_briefings(limit: int = 5):
    db = get_db()
    rows = db.execute(
        "SELECT id, timestamp, sponsor, call_type, banker FROM briefings ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


def search_all(query: str, limit: int = 20) -> list:
    """Full-text search across briefings, feedback, scout_results, and actions."""
    q = f"%{query}%"
    db = get_db()
    results = []

    # Briefings — match on sponsor, call_type, banker, or sections text
    rows = db.execute(
        "SELECT id, timestamp, sponsor, call_type, banker, sections_json FROM briefings "
        "WHERE sponsor LIKE ? OR call_type LIKE ? OR banker LIKE ? OR sections_json LIKE ? "
        "ORDER BY id DESC LIMIT ?",
        (q, q, q, q, limit),
    ).fetchall()
    for r in rows:
        results.append({
            "type": "Briefing",
            "title": f"{r['sponsor']} — {r['call_type']}",
            "meta": f"Banker: {r['banker']}  ·  {r['timestamp'][:10]}",
            "tab": "briefing",
            "id": r["id"],
        })

    # Feedback — match on sponsor, comment, section
    rows = db.execute(
        "SELECT id, timestamp, tool, sponsor, section, comment, banker FROM feedback "
        "WHERE sponsor LIKE ? OR comment LIKE ? OR section LIKE ? OR banker LIKE ? "
        "ORDER BY id DESC LIMIT ?",
        (q, q, q, q, limit),
    ).fetchall()
    for r in rows:
        results.append({
            "type": f"Feedback · {r['tool'] or 'unknown'}",
            "title": r["section"] or r["sponsor"] or "Feedback entry",
            "meta": f"{r['comment'] or '—'}  ·  {r['timestamp'][:10]}",
            "tab": "scanner",
            "id": r["id"],
        })

    # Scout results — match on sponsor or company
    rows = db.execute(
        "SELECT id, timestamp, sponsor, company, results_json FROM scout_results "
        "WHERE sponsor LIKE ? OR company LIKE ? OR results_json LIKE ? "
        "ORDER BY id DESC LIMIT ?",
        (q, q, q, limit),
    ).fetchall()
    for r in rows:
        label = r["sponsor"] or r["company"]
        results.append({
            "type": "Scout Result",
            "title": label,
            "meta": r["timestamp"][:10],
            "tab": "sponsormatch",
            "id": r["id"],
        })

    # Actions — match on sponsor, item, action
    rows = db.execute(
        "SELECT id, timestamp, tool, sponsor, item, action, banker FROM actions "
        "WHERE sponsor LIKE ? OR item LIKE ? OR action LIKE ? OR banker LIKE ? "
        "ORDER BY id DESC LIMIT ?",
        (q, q, q, q, limit),
    ).fetchall()
    for r in rows:
        results.append({
            "type": f"Action · {r['action'] or 'logged'}",
            "title": r["item"] or r["sponsor"] or "Action",
            "meta": f"Tool: {r['tool']}  ·  {r['timestamp'][:10]}",
            "tab": "dashboard",
            "id": r["id"],
        })

    db.close()
    # De-duplicate by (type, title) keeping first occurrence, cap total
    seen = set()
    unique = []
    for r in results:
        key = (r["type"], r["title"])
        if key not in seen:
            seen.add(key)
            unique.append(r)
        if len(unique) >= limit:
            break
    return unique
