Feature: Feedback Backend API
  As a developer building the feedback system
  I need a backend API that stores and retrieves feedback entries with aggregations
  So that all tools can record banker actions and the Leadership View can display them

  Background:
    Given the web application is running on port 8080
    And no feedback entries exist (clean state)

  # --- FB-5: POST /api/feedback ---

  Scenario: Record a briefing rating
    When a POST request is sent to "/api/feedback" with JSON:
      """
      {
        "tool": "briefing",
        "sponsor": "GTCR",
        "section": "Executive Summary",
        "rating": "up",
        "banker": "Eric Welsh"
      }
      """
    Then the response status code is 200
    And the response JSON contains:
      | field          | value    |
      | status         | recorded |
      | total_feedback | 1        |

  Scenario: Record a bolt-on scout action
    When a POST request is sent to "/api/feedback" with JSON:
      """
      {
        "tool": "bolt_on_scout",
        "sponsor": "Clayton, Dubilier & Rice",
        "item": "Meridian Specialty Insurance",
        "action": "introduce",
        "banker": "Jeff Tuckle"
      }
      """
    Then the response status code is 200
    And the response JSON field "status" is "recorded"

  Scenario: Record a scanner action
    When a POST request is sent to "/api/feedback" with JSON:
      """
      {
        "tool": "scanner",
        "sponsor": "GTCR",
        "item": "GTCR-OPP-001",
        "action": "pursue"
      }
      """
    Then the response status code is 200

  Scenario: Missing optional fields default to empty strings
    When a POST request is sent to "/api/feedback" with JSON:
      """
      {
        "tool": "briefing",
        "sponsor": "GTCR"
      }
      """
    Then the response status code is 200
    And the stored entry has:
      | field   | value      |
      | section |            |
      | item    |            |
      | rating  |            |
      | action  |            |
      | comment |            |
      | banker  | Demo User  |

  Scenario: Server adds a timestamp to each entry
    When a POST request is sent to "/api/feedback" with tool "briefing" and sponsor "GTCR"
    Then the stored entry has a "timestamp" field matching ISO format "YYYY-MM-DDTHH:MM:SS"

  Scenario: Feedback counter increments
    When 3 POST requests are sent to "/api/feedback"
    Then the third response has total_feedback equal to 3

  # --- FB-5: GET /api/feedback ---

  Scenario: Retrieve feedback with aggregations
    Given the following feedback entries have been recorded:
      | tool          | sponsor | rating | action    |
      | briefing      | GTCR    | up     |           |
      | briefing      | GTCR    | down   |           |
      | bolt_on_scout | CD&R    |        | introduce |
      | scanner       | GTCR    |        | pursue    |
    When a GET request is sent to "/api/feedback"
    Then the response JSON contains:
      | field | value |
      | total | 4     |
    And "by_tool" contains "briefing" with count 2
    And "by_tool" contains "bolt_on_scout" with count 1
    And "by_tool" contains "scanner" with count 1
    And "by_rating" contains "up" with count 1
    And "by_rating" contains "down" with count 1
    And "by_action" contains "introduce" with count 1
    And "by_action" contains "pursue" with count 1

  Scenario: Entries returned in reverse chronological order
    Given entries were recorded in order: entry-1 (oldest), entry-2, entry-3 (newest)
    When a GET request is sent to "/api/feedback"
    Then the "entries" array has entry-3 at index 0
    And the "entries" array has entry-1 at index 2

  Scenario: Empty feedback returns zero counts
    When a GET request is sent to "/api/feedback"
    Then the response JSON contains:
      | field   | value |
      | total   | 0     |
    And "entries" is an empty array
    And "by_tool" is an empty object
    And "by_action" is an empty object
    And "by_rating" is an empty object

  # --- FB-5: In-Memory Storage ---

  Scenario: Feedback is stored in memory only
    Given 5 feedback entries have been recorded
    When the application server is restarted
    Then GET "/api/feedback" returns total 0
    And all previously recorded entries are gone
