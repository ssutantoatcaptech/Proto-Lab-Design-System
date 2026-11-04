"""
PowerPoint leave-behind generator for Huntington Capital Markets AI.
Converts the AI-generated client leave-behind markdown into a polished .pptx deck.
"""

import io
import re
from datetime import date

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

# ── Brand colors ──────────────────────────────────────────────────────────────
GREEN       = RGBColor(0x00, 0x61, 0x4A)   # Huntington green #00614A
GREEN_DARK  = RGBColor(0x00, 0x44, 0x34)   # #004434
GREEN_LIGHT = RGBColor(0xE8, 0xF5, 0xF0)   # #E8F5F0
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
BLACK       = RGBColor(0x1D, 0x1D, 0x1F)
GRAY        = RGBColor(0x86, 0x86, 0x8B)
GRAY_LIGHT  = RGBColor(0xF0, 0xF2, 0xF5)
AMBER       = RGBColor(0xFF, 0x95, 0x00)

FONT = "Calibri"

# Slide dimensions: 13.33 x 7.5 inches (widescreen 16:9)
SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _add_rect(slide, left, top, width, height, fill_color, line_color=None):
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        left, top, width, height
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(0.5)
    else:
        shape.line.fill.background()
    return shape


def _add_textbox(slide, left, top, width, height, text, font_size=12,
                 bold=False, color=BLACK, align=PP_ALIGN.LEFT, italic=False,
                 font=FONT, word_wrap=True):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    txBox.word_wrap = word_wrap
    tf = txBox.text_frame
    tf.word_wrap = word_wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return txBox


def _add_paragraph(tf, text, font_size=11, bold=False, color=BLACK,
                   align=PP_ALIGN.LEFT, italic=False, space_before=0, bullet=False):
    p = tf.add_paragraph()
    p.alignment = align
    if space_before:
        p.space_before = Pt(space_before)
    run = p.add_run()
    run.text = text
    run.font.name = FONT
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return p


def _section_label(slide, text, top=Inches(0.55)):
    """Small green all-caps section label."""
    _add_textbox(slide, Inches(0.5), top, Inches(12), Inches(0.28),
                 text.upper(), font_size=8, bold=True, color=GREEN)


# ── Slide builders ────────────────────────────────────────────────────────────

