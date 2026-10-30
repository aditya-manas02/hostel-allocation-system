import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = pptx.Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    NAVY_DARK = RGBColor(15, 23, 42)       # Slate 900
    NAVY_MID = RGBColor(30, 41, 59)        # Slate 800
    INDIGO_PRIMARY = RGBColor(67, 56, 202) # Indigo 700
    INDIGO_ACCENT = RGBColor(99, 102, 241) # Indigo 500
    BLUE_BG = RGBColor(241, 245, 249)      # Slate 100
    CARD_BG = RGBColor(255, 255, 255)      # White
    EMERALD_GREEN = RGBColor(16, 185, 129) # Emerald 500
    AMBER_ORANGE = RGBColor(245, 158, 11)  # Amber 500
    TEXT_DARK = RGBColor(15, 23, 42)       # Slate 900
    TEXT_MUTED = RGBColor(100, 116, 139)   # Slate 500
    TEXT_LIGHT = RGBColor(255, 255, 255)   # White
    BORDER_LIGHT = RGBColor(226, 232, 240) # Slate 200

    def add_header(slide, tag_text, title_text, subtitle_text=None, is_dark=False):
        # Header Tag pill
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = INDIGO_ACCENT if is_dark else INDIGO_PRIMARY

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT if is_dark else TEXT_DARK

        # Subtitle
        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(0.45))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = RGBColor(148, 163, 184) if is_dark else TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_LIGHT):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        return shape

    def add_footer(slide, current_slide, total_slides=12, is_dark=False):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.3))
        tf = footer_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"Policy-Driven Hostel Allocation Engine  |  Presenter: Aditya Manas (12326241)  |  Slide {current_slide} of {total_slides}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = RGBColor(100, 116, 139) if is_dark else RGBColor(148, 163, 184)

    # =========================================================================
    # SLIDE 1: Title Slide (Dark Theme)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY_DARK
    bg1.line.fill.background()

    # Title Container Card
    add_card(slide1, Inches(1.0), Inches(1.0), Inches(11.333), Inches(5.5), NAVY_MID, RGBColor(51, 65, 85))

    # Badge Pill
    badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.5), Inches(5.0), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(30, 58, 138)
    badge.line.color.rgb = INDIGO_ACCENT
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "★  CAPSTONE PROJECT PRESENTATION"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(199, 210, 254)
    p_b.alignment = PP_ALIGN.CENTER

    # Main Heading
    tb_title = slide1.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.3), Inches(1.8))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    p1 = tf_t.paragraphs[0]
    p1.text = "Policy-Driven Hostel Allocation Engine"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT

    p2 = tf_t.add_paragraph()
    p2.text = "with Roommate Compatibility Matching & Cryptographic Audit"
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = INDIGO_ACCENT

    # Presenter Information Cards
    add_card(slide1, Inches(1.5), Inches(4.3), Inches(4.8), Inches(1.6), RGBColor(15, 23, 42), INDIGO_PRIMARY)
    p_box = slide1.shapes.add_textbox(Inches(1.7), Inches(4.45), Inches(4.4), Inches(1.3))
    tf_p = p_box.text_frame
    tf_p.word_wrap = True
    p_p1 = tf_p.paragraphs[0]
    p_p1.text = "CANDIDATE INFORMATION"
    p_p1.font.size = Pt(10)
    p_p1.font.bold = True
    p_p1.font.color.rgb = INDIGO_ACCENT

    p_p2 = tf_p.add_paragraph()
    p_p2.text = "Aditya Manas"
    p_p2.font.size = Pt(18)
    p_p2.font.bold = True
    p_p2.font.color.rgb = TEXT_LIGHT

    p_p3 = tf_p.add_paragraph()
    p_p3.text = "Registration No: 12326241  |  B.Tech CSE"
    p_p3.font.size = Pt(12)
    p_p3.font.color.rgb = RGBColor(203, 213, 225)

    add_card(slide1, Inches(6.6), Inches(4.3), Inches(5.2), Inches(1.6), RGBColor(15, 23, 42), RGBColor(51, 65, 85))
    d_box = slide1.shapes.add_textbox(Inches(6.8), Inches(4.45), Inches(4.8), Inches(1.3))
    tf_d = d_box.text_frame
    tf_d.word_wrap = True
    p_d1 = tf_d.paragraphs[0]
    p_d1.text = "PROJECT DOMAIN & SCOPE"
    p_d1.font.size = Pt(10)
    p_d1.font.bold = True
    p_d1.font.color.rgb = EMERALD_GREEN

    p_d2 = tf_d.add_paragraph()
    p_d2.text = "Enterprise University Management"
    p_d2.font.size = Pt(18)
    p_d2.font.bold = True
    p_d2.font.color.rgb = TEXT_LIGHT

    p_d3 = tf_d.add_paragraph()
    p_d3.text = "Deterministic Multi-Pass Heuristics + Full-Stack Monorepo"
    p_d3.font.size = Pt(12)
    p_d3.font.color.rgb = RGBColor(203, 213, 225)

    # =========================================================================
    # SLIDE 2: Project Introduction
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "1. Project Introduction", "System Overview & Institutional Vision",
               "An autonomous, policy-governed residential allocation platform for modern collegiate campuses.")
    add_footer(slide2, 2)

    # 3 Column Cards
    col_w = Inches(3.64)
    c1 = add_card(slide2, Inches(0.8), Inches(2.1), col_w, Inches(4.6))
    tb_c1 = slide2.shapes.add_textbox(Inches(1.0), Inches(2.3), col_w - Inches(0.4), Inches(4.2))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    p = tf_c1.paragraphs[0]
    p.text = "🏛️ Scale & Scope"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = INDIGO_PRIMARY

    items_c1 = [
        "Engineered for large-scale collegiate campuses managing 8,000+ residential beds.",
        "Oversees 5 campus hostels: Tagore, Gargi, Sarojini, Aryabhatta, and Kalam House.",
        "Accommodates Single, Double, Triple, and Quad rooms across 2,960 residential units.",
        "Designed to eliminate 100% of manual paperwork and clerical human errors."
    ]
    for item in items_c1:
        p_item = tf_c1.add_paragraph()
        p_item.text = "• " + item
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = TEXT_DARK
        p_item.space_before = Pt(8)

    c2 = add_card(slide2, Inches(4.84), Inches(2.1), col_w, Inches(4.6))
    tb_c2 = slide2.shapes.add_textbox(Inches(5.04), Inches(2.3), col_w - Inches(0.4), Inches(4.2))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p = tf_c2.paragraphs[0]
    p.text = "⚖️ Policy-Driven Core"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = INDIGO_PRIMARY

    items_c2 = [
        "Hard Constraint Enforcement (Invariant I8): Absolute compliance with gender boundaries and room capacity.",
        "Mandatory PWD Accessibility: Automatic mapping of disabled students to ground-floor wheelchair units.",
        "Statutory Quota Buckets: Priority quotas for General, PWD, Scholarship, Sports, and International students.",
        "Audit Trail: Append-only SHA-256 hash-chained log securing every allocation decision."
    ]
    for item in items_c2:
        p_item = tf_c2.add_paragraph()
        p_item.text = "• " + item
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = TEXT_DARK
        p_item.space_before = Pt(8)

    c3 = add_card(slide2, Inches(8.88), Inches(2.1), col_w, Inches(4.6))
    tb_c3 = slide2.shapes.add_textbox(Inches(9.08), Inches(2.3), col_w - Inches(0.4), Inches(4.2))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    p = tf_c3.paragraphs[0]
    p.text = "🤝 Roommate Harmony"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = INDIGO_PRIMARY

    items_c3 = [
        "Encrypted Lifestyle Questionnaire: Sleep cycles, study habits, cleanliness, and noise tolerance.",
        "AES-256-GCM Protection: Raw personal responses are never revealed to roommates, wardens, or staff.",
        "Heuristic Compatibility Scoring: Mathematical pairwise matching yielding compatibility index (0-100%).",
        "Substantially reduces mid-semester roommate conflict and emergency reallotment friction."
    ]
    for item in items_c3:
        p_item = tf_c3.add_paragraph()
        p_item.text = "• " + item
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = TEXT_DARK
        p_item.space_before = Pt(8)

    # =========================================================================
    # SLIDE 3: Existing Gaps
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "2. Problem Statement", "Existing Gaps in Traditional Allocation Systems",
               "Why conventional university residential allotments fail students and campus administrations.")
    add_footer(slide3, 3)

    gaps = [
        ("Opaque Manual Spreadsheets", "Allocations performed via disconnected Excel files or legacy forms; highly susceptible to administrative discretion, clerical mistakes, and accusations of favoritism."),
        ("Random / Discordant Roommates", "Students paired randomly without regard for diurnal cycles or study habits, leading to severe sleep disruption, academic friction, and endless room transfer petitions."),
        ("Disability & Accessibility Violations", "Physically challenged and PWD students frequently assigned to upper floors lacking ramp or elevator access due to lack of hard constraint validation."),
        ("Severe Privacy Breaches", "Lifestyle preferences, medical conditions, and habits handled insecurely on paper or unencrypted databases, exposing sensitive personal data to unauthorized staff."),
        ("Zero Auditability & Accountability", "Impossible to reconstruct why an allocation was granted or verify whether hard constraints were overridden. Lack of cryptographic tampering detection.")
    ]

    for idx, (title, desc) in enumerate(gaps):
        top_pos = Inches(2.0 + idx * 0.95)
        add_card(slide3, Inches(0.8), top_pos, Inches(11.733), Inches(0.82), RGBColor(254, 242, 242), RGBColor(254, 202, 202))
        tb = slide3.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.08), Inches(11.333), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = f"✕  GAP 0{idx+1}: {title}"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = RGBColor(185, 28, 28)

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = RGBColor(71, 85, 105)

    # =========================================================================
    # SLIDE 4: Objectives
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "3. Project Objectives", "Core Architectural & Functional Goals",
               "Concrete engineering goals set to transform university hostel governance.")
    add_footer(slide4, 4)

    # 4 Cards in 2x2 Grid
    grid = [
        ("01. Zero Constraint Violations", "Enforce hard policy constraints (Invariant I8) via mathematically verified engine guarantees. Zero student assigned twice, zero bed over-allocated, strict gender boundaries.", EMERALD_GREEN),
        ("02. Deterministic Reproducibility", "Invariant I3: Given identical applicant snapshots, quota rules, engine version, and PRNG seed, the system outputs byte-identical allocation drafts every single time.", INDIGO_PRIMARY),
        ("03. Privacy-Preserving Matching", "Invariant I6: Encrypt lifestyle questionnaires at rest with AES-256-GCM. Never display raw questionnaire answers to staff. Present only aggregate compatibility scores.", RGBColor(147, 51, 234)),
        ("04. Full Explainability & Audit", "Invariant I4 & I7: Provide a clear, human-readable rationale for every bed assignment alongside an append-only SHA-256 hash-chained tamper-evident audit ledger.", AMBER_ORANGE)
    ]

    card_w = Inches(5.65)
    card_h = Inches(2.2)
    positions = [(Inches(0.8), Inches(2.1)), (Inches(6.88), Inches(2.1)),
                 (Inches(0.8), Inches(4.55)), (Inches(6.88), Inches(4.55))]

    for idx, (title, desc, color) in enumerate(grid):
        x, y = positions[idx]
        add_card(slide4, x, y, card_w, card_h)
        tb = slide4.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), card_w - Inches(0.6), card_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = color

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_DARK
        p_d.space_before = Pt(8)

    # =========================================================================
    # SLIDE 5: Achieving Registration Objectives (Workflow)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "4. Implementation Strategy", "How Registration & Operational Objectives are Achieved",
               "End-to-end multi-role system architecture bridging student self-service and administrative governance.")
    add_footer(slide5, 5)

    stages = [
        ("Step 1: Student Portal", "Aditya Manas submits hostel application, verifies eligibility status against policy rules, drag-and-drops preferences, and submits encrypted lifestyle questionnaire."),
        ("Step 2: Engine Execution", "Admin triggers multi-pass heuristic engine. Allocates 8,000+ beds in seconds with seeded PRNG tiebreaker and multi-layer constraint validation."),
        ("Step 3: Warden Bed Map Review", "Hostel Wardens inspect visual room-by-room bed maps, review structured Invariant I4 explanations, and perform reasoned reassignments with audited escalation."),
        ("Step 4: Formal Publication", "Sole atomic path sets PUBLISHED status in a MongoDB ACID transaction with cryptographic approval signature. Published orders become immutable (Invariant I2)."),
        ("Step 5: Post-Publish Reallocations", "Students request room changes via portal with mandatory justification. Admins review in dedicated queue and execute direct bed assignments in real time.")
    ]

    for idx, (title, desc) in enumerate(stages):
        top_pos = Inches(2.0 + idx * 0.95)
        add_card(slide5, Inches(0.8), top_pos, Inches(11.733), Inches(0.82), RGBColor(248, 250, 252), INDIGO_ACCENT)
        tb = slide5.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.08), Inches(11.333), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = INDIGO_PRIMARY

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 6: Allocation Algorithm & Model
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "5. Algorithm Architecture", "Deterministic Multi-Pass Heuristic Engine",
               "Pure TypeScript zero-I/O algorithmic pipeline guaranteeing mathematical fairness and execution speed.")
    add_footer(slide6, 6)

    passes = [
        ("PASS A: Quota & PWD Hard Priority", "PWD applicants prioritized and matched strictly to ground-floor wheelchair-accessible beds.\nCategorical quota reservations fulfilled: SC/ST/OBC, Sports, Scholarship, International.", INDIGO_PRIMARY),
        ("PASS B: General Merit & Ranked Preference", "Evaluates applicant ranked choices (hostels 1..N, room types).\nSorts applicants deterministically by composite score (academic CGPA + home-to-campus distance index).\nGreedy assignment to highest available preference bucket.", EMERALD_GREEN),
        ("PASS C: Waitlist Buffer & Fallback", "Handles over-subscription deterministically without violating room capacity.\nAssigns remaining applicants to fallback campus hostels or waitlists.\nMaintains institutional buffer capacity for emergency medical accommodations.", AMBER_ORANGE)
    ]

    for idx, (title, desc, color) in enumerate(passes):
        top_pos = Inches(2.1 + idx * 1.55)
        add_card(slide6, Inches(0.8), top_pos, Inches(11.733), Inches(1.35))
        tb = slide6.shapes.add_textbox(Inches(1.1), top_pos + Inches(0.12), Inches(11.1), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = color

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11.5)
        p_d.font.color.rgb = TEXT_DARK
        p_d.space_before = Pt(4)

    # Bottom note
    bn = slide6.shapes.add_textbox(Inches(0.8), Inches(6.5), Inches(11.733), Inches(0.4))
    tf_bn = bn.text_frame
    p_bn = tf_bn.paragraphs[0]
    p_bn.text = "⚡ Seeded Determinism: Uses SFC32 PRNG (Simple Fast Counter) with Cyrb128 state hashing. Math.random() is strictly prohibited."
    p_bn.font.size = Pt(11)
    p_bn.font.bold = True
    p_bn.font.color.rgb = INDIGO_PRIMARY

    # =========================================================================
    # SLIDE 7: Roommate Matching & Privacy
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "6. Roommate Matching Model", "Lifestyle Compatibility & AES-256 Privacy Architecture",
               "Pairwise multi-dimensional metric optimizing student living harmony without compromising privacy.")
    add_footer(slide7, 7)

    # Left Card: Dimensions
    add_card(slide7, Inches(0.8), Inches(2.1), Inches(5.65), Inches(4.7))
    tb_l = slide7.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.25), Inches(4.3))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = "4-Dimensional Compatibility Vector"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = INDIGO_PRIMARY

    dims = [
        ("Sleep Schedule (Diurnal Cycle):", "Early Bird vs. Night Owl alignment (Weight: 35%). Prevents sleep disturbance."),
        ("Study Habits & Quiet Hours:", "In-room silent study vs. Library focus vs. Collaborative study (Weight: 25%)."),
        ("Cleanliness & Room Tidiness:", "High organization vs. Flexible routines (Weight: 20%). Prevents chore friction."),
        ("Noise & Social Tolerance:", "Tolerance for in-room visitors, gaming, and musical instruments (Weight: 20%).")
    ]
    for d_title, d_desc in dims:
        p1 = tf_l.add_paragraph()
        p1.text = "• " + d_title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        p1.space_before = Pt(6)
        p2 = tf_l.add_paragraph()
        p2.text = "  " + d_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # Right Card: Cryptography & Formula
    add_card(slide7, Inches(6.88), Inches(2.1), Inches(5.65), Inches(4.7))
    tb_r = slide7.shapes.add_textbox(Inches(7.08), Inches(2.3), Inches(5.25), Inches(4.3))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = "Mathematical Model & Invariant I6 Security"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD_GREEN

    points_r = [
        ("Distance Metric:", "Normalized Euclidean Distance in 4D space:\nScore(A, B) = 100 * [1 - sqrt(sum(w_i * (A_i - B_i)^2)) / max_dist]"),
        ("AES-256-GCM Encryption:", "All raw survey answers encrypted at rest with per-record initialization vectors (IVs) and authenticated Galois Counter Mode."),
        ("Zero PII Leakage:", "Students, Wardens, and Admins only observe aggregate pairwise match scores (e.g. 82/100). Individual responses are never returned in API payloads."),
        ("GDPR Right-to-Forget:", "Full deletion on student request with audited tombstone record preserving mathematical allocation integrity.")
    ]
    for r_title, r_desc in points_r:
        p1 = tf_r.add_paragraph()
        p1.text = "• " + r_title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        p1.space_before = Pt(6)
        p2 = tf_r.add_paragraph()
        p2.text = "  " + r_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 8: Student Portal Features
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "7. Core Features: Student Portal", "Student Self-Service & Room Change Lifecycle",
               "Designed for Aditya Manas (12326241) and 8,000+ campus applicants.")
    add_footer(slide8, 8)

    sf = [
        ("1-Click Application & Document Verification", "Students apply online, upload residency and category certificates, and track automated document verification against institute eligibility criteria."),
        ("Drag-to-Rank Preferences", "Interactive visual preference builder allowing students to order choices across all 5 campus hostels and preferred room types (Single/Double/Triple/Quad)."),
        ("Official Allotment Certificate (`/result`)", "Live confirmed allotment order: Hostel, Block, Floor, Room, Bed, Reporting Date, Dining Hall allotment, and assigned roommate details with compatibility score."),
        ("Cryptographic Printable PDF Letter", "Official university allotment letter with SHA-256 cryptographic seal, QR verification code, and warden digital signature ready for physical check-in."),
        ("Formal Room Change Request Flow", "Students can submit formal room transfer requests selecting target residence, room type, category, and minimum 10-character justification with real-time tracking.")
    ]

    for idx, (title, desc) in enumerate(sf):
        top_pos = Inches(2.0 + idx * 0.95)
        add_card(slide8, Inches(0.8), top_pos, Inches(11.733), Inches(0.82))
        tb = slide8.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.08), Inches(11.333), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = f"🎓  {title}"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = INDIGO_PRIMARY

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 9: Admin & Warden Features
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "8. Core Features: Admin & Warden", "Command Center, Direct Allotment & Visual Bed Map",
               "High-productivity tools for residential administrators, wardens, and chief wardens.")
    add_footer(slide9, 9)

    af = [
        ("Direct Student Room Allotment (`/assignments`)", "Admin portal to view complete student roster (Allotted vs. Waitlisted). Search by roll/name and assign any student to any bed across 5 hostels with Invariant I5 audit trail."),
        ("Interactive Visual Bed Map (`/bedmap`)", "Floor-by-floor graphical bed matrix across 5 hostels, 4 blocks, and 16 floors. Real-time visual color-coding: Occupied (Slate), Vacant (Green), Overridden (Amber), and Accessible (♿)."),
        ("1-Click Vacant Bed Assignment", "Wardens can click any vacant bed on the interactive bed map to immediately allot it to a waitlisted student with automated capacity update."),
        ("Room Change Requests Queue (`/room-changes`)", "Central review queue for all student transfer petitions. Admins/Wardens inspect reasons, evaluate bed availability, and execute 'Approve & Reassign Bed' or 'Decline'."),
        ("Chief Warden Hard Constraint Escalation (`/escalations`)", "Multi-tiered review queue for Invariant I5 exceptions requiring Chief Warden authorization before updating published institutional records.")
    ]

    for idx, (title, desc) in enumerate(af):
        top_pos = Inches(2.0 + idx * 0.95)
        add_card(slide9, Inches(0.8), top_pos, Inches(11.733), Inches(0.82))
        tb = slide9.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.08), Inches(11.333), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = f"🏢  {title}"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = EMERALD_GREEN

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 10: Tech Stack
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "9. Technology Stack", "Full-Stack Enterprise Architecture",
               "Production-grade monorepo engineered with modern web technologies and ACID persistence.")
    add_footer(slide10, 10)

    # 4 Columns
    col_w4 = Inches(2.72)
    spacing4 = Inches(0.28)

    tech_cards = [
        ("Frontend Application", "apps/web", INDIGO_PRIMARY, [
            "Next.js 15 App Router",
            "TypeScript (Strict)",
            "Tailwind CSS + shadcn/ui",
            "Reactive Store (allocationStore)",
            "Custom DOM Events Sync",
            "Responsive Mobile / Desktop",
            "Client-Side PDF Generator"
        ]),
        ("Backend REST API", "apps/api", EMERALD_GREEN, [
            "Node.js + Express + TypeScript",
            "RESTful API Architecture",
            "Zod Request Validation",
            "JWT Auth & RBAC Middleware",
            "OpenAPI / Swagger at /api/docs",
            "Standardized Error Handling",
            "Correlation IDs for Tracing"
        ]),
        ("Allocation Engine", "packages/engine", AMBER_ORANGE, [
            "Pure TypeScript Library",
            "Zero I/O & Zero Frameworks",
            "Deterministic Multi-Pass Heuristics",
            "Seeded PRNG (SFC32 / Cyrb128)",
            "Fast-Check Property Testing",
            "Roommate Compatibility Scoring",
            "100% Green Test Suite"
        ]),
        ("Database & Infrastructure", "infra", RGBColor(147, 51, 234), [
            "MongoDB 8.0 Replica Set (rs0)",
            "ACID Multi-Doc Transactions",
            "Redis 7.4 + BullMQ Jobs",
            "AES-256-GCM Encryption",
            "SHA-256 Hash-Chained Audit",
            "Docker Compose Orchestration",
            "Vercel + Render Deployment"
        ])
    ]

    for idx, (title, pkg, color, bullets) in enumerate(tech_cards):
        left_pos = Inches(0.8) + idx * (col_w4 + spacing4)
        add_card(slide10, left_pos, Inches(2.1), col_w4, Inches(4.7))
        tb = slide10.shapes.add_textbox(left_pos + Inches(0.18), Inches(2.25), col_w4 - Inches(0.36), Inches(4.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = color

        p_pkg = tf.add_paragraph()
        p_pkg.text = pkg
        p_pkg.font.size = Pt(10)
        p_pkg.font.color.rgb = TEXT_MUTED

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = "• " + b
            p_b.font.size = Pt(10.5)
            p_b.font.color.rgb = TEXT_DARK
            p_b.space_before = Pt(4)

    # =========================================================================
    # SLIDE 11: Invariants & Security
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "10. Invariants & Security", "8 Non-Negotiable Institutional Invariants (I1–I8)",
               "Mathematical and architectural safety guarantees enforced across code and databases.")
    add_footer(slide11, 11)

    invs = [
        ("I1 & I2: Draft Separation & Immutability", "Strict state machine (GENERATING → DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED). Exactly one atomic code path publishes drafts. Published records are immutable."),
        ("I3: Mathematical Reproducibility", "Same applicant snapshot + seed + rules + engine version ⇒ byte-identical draft output. Verified through comprehensive fast-check property tests."),
        ("I4: Explainable Assignments", "Every bed assignment stores structured explanations: preference rank, verified constraints, quota bucket, tiebreak PRNG value, and rationale."),
        ("I5: Mandatory Override Justification", "All manual edits and reassignments require categorized justification (≥10 chars). Hard constraint exceptions mandate Chief Warden escalation."),
        ("I6: Sensitive Lifestyle Privacy", "Questionnaire answers encrypted with AES-256-GCM (per-record IV). Never exposed in student or admin payloads; pairwise scores only."),
        ("I7 & I8: Append-Only Audit & Hard Constraints", "Append-only SHA-256 hash-chained audit log with tamper detection. Hard constraints (gender, capacity, PWD accessibility) are never violated.")
    ]

    for idx, (title, desc) in enumerate(invs):
        top_pos = Inches(2.0 + idx * 0.8)
        add_card(slide11, Inches(0.8), top_pos, Inches(11.733), Inches(0.72))
        tb = slide11.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.06), Inches(11.333), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = f"🔒  {title}"
        p_t.font.size = Pt(12.5)
        p_t.font.bold = True
        p_t.font.color.rgb = INDIGO_PRIMARY

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 12: Benchmarks & Conclusion
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    add_header(slide12, "11. Results & Conclusion", "Performance Benchmarks & Summary",
               "Empirical verification of engine speed, fairness, and system robustness.")
    add_footer(slide12, 12)

    # 4 KPI Stat Boxes
    kpis = [
        ("3.70s", "Engine Allocation Time", "Allocated 8,000 applicants to 8,000 beds (~160x faster than 10-min budget)", EMERALD_GREEN),
        ("0", "Constraint Violations", "Zero gender, capacity, or PWD accessibility breaches detected", INDIGO_PRIMARY),
        ("100%", "Test Suite Green", "Passed property tests (>=200 runs), unit tests, and Next.js 14 static build", RGBColor(147, 51, 234)),
        ("20 / 20", "Next.js Web Routes", "All routes statically compiled and live synchronized across 5 portals", AMBER_ORANGE)
    ]

    kpi_w = Inches(2.72)
    kpi_spacing = Inches(0.28)
    for idx, (stat, label, detail, color) in enumerate(kpis):
        left_pos = Inches(0.8) + idx * (kpi_w + kpi_spacing)
        add_card(slide12, left_pos, Inches(2.1), kpi_w, Inches(2.1))
        tb = slide12.shapes.add_textbox(left_pos + Inches(0.15), Inches(2.2), kpi_w - Inches(0.3), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p_s = tf.paragraphs[0]
        p_s.text = stat
        p_s.font.size = Pt(28)
        p_s.font.bold = True
        p_s.font.color.rgb = color
        p_s.alignment = PP_ALIGN.CENTER

        p_l = tf.add_paragraph()
        p_l.text = label
        p_l.font.size = Pt(12)
        p_l.font.bold = True
        p_l.font.color.rgb = TEXT_DARK
        p_l.alignment = PP_ALIGN.CENTER

        p_d = tf.add_paragraph()
        p_d.text = detail
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.CENTER
        p_d.space_before = Pt(4)

    # Summary Conclusion Box
    add_card(slide12, Inches(0.8), Inches(4.4), Inches(11.733), Inches(2.3), RGBColor(248, 250, 252), INDIGO_PRIMARY)
    tb_c = slide12.shapes.add_textbox(Inches(1.1), Inches(4.55), Inches(11.1), Inches(2.0))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = "🎯 Presentation Takeaways for Aditya Manas (12326241)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = INDIGO_PRIMARY

    bullets_c = [
        "Completely solves traditional hostel allocation bottlenecks by replacing opaque spreadsheets with a deterministic, explainable algorithm.",
        "Guarantees privacy-preserving roommate harmony using AES-256-GCM encryption and 4D compatibility heuristic scoring.",
        "Delivers an end-to-end production architecture with student self-service, administrative direct allotment, and interactive visual bed mapping.",
        "Empirically proven to scale effortlessly to massive university populations while preserving 8 non-negotiable security invariants."
    ]
    for b in bullets_c:
        p_b = tf_c.add_paragraph()
        p_b.text = "✔  " + b
        p_b.font.size = Pt(11.5)
        p_b.font.color.rgb = TEXT_DARK
        p_b.space_before = Pt(4)

    # Save Presentation
    output_filename = "Hostel_Allocation_System_Presentation.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as {output_filename}")

if __name__ == "__main__":
    create_presentation()
