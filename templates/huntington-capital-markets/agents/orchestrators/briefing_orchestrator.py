"""
Briefing Pack Orchestrator — PE Sponsorship Briefing Pack feature.

Flow:
  Stage 1 (sequential):  Intelligence Analyst builds factual foundation
  Stage 2 (parallel):    Relationship Strategist + Deal Originator + Bolt-On Connector run concurrently
  Stage 3 (sequential):  Compliance & Risk Reviewer reviews Stage 2 outputs
  Stage 4 (sequential):  Synthesizer produces final 8-section briefing pack

NOT YET INTEGRATED — stub only. Integration into /api/briefing is a follow-on ticket.
"""

from dataclasses import dataclass, field


@dataclass
class AgentResult:
    agent_name: str
    perspective: str
    content: str
    duration_seconds: float = 0.0


@dataclass
class BriefingPipelineResult:
    sponsor: str
    call_type: str
    banker: str
    generated_date: str
    # Stage 1
    intelligence: AgentResult = None
    # Stage 2 (parallel)
    relationship: AgentResult = None
    deal_ideas: AgentResult = None
    bolton_intros: AgentResult = None
    # Stage 3
    compliance_review: AgentResult = None
    # Stage 4
    final_briefing: AgentResult = None


# TODO: implement run_briefing_pipeline(client, sponsor_name, call_type, banker, banker_answers)
# Stage 1: intelligence_analyst
# Stage 2: relationship_strategist + deal_originator + bolton_connector (concurrent)
# Stage 3: compliance_risk_reviewer(stage1 + stage2 outputs)
# Stage 4: synthesizer(all outputs) → final 8-section briefing