def _slide_cover(prs, sponsor_name, call_type, banker, call_date):
    layout = prs.slide_layouts[6]  # blank
    slide = prs.slides.add_slide(layout)

    # Full-bleed dark green background
    _add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, GREEN_DARK)

    # Accent bar — bottom 6px
    _add_rect(slide, 0, SLIDE_H - Inches(0.08), SLIDE_W, Inches(0.08), AMBER)

    # White top bar
    _add_rect(slide, 0, 0, SLIDE_W, Inches(0.06), WHITE)

    # Bank name
    _add_textbox(slide, Inches(0.8), Inches(1.6), Inches(11), Inches(0.5),
                 "HUNTINGTON NATIONAL BANK",
                 font_size=11, bold=True, color=RGBColor(0xFF,0xFF,0xFF),
                 align=PP_ALIGN.CENTER)

    # Division
    _add_textbox(slide, Inches(0.8), Inches(2.05), Inches(11), Inches(0.4),
                 "Capital Markets & Sponsor Coverage",
                 font_size=14, color=RGBColor(0xA0,0xD4,0xC0),
                 align=PP_ALIGN.CENTER)

    # Sponsor name — headline
    _add_textbox(slide, Inches(0.5), Inches(2.7), Inches(12.3), Inches(1.2),
                 sponsor_name,
                 font_size=44, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    # Call type
    _add_textbox(slide, Inches(0.5), Inches(3.85), Inches(12.3), Inches(0.5),
                 call_type,
                 font_size=18, color=RGBColor(0xA0,0xD4,0xC0), align=PP_ALIGN.CENTER)

    # Divider line
    _add_rect(slide, Inches(4.5), Inches(4.5), Inches(4.33), Inches(0.02), RGBColor(0x34,0xD3,0x99))

    # Meta
    meta = f"Prepared by {banker}  ·  {call_date}"
    _add_textbox(slide, Inches(0.5), Inches(4.7), Inches(12.3), Inches(0.35),
                 meta, font_size=11, color=RGBColor(0x88,0xBB,0xA8), align=PP_ALIGN.CENTER)

    # Confidential footer
    _add_textbox(slide, Inches(0.5), Inches(6.9), Inches(12.3), Inches(0.3),
                 "CONFIDENTIAL — FOR DISCUSSION PURPOSES ONLY  ·  NOT FOR DISTRIBUTION",
                 font_size=7, color=RGBColor(0x55,0x88,0x70), align=PP_ALIGN.CENTER)

    return slide


def _slide_market_observations(prs, bullets):
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)

    # Header bar
    _add_rect(slide, 0, 0, SLIDE_W, Inches(1.15), GREEN)
    _add_textbox(slide, Inches(0.5), Inches(0.22), Inches(12), Inches(0.45),
                 "Market Observations", font_size=26, bold=True, color=WHITE)
    _add_textbox(slide, Inches(0.5), Inches(0.68), Inches(12), Inches(0.3),
                 "Current conditions relevant to your portfolio", font_size=11,
                 color=RGBColor(0xA0,0xD4,0xC0))

    # Green left accent strip
    _add_rect(slide, 0, Inches(1.15), Inches(0.06), SLIDE_H - Inches(1.15), GREEN)

    # Bullet cards
    card_top = Inches(1.35)
    card_h = Inches(1.1)
    gap = Inches(0.18)

    for i, bullet in enumerate(bullets[:5]):
        top = card_top + i * (card_h + gap)
        # Card background
        _add_rect(slide, Inches(0.2), top, Inches(12.9), card_h, GRAY_LIGHT)
        # Number badge
        _add_rect(slide, Inches(0.2), top, Inches(0.45), card_h, GREEN)
        _add_textbox(slide, Inches(0.2), top + Inches(0.3), Inches(0.45), Inches(0.5),
                     str(i + 1), font_size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        # Bullet text
        _add_textbox(slide, Inches(0.8), top + Inches(0.12), Inches(12.1), card_h - Inches(0.24),
                     bullet.lstrip('•- ').strip(), font_size=12, color=BLACK)

    _slide_footer(slide)
    return slide


def _slide_financing_idea(prs, idea_num, title, why_now, structure_lines, comps, total_ideas):
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)

    # Header
    _add_rect(slide, 0, 0, SLIDE_W, Inches(1.15), GREEN)
    label = f"Financing Idea {idea_num} of {total_ideas}"
    _add_textbox(slide, Inches(0.5), Inches(0.15), Inches(10), Inches(0.35),
                 label, font_size=10, bold=True, color=RGBColor(0xA0,0xD4,0xC0))
    _add_textbox(slide, Inches(0.5), Inches(0.45), Inches(12), Inches(0.6),
                 title, font_size=22, bold=True, color=WHITE)

    # Left column — Why Now + Structure
    col_left = Inches(0.4)
    col_w = Inches(6.1)
    y = Inches(1.3)

    _add_textbox(slide, col_left, y, col_w, Inches(0.3),
                 "WHY NOW", font_size=8, bold=True, color=GREEN)
    y += Inches(0.3)
    _add_rect(slide, col_left, y, col_w, Inches(0.025), GREEN_LIGHT)
    y += Inches(0.1)
    _add_textbox(slide, col_left, y, col_w, Inches(1.1),
                 why_now, font_size=11, color=BLACK)
    y += Inches(1.25)

    _add_textbox(slide, col_left, y, col_w, Inches(0.3),
                 "PROPOSED STRUCTURE", font_size=8, bold=True, color=GREEN)
    y += Inches(0.3)
    _add_rect(slide, col_left, y, col_w, Inches(0.025), GREEN_LIGHT)
    y += Inches(0.1)

    for line in structure_lines[:6]:
        _add_textbox(slide, col_left + Inches(0.1), y, col_w - Inches(0.1), Inches(0.3),
                     f"• {line.strip()}", font_size=11, color=BLACK)
        y += Inches(0.3)

    # Right column — Market Comps table
    col_right = Inches(7.0)
    col_rw = Inches(5.9)
    ry = Inches(1.3)

    _add_textbox(slide, col_right, ry, col_rw, Inches(0.3),
                 "MARKET COMPS", font_size=8, bold=True, color=GREEN)
    ry += Inches(0.3)
    _add_rect(slide, col_right, ry, col_rw, Inches(0.025), GREEN_LIGHT)
    ry += Inches(0.1)

    if comps:
        headers = ["Transaction", "Sponsor", "Size", "Spread"]
        col_widths = [Inches(2.1), Inches(1.4), Inches(0.9), Inches(1.2)]
        # Header row
        _add_rect(slide, col_right, ry, col_rw, Inches(0.32), GREEN)
        cx = col_right
        for h, cw in zip(headers, col_widths):
            _add_textbox(slide, cx + Inches(0.05), ry + Inches(0.04), cw, Inches(0.26),
                         h, font_size=9, bold=True, color=WHITE)
            cx += cw
        ry += Inches(0.32)

        for ci, comp in enumerate(comps[:5]):
            bg = GRAY_LIGHT if ci % 2 == 0 else WHITE
            _add_rect(slide, col_right, ry, col_rw, Inches(0.32), bg)
            cx = col_right
            for val, cw in zip(comp, col_widths):
                _add_textbox(slide, cx + Inches(0.05), ry + Inches(0.04), cw, Inches(0.26),
                             str(val), font_size=9, color=BLACK)
                cx += cw
            ry += Inches(0.32)

    _slide_footer(slide)
    return slide


