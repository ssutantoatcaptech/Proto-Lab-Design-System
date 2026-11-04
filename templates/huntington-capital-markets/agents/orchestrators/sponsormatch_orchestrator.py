"""
Sponsor Match Orchestrator — Sponsor Match (Reverse Scout) feature.

Flow:
  Stage 1 (sequential):  Company Profiler builds investment thesis for the sell-side company
  Stage 2 (sequential):  Sponsor Matcher scores all sponsors against the thesis
  Stage 3 (sequential):  Outreach Drafter writes tailored outreach for top 5 sponsors
  Stage 4 (sequential):  Synthesizer produces ranked sponsor list with outreach strategy

NOT YET INTEGRATED — stub only. Integration into /api/sponsormatch is a follow-on ticket.
"""

from dataclasses import dataclass


@dataclass
class AgentResult:
    agent_name: str
    perspective: str
    content: str
    duration_seconds: float = 0.0


@dataclass
class SponsorMatchPipelineResult:
    company_name: str
    generated_date: str
    company_profile: AgentResult = None  # Stage 1: investment thesis
    sponsor_scores: AgentResult = None   # Stage 2: all sponsors ranked
    outreach: AgentResult = None         # Stage 3: top 5 outreach drafts
    final_output: AgentResult = None     # Stage 4: synthesized sponsor list


# TODO: implement run_sponsormatch_pipeline(client, company_name)
# Stage 1: company_profiler(company data from MIDDLE_MARKET_CLIENTS)
# Stage 2: sponsor_matcher(company profile vs all SPONSORS)
# Stage 3: outreach_drafter(top 5 matched sponsors)
# Stage 4: synthesizer(all outputs) → ranked sponsor list with outreach strategy
