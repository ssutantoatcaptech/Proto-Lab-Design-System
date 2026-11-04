Feature: Bolt-On Scout Action Buttons
  As a sponsor coverage banker reviewing bolt-on match recommendations
  I want to take an action on each match (Introduce, Pass, or Flag for Review)
  So that I can triage recommendations and my decisions are visible to leadership

  Background:
    Given the web application is running on port 8080
    And bolt-on scout results have been generated for "Clayton, Dubilier & Rice"
    And at least 3 match cards are displayed

  # --- FB-2: Action Buttons ---

  Scenario: Introduce a bolt-on match
    When the banker clicks "Introduce" on the match card for company "Meridian Specialty Insurance"
    Then a feedback entry is recorded with:
      | tool   | bolt_on_scout              |
      | sponsor| Clayton, Dubilier & Rice   |
      | item   | Meridian Specialty Insurance|
      | action | introduce                  |
    And the "Introduce" button has the "done" CSS class
    And the "Introduce" button has a green filled background
    And a toast notification displays "Action recorded: introduce"

  Scenario: Pass on a bolt-on match
    When the banker clicks "Pass" on a match card
    Then a feedback entry is recorded with action "pass"
    And the "Pass" button has the "done" CSS class
    And the "Pass" button has a gray filled background

  Scenario: Flag a bolt-on match for review
    When the banker clicks "Flag for Review" on a match card
    Then a feedback entry is recorded with action "flag_for_review"
    And the "Flag for Review" button has the "done" CSS class
    And the "Flag for Review" button has an amber filled background

  Scenario: Change an action on a match card
    Given the banker previously clicked "Introduce" on a match card
    When the banker clicks "Pass" on the same match card
    Then the "Introduce" button loses the "done" CSS class
    And the "Pass" button gains the "done" CSS class
    And 2 feedback entries exist (original "introduce" and new "pass")

  Scenario: Each match card has independent actions
    Given 3 match cards are visible
    When the banker clicks "Introduce" on match card 1
    And the banker clicks "Pass" on match card 2
    And the banker clicks "Flag for Review" on match card 3
    Then match card 1 shows "Introduce" as active
    And match card 2 shows "Pass" as active
    And match card 3 shows "Flag for Review" as active
    And 3 feedback entries are recorded

  Scenario: Action buttons include the correct sponsor name
    When the banker clicks "Introduce" on any match card
    Then the feedback entry sponsor field is "Clayton, Dubilier & Rice"
    And the feedback entry item field is the company name from that card