def _slide_about_huntington(prs, body_text):
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)

    # Split header + content layout
    _add_rect(slide, 0, 0, Inches(4.5), SLIDE_H, GREEN_DARK)
    _add_rect(slide, Inches(4.5), 0, SLIDE_W - Inches(4.5), SLIDE_H, WHITE)
    _add_rect(slide, Inches(4.5), 0, Inches(0.06), SLIDE_H, GREEN)

    # Left panel text
    _add_textbox(slide, Inches(0.4), Inches(1.2), Inches(3.6), Inches(0.6),
                 "Huntington", font_size=28, bold=True, color=WHITE)
    _add_textbox(slide, Inches(0.4), Inches(1.8), Inches(3.6), Inches(0.5),
                 "Capital Markets", font_size=20, color=RGBColor(0xA0,0xD4,0xC0))

    _add_rect(slide, Inches(0.4), Inches(2.45), Inches(3.2), Inches(0.04),
              RGBColor(0x34,0xD3,0x99))

    _add_textbox(slide, Inches(0.4), Inches(2.65), Inches(3.6), Inches(3.5),
                 "How We Can Help", font_size=13, bold=True,
                 color=RGBColor(0xA0,0xD4,0xC0))

    # Right panel — body
    _add_textbox(slide, Inches(4.8), Inches(0.6), Inches(8.3), Inches(6.2),
                 body_text, font_size=12, color=BLACK)

    # Capabilities pills
    caps = ["Leveraged Finance", "High Yield", "M&A Advisory",
            "Dividend Recapitalizations", "Bolt-On M&A Financing"]
    pill_x = Inches(4.8)
    pill_y = Inches(5.8)
    for cap in caps:
        w = Inches(len(cap) * 0.095 + 0.3)
        _add_rect(slide, pill_x, pill_y, w, Inches(0.32), GREEN_LIGHT)
        _add_textbox(slide, pill_x + Inches(0.1), pill_y + Inches(0.04),
                     w - Inches(0.1), Inches(0.26),
                     cap, font_size=9, bold=True, color=GREEN)
        pill_x += w + Inches(0.1)
        if pill_x > Inches(12.5):
            pill_x = Inches(4.8)
            pill_y += Inches(0.38)

    _slide_footer(slide)
    return slide


def _slide_footer(slide, text="Huntington National Bank — Capital Markets & Sponsor Coverage  ·  CONFIDENTIAL"):
    _add_rect(slide, 0, SLIDE_H - Inches(0.32), SLIDE_W, Inches(0.32), GREEN_DARK)
    _add_textbox(slide, Inches(0.3), SLIDE_H - Inches(0.28), Inches(12.5), Inches(0.26),
                 text, font_size=7, color=RGBColor(0x88,0xBB,0xA8))


# ── Markdown parser ────────────────────────────────────────────────────────────

def _parse_leave_behind(markdown_text):
    """
    Parse leave-behind markdown into structured sections.
    Returns: {market_bullets, ideas: [{title, why_now, structure, comps}], about}
    """
    result = {"market_bullets": [], "ideas": [], "about": ""}

    # Split into H2 sections
    sections = re.split(r'^## ', markdown_text, flags=re.MULTILINE)

    for section in sections:
        if not section.strip():
            continue
        lines = section.strip().split('\n')
        heading = lines[0].strip()
        body = '\n'.join(lines[1:]).strip()

        if 'market' in heading.lower():
            # Extract bullets
            for line in body.split('\n'):
                line = line.strip().lstrip('•-*').strip()
                if line and len(line) > 10:
                    result["market_bullets"].append(line)

        elif 'financing' in heading.lower() or 'idea' in heading.lower():
            # Split individual ideas by H3 or bold headers or "---"
            idea_blocks = re.split(r'(?:^###|\n---|\*\*IDEA)', body, flags=re.MULTILINE)
            for block in idea_blocks:
                if not block.strip():
                    continue
                idea = _parse_idea_block(block)
                if idea:
                    result["ideas"].append(idea)

        elif 'huntington' in heading.lower() or 'help' in heading.lower() or 'about' in heading.lower():
            # Strip markdown formatting
            clean = re.sub(r'\*+([^*]+)\*+', r'\1', body)
            result["about"] = clean.strip()

    return result


