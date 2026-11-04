"""
Opportunity Scanner Orchestrator — Opportunity Scanner feature.

Flow:
  Stage 1 (parallel):    Market Analyst + Portfolio Monitor run concurrently
  Stage 2 (sequential):  Synthesizer correlates market windows with portfolio events
                         and produces prioritized opportunity list

NOT YET INTEGRATED — stub only. Integration into /api/scanner is a follow-on ticket.
"""

from dataclasses import dataclass


@dataclass
class AgentResult:
    agent_name: str
    perspective: str
    content: str
    duration_seconds: float = 0.0


@dataclass
class ScannerPipelineResult:
    generated_date: str
    market_conditions: AgentResult = None   # Stage 1a (parallel)
    portfolio_events: AgentResult = None    # Stage 1b (parallel)
    final_output: AgentResult = None        # Stage 2: synthesized opportunity list


# TODO: implement run_scanner_pipeline(client)
# Stage 1: market_analyst() + portfolio_monitor() — run concurrently
# Stage 2: synthesizer(market + portfolio outputs) → prioritized opportunity list
# Output replaces current static SCANNER_RESULTS in web/app.py
