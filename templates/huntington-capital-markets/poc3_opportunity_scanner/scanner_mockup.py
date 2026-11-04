"""
PoC 3: Sponsor Opportunity Scanner — Pre-Rendered Mockup
Huntington Capital Markets - AI Initiative

Simulates the Sponsor Opportunity Scanner for the roadmap slide.
Uses pre-rendered data with typing delays to mimic real-time scanning.
No API calls — runs entirely offline.

Usage:
    python scanner_mockup.py
    python scanner_mockup.py --sponsor "GTCR"
    python scanner_mockup.py --fast
"""

import argparse
import json
import os
import sys
import time
from datetime import date, timedelta
from dataclasses import dataclass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from common.sponsors import SPONSORS, SPONSOR_NAMES

SCANNER_RESULTS = {
    "GTCR": [
        {
            "opportunity_id": "OPP-2026-0147",
            "signal_type": "FUND LIFECYCLE",
            "urgency": "HIGH",
            "sponsor": "GTCR",
            "signal": "Fund XIV ($7.5B, 2024 vintage) — 18% deployed. Actively seeking platforms in financial services and healthcare.",
            "recommended_product": "Lead-left LBO financing (TLB + revolver)",
            "estimated_fee_mm": 4.5,
            "action": "Schedule meeting with Collin Roche to discuss healthcare platform pipeline",
            "confidence": 0.87,
            "detail": {
                "background": "GTCR's Fund XIV closed at $7.5B in 2024, making it their largest fund to date. With their January 2025 exit from Worldpay (~$24.25B sale to Global Payments), significant capital has been returned to investors and the team has bandwidth for new platforms. GTCR's Leaders Strategy targets market-leading companies where they can drive transformational growth through M&A and technology. Healthcare and financial services have been their two highest-conviction themes across the last three fund vintages.",
                "sources": [
                    {"type": "CRM", "detail": "Sponsor profile — Fund XIV vintage, AUM $30B+, strategy and investment themes"},
                    {"type": "Deal Activity", "detail": "Worldpay exit to Global Payments announced January 2025 (~$24.25B EV)"},
                    {"type": "Market Data", "detail": "LBO leverage market at 5.0-5.5x for middle market; investor appetite strong for healthcare platforms"},
                    {"type": "Relationship", "detail": "Active coverage by Eric Welsh (VP); last meeting March 2026"},
                ],
                "market_context": "Current leveraged loan market at SOFR+275-350 for healthcare platforms. CLO formation running 15% above 2025 pace, supporting strong investor demand. Healthcare services sector outlook is favorable with leverage available at 5.0-6.0x for quality platforms.",
                "fee_basis": "Assumes $500-800M platform deal, Huntington in co-lead left role at 150-200bps OID + 50bps arrangement fee.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0148",
            "signal_type": "MATURITY WALL",
            "urgency": "HIGH",
            "sponsor": "GTCR",
            "signal": "AssuredPartners — $4.2B TLB maturing Q4 2027. Current spread SOFR+375; market now at SOFR+300-325 for comparable credits.",
            "recommended_product": "Repricing and extension mandate",
            "estimated_fee_mm": 6.2,
            "action": "Pitch repricing to save ~50-75bps; Huntington for co-lead left role",
            "confidence": 0.92,
            "detail": {
                "background": "AssuredPartners is one of the largest PE-backed insurance brokerages in North America with $3.0B+ revenue and 200+ completed acquisitions. Co-owned by GTCR and APAX Partners. The 2021-vintage term loan B carries a spread of SOFR+375 — significantly wider than where comparable insurance brokerage credits are trading today (SOFR+300-325). With the maturity wall approaching in Q4 2027, a proactive repricing would save the company $25-30M annually in interest expense while extending the maturity runway.",
                "sources": [
                    {"type": "CRM", "detail": "AssuredPartners portfolio data — $3.0B+ revenue, 6.5x leverage, co-investment with APAX Partners"},
                    {"type": "Market Data", "detail": "Insurance distribution sector spread at SOFR+275-325; leverage available 5.5-6.5x"},
                    {"type": "Market Data", "detail": "High yield spreads at 310-340bps; rate environment shows Fed funds at 3.75-4.00% with 2-3 cuts expected"},
                    {"type": "Relationship", "detail": "Eric Welsh engaged on AssuredPartners refi discussion per CRM"},
                ],
                "market_context": "Insurance distribution is one of the most active sectors in leveraged finance. P&C rate hardening continues to drive organic revenue growth for brokerages, improving credit metrics. CLO demand for insurance brokerage paper remains strong. Comparable recent repricing: Hub International repriced at SOFR+300 in Q1 2026.",
                "fee_basis": "Based on $4.2B repricing, co-lead left at 25-35bps arrangement fee. Repricing fees are lower than new-issue but volume compensates.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0149",
            "signal_type": "PORTFOLIO ACTIVITY",
            "urgency": "MEDIUM",
            "sponsor": "GTCR",
            "signal": "Optimal Blue — bolt-on pipeline active. 3 targets in mortgage tech space identified by sponsor.",
            "recommended_product": "Incremental term loan for add-ons",
            "estimated_fee_mm": 1.8,
            "action": "Offer staple financing for Optimal Blue bolt-on acquisitions",
            "confidence": 0.78,
            "detail": {
                "background": "Optimal Blue is the dominant product-pricing engine in US mortgage origination, used by 60%+ of originators. GTCR acquired it from ICE (which inherited it via the Black Knight acquisition) in 2023. The platform generates $280M in revenue at 5.8x leverage. GTCR has been actively pursuing bolt-on acquisitions in adjacent mortgage technology verticals — loan origination systems, compliance automation, and borrower engagement tools — to build a broader mortgage technology ecosystem around Optimal Blue's pricing engine.",
                "sources": [
                    {"type": "CRM", "detail": "Optimal Blue portfolio data — $280M revenue, 5.8x leverage, acquired from Black Knight/ICE 2023"},
                    {"type": "CRM", "detail": "GTCR investment themes include Financial Services & Technology"},
                    {"type": "Market Data", "detail": "Technology & Software sector spread at SOFR+300-375; leverage available 5.0-6.5x for recurring-revenue models"},
                    {"type": "Relationship", "detail": "Coverage relationship active; sponsor has indicated bolt-on pipeline to coverage team"},
                ],
                "market_context": "Mortgage origination volumes recovering as rates stabilize, supporting fintech valuations. Recurring-revenue mortgage tech platforms trading at 12-15x EBITDA. Non-bank lenders remain aggressive in recurring-revenue credits, but banks can compete on relationship and execution speed for add-on deals.",
                "fee_basis": "Assumes 3 bolt-on acquisitions averaging $75-150M each. Incremental term loan at 100-125bps OID. Smaller deal sizes but repeat transaction potential.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0150",
            "signal_type": "EXIT SIGNAL",
            "urgency": "MEDIUM",
            "sponsor": "GTCR",
            "signal": "Worldpay exit to Global Payments closing H1 2025. GTCR returns $13B+ to LPs — accelerates Fund XIV deployment.",
            "recommended_product": "Lead-left platform financing, Fund XIV",
            "estimated_fee_mm": 8.5,
            "action": "Propose financing capabilities for Fund XIV's next platform in healthcare or financial services",
            "confidence": 0.71,
            "detail": {
                "background": "GTCR's sale of its 55% stake in Worldpay to Global Payments (~$24.25B total EV, announced January 2025) represents one of the largest PE exits in recent history. The return of $13B+ to LPs combined with Fund XIV's low deployment rate (18%) creates significant pressure to deploy capital into new platforms. GTCR's historical pattern after major exits is to accelerate platform investing in their core themes. Coverage team should expect 2-3 new platform investments within 12-18 months.",
                "sources": [
                    {"type": "Deal Activity", "detail": "Worldpay exit — sale to Global Payments, ~$24.25B EV, announced January 2025"},
                    {"type": "CRM", "detail": "Fund XIV at 18% deployed; investment themes: Financial Services & Technology, Healthcare, TMT, Business Services"},
                    {"type": "CRM", "detail": "GTCR target profile: $100M-$1B revenue, $30M-$200M EBITDA, take-privates and carve-outs"},
                    {"type": "Market Data", "detail": "LBO leverage available at 5.0-5.5x; deal volume YTD up 12% vs. prior year"},
                ],
                "market_context": "LP distributions are at 5-year lows across the PE industry, making GTCR's Worldpay return exceptional. This strengthens LP relationships and creates urgency to deploy Fund XIV. Market conditions are favorable: leverage is available, spreads have compressed from 2023 peaks, and CLO formation is strong. GTCR's healthcare and fintech deal flow should accelerate meaningfully.",
                "fee_basis": "Assumes 2-3 platform acquisitions from Fund XIV at $500M-$1.5B each. Huntington in lead left or co-lead role. Blended fee estimate across potential deals.",
            },
        },
    ],
    "Clayton, Dubilier & Rice": [
        {
            "opportunity_id": "OPP-2026-0151",
            "signal_type": "MATURITY WALL",
            "urgency": "HIGH",
            "sponsor": "Clayton, Dubilier & Rice",
            "signal": "Cornerstone Building Brands — $3.2B TLB maturing 2027-2028. Spread compression opportunity ~40bps.",
            "recommended_product": "Extension and repricing mandate",
            "estimated_fee_mm": 5.8,
            "action": "Jeff Tuckle to present refi proposal at next coverage meeting",
            "confidence": 0.91,
            "detail": {
                "background": "Cornerstone Building Brands is North America's largest manufacturer of exterior building products, serving both residential and commercial markets. CD&R took it private in 2022. With $5.8B revenue and 5.5x leverage, the company carries a $3.2B term loan B with maturities spanning 2027-2028. The existing spread sits ~40bps wide of where comparable building products credits are trading today, creating a clear repricing opportunity. CD&R has been executing operational improvements — distribution footprint rationalization and margin expansion — that strengthen the credit story.",
                "sources": [
                    {"type": "CRM", "detail": "Cornerstone portfolio data — $5.8B revenue, 5.5x leverage, debt maturities 2027-2028"},
                    {"type": "Market Data", "detail": "Industrial & Building Products sector spread at SOFR+250-325; outlook favorable"},
                    {"type": "Market Data", "detail": "Key theme: Building products benefiting from housing supply deficit and infrastructure spending"},
                    {"type": "Relationship", "detail": "Jeff Tuckle (VP) active coverage; discussing Cornerstone debt maturity solutions per CRM"},
                ],
                "market_context": "Building products sector is benefiting from structural tailwinds: US housing supply deficit (3-4M units), infrastructure bill spending flowing through, and commercial construction stable. Leverage available at 4.5-5.5x for building products. Huntington has a strong angle here — expertise in industrial/building products ABL facilities can complement the term loan repricing.",
                "fee_basis": "Based on $3.2B repricing/extension. Co-lead left role at 25-35bps. Additional ABL revolver amendment could add $0.5-1.0M in fees.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0152",
            "signal_type": "FUND LIFECYCLE",
            "urgency": "HIGH",
            "sponsor": "Clayton, Dubilier & Rice",
            "signal": "Fund XII ($16B, 2023) — 35% deployed. Actively seeking industrial carve-outs. 2 LOIs in market.",
            "recommended_product": "Lead-left acquisition financing (TLB + revolver + ABL)",
            "estimated_fee_mm": 7.2,
            "action": "Present Huntington's industrial ABL capabilities; propose co-underwrite on next carve-out",
            "confidence": 0.84,
            "detail": {
                "background": "CD&R Fund XII ($16B) is their largest fund and their strategy centers on operational improvement in complex situations — specifically corporate carve-outs, public-to-privates, and management partnerships. With 35% deployed and 2 active LOIs in the industrial sector, Fund XII is in its peak deployment phase. CD&R's track record in carve-outs is exceptional (Roper Technologies industrial businesses for $3.6B in 2022, Veritiv for $2.3B in 2023). The next 12-18 months should see 3-5 additional platform investments.",
                "sources": [
                    {"type": "CRM", "detail": "Fund XII vintage 2023, $16B, strategy focused on carve-outs and operational improvement"},
                    {"type": "CRM", "detail": "Recent deals: Veritiv take-private ($2.3B), Roper Technologies carve-out ($3.6B), Cornerstone refi ($3.2B)"},
                    {"type": "CRM", "detail": "Investment themes: Industrial & Distribution, Healthcare Services, Financial & Business Services"},
                    {"type": "Market Data", "detail": "LBO leverage at 5.0-5.5x; ABL facilities attractive for distribution/industrial assets with hard collateral"},
                ],
                "market_context": "Corporate carve-out activity accelerating as conglomerates rationalize portfolios. CD&R's operational playbook is well-suited to the current environment. Huntington's ABL capabilities are a differentiator — many carve-outs involve distribution/industrial assets with receivables and inventory that support asset-based lending alongside traditional term loans.",
                "fee_basis": "Assumes $1-3B carve-out transaction. Huntington as co-lead on ABL + participation in TLB. Blended fee across ABL arrangement + TLB allocation.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0153",
            "signal_type": "EXIT SIGNAL",
            "urgency": "MEDIUM",
            "sponsor": "Clayton, Dubilier & Rice",
            "signal": "Veritiv — operational restructuring ahead of plan. CD&R evaluating 2027 exit (IPO or sponsor-to-sponsor).",
            "recommended_product": "Sell-side advisory and take-out financing",
            "estimated_fee_mm": 3.5,
            "action": "Position for sell-side mandate or take-out financing with acquiring sponsor",
            "confidence": 0.68,
            "detail": {
                "background": "CD&R took Veritiv private in 2023 for $2.3B. Veritiv is a leading North American packaging and distribution company with ~$5.5-6B in revenue. CD&R's operational restructuring — including distribution footprint rationalization and working capital optimization — is tracking ahead of the original value creation plan. If improvement continues through 2026, CD&R will likely evaluate exit options in 2027: IPO, sponsor-to-sponsor sale, or strategic sale. Huntington can position on either side — sell-side advisory or financing for the acquiring party.",
                "sources": [
                    {"type": "CRM", "detail": "Veritiv portfolio data — taken private 2023, $5.5-6B revenue, 4.1x leverage, operational restructuring underway"},
                    {"type": "CRM", "detail": "CD&R strategy: operational improvement, typical hold period 4-6 years"},
                    {"type": "Deal Activity", "detail": "Veritiv take-private was sole-sponsor deal by CD&R"},
                    {"type": "Market Data", "detail": "Industrial distribution M&A multiples at 8-11x EBITDA; IPO window selectively open"},
                ],
                "market_context": "Packaging and distribution assets trading at 8-11x EBITDA for quality platforms. IPO market has reopened selectively for industrial companies with clean growth stories. Sponsor-to-sponsor secondaries active, especially for companies with proven operational improvement. Timing is medium-term (2027) so this is a positioning play for Huntington.",
                "fee_basis": "Sell-side advisory fee at 0.5-1.0% of transaction value, or take-out financing fees at 100-150bps OID on $2-3B financing package.",
            },
        },
    ],
    "Stone Point Capital": [
        {
            "opportunity_id": "OPP-2026-0154",
            "signal_type": "PORTFOLIO ACTIVITY",
            "urgency": "HIGH",
            "sponsor": "Stone Point Capital",
            "signal": "AmeriLife — 8 bolt-on acquisitions in pipeline for H2 2026. Total add-on financing need ~$800M.",
            "recommended_product": "Delayed-draw incremental for bolt-ons",
            "estimated_fee_mm": 3.2,
            "action": "Propose delayed-draw facility to streamline AmeriLife's M&A execution",
            "confidence": 0.89,
            "detail": {
                "background": "AmeriLife is a national insurance distribution platform co-owned by Stone Point Capital and Thomas H. Lee Partners since 2020. With $1.5B+ in revenue and 60+ completed acquisitions, AmeriLife is one of the most prolific roll-up stories in insurance distribution. The platform carries 6.8x leverage. Stone Point's playbook is to use AmeriLife as a consolidation vehicle for independent insurance agencies and distribution partners, with a particular focus on Medicare, life insurance, and annuity distribution. The H2 2026 bolt-on pipeline of 8 targets represents approximately $800M in aggregate add-on financing needs.",
                "sources": [
                    {"type": "CRM", "detail": "AmeriLife portfolio data — $1.5B+ revenue, 6.8x leverage, co-investment with Thomas H. Lee Partners"},
                    {"type": "CRM", "detail": "Stone Point strategy: deep sector specialization in financial services, insurance distribution"},
                    {"type": "Deal Activity", "detail": "AmeriLife incremental term loan ($600M for bolt-on M&A, Q4 2024)"},
                    {"type": "Market Data", "detail": "Insurance distribution sector spread at SOFR+275-325; leverage available 5.5-6.5x"},
                ],
                "market_context": "Insurance distribution remains the most active M&A sector in financial services. P&C rate hardening continues to drive organic growth for brokerages, supporting higher leverage levels. A delayed-draw term loan facility would give AmeriLife execution speed on bolt-ons without requiring multiple market trips. Comparable: Hub International, Acrisure, and Gallagher all have similar facilities.",
                "fee_basis": "Delayed-draw facility of $800M with 75-100bps commitment fee on undrawn + 100-125bps OID on drawn amounts. Multiple draw structure generates recurring fees.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0155",
            "signal_type": "FUND LIFECYCLE",
            "urgency": "MEDIUM",
            "sponsor": "Stone Point Capital",
            "signal": "Trident IX ($4.0B, 2023) — 40% deployed. Seeking insurance and specialty finance platforms.",
            "recommended_product": "Lead-left platform acquisition financing",
            "estimated_fee_mm": 2.8,
            "action": "Eric Welsh to share Huntington insurance distribution deal flow",
            "confidence": 0.82,
            "detail": {
                "background": "Stone Point's Trident IX ($4.0B, 2023) is focused exclusively on financial services — their core sector specialization since the firm's founding. With 40% deployed, the fund is entering its most active deployment period. Stone Point's investment themes for Trident IX include insurance (distribution, services, specialty carriers), specialty finance & lending, capital markets infrastructure & FinTech, and real assets & mortgage services. Their target profile is $50M-$500M revenue companies in North America. Huntington's middle market client book has strong overlap with these criteria, particularly in insurance and financial services.",
                "sources": [
                    {"type": "CRM", "detail": "Trident IX vintage 2023, $4.0B, financial services-focused strategy"},
                    {"type": "CRM", "detail": "Target profile: $50M-$500M revenue, $15M-$100M EBITDA, North America"},
                    {"type": "CRM", "detail": "Current platforms: Kinsale (public), AmeriLife, Wilshire Advisors, Foundation Risk Partners"},
                    {"type": "Relationship", "detail": "Developing — VP coverage by Eric Welsh; introductory meeting January 2026"},
                ],
                "market_context": "Financial services PE activity is elevated as insurtech valuations have normalized and traditional insurance distribution remains highly fragmented. Specialty finance platforms attract strong interest given rate environment. Stone Point's sector focus makes them a natural partner for Huntington's financial services deal flow — particularly insurance distribution clients like CrossPoint Insurance Group in Huntington's book.",
                "fee_basis": "Platform acquisition financing at $200-500M. Huntington as lead left or co-lead for insurance/financial services assets where Huntington has sector expertise.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0156",
            "signal_type": "MATURITY WALL",
            "urgency": "MEDIUM",
            "sponsor": "Stone Point Capital",
            "signal": "Foundation Risk Partners — $500M TL maturing Q2 2027. Growing into larger capital structure.",
            "recommended_product": "Upsizing and extension mandate",
            "estimated_fee_mm": 1.5,
            "action": "Propose upsized facility to support continued bolt-on strategy",
            "confidence": 0.76,
            "detail": {
                "background": "Foundation Risk Partners is a Southeast-focused insurance distribution platform in Stone Point's portfolio (invested 2023). With $850M in revenue and 5.9x leverage, FRP is a middle-market insurance brokerage executing a bolt-on acquisition strategy similar to AmeriLife but at an earlier stage. The existing $500M term loan matures Q2 2027 and the company has outgrown the current facility — revenue growth and completed acquisitions since the initial financing mean FRP needs a larger capital structure to continue its buy-and-build strategy.",
                "sources": [
                    {"type": "CRM", "detail": "Foundation Risk Partners portfolio data — $850M revenue, 5.9x leverage, Southeast-focused"},
                    {"type": "CRM", "detail": "Stone Point investment in FRP via Trident funds, platform investment 2023"},
                    {"type": "Deal Activity", "detail": "Foundation Risk Partners platform investment (2023)"},
                    {"type": "Market Data", "detail": "Insurance distribution sector spread at SOFR+275-325; strong investor appetite for insurance brokerage paper"},
                ],
                "market_context": "Insurance brokerage refinancings have been one of the most active leveraged finance product categories in 2025-2026. Investor appetite for insurance distribution credits remains very strong given predictable cash flows and organic growth from rate hardening. FRP's Southeast focus and middle-market positioning is in Huntington's sweet spot.",
                "fee_basis": "Upsized facility from $500M to $700-800M with maturity extension. Refinancing fees at 50-75bps on full amount. Huntington in co-lead role given middle-market positioning.",
            },
        },
    ],
    "Madison Dearborn Partners": [
        {
            "opportunity_id": "OPP-2026-0157",
            "signal_type": "MATURITY WALL",
            "urgency": "HIGH",
            "sponsor": "Madison Dearborn Partners",
            "signal": "Nuvei — post-take-private financing ($4.2B) matures 2028. Repricing opportunity as payments sector tightens.",
            "recommended_product": "Repricing amendment mandate",
            "estimated_fee_mm": 4.8,
            "action": "Present repricing proposal — 30-50bps savings vs. existing spread",
            "confidence": 0.86,
            "detail": {
                "background": "Nuvei Corporation is a global payments technology platform taken private in 2024 for $6.3B CAD, led by Advent International with Madison Dearborn as co-investor. The company generates $1.1B in revenue with 5.3x leverage. The post-take-private financing of ~$4.2B was priced at the wider end of payments sector spreads given the size and complexity of the transaction. Since closing, payments sector spreads have compressed 30-50bps as investor confidence in embedded finance and cross-border payments has improved. A repricing would deliver material interest savings.",
                "sources": [
                    {"type": "CRM", "detail": "Nuvei portfolio data — $1.1B revenue, 5.3x leverage, co-investment with Advent International (lead)"},
                    {"type": "Deal Activity", "detail": "Take-private of Nuvei Corporation ($6.3B CAD, 2024) — Advent-led, MDP co-investor"},
                    {"type": "Market Data", "detail": "Technology & Software sector spread at SOFR+300-375; payments subsector tighter at SOFR+275-325"},
                    {"type": "CRM", "detail": "MDP relationship active — Director coverage by Jeff Tuckle; last meeting April 2026"},
                ],
                "market_context": "Payments technology credits have outperformed the broader leveraged loan market in 2025-2026. Investor appetite is strong given recurring revenue profiles and growth tailwinds from embedded finance and regulatory modernization. Comparable: Worldpay, Paysafe, and Shift4 all repriced tighter in recent quarters. Note: Advent is the lead sponsor so Huntington's approach should go through both the Advent and MDP relationship channels.",
                "fee_basis": "Based on $4.2B repricing. Participant or co-arranger role at 15-25bps. Advent's existing bank group will likely get first call, but Huntington's payments sector expertise could earn a role.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0158",
            "signal_type": "DIVIDEND RECAP",
            "urgency": "MEDIUM",
            "sponsor": "Madison Dearborn Partners",
            "signal": "GHX — completed $500M recap in Q2 2025. Strong cash flow supports second recap within 12-18 months.",
            "recommended_product": "Dividend recap arrangement",
            "estimated_fee_mm": 2.5,
            "action": "Monitor GHX leverage trajectory; propose recap when leverage back below 5.0x",
            "confidence": 0.72,
            "detail": {
                "background": "Global Healthcare Exchange (GHX) is a B2B healthcare supply chain platform that MDP has owned since ~2017 (Fund VII). With $350M in revenue, 4,000+ hospitals on the network, a SaaS model with 90%+ retention, and 5.1x leverage, GHX is a classic MDP hold — long-duration ownership of a market-leading platform with predictable cash flows. MDP completed a $500M dividend recapitalization in Q2 2025. Given GHX's strong free cash flow generation and the recurring nature of its revenue, the company should delever back below 5.0x within 12-18 months, opening a window for a second recap.",
                "sources": [
                    {"type": "CRM", "detail": "GHX portfolio data — $350M revenue, 5.1x leverage, B2B healthcare supply chain, 90%+ retention"},
                    {"type": "Deal Activity", "detail": "GHX recapitalization ($500M dividend recap, Q2 2025)"},
                    {"type": "CRM", "detail": "MDP investment themes: Healthcare (services, life sciences), growth-oriented investing in defensible market positions"},
                    {"type": "Market Data", "detail": "Healthcare IT valuations at 15-20x EBITDA; SaaS retention above 90% supports premium leverage"},
                ],
                "market_context": "Healthcare IT SaaS platforms command premium multiples (15-20x EBITDA) and premium leverage (5.0-6.5x). The dividend recap market has been active in 2025-2026 as sponsors seek DPI for aging fund vintages. GHX's MDP Fund VII vintage (2017) is now 9 years old — LP pressure for distributions is high, making a second recap strategically motivated beyond just the financial opportunity.",
                "fee_basis": "Second recap of $300-400M as leverage deleverages back below 5.0x. Arrangement fees at 75-100bps. Huntington as participant or co-arranger.",
            },
        },
        {
            "opportunity_id": "OPP-2026-0159",
            "signal_type": "FUND LIFECYCLE",
            "urgency": "MEDIUM",
            "sponsor": "Madison Dearborn Partners",
            "signal": "Fund VIII (2021) — fully deployed. Fund IX raising expected H2 2026. TMT/cybersecurity bolt-on pipeline active — Cardinal Cyber Defense intro opportunity.",
            "recommended_product": "Lead-left platform financing, Fund IX, plus client introduction",
            "estimated_fee_mm": 5.0,
            "action": "Jeff Tuckle to attend MDP annual meeting; introduce Cardinal Cyber Defense (Dayton, OH) as LogRhythm/Exabeam bolt-on",
            "confidence": 0.77,
            "detail": {
                "background": "Madison Dearborn Partners Fund VIII ($4.6B, 2021) is now fully deployed across investments including LogRhythm/Exabeam (cybersecurity), Nuvei (payments, co-invest with Advent), and GHX (healthcare IT). With Fund VIII complete, MDP is expected to raise Fund IX in H2 2026, likely targeting $5-6B. MDP's Chicago headquarters creates natural overlap with Huntington's Midwest coverage footprint. The fund transition period is the highest-value window for relationship deepening. Critically, Huntington's client book contains Cardinal Cyber Defense (Dayton, OH) — a FedRAMP-authorized OT/ICS cybersecurity firm growing ARR 40%+ — a natural bolt-on to MDP's LogRhythm/Exabeam SIEM platform. This introduction is a high-value talking point for the MDP annual meeting.",
                "sources": [
                    {"type": "CRM", "detail": "Fund VIII vintage 2021, $4.6B, fully deployed. AUM $28B+, HQ Chicago"},
                    {"type": "CRM", "detail": "Investment themes: Financial & Transaction Services, Healthcare, TMT, Basic Industries"},
                    {"type": "CRM", "detail": "Key partners: Vahe Dombalagian, Tom Souleles, Nick Alexos, Tim Sullivan"},
                    {"type": "Relationship", "detail": "Active — Director coverage by Jeff Tuckle; last meeting April 2026 at MDP annual meeting"},
                ],
                "market_context": "PE fundraising has been competitive but top-quartile managers continue to raise successfully. MDP's track record and sector focus position them well. The Chicago private equity ecosystem is active with several middle-market and large-cap firms competing for deals. Huntington's relationship with MDP benefits from geographic proximity and sector overlap in healthcare and financial services.",
                "fee_basis": "Assumes 2-4 platform acquisitions from Fund IX at $300M-$1B each over 2-3 years. Huntington as co-lead or participant across multiple transactions. Blended fee estimate.",
            },
        },
    ],
}


def type_text(text: str, delay: float = 0.02, fast: bool = False):
    """Print text with typing effect."""
    if fast:
        print(text)
        return
    for char in text:
        print(char, end="", flush=True)
        if char == "\n":
            time.sleep(delay * 3)
        elif char in ".,:;":
            time.sleep(delay * 2)
        else:
            time.sleep(delay)
    print()


def simulate_scan_delay(message: str, seconds: float, fast: bool = False):
    """Simulate a processing delay with a spinner."""
    if fast:
        print(f"  {message} ... done")
        return
    chars = "|/-\\"
    end_time = time.time() + seconds
    i = 0
    while time.time() < end_time:
        print(f"\r  {chars[i % 4]} {message}", end="", flush=True)
        time.sleep(0.15)
        i += 1
    print(f"\r  \u2713 {message}          ")


def urgency_color(urgency: str) -> str:
    """Return ANSI color for urgency level."""
    colors = {
        "HIGH": "\033[91m",
        "MEDIUM": "\033[93m",
        "LOW": "\033[92m",
    }
    reset = "\033[0m"
    return f"{colors.get(urgency, '')}{urgency}{reset}"


def run_scanner(sponsor_name: str = None, fast: bool = False):
    """Run the scanner mockup for one or all sponsors."""
    sponsors_to_scan = [sponsor_name] if sponsor_name else SPONSOR_NAMES

    print()
    type_text("=" * 70, fast=fast)
    type_text("  HUNTINGTON CAPITAL MARKETS", fast=fast)
    type_text("  SPONSOR OPPORTUNITY SCANNER", fast=fast)
    type_text(f"  Scan Date: {date.today().isoformat()}", fast=fast)
    type_text("=" * 70, fast=fast)

    if not fast:
        print()
        simulate_scan_delay("Connecting to CRM data feed", 1.2, fast)
        simulate_scan_delay("Loading sponsor portfolio data", 0.8, fast)
        simulate_scan_delay("Pulling market conditions (SOFR, spreads, CLO formation)", 1.0, fast)
        simulate_scan_delay("Analyzing fund lifecycle signals", 1.5, fast)
        simulate_scan_delay("Scanning maturity walls and refi windows", 1.2, fast)
        simulate_scan_delay("Cross-referencing portfolio activity signals", 1.0, fast)

    total_opps = 0
    total_fees = 0

    for name in sponsors_to_scan:
        opps = SCANNER_RESULTS.get(name, [])
        if not opps:
            continue

        print()
        type_text(f"\n{'─' * 70}", fast=fast)
        sponsor_data = SPONSORS.get(name, {})
        type_text(f"  SPONSOR: {name.upper()}", fast=fast)
        type_text(f"  Current Fund: {sponsor_data.get('fund_vintage', 'N/A')}", fast=fast)
        type_text(f"  Coverage: {sponsor_data.get('relationship_status', 'N/A').split(';')[0]}", fast=fast)
        type_text(f"  Opportunities Detected: {len(opps)}", fast=fast)
        type_text(f"{'─' * 70}", fast=fast)

        if not fast:
            simulate_scan_delay(f"Analyzing {name} portfolio signals", 1.5, fast)

        for opp in opps:
            total_opps += 1
            total_fees += opp["estimated_fee_mm"]

            print()
            type_text(f"  [{opp['opportunity_id']}] {urgency_color(opp['urgency'])} URGENCY", fast=fast)
            type_text(f"  Signal Type: {opp['signal_type']}", fast=fast)
            type_text(f"  Signal:      {opp['signal']}", fast=fast)
            type_text(f"  Product:     {opp['recommended_product']}", fast=fast)
            type_text(f"  Est. Fee:    ${opp['estimated_fee_mm']:.1f}M", fast=fast)
            type_text(f"  Confidence:  {opp['confidence']:.0%}", fast=fast)
            type_text(f"  Action:      {opp['action']}", fast=fast)

    print()
    type_text("=" * 70, fast=fast)
    type_text("  SCAN SUMMARY", fast=fast)
    type_text(f"  Sponsors Scanned:    {len(sponsors_to_scan)}", fast=fast)
    type_text(f"  Opportunities Found: {total_opps}", fast=fast)
    type_text(f"  Total Fee Pipeline:  ${total_fees:.1f}M", fast=fast)

    high_urgency = sum(
        1 for name in sponsors_to_scan
        for opp in SCANNER_RESULTS.get(name, [])
        if opp["urgency"] == "HIGH"
    )
    type_text(f"  High Urgency:        {high_urgency}", fast=fast)
    type_text("=" * 70, fast=fast)
    type_text("\n  Next scan scheduled: Monday 8:00 AM ET", fast=fast)
    type_text("  Configure alerts: scan --alerts on", fast=fast)
    print()


def save_scan_results(output_dir: str, sponsor_name: str = None):
    """Save scan results to JSON."""
    os.makedirs(output_dir, exist_ok=True)
    sponsors_to_save = [sponsor_name] if sponsor_name else SPONSOR_NAMES

    results = {
        "scan_date": date.today().isoformat(),
        "sponsors_scanned": len(sponsors_to_save),
        "opportunities": [],
    }

    for name in sponsors_to_save:
        for opp in SCANNER_RESULTS.get(name, []):
            results["opportunities"].append(opp)

    results["total_opportunities"] = len(results["opportunities"])
    results["total_fee_pipeline_mm"] = sum(o["estimated_fee_mm"] for o in results["opportunities"])

    path = os.path.join(output_dir, "scanner_results.json")
    with open(path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"  Results saved: {path}")


def main():
    parser = argparse.ArgumentParser(
        description="Huntington Capital Markets — Sponsor Opportunity Scanner (Mockup)"
    )
    parser.add_argument("--sponsor", type=str, help="Scan one sponsor")
    parser.add_argument("--fast", action="store_true", help="Skip animation delays")
    parser.add_argument("--output-dir", type=str, default="./output", help="Save results to directory")
    parser.add_argument("--save", action="store_true", help="Save results to JSON")
    args = parser.parse_args()

    run_scanner(args.sponsor, fast=args.fast)

    if args.save:
        save_scan_results(args.output_dir, args.sponsor)


if __name__ == "__main__":
    main()
