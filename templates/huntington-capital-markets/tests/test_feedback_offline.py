"""
Offline test suite for the Feedback Mechanism (FB-1 through FB-5).
Tests the backend API directly without requiring a browser or running server.

Uses Flask's test client to exercise POST /api/feedback and GET /api/feedback.

Run: python3 tests/test_feedback_offline.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

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


def get_test_client():
    """Create a fresh Flask test client with empty feedback state."""
    from web.app import app, _feedback
    _feedback.clear()
    app.config["TESTING"] = True
    return app.test_client()


def test_fb5_post_briefing_rating():
    """FB-5 / TC-FB-01: POST /api/feedback records a briefing rating."""
    print("\n--- FB-5: POST /api/feedback -- Briefing Rating ---")

    client = get_test_client()
    resp = client.post("/api/feedback", json={
        "tool": "briefing",
        "sponsor": "GTCR",
        "section": "Executive Summary",
        "rating": "up",
        "banker": "Eric Welsh",
    })
    data = resp.get_json()

    check("FB-05", "Response status is 200", resp.status_code == 200, f"Got {resp.status_code}")
    check("FB-05", "Response status field is 'recorded'", data.get("status") == "recorded", f"Got {data.get('status')}")
    check("FB-05", "total_feedback is 1", data.get("total_feedback") == 1, f"Got {data.get('total_feedback')}")


def test_fb5_post_bolt_on_action():
    """FB-5 / TC-FB-02: POST /api/feedback records a bolt-on scout action."""
    print("\n--- FB-5: POST /api/feedback -- Bolt-On Scout Action ---")

    client = get_test_client()
    resp = client.post("/api/feedback", json={
        "tool": "bolt_on_scout",
        "sponsor": "Clayton, Dubilier & Rice",
        "item": "Meridian Specialty Insurance",
        "action": "introduce",
    })
    data = resp.get_json()

    check("FB-05", "Response status is 200", resp.status_code == 200)
    check("FB-05", "Status is recorded", data.get("status") == "recorded")


def test_fb5_post_scanner_action():
    """FB-5 / TC-FB-03: POST /api/feedback records a scanner action."""
    print("\n--- FB-5: POST /api/feedback -- Scanner Action ---")

    client = get_test_client()
    resp = client.post("/api/feedback", json={
        "tool": "scanner",
        "sponsor": "GTCR",
        "item": "GTCR-OPP-001",
        "action": "pursue",
    })
    data = resp.get_json()

    check("FB-05", "Response status is 200", resp.status_code == 200)
    check("FB-05", "Status is recorded", data.get("status") == "recorded")


def test_fb5_post_defaults():
    """FB-5 / TC-FB-04: Missing optional fields default correctly."""
    print("\n--- FB-5: POST /api/feedback -- Default Values ---")

    client = get_test_client()
    resp = client.post("/api/feedback", json={
        "tool": "briefing",
        "sponsor": "GTCR",
    })
    data = resp.get_json()

    check("FB-05", "Response is 200", resp.status_code == 200)

    # Retrieve and inspect the stored entry
    get_resp = client.get("/api/feedback")
    entries = get_resp.get_json().get("entries", [])
    check("FB-05", "One entry stored", len(entries) == 1, f"Got {len(entries)}")

    if entries:
        e = entries[0]
        check("FB-05", "section defaults to empty string", e.get("section") == "", f"Got '{e.get('section')}'")
        check("FB-05", "item defaults to empty string", e.get("item") == "", f"Got '{e.get('item')}'")
        check("FB-05", "rating defaults to None/empty", e.get("rating") is None or e.get("rating") == "", f"Got '{e.get('rating')}'")
        check("FB-05", "action defaults to empty string", e.get("action") == "", f"Got '{e.get('action')}'")
        check("FB-05", "comment defaults to empty string", e.get("comment") == "", f"Got '{e.get('comment')}'")
        check("FB-05", "banker defaults to 'Demo User'", e.get("banker") == "Demo User", f"Got '{e.get('banker')}'")


def test_fb5_post_timestamp():
    """FB-5 / TC-FB-05: Server adds timestamp to each entry."""
    print("\n--- FB-5: POST /api/feedback -- Timestamp Generation ---")

    client = get_test_client()
    client.post("/api/feedback", json={"tool": "briefing", "sponsor": "GTCR"})

    get_resp = client.get("/api/feedback")
    entries = get_resp.get_json().get("entries", [])

    if entries:
        ts = entries[0].get("timestamp", "")
        check("FB-05", "Timestamp is present", bool(ts), "No timestamp found")
        check("FB-05", "Timestamp matches ISO format (contains T separator)",
              "T" in ts and len(ts) >= 19,
              f"Got '{ts}'")
    else:
        check("FB-05", "Entry exists to check timestamp", False)


def test_fb5_counter_increments():
    """FB-5 / TC-FB-06: Feedback counter increments correctly."""
    print("\n--- FB-5: POST /api/feedback -- Counter Incrementing ---")

    client = get_test_client()

    for i in range(1, 6):
        resp = client.post("/api/feedback", json={
            "tool": "briefing",
            "sponsor": "GTCR",
            "rating": "up",
        })
        data = resp.get_json()
        check("FB-05", f"After {i} submissions, total_feedback = {i}",
              data.get("total_feedback") == i,
              f"Got {data.get('total_feedback')}")


def test_fb5_get_aggregations():
    """FB-5 / TC-FB-07: GET /api/feedback returns correct aggregations."""
    print("\n--- FB-5: GET /api/feedback -- Aggregations ---")

    client = get_test_client()

    # Submit a mix of feedback
    entries = [
        {"tool": "briefing", "sponsor": "GTCR", "section": "Executive Summary", "rating": "up"},
        {"tool": "briefing", "sponsor": "GTCR", "section": "Portfolio Analysis", "rating": "down"},
        {"tool": "bolt_on_scout", "sponsor": "CD&R", "item": "TestCo", "action": "introduce"},
        {"tool": "scanner", "sponsor": "GTCR", "item": "GTCR-OPP-001", "action": "pursue"},
        {"tool": "scanner", "sponsor": "Stone Point Capital", "item": "SP-OPP-001", "action": "dismiss"},
    ]
    for e in entries:
        client.post("/api/feedback", json=e)

    resp = client.get("/api/feedback")
    data = resp.get_json()

    check("FB-05", "Total is 5", data.get("total") == 5, f"Got {data.get('total')}")

    by_tool = data.get("by_tool", {})
    check("FB-05", "by_tool: briefing = 2", by_tool.get("briefing") == 2, f"Got {by_tool.get('briefing')}")
    check("FB-05", "by_tool: bolt_on_scout = 1", by_tool.get("bolt_on_scout") == 1, f"Got {by_tool.get('bolt_on_scout')}")
    check("FB-05", "by_tool: scanner = 2", by_tool.get("scanner") == 2, f"Got {by_tool.get('scanner')}")

    by_rating = data.get("by_rating", {})
    check("FB-05", "by_rating: up = 1", by_rating.get("up") == 1, f"Got {by_rating.get('up')}")
    check("FB-05", "by_rating: down = 1", by_rating.get("down") == 1, f"Got {by_rating.get('down')}")

    by_action = data.get("by_action", {})
    check("FB-05", "by_action: introduce = 1", by_action.get("introduce") == 1, f"Got {by_action.get('introduce')}")
    check("FB-05", "by_action: pursue = 1", by_action.get("pursue") == 1, f"Got {by_action.get('pursue')}")
    check("FB-05", "by_action: dismiss = 1", by_action.get("dismiss") == 1, f"Got {by_action.get('dismiss')}")


def test_fb5_get_reverse_chronological():
    """FB-5 / TC-FB-08: Entries returned in reverse chronological order."""
    print("\n--- FB-5: GET /api/feedback -- Reverse Chronological Order ---")

    client = get_test_client()

    # Submit entries with identifiable sponsors
    for sponsor in ["First", "Second", "Third"]:
        client.post("/api/feedback", json={"tool": "briefing", "sponsor": sponsor})

    resp = client.get("/api/feedback")
    entries = resp.get_json().get("entries", [])

    check("FB-05", "3 entries returned", len(entries) == 3, f"Got {len(entries)}")
    if len(entries) == 3:
        check("FB-05", "Newest entry (Third) is first", entries[0].get("sponsor") == "Third",
              f"Got {entries[0].get('sponsor')}")
        check("FB-05", "Oldest entry (First) is last", entries[2].get("sponsor") == "First",
              f"Got {entries[2].get('sponsor')}")


def test_fb5_get_empty():
    """FB-5 / TC-FB-09: Empty feedback returns zero counts."""
    print("\n--- FB-5: GET /api/feedback -- Empty State ---")

    client = get_test_client()
    resp = client.get("/api/feedback")
    data = resp.get_json()

    check("FB-05", "Total is 0", data.get("total") == 0, f"Got {data.get('total')}")
    check("FB-05", "Entries is empty list", data.get("entries") == [], f"Got {data.get('entries')}")
    check("FB-05", "by_tool is empty dict", data.get("by_tool") == {}, f"Got {data.get('by_tool')}")
    check("FB-05", "by_action is empty dict", data.get("by_action") == {}, f"Got {data.get('by_action')}")
    check("FB-05", "by_rating is empty dict", data.get("by_rating") == {}, f"Got {data.get('by_rating')}")


def test_fb5_entry_fields_stored():
    """FB-5 / TC-FB-10: All submitted fields are stored and retrievable."""
    print("\n--- FB-5: Entry Field Storage ---")

    client = get_test_client()
    client.post("/api/feedback", json={
        "tool": "bolt_on_scout",
        "sponsor": "GTCR",
        "section": "top-matches",
        "item": "Meridian Specialty Insurance",
        "rating": "up",
        "action": "introduce",
        "comment": "Great match, schedule call this week",
        "banker": "Eric Welsh",
    })

    resp = client.get("/api/feedback")
    entries = resp.get_json().get("entries", [])

    check("FB-05", "One entry stored", len(entries) == 1)
    if entries:
        e = entries[0]
        check("FB-05", "tool = bolt_on_scout", e.get("tool") == "bolt_on_scout")
        check("FB-05", "sponsor = GTCR", e.get("sponsor") == "GTCR")
        check("FB-05", "section = top-matches", e.get("section") == "top-matches")
        check("FB-05", "item = Meridian Specialty Insurance", e.get("item") == "Meridian Specialty Insurance")
        check("FB-05", "rating = up", e.get("rating") == "up")
        check("FB-05", "action = introduce", e.get("action") == "introduce")
        check("FB-05", "comment stored", e.get("comment") == "Great match, schedule call this week")
        check("FB-05", "banker = Eric Welsh", e.get("banker") == "Eric Welsh")


def test_fb1_feedback_bar_in_template():
    """FB-1: Verify that the feedback bar HTML structure exists in the template."""
    print("\n--- FB-1: Feedback Bar in Template ---")

    template_path = os.path.join(os.path.dirname(__file__), "..", "web", "templates", "index.html")
    with open(template_path) as f:
        html = f.read()

    check("FB-01", "feedbackBarHTML function defined", "function feedbackBarHTML(" in html)
    check("FB-01", "Feedback bar has up button", "Yes</button>" in html or "&#9650; Yes" in html)
    check("FB-01", "Feedback bar has down button", "No</button>" in html or "&#9660; No" in html)
    check("FB-01", "Feedback bar has comment input", "fb-comment" in html)
    check("FB-01", "rateBriefingSection function defined", "function rateBriefingSection(" in html)
    check("FB-01", "submitSectionComment function defined", "function submitSectionComment(" in html)
    check("FB-01", "Feedback bar is added to each briefing section", "feedbackBarHTML('briefing'" in html)


def test_fb2_bolt_on_buttons_in_template():
    """FB-2: Verify bolt-on scout action buttons exist in the template."""
    print("\n--- FB-2: Bolt-On Scout Action Buttons in Template ---")

    template_path = os.path.join(os.path.dirname(__file__), "..", "web", "templates", "index.html")
    with open(template_path) as f:
        html = f.read()

    check("FB-02", "Introduce button exists", "action-btn introduce" in html)
    check("FB-02", "Pass button exists", "action-btn pass" in html)
    check("FB-02", "Flag for Review button exists", "action-btn flag" in html)
    check("FB-02", "scoutAction function defined", "function scoutAction(" in html)
    check("FB-02", "Introduce calls scoutAction with 'introduce'", "scoutAction(" in html and "'introduce'" in html)
    check("FB-02", "Pass calls scoutAction with 'pass'", "'pass'" in html)
    check("FB-02", "Flag calls scoutAction with 'flag_for_review'", "'flag_for_review'" in html)


def test_fb3_scanner_buttons_in_template():
    """FB-3: Verify opportunity scanner action buttons exist in the template."""
    print("\n--- FB-3: Opportunity Scanner Action Buttons in Template ---")

    template_path = os.path.join(os.path.dirname(__file__), "..", "web", "templates", "index.html")
    with open(template_path) as f:
        html = f.read()

    check("FB-03", "Pursue button exists", ">Pursue<" in html)
    check("FB-03", "Schedule Call button exists", ">Schedule Call<" in html)
    check("FB-03", "Dismiss button exists", ">Dismiss<" in html)
    check("FB-03", "scannerAction function defined", "function scannerAction(" in html)
    check("FB-03", "Pursue calls scannerAction with 'pursue'", "'pursue'" in html)
    check("FB-03", "Schedule Call calls scannerAction with 'schedule_call'", "'schedule_call'" in html)
    check("FB-03", "Dismiss calls scannerAction with 'dismiss'", "'dismiss'" in html)


def test_fb4_leadership_feed_in_template():
    """FB-4: Verify leadership activity feed structure exists in the template."""
    print("\n--- FB-4: Leadership Feed in Template ---")

    template_path = os.path.join(os.path.dirname(__file__), "..", "web", "templates", "index.html")
    with open(template_path) as f:
        html = f.read()

    check("FB-04", "Feedback feed container exists", 'id="feedback-feed"' in html)
    check("FB-04", "loadFeedbackFeed function defined", "function loadFeedbackFeed(" in html)
    check("FB-04", "Feed loads on leadership tab switch", "loadFeedbackFeed()" in html)
    check("FB-04", "Feed fetches from /api/feedback", "fetch('/api/feedback')" in html)
    check("FB-04", "Tool icon mapping defined (briefing=B)", "briefing: 'B'" in html)
    check("FB-04", "Tool icon mapping defined (scout=S)", "bolt_on_scout: 'S'" in html)
    check("FB-04", "Tool icon mapping defined (scanner=O)", "scanner: 'O'" in html)
    check("FB-04", "Empty state message exists", "No feedback recorded yet" in html)
    check("FB-04", "Feed limits to 20 entries", ".slice(0, 20)" in html)
    check("FB-04", "Summary counts rendered", "by_action.introduce" in html)


def test_fb5_api_routes_registered():
    """FB-5: Verify both feedback API routes are registered."""
    print("\n--- FB-5: API Routes Registered ---")

    from web.app import app

    # Flask registers POST and GET as separate rules for the same URL
    feedback_rules = [r for r in app.url_map.iter_rules() if r.rule == "/api/feedback"]
    all_methods = set()
    for rule in feedback_rules:
        all_methods.update(rule.methods)

    check("FB-05", "/api/feedback route(s) exist", len(feedback_rules) >= 1, f"Found {len(feedback_rules)} rules")
    check("FB-05", "POST method allowed on /api/feedback", "POST" in all_methods, f"Methods: {all_methods}")
    check("FB-05", "GET method allowed on /api/feedback", "GET" in all_methods, f"Methods: {all_methods}")


def test_fb_css_styles():
    """FB-1/2/3: Verify feedback-related CSS styles exist."""
    print("\n--- FB-1/2/3: Feedback CSS Styles ---")

    template_path = os.path.join(os.path.dirname(__file__), "..", "web", "templates", "index.html")
    with open(template_path) as f:
        html = f.read()

    check("FB-01", "feedback-bar CSS class defined", ".feedback-bar" in html)
    check("FB-01", "active-up CSS styling defined", "active-up" in html)
    check("FB-01", "active-down CSS styling defined", "active-down" in html)
    check("FB-02", "action-btn.introduce CSS defined", ".action-btn.introduce" in html)
    check("FB-02", "action-btn.introduce.done CSS defined", ".action-btn.introduce.done" in html)
    check("FB-02", "action-btn.pass CSS defined", ".action-btn.pass" in html)
    check("FB-02", "action-btn.flag CSS defined", ".action-btn.flag" in html)
    check("FB-03", "action-btn.dismiss CSS defined", ".action-btn.dismiss" in html)
    check("FB-03", "action-btn.dismiss.done CSS defined", ".action-btn.dismiss.done" in html)
    check("FB-04", "feedback-feed CSS defined", ".feedback-feed" in html)
    check("FB-04", "feed-entry CSS defined", ".feed-entry" in html or "feed-entry" in html)


if __name__ == "__main__":
    print("=" * 60)
    print("  HUNTINGTON CAPITAL MARKETS AI")
    print("  Feedback Mechanism Offline Test Suite")
    print("  Covers: FB-1 through FB-5")
    print("=" * 60)

    test_fb5_post_briefing_rating()
    test_fb5_post_bolt_on_action()
    test_fb5_post_scanner_action()
    test_fb5_post_defaults()
    test_fb5_post_timestamp()
    test_fb5_counter_increments()
    test_fb5_get_aggregations()
    test_fb5_get_reverse_chronological()
    test_fb5_get_empty()
    test_fb5_entry_fields_stored()
    test_fb1_feedback_bar_in_template()
    test_fb2_bolt_on_buttons_in_template()
    test_fb3_scanner_buttons_in_template()
    test_fb4_leadership_feed_in_template()
    test_fb5_api_routes_registered()
    test_fb_css_styles()

    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {results['pass']} passed, {results['fail']} failed, {results['warn']} warnings")
    print(f"{'=' * 60}")

    sys.exit(1 if results["fail"] > 0 else 0)
