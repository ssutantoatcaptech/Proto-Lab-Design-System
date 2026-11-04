# Agent definitions — one module per agent, shared across orchestrators.
# Each module exposes: AGENT_NAME, AGENT_PERSPECTIVE, SYSTEM_PROMPT

# Shared
from . import synthesizer

# Briefing Pack
from . import intelligence_analyst
from . import relationship_strategist
from . import deal_originator
from . import compliance_risk_reviewer
from . import bolton_connector

# Bolt-On Scout
from . import deal_screener
from . import thesis_validator
from . import introduction_writer

# Sponsor Match
from . import company_profiler
from . import sponsor_matcher
from . import outreach_drafter

# Opportunity Scanner
from . import market_analyst
from . import portfolio_monitor
