"""
Bolt-On Scout Orchestrator — Bolt-On Scout feature.

Flow:
  Stage 1 (sequential):  Deal Screener scores all companies (fast, throughput-optimized)
  Stage 2 (sequential):  Thesis Validator validates top 10 against sponsor's investment thesis
  Stage 3 (sequential):  Introduction Writer drafts rationales for top 5 validated candidates
  Stage 4 (sequential):  Synthesizer produces ranked Top 5 Introduction view

NOT YET INTEGRATED — stub only. Integration into /api/boltonscout is a follow-on ticket.
"""

from dataclasses import dataclass


@dataclass
class AgentResult:
    agent_name: str
    perspective: str
    content: str
    duration_seconds: float = 0.0


@dataclass
class BoltonScoutPipelineResult:
    sponsor: str
    generated_date: str
    screening: AgentResult = None       # Stage 1: all companies scored
    validation: AgentResult = None      # Stage 2: top 10 thesis-validated
    introductions: AgentResult = None   # Stage 3: top 5 rationales written
    final_output: AgentResult = None    # Stage 4: synthesized Top 5 view


# TODO: implement run_boltonscout_pipeline(client, sponsor_name)
# Stage 1: deal_screener(all MIDDLE_MARKET_CLIENTS vs sponsor criteria)
# Stage 2: thesis_validator(top 10 from stage 1)
# Stage 3: introduction_writer(top 5 validated)
# Stage 4: synthesizer(all outputs) → ranked Top 5 Introduction pack