def _parse_idea_block(block):
    """Parse a single financing idea block into title/why_now/structure/comps."""
    lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
    if not lines:
        return None

    idea = {"title": "", "why_now": "", "structure": [], "comps": []}

    # First non-empty line (strip bold markers) is the title
    title_line = lines[0].lstrip('*# ').rstrip('*')
    if title_line:
        idea["title"] = title_line

    # Find Why Now, Structure, Comps sub-sections
    current = None
    for line in lines[1:]:
        l = line.lower()
        if 'why now' in l:
            current = 'why'
            continue
        elif 'structure' in l or 'proposed' in l:
            current = 'structure'
            continue
        elif 'comp' in l and ('market' in l or 'transaction' in l):
            current = 'comps'
            continue

        if current == 'why':
            clean = re.sub(r'\*+([^*]+)\*+', r'\1', line).lstrip('*-• ').strip()
            if clean:
                idea["why_now"] += (' ' if idea["why_now"] else '') + clean
        elif current == 'structure':
            clean = re.sub(r'\*+([^*]+)\*+', r'\1', line).lstrip('*-• ').strip()
            if clean and not clean.startswith('|'):
                idea["structure"].append(clean)
        elif current == 'comps':
            if '|' in line:
                cells = [c.strip() for c in line.split('|') if c.strip()]
                if cells and not all(set(c) <= set('-: ') for c in cells):
                    idea["comps"].append(cells[:4])  # Transaction, Sponsor, Size, Spread

    return idea if idea["title"] else None


# ── Public API ────────────────────────────────────────────────────────────────

def build_leave_behind_pptx(
    sponsor_name: str,
    call_type: str,
    banker: str,
    leave_behind_markdown: str,
    call_date: str = None,
) -> bytes:
    """
    Build a polished leave-behind .pptx from AI-generated markdown.
    Returns raw bytes of the .pptx file.
    """
    if call_date is None:
        call_date = date.today().strftime("%B %d, %Y")

    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    parsed = _parse_leave_behind(leave_behind_markdown)

    # Slide 1: Cover
    _slide_cover(prs, sponsor_name, call_type, banker, call_date)

    # Slide 2: Market Observations
    bullets = parsed["market_bullets"]
    if not bullets:
        bullets = ["Current leveraged loan market is constructive — spread compression creating repricing opportunities.",
                   "CLO formation remains robust, supporting strong demand for new TLB issuance.",
                   "Middle market M&A activity accelerating as PE sponsors deploy dry powder.",
                   "Rate environment stabilizing — floating rate borrowers benefiting from SOFR plateau."]
    _slide_market_observations(prs, bullets)

    # Slides 3+: Financing Ideas (one per slide)
    ideas = parsed["ideas"]
    if not ideas:
        # Fallback single idea placeholder
        ideas = [{"title": f"{sponsor_name} — Refinancing Opportunity",
                  "why_now": "Current market conditions present a timely repricing opportunity.",
                  "structure": ["Product: Term Loan B", "Huntington Role: Co-Lead Arranger"],
                  "comps": []}]
    for i, idea in enumerate(ideas, 1):
        _slide_financing_idea(prs, i, idea["title"], idea["why_now"],
                              idea["structure"], idea["comps"], len(ideas))

    # Final slide: About Huntington
    about = parsed["about"]
    if not about:
        about = ("Huntington Capital Markets provides comprehensive leveraged finance, "
                 "high yield, and M&A advisory services to private equity sponsors across "
                 "the middle market. With deep sector expertise and a dedicated sponsor "
                 "coverage team, we serve as a trusted partner across the full deal lifecycle.")
    _slide_about_huntington(prs, about)

    buf = io.BytesIO()
    prs.save(buf)
    buf.seek(0)
    return buf.read()
