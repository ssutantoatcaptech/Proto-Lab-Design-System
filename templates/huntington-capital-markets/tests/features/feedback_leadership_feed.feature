Feature: Leadership View Feedback Activity Feed
  As head of capital markets (Chris Wood)
  I want to see a real-time feed of all banker actions across AI tools
  So that I can monitor which recommendations my team is acting on

  Background:
    Given the web application is running on port 8080

  # --- FB-4: Activity Feed ---

  Scenario: Activity feed loads on tab switch
    Given the following feedback has been recorded:
      | tool          | sponsor | section           | action    | rating |
      | briefing      | GTCR    | Executive Summary |           | up     |
      | bolt_on_scout | CD&R    |                   | introduce |        |
      | scanner       | GTCR    |                   | pursue    |        |
    When the banker navigates to the Leadership View tab
    Then a GET request is made to "/api/feedback"
    And the feedback feed container displays 3 entries

  Scenario: Feed entries are in reverse chronological order
    Given feedback entries were recorded in order: entry-A, entry-B, entry-C
    When the Leadership View loads
    Then entry-C appears first in the feed
    And entry-A appears last in the feed

  Scenario: Briefing rating entry format
    Given a feedback entry exists:
      | tool    | briefing          |
      | sponsor | GTCR              |
      | section | Executive Summary |
      | rating  | up                |
    When the Leadership View loads
    Then the feed entry shows icon "B" with CSS class "briefing"
    And the feed entry shows tool name "Sponsor Briefing"
    And the feed entry shows sponsor "GTCR"
    And the feed entry description reads "Rated Executive Summary useful"
    And the feed entry shows the timestamp and banker name

  Scenario: Briefing negative rating entry format
    Given a feedback entry exists with tool "briefing", rating "down", section "Portfolio Analysis"
    When the Leadership View loads
    Then the feed entry description reads "Rated Portfolio Analysis not useful"

  Scenario: Briefing comment entry format
    Given a feedback entry exists:
      | tool    | briefing                  |
      | section | Talking Points            |
      | rating  | comment                   |
      | comment | Add rate cap discussion   |
    When the Leadership View loads
    Then the feed entry description reads "Commented on Talking Points: \"Add rate cap discussion\""

  Scenario: Bolt-On Scout action entry format
    Given a feedback entry exists:
      | tool   | bolt_on_scout              |
      | sponsor| CD&R                       |
      | item   | Meridian Specialty Insurance|
      | action | introduce                  |
    When the Leadership View loads
    Then the feed entry shows icon "S" with CSS class "scout"
    And the feed entry shows tool name "Bolt-On Scout"
    And the feed entry description reads "introduce on Meridian Specialty Insurance"

  Scenario: Scanner action entry format
    Given a feedback entry exists:
      | tool   | scanner       |
      | sponsor| GTCR          |
      | item   | GTCR-OPP-001  |
      | action | pursue        |
    When the Leadership View loads
    Then the feed entry shows icon "O" with CSS class "scanner"
    And the feed entry shows tool name "Opportunity Scanner"
    And the feed entry description reads "pursue on GTCR-OPP-001"

  Scenario: Summary counts at top of feed
    Given the following feedback totals:
      | type          | count |
      | rating: up    | 5     |
      | rating: down  | 2     |
      | action: introduce   | 3 |
      | action: pursue      | 4 |
      | action: pass        | 1 |
      | action: dismiss     | 2 |
    When the Leadership View loads
    Then the summary bar shows "5 positive"
    And the summary bar shows "2 negative" if down ratings exist
    And the summary bar shows "3 introductions" in green
    And the summary bar shows "4 pursuing" in green
    And the summary bar shows "1 passed"
    And the summary bar shows "2 dismissed"

  Scenario: Empty feed state
    Given no feedback has been recorded
    When the Leadership View loads
    Then the feed container shows "No feedback recorded yet. Use the other tools and provide ratings to see activity here."

  Scenario: Feed limits to 20 entries
    Given 25 feedback entries have been recorded
    When the Leadership View loads
    Then exactly 20 entries are displayed in the feed
    And the 20 entries are the most recent ones
