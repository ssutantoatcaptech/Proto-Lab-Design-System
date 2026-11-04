"""
Market conditions data for Huntington Capital Markets demos.
Refreshed to Q2 2026 baseline (April 2026).
"""

MARKET_METADATA = {
    "as_of_date": "April 2026",
    "sources": [
        "Bloomberg (rates/spreads)",
        "LCD / Morningstar (leveraged loan volume)",
        "PitchBook (sector multiples, deal count)",
        "Fed H.15 (Treasury rates)",
        "Preqin (PE dry powder, fund lifecycle data)",
    ],
}

MARKET_CONTEXT = {
    "leveraged_loan_rate": "SOFR + 325-375bps (B/BB-rated); tightened ~50bps since Jan",
    "high_yield_spread": "~295bps over Treasuries (near 18-month tights)",
    "lbo_leverage_market": "5.0-6.0x EBITDA (senior), 6.5-7.5x (total); non-bank lenders pushing 7.0x+ in tech/software",
    "deal_volume_ytd": "Leveraged loan volume $210B YTD (up 28% vs prior year); driven by refis and repricing",
    "investor_appetite": "CLO formation pace ~$45B YTD; institutional demand outpacing supply; non-bank competition fierce in upper MM",
    "rate_environment": "Fed funds 4.00-4.25%; market pricing 2 cuts by year-end; 10Y Treasury at 4.15%",
    "themes": [
        "Refinancing wave: $900B+ of leveraged loans maturing 2026-2028; sponsors aggressively extending and repricing",
        "Dividend recaps surging — sponsors returning capital ahead of potential rate volatility",
        "Software/tech lending spreads at post-2021 tights; documentation loosening (covenant-lite now standard)",
        "PE exit backlog: $4T+ in unrealized PE portfolio value; secondary market volume up 35% YoY",
        "Insurance distribution consolidation — largest PE-backed rollup theme by deal count",
    ],
}

SECTOR_MARKET_CONDITIONS = {
    "Financial Services & Technology": {
        "outlook": "Favorable",
        "spread": "SOFR + 275-325bps",
        "leverage_available": "6.0-7.0x",
        "key_themes": [
            "Insurance distribution M&A at all-time highs — 800+ deals in 2025",
            "FinTech valuations stabilizing after 2022-2023 reset",
            "Embedded finance and payments infrastructure driving sponsor interest",
        ],
        "huntington_angle": "Strong insurance/financial services coverage; can leverage Huntington's banking relationships for warm intros",
    },
    "Healthcare Services": {
        "outlook": "Mixed — selective",
        "spread": "SOFR + 350-425bps",
        "leverage_available": "5.0-6.0x (lower due to regulatory risk)",
        "key_themes": [
            "Physician practice management under FTC scrutiny — slowing consolidation",
            "Healthcare IT/SaaS still attractive; recurring revenue models preferred",
            "Post-acute and home health benefiting from hospital-at-home tailwinds",
        ],
        "huntington_angle": "Midwest healthcare ecosystem knowledge; regional health system relationships for commercial banking cross-sell",
    },
    "Technology & Software": {
        "outlook": "Strong — premium pricing",
        "spread": "SOFR + 275-350bps",
        "leverage_available": "6.5-8.0x (recurring revenue multiples)",
        "key_themes": [
            "AI infrastructure spending creating new platform opportunities",
            "Cybersecurity M&A accelerating — consolidation of point solutions",
            "ARR-based lending increasingly accepted; non-bank lenders aggressive in recurring-revenue credits",
        ],
        "huntington_angle": "Can position as relationship bank for post-acquisition commercial needs; tech companies value Midwest banking stability",
    },
    "Industrial & Building Products": {
        "outlook": "Cautious — cycle dependent",
        "spread": "SOFR + 375-450bps",
        "leverage_available": "4.5-5.5x",
        "key_themes": [
            "Housing starts still below historical norms — upside potential",
            "Reshoring/near-shoring driving specialty manufacturing investment",
            "Building products firms with commercial exposure outperforming residential",
        ],
        "huntington_angle": "Deep Midwest industrial base; strong ABL capabilities for cyclical names; relationship with regional strategic acquirers",
    },
    "Insurance Distribution": {
        "outlook": "Strong — highest deal volume by count",
        "spread": "SOFR + 300-375bps",
        "leverage_available": "6.0-7.5x",
        "key_themes": [
            "Organic growth 8-12% from rate hardening in P&C lines",
            "Platform valuations 14-18x EBITDA; bolt-ons at 8-12x",
            "Increasing sponsor interest in life & annuity distribution (less penetrated)",
        ],
        "huntington_angle": "Huntington's insurance vertical expertise; can lead or co-lead add-on financings in the $200-500M range",
    },
}
