Feature: Sponsor Briefing Feedback
  As a sponsor coverage MD reviewing an AI-generated briefing pack
  I want to rate each section and leave optional comments
  So that the platform learns which content adds value

  Background:
    Given the web application is running on port 8080
    And a briefing pack has been generated for sponsor "GTCR"

  # --- FB-1: Section-Level Rating ---

  Scenario: Rate a briefing section as useful
    When the MD clicks the thumbs-up button on the "Executive Summary" section
    Then a feedback entry is recorded with:
      | tool    | briefing          |
      | sponsor | GTCR              |
      | section | Executive Summary |
      | rating  | up                |
    And the thumbs-up button has the "active-up" CSS class
    And the thumbs-down button does not have the "active-down" CSS class
    And a toast notification displays "Feedback recorded: up"

  Scenario: Rate a briefing section as not useful
    When the MD clicks the thumbs-down button on the "Portfolio Analysis & Financing Opportunities" section
    Then a feedback entry is recorded with:
      | tool    | briefing                                    |
      | sponsor | GTCR                                        |
      | section | Portfolio Analysis & Financing Opportunities |
      | rating  | down                                        |
    And the thumbs-down button has the "active-down" CSS class

  Scenario: Comment field appears after rating
    Given the comment input on the "Executive Summary" section is hidden
    When the MD clicks the thumbs-up button on the "Executive Summary" section
    Then the comment input on the "Executive Summary" section becomes visible
    And the comment input has placeholder text "Optional comment..."

  Scenario: Submit an optional comment on a section
    Given the MD has rated the "MD Call Talking Points" section as "up"
    When the MD types "Missed the Assured Partners refinancing angle" in the comment field
    And the MD presses Enter
    Then a feedback entry is recorded with:
      | tool    | briefing                                        |
      | sponsor | GTCR                                            |
      | section | MD Call Talking Points                           |
      | rating  | comment                                         |
      | comment | Missed the Assured Partners refinancing angle    |
    And the comment input placeholder changes to "Comment saved!"
    And after 2 seconds the placeholder reverts to "Optional comment..."

  Scenario: Empty comment is not submitted
    Given the MD has rated a section
    When the MD presses Enter in the comment field without typing anything
    Then no feedback entry is recorded for a comment

  Scenario: Change a rating on the same section
    Given the MD previously clicked thumbs-up on the "Executive Summary" section
    When the MD clicks the thumbs-down button on the "Executive Summary" section
    Then the thumbs-up button loses the "active-up" CSS class
    And the thumbs-down button gains the "active-down" CSS class
    And a new feedback entry is recorded with rating "down"

  Scenario: Each section has independent feedback controls
    When the MD clicks thumbs-up on the "Executive Summary" section
    And the MD clicks thumbs-down on the "MD Call Talking Points" section
    Then the "Executive Summary" section shows thumbs-up as active
    And the "MD Call Talking Points" section shows thumbs-down as active
    And 2 feedback entries are recorded
