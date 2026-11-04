# Huntington Capital Markets AI

Pre-sales engagement for CapTech Consulting with Huntington Bank's Capital Markets division. Building AI-powered PoCs and a strategic roadmap for Chris Wood's capital markets offsite (May 13-14, 2026).

## Key People

- **Chris Wood** — Executive Managing Director, Capital Markets and Sponsor Coverage, Huntington National Bank. Hired from Truist March 2025. Primary stakeholder.
- **Michelle Mills** — COO for Capital Markets segment, coordinating logistics
- **Genie Donnaly** — CapTech Account Manager for Huntington
- **Paul Given** — CapTech Engagement Lead

## Project Structure

- `configs/` — YAML configurations (if applicable)
- `poc1_sponsor_briefing/` — PoC 1: Sponsor Briefing Pack Automation
- `agents/` — Genie (Domain Expert), Dmitri (Developer), Paul (Tester) agent definitions
- `*.md` — Research, use cases, briefings, and context documents

## Three-Agent Workflow

| Agent | Role | Color |
|-------|------|-------|
| **Genie** | Capital Markets domain expert — defines use cases, validates business value, writes executive-ready content | Blue |
| **Dmitri** | Senior Developer — implements PoCs, prompt engineering, data integration | Green |
| **Paul** | QA & Demo specialist — tests PoCs, validates output quality, builds demo scripts | Red |

## Strategic Context

- Huntington is aggressively building Capital Markets under Chris Wood
- $4T in unsold PE assets = sponsor coverage is the #1 growth priority
- Middle market client book is the differentiator — matching founder-owned businesses to PE bolt-on themes
- Chris wants to move up league tables past regional peers (KeyBanc, Citizens, Regions)
- The offsite demo should show practical, banker-ready AI tools, not slides about AI

## Tech Stack

- Python 3.10+
- Anthropic Claude API (opus for reasoning, sonnet for extraction)
- Data: CRM stubs, SEC filings, market data (stubbed for PoC)
