"""
scrape_brand.py — Scrape a website's brand identity using the Firecrawl API.

Usage:
    python execution/scrape_brand.py <URL> [--output-dir DIR]

Outputs structured brand data (colors, typography, spacing, components, images)
plus downloaded visual assets (logo, favicon, screenshots) to:
    .tmp/brand-scraper/<domain>/

Requires:
    FIRECRAWL_API_KEY in .env
    pip install requests python-dotenv
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2"
REQUEST_TIMEOUT = 90  # seconds
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # seconds, doubles each retry


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def load_api_key() -> str:
    """Load FIRECRAWL_API_KEY from .env (project root)."""
    # Walk up from script location to find .env
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    dotenv_path = project_root / ".env"
    load_dotenv(dotenv_path)

    key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    if not key:
        print("ERROR: FIRECRAWL_API_KEY not found in .env")
        print(f"  Looked for .env at: {dotenv_path}")
        print("  Get your key at: https://www.firecrawl.dev/app/api-keys")
        print("  Then add to .env: FIRECRAWL_API_KEY=fc-...")
        sys.exit(1)
    return key


def firecrawl_request(endpoint: str, payload: dict, api_key: str) -> dict:
    """Make a POST request to the Firecrawl API with retry + backoff."""
    url = f"{FIRECRAWL_BASE_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT
            )

            if resp.status_code == 429:
                wait = RETRY_BACKOFF ** attempt
                print(f"  Rate limited (429). Waiting {wait}s before retry {attempt}/{MAX_RETRIES}...")
                time.sleep(wait)
                continue

            resp.raise_for_status()
            data = resp.json()

            if not data.get("success"):
                print(f"  API returned success=false: {json.dumps(data, indent=2)}")
                sys.exit(1)

            return data

        except requests.exceptions.Timeout:
            print(f"  Request timed out (attempt {attempt}/{MAX_RETRIES}).")
            if attempt == MAX_RETRIES:
                raise
            time.sleep(RETRY_BACKOFF ** attempt)

        except requests.exceptions.HTTPError as e:
            print(f"  HTTP error: {e}")
            raise

    # Should not reach here, but just in case
    raise RuntimeError("Exhausted retries")


def download_file(url: str, dest: Path) -> bool:
    """Download a file from a URL. Returns True on success."""
    if not url:
        return False
    try:
        resp = requests.get(url, timeout=30, stream=True)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Warning: Could not download {url}: {e}")
        return False


def determine_extension(url: str, default: str = ".png") -> str:
    """Guess file extension from URL."""
    path = urlparse(url).path.lower()
    for ext in [".svg", ".png", ".jpg", ".jpeg", ".ico", ".webp", ".gif"]:
        if path.endswith(ext):
            return ext
    return default


# ---------------------------------------------------------------------------
# Core scraping logic
# ---------------------------------------------------------------------------


def scrape_branding(target_url: str, api_key: str) -> dict:
    """
    Call 1: Extract branding profile, screenshot, and markdown.

    Uses formats: branding, screenshot (full page + viewport), markdown
    """
    print(f"[1/2] Scraping branding data from {target_url}...")

    payload = {
        "url": target_url,
        "formats": [
            "branding",
            {"type": "screenshot", "fullPage": True},
            "markdown",
        ],
        "timeout": 60000,
        "blockAds": True,
    }

    result = firecrawl_request("scrape", payload, api_key)
    return result.get("data", {})


def scrape_design_details(target_url: str, api_key: str) -> dict:
    """
    Call 2: Extract supplementary design details via JSON extraction.

    Uses a prompt to ask the LLM about design patterns that the structured
    branding format might not capture — gradients, shadows, hover effects,
    hero layout, etc.
    """
    print(f"[2/2] Extracting supplementary design details from {target_url}...")

    prompt = (
        "Analyze this website's visual design and extract the following details. "
        "For each field, return null if the information is not present or not applicable.\n\n"
        "1. gradient_definitions: Array of CSS gradients used prominently on the page "
        "(e.g., 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')\n"
        "2. shadow_styles: Array of notable box-shadow or text-shadow values used\n"
        "3. hover_effects: Description of hover behaviors on buttons, links, cards, and interactive elements\n"
        "4. hero_section: Object with keys: layout (description), background_type (solid/gradient/image/video), "
        "cta_text (the main call-to-action button text), headline (the main heading text), subheadline\n"
        "5. notable_techniques: Array of distinctive CSS/design techniques "
        "(e.g., glassmorphism, parallax scrolling, clip-path shapes, sticky elements, animated gradients)\n"
        "6. image_treatments: Description of how images are styled (border-radius, overlays, filters, aspect ratios)\n"
        "7. navigation_style: Object with keys: type (sticky/fixed/static), transparent_on_hero (bool), "
        "mobile_pattern (hamburger/bottom-nav/drawer), has_mega_menu (bool)\n"
        "8. card_styles: Description of any card components — border, shadow, radius, padding\n"
        "9. section_spacing: Approximate spacing between major page sections\n"
        "10. footer_description: Brief description of footer layout and content\n"
        "11. social_proof_elements: Any testimonials, logos, stats, or trust badges\n"
        "12. animation_descriptions: Descriptions of any scroll animations, transitions, "
        "or micro-interactions observed"
    )

    payload = {
        "url": target_url,
        "formats": [
            {
                "type": "json",
                "prompt": prompt,
            }
        ],
        "onlyMainContent": False,
        "timeout": 60000,
        "blockAds": True,
    }

    result = firecrawl_request("scrape", payload, api_key)
    return result.get("data", {}).get("json", {})


def scrape_hero_screenshot(target_url: str, api_key: str) -> str | None:
    """
    Take a viewport-sized screenshot (hero/above-the-fold).
    Returns the screenshot URL or None.
    """
    print("  Taking hero screenshot (viewport-height only)...")

    payload = {
        "url": target_url,
        "formats": [
            {"type": "screenshot", "fullPage": False},
        ],
        "timeout": 30000,
        "blockAds": True,
    }

    try:
        result = firecrawl_request("scrape", payload, api_key)
        return result.get("data", {}).get("screenshot")
    except Exception as e:
        print(f"  Warning: Hero screenshot failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Output generation
# ---------------------------------------------------------------------------


def generate_summary(brand: dict, design: dict, target_url: str) -> str:
    """Generate a human-readable markdown summary of the brand profile."""
    lines = [
        f"# Brand Profile: {target_url}",
        "",
        f"**Color Scheme:** {brand.get('colorScheme', 'unknown')}",
        "",
    ]

    # Colors
    colors = brand.get("colors") or {}
    if colors:
        lines.append("## Colors")
        lines.append("")
        lines.append("| Role | Value |")
        lines.append("|------|-------|")
        for role, value in colors.items():
            if isinstance(value, str):
                lines.append(f"| {role} | `{value}` |")
        lines.append("")

    # Typography
    typo = brand.get("typography") or {}
    families = typo.get("fontFamilies") or {}
    sizes = typo.get("fontSizes") or {}
    weights = typo.get("fontWeights") or {}
    line_heights = typo.get("lineHeights") or {}

    if families or sizes:
        lines.append("## Typography")
        lines.append("")
        if families:
            lines.append("### Font Families")
            for role, family in families.items():
                lines.append(f"- **{role}:** {family}")
            lines.append("")
        if sizes:
            lines.append("### Font Sizes")
            for level, size in sizes.items():
                lines.append(f"- **{level}:** {size}")
            lines.append("")
        if weights:
            lines.append("### Font Weights")
            for name, weight in weights.items():
                lines.append(f"- **{name}:** {weight}")
            lines.append("")
        if line_heights:
            lines.append("### Line Heights")
            for role, lh in line_heights.items():
                lines.append(f"- **{role}:** {lh}")
            lines.append("")

    # Spacing
    spacing = brand.get("spacing") or {}
    if spacing:
        lines.append("## Spacing")
        lines.append("")
        if "baseUnit" in spacing:
            lines.append(f"- **Base Unit:** {spacing['baseUnit']}px")
        if "borderRadius" in spacing:
            lines.append(f"- **Border Radius:** {spacing['borderRadius']}")
        lines.append("")

    # Components
    components = brand.get("components") or {}
    if components:
        lines.append("## UI Components")
        lines.append("")
        for comp_name, comp_data in components.items():
            if isinstance(comp_data, dict):
                lines.append(f"### {comp_name}")
                for prop, val in comp_data.items():
                    lines.append(f"- **{prop}:** {val}")
                lines.append("")

    # Images
    images = brand.get("images") or {}
    if images:
        lines.append("## Brand Images")
        lines.append("")
        for img_type, img_url in images.items():
            if img_url:
                lines.append(f"- **{img_type}:** {img_url}")
        lines.append("")

    # Logo
    if brand.get("logo"):
        lines.append(f"**Logo URL:** {brand['logo']}")
        lines.append("")

    # Layout
    layout = brand.get("layout") or {}
    if layout:
        lines.append("## Layout")
        lines.append("")
        lines.append(f"```json\n{json.dumps(layout, indent=2)}\n```")
        lines.append("")

    # Animations
    animations = brand.get("animations") or {}
    if animations:
        lines.append("## Animations")
        lines.append("")
        lines.append(f"```json\n{json.dumps(animations, indent=2)}\n```")
        lines.append("")

    # Personality
    personality = brand.get("personality") or {}
    if personality:
        lines.append("## Brand Personality")
        lines.append("")
        for trait, val in personality.items():
            lines.append(f"- **{trait}:** {val}")
        lines.append("")

    # Design analysis supplement
    if design:
        lines.append("---")
        lines.append("")
        lines.append("## Design Analysis (Supplementary)")
        lines.append("")

        hero = design.get("hero_section") or {}
        if hero:
            lines.append("### Hero Section")
            for k, v in hero.items():
                if v:
                    lines.append(f"- **{k}:** {v}")
            lines.append("")

        gradients = design.get("gradient_definitions") or []
        if gradients:
            lines.append("### Gradients")
            for g in gradients:
                lines.append(f"- `{g}`")
            lines.append("")

        shadows = design.get("shadow_styles") or []
        if shadows:
            lines.append("### Shadows")
            for s in shadows:
                lines.append(f"- `{s}`")
            lines.append("")

        notable = design.get("notable_techniques") or []
        if notable:
            lines.append("### Notable Techniques")
            for t in notable:
                lines.append(f"- {t}")
            lines.append("")

        nav = design.get("navigation_style") or {}
        if nav:
            lines.append("### Navigation")
            for k, v in nav.items():
                lines.append(f"- **{k}:** {v}")
            lines.append("")

        hover = design.get("hover_effects")
        if hover:
            lines.append("### Hover Effects")
            lines.append(f"{hover}")
            lines.append("")

        cards = design.get("card_styles")
        if cards:
            lines.append("### Card Styles")
            lines.append(f"{cards}")
            lines.append("")

        anims = design.get("animation_descriptions")
        if anims:
            lines.append("### Animation Details")
            lines.append(f"{anims}")
            lines.append("")

    return "\n".join(lines)


def generate_brand_guidelines(brand: dict, design: dict, metadata: dict, target_url: str, out_dir: Path) -> str:
    """
    Generate a polished, referenceable brand guidelines markdown document.

    Unlike the quick summary, this is designed as a standalone reference spec
    that other skills or processes can point at when building a new website.
    Includes ready-to-use CSS custom properties, Google Fonts links, and
    organized design tokens.
    """
    from datetime import datetime

    domain = urlparse(target_url).netloc
    now = datetime.now().strftime("%Y-%m-%d")
    colors = brand.get("colors") or {}
    typo = brand.get("typography") or {}
    families = typo.get("fontFamilies") or {}
    sizes = typo.get("fontSizes") or {}
    weights = typo.get("fontWeights") or {}
    line_heights = typo.get("lineHeights") or {}
    spacing = brand.get("spacing") or {}
    components = brand.get("components") or {}
    images = brand.get("images") or {}
    layout = brand.get("layout") or {}
    animations = brand.get("animations") or {}
    personality = brand.get("personality") or {}
    logo_url = brand.get("logo") or images.get("logo")

    lines = []

    # ── Header ──────────────────────────────────────────────────────────
    lines.append(f"# Brand Guidelines — {domain}")
    lines.append("")
    lines.append(f"> Auto-extracted from [{target_url}]({target_url}) on {now}")
    lines.append(f"> Color scheme: **{brand.get('colorScheme', 'unknown')}**")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ── Table of Contents ───────────────────────────────────────────────
    lines.append("## Table of Contents")
    lines.append("")
    lines.append("1. [Logo & Brand Images](#logo--brand-images)")
    lines.append("2. [Color Palette](#color-palette)")
    lines.append("3. [Typography](#typography)")
    lines.append("4. [Spacing & Layout](#spacing--layout)")
    lines.append("5. [UI Components](#ui-components)")
    lines.append("6. [Visual Effects & Techniques](#visual-effects--techniques)")
    lines.append("7. [Brand Personality](#brand-personality)")
    lines.append("8. [CSS Custom Properties (Ready to Use)](#css-custom-properties)")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ── 1. Logo & Brand Images ──────────────────────────────────────────
    lines.append("## Logo & Brand Images")
    lines.append("")

    # Reference local files if they exist
    logo_files = list(out_dir.glob("logo.*"))
    favicon_files = list(out_dir.glob("favicon.*"))
    og_files = list(out_dir.glob("og_image.*"))
    hero_files = list(out_dir.glob("hero_screenshot.*"))

    if logo_url:
        lines.append(f"**Logo URL:** {logo_url}")
    if logo_files:
        lines.append(f"**Local file:** `{logo_files[0].name}`")
    lines.append("")

    rows = []
    if images.get("favicon") or favicon_files:
        rows.append(f"| Favicon | `{favicon_files[0].name if favicon_files else 'N/A'}` | {images.get('favicon', 'N/A')} |")
    og_url_val = images.get("ogImage") or metadata.get("ogImage")
    if og_url_val or og_files:
        rows.append(f"| OG Image | `{og_files[0].name if og_files else 'N/A'}` | {og_url_val or 'N/A'} |")
    if hero_files:
        rows.append(f"| Hero Screenshot | `{hero_files[0].name}` | (captured locally) |")
    ss_files = list(out_dir.glob("screenshot.*"))
    if ss_files:
        rows.append(f"| Full-Page Screenshot | `{ss_files[0].name}` | (captured locally) |")

    if rows:
        lines.append("| Asset | Local File | Source URL |")
        lines.append("|-------|-----------|------------|")
        lines.extend(rows)
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 2. Color Palette ────────────────────────────────────────────────
    lines.append("## Color Palette")
    lines.append("")

    if colors:
        # Core colors
        core_roles = ["primary", "secondary", "accent", "background", "textPrimary", "textSecondary"]
        core = {k: v for k, v in colors.items() if k in core_roles and isinstance(v, str)}
        semantic_roles = ["link", "success", "warning", "error"]
        semantic = {k: v for k, v in colors.items() if k in semantic_roles and isinstance(v, str)}
        other = {k: v for k, v in colors.items() if k not in core_roles and k not in semantic_roles and isinstance(v, str)}

        if core:
            lines.append("### Core Colors")
            lines.append("")
            lines.append("| Role | Hex | Preview |")
            lines.append("|------|-----|---------|")
            for role, val in core.items():
                lines.append(f"| {role} | `{val}` | 🟦 |")
            lines.append("")

        if semantic:
            lines.append("### Semantic Colors")
            lines.append("")
            lines.append("| Role | Hex |")
            lines.append("|------|-----|")
            for role, val in semantic.items():
                lines.append(f"| {role} | `{val}` |")
            lines.append("")

        if other:
            lines.append("### Additional Colors")
            lines.append("")
            lines.append("| Role | Hex |")
            lines.append("|------|-----|")
            for role, val in other.items():
                lines.append(f"| {role} | `{val}` |")
            lines.append("")
    else:
        lines.append("*No color data extracted.*")
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 3. Typography ───────────────────────────────────────────────────
    lines.append("## Typography")
    lines.append("")

    if families:
        lines.append("### Font Families")
        lines.append("")
        lines.append("| Role | Family |")
        lines.append("|------|--------|")
        for role, family in families.items():
            lines.append(f"| {role} | `{family}` |")
        lines.append("")

        # Generate a Google Fonts import hint
        unique_fonts = list(set(f for f in families.values() if f and f not in ["monospace", "sans-serif", "serif", "system-ui", "-apple-system"]))
        if unique_fonts:
            font_params = "|".join(f.replace(" ", "+") for f in unique_fonts)
            lines.append("**Google Fonts import (if applicable):**")
            lines.append(f"```html")
            lines.append(f'<link href="https://fonts.googleapis.com/css2?family={"&family=".join(f.replace(" ", "+") + ":wght@300;400;500;600;700" for f in unique_fonts)}&display=swap" rel="stylesheet">')
            lines.append("```")
            lines.append("")

    if sizes:
        lines.append("### Type Scale")
        lines.append("")
        lines.append("| Level | Size |")
        lines.append("|-------|------|")
        for level, size in sizes.items():
            lines.append(f"| {level} | `{size}` |")
        lines.append("")

    if weights:
        lines.append("### Font Weights")
        lines.append("")
        lines.append("| Name | Value |")
        lines.append("|------|-------|")
        for name, weight in weights.items():
            lines.append(f"| {name} | `{weight}` |")
        lines.append("")

    if line_heights:
        lines.append("### Line Heights")
        lines.append("")
        for role, lh in line_heights.items():
            lines.append(f"- **{role}:** `{lh}`")
        lines.append("")

    if not families and not sizes:
        lines.append("*No typography data extracted.*")
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 4. Spacing & Layout ─────────────────────────────────────────────
    lines.append("## Spacing & Layout")
    lines.append("")

    if spacing:
        lines.append("### Spacing Tokens")
        lines.append("")
        if "baseUnit" in spacing:
            base = spacing["baseUnit"]
            lines.append(f"**Base unit:** `{base}px`")
            lines.append("")
            lines.append("| Token | Value |")
            lines.append("|-------|-------|")
            for mult, name in [(0.5, "xs"), (1, "sm"), (2, "md"), (3, "lg"), (4, "xl"), (6, "2xl"), (8, "3xl")]:
                lines.append(f"| {name} | `{int(base * mult)}px` |")
            lines.append("")
        if "borderRadius" in spacing:
            lines.append(f"**Border radius:** `{spacing['borderRadius']}`")
            lines.append("")
        padding = spacing.get("padding")
        if padding and isinstance(padding, dict):
            lines.append("### Padding")
            lines.append("")
            for k, v in padding.items():
                lines.append(f"- **{k}:** `{v}`")
            lines.append("")
        margins = spacing.get("margins")
        if margins and isinstance(margins, dict):
            lines.append("### Margins")
            lines.append("")
            for k, v in margins.items():
                lines.append(f"- **{k}:** `{v}`")
            lines.append("")

    if layout:
        lines.append("### Layout Configuration")
        lines.append("")
        lines.append("```json")
        lines.append(json.dumps(layout, indent=2))
        lines.append("```")
        lines.append("")

    section_spacing = design.get("section_spacing") if design else None
    if section_spacing:
        lines.append(f"**Section spacing:** {section_spacing}")
        lines.append("")

    if not spacing and not layout:
        lines.append("*No spacing/layout data extracted.*")
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 5. UI Components ────────────────────────────────────────────────
    lines.append("## UI Components")
    lines.append("")

    if components:
        for comp_name, comp_data in components.items():
            if isinstance(comp_data, dict) and comp_data:
                lines.append(f"### {comp_name}")
                lines.append("")
                lines.append("| Property | Value |")
                lines.append("|----------|-------|")
                for prop, val in comp_data.items():
                    lines.append(f"| {prop} | `{val}` |")
                lines.append("")

    # Cards from design analysis
    card_styles = design.get("card_styles") if design else None
    if card_styles:
        lines.append("### Card Styles")
        lines.append("")
        lines.append(str(card_styles))
        lines.append("")

    # Navigation
    nav = design.get("navigation_style") if design else None
    if nav and isinstance(nav, dict):
        lines.append("### Navigation")
        lines.append("")
        lines.append("| Property | Value |")
        lines.append("|----------|-------|")
        for k, v in nav.items():
            lines.append(f"| {k} | `{v}` |")
        lines.append("")

    if not components and not card_styles and not nav:
        lines.append("*No component data extracted.*")
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 6. Visual Effects & Techniques ──────────────────────────────────
    lines.append("## Visual Effects & Techniques")
    lines.append("")

    has_effects = False

    if design:
        gradients = design.get("gradient_definitions") or []
        if gradients:
            has_effects = True
            lines.append("### Gradients")
            lines.append("")
            lines.append("```css")
            for g in gradients:
                lines.append(f"background: {g};")
            lines.append("```")
            lines.append("")

        shadows = design.get("shadow_styles") or []
        if shadows:
            has_effects = True
            lines.append("### Shadows")
            lines.append("")
            lines.append("```css")
            for s in shadows:
                lines.append(f"box-shadow: {s};")
            lines.append("```")
            lines.append("")

        hover = design.get("hover_effects")
        if hover:
            has_effects = True
            lines.append("### Hover & Interaction Effects")
            lines.append("")
            lines.append(str(hover))
            lines.append("")

        notable = design.get("notable_techniques") or []
        if notable:
            has_effects = True
            lines.append("### Notable Techniques")
            lines.append("")
            for t in notable:
                lines.append(f"- {t}")
            lines.append("")

        img_treatments = design.get("image_treatments")
        if img_treatments:
            has_effects = True
            lines.append("### Image Treatments")
            lines.append("")
            lines.append(str(img_treatments))
            lines.append("")

        anim_desc = design.get("animation_descriptions")
        if anim_desc:
            has_effects = True
            lines.append("### Animations & Transitions")
            lines.append("")
            lines.append(str(anim_desc))
            lines.append("")

    if animations:
        has_effects = True
        lines.append("### Animation Tokens")
        lines.append("")
        lines.append("```json")
        lines.append(json.dumps(animations, indent=2))
        lines.append("```")
        lines.append("")

    if not has_effects:
        lines.append("*No visual effect data extracted.*")
        lines.append("")

    # Hero section
    hero = design.get("hero_section") if design else None
    if hero and isinstance(hero, dict):
        lines.append("### Hero Section")
        lines.append("")
        lines.append("| Property | Value |")
        lines.append("|----------|-------|")
        for k, v in hero.items():
            if v:
                lines.append(f"| {k} | {v} |")
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 7. Brand Personality ────────────────────────────────────────────
    lines.append("## Brand Personality")
    lines.append("")

    if personality:
        for trait, val in personality.items():
            lines.append(f"- **{trait}:** {val}")
        lines.append("")
    else:
        lines.append("*No personality data extracted.*")
        lines.append("")

    # Social proof / footer from design analysis
    social = design.get("social_proof_elements") if design else None
    if social:
        lines.append("### Social Proof & Trust Elements")
        lines.append("")
        lines.append(str(social))
        lines.append("")

    footer = design.get("footer_description") if design else None
    if footer:
        lines.append("### Footer")
        lines.append("")
        lines.append(str(footer))
        lines.append("")

    lines.append("---")
    lines.append("")

    # ── 8. CSS Custom Properties ────────────────────────────────────────
    lines.append("## CSS Custom Properties")
    lines.append("")
    lines.append("Copy-paste these into your stylesheet to start building with this brand:")
    lines.append("")
    lines.append("```css")
    lines.append(":root {")
    lines.append("  /* Colors */")
    for role, val in colors.items():
        if isinstance(val, str) and val.startswith("#"):
            css_name = role.replace("_", "-")
            # Convert camelCase to kebab-case
            kebab = ""
            for c in css_name:
                if c.isupper():
                    kebab += "-" + c.lower()
                else:
                    kebab += c
            lines.append(f"  --color-{kebab}: {val};")
    lines.append("")
    lines.append("  /* Typography */")
    for role, family in families.items():
        kebab = ""
        for c in role:
            if c.isupper():
                kebab += "-" + c.lower()
            else:
                kebab += c
        lines.append(f"  --font-{kebab}: '{family}', sans-serif;")
    for level, size in sizes.items():
        lines.append(f"  --font-size-{level}: {size};")
    for name, weight in weights.items():
        lines.append(f"  --font-weight-{name}: {weight};")
    lines.append("")
    lines.append("  /* Spacing */")
    if "baseUnit" in spacing:
        base = spacing["baseUnit"]
        lines.append(f"  --spacing-base: {base}px;")
        for mult, name in [(0.5, "xs"), (1, "sm"), (2, "md"), (3, "lg"), (4, "xl"), (6, "2xl"), (8, "3xl")]:
            lines.append(f"  --spacing-{name}: {int(base * mult)}px;")
    if "borderRadius" in spacing:
        lines.append(f"  --radius: {spacing['borderRadius']};")
    lines.append("}")
    lines.append("```")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"*Generated on {now} from {target_url}*")
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Scrape a website's brand identity using the Firecrawl API."
    )
    parser.add_argument("url", help="URL of the website to scrape")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Output directory (default: .tmp/brand-scraper/<domain>)",
    )
    args = parser.parse_args()

    target_url = args.url
    if not target_url.startswith(("http://", "https://")):
        target_url = f"https://{target_url}"

    domain = urlparse(target_url).netloc
    api_key = load_api_key()

    # Set up output directory
    if args.output_dir:
        out_dir = Path(args.output_dir)
    else:
        project_root = Path(__file__).resolve().parent.parent
        out_dir = project_root / ".tmp" / "brand-scraper" / domain

    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {out_dir}")
    print()

    # ------------------------------------------------------------------
    # Call 1: Branding + full-page screenshot + markdown
    # ------------------------------------------------------------------
    data = scrape_branding(target_url, api_key)

    branding = data.get("branding") or {}
    full_screenshot_url = data.get("screenshot")
    markdown_content = data.get("markdown", "")
    metadata = data.get("metadata") or {}

    # Save brand profile JSON
    brand_path = out_dir / "brand_profile.json"
    with open(brand_path, "w", encoding="utf-8") as f:
        json.dump(branding, f, indent=2, ensure_ascii=False)
    print(f"  Saved: {brand_path}")

    # Save raw markdown for reference
    if markdown_content:
        md_path = out_dir / "page_content.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        print(f"  Saved: {md_path}")

    # Save metadata
    if metadata:
        meta_path = out_dir / "metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print(f"  Saved: {meta_path}")

    # Download full-page screenshot
    if full_screenshot_url:
        ss_path = out_dir / "screenshot.png"
        if download_file(full_screenshot_url, ss_path):
            print(f"  Saved: {ss_path}")

    # ------------------------------------------------------------------
    # Hero screenshot (viewport-only)
    # ------------------------------------------------------------------
    hero_url = scrape_hero_screenshot(target_url, api_key)
    if hero_url:
        hero_path = out_dir / "hero_screenshot.png"
        if download_file(hero_url, hero_path):
            print(f"  Saved: {hero_path}")

    # ------------------------------------------------------------------
    # Call 2: Design details via JSON extraction
    # ------------------------------------------------------------------
    design_details = scrape_design_details(target_url, api_key)

    design_path = out_dir / "design_analysis.json"
    with open(design_path, "w", encoding="utf-8") as f:
        json.dump(design_details, f, indent=2, ensure_ascii=False)
    print(f"  Saved: {design_path}")

    # ------------------------------------------------------------------
    # Download brand images
    # ------------------------------------------------------------------
    images = branding.get("images") or {}
    logo_url = branding.get("logo") or images.get("logo")
    favicon_url = images.get("favicon")
    og_url = images.get("ogImage") or metadata.get("ogImage")

    print()
    print("Downloading brand images...")

    if logo_url:
        ext = determine_extension(logo_url, ".png")
        logo_dest = out_dir / f"logo{ext}"
        if download_file(logo_url, logo_dest):
            print(f"  Saved: {logo_dest}")

    if favicon_url:
        ext = determine_extension(favicon_url, ".ico")
        fav_dest = out_dir / f"favicon{ext}"
        if download_file(favicon_url, fav_dest):
            print(f"  Saved: {fav_dest}")

    if og_url:
        ext = determine_extension(og_url, ".png")
        og_dest = out_dir / f"og_image{ext}"
        if download_file(og_url, og_dest):
            print(f"  Saved: {og_dest}")

    # ------------------------------------------------------------------
    # Generate human-readable summary
    # ------------------------------------------------------------------
    print()
    print("Generating summary...")

    summary = generate_summary(branding, design_details, target_url)
    summary_path = out_dir / "summary.md"
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary)
    print(f"  Saved: {summary_path}")

    # ------------------------------------------------------------------
    # Generate brand guidelines reference document
    # ------------------------------------------------------------------
    print("Generating brand guidelines...")

    guidelines = generate_brand_guidelines(
        branding, design_details, metadata, target_url, out_dir
    )
    guidelines_path = out_dir / "brand_guidelines.md"
    with open(guidelines_path, "w", encoding="utf-8") as f:
        f.write(guidelines)
    print(f"  Saved: {guidelines_path}")

    # ------------------------------------------------------------------
    # Done
    # ------------------------------------------------------------------
    print()
    print("=" * 60)
    print(f"Brand scrape complete for: {target_url}")
    print(f"All outputs saved to: {out_dir}")
    print("=" * 60)
    print()
    print("Key files:")
    print(f"  brand_guidelines.md  — Referenceable brand guide with CSS custom properties")
    print(f"  brand_profile.json   — Structured brand data (colors, fonts, spacing, etc.)")
    print(f"  design_analysis.json — Supplementary design details (gradients, effects, etc.)")
    print(f"  summary.md           — Quick human-readable brand summary")
    print(f"  screenshot.png       — Full-page screenshot")
    print(f"  hero_screenshot.png  — Above-the-fold screenshot")


if __name__ == "__main__":
    main()
