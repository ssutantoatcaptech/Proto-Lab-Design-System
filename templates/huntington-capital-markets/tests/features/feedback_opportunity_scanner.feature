Feature: Opportunity Scanner Action Buttons
  As a sponsor coverage banker reviewing AI-predicted transaction opportunities
  I want to take an action on each opportunity (Pursue, Schedule Call, or Dismiss)
  So that the predicted pipeline reflects actual banker intent

  Background:
    Given the web application is running on port 8080
    And the Opportunity Scanner tab is active
    And scanner results are loaded for all sponsors

  # --- FB-3: Action Buttons ---

  Scenario: Pursue an opportunity
    When the banker clicks "Pursue" on opportunity "GTCR-OPP-001"
    Then a feedback entry is recorded with:
      | tool   | scanner       |
      | sponsor| GTCR          |
      | item   | GTCR-OPP-001  |
      | action | pursue        |
    And the "Pursue" button has the "done" CSS class
    And a toast notification displays "Action recorded: pursue"

  Scenario: Schedule a call for an opportunity
    When the banker clicks "Schedule Call" on an opportunity
    Then a feedback entry is recorded with action "schedule_call"
    And the "Schedule Call" button has the "done" CSS class

  Scenario: Dismiss an opportunity
    When the banker clicks "Dismiss" on an opportunity
    Then a feedback entry is recorded with action "dismiss"
    And the "Dismiss" button has the "done" CSS class
    And the "Dismiss" button has a gray filled background

  Scenario: Change an action on an opportunity card
    Given the banker previously clicked "Pursue" on opportunity "GTCR-OPP-001"
    When the banker clicks "Dismiss" on the same opportunity
    Then the "Pursue" button loses the "done" CSS class
    And the "Dismiss" button gains the "done" CSS class
    And 2 feedback entries exist for that opportunity

  Scenario: Actions across different sponsors are independent
    When the banker clicks "Pursue" on a GTCR opportunity
    And the banker clicks "Dismiss" on a Stone Point Capital opportunity
    Then 2 feedback entries are recorded with different sponsors
    And each opportunity card retains its own action state
