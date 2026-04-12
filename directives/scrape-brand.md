# Brand Scraper Directive

## Goal
Scrape any website URL and extract its complete brand identity — colors, typography, fonts, logos, hero images, button styles, layout patterns, and visual effects — saving structured data and visual assets locally.

## Inputs
- **URL** (required): The website to analyze
- **Output directory** (optional): Override default `.tmp/brand-scraper/<domain>/`

## Tools / Scripts
1. `execution/scrape_brand.py` — Main scraping script. See `brand-scraper/SKILL.md` for full documentation.

## Execution Steps
1. Verify `FIRECRAWL_API_KEY` exists in `.env`
2. Run: `python execution/scrape_brand.py <URL>`
3. Read outputs from `.tmp/brand-scraper/<domain>/`
4. Present `summary.md` to the user
5. If building a website from this data, convert `brand_profile.json` into CSS custom properties

## Outputs
- `brand_guidelines.md` — ⭐ Primary deliverable. Polished brand guide with TOC, organized tokens, and ready-to-use CSS custom properties. Reference this file when building a new website.
- `brand_profile.json` — Structured brand data from Firecrawl's branding format
- `design_analysis.json` — AI-extracted design details (gradients, shadows, effects)
- `summary.md` — Quick human-readable overview
- `screenshot.png` — Full-page screenshot
- `hero_screenshot.png` — Viewport-height screenshot
- `logo.*`, `favicon.*`, `og_image.*` — Downloaded brand images

## Edge Cases
- **Missing API key**: Script exits with clear instructions to get one
- **Rate limiting (429)**: Script retries with exponential backoff (up to 3 attempts)
- **Sparse branding data**: Some sites expose minimal CSS. The `design_analysis.json` from the JSON extraction call compensates with LLM analysis of the page content
- **SVG logos**: Saved as-is (not converted to raster)
- **Timeouts**: 90s per request, configurable
- **Sites behind auth**: Not supported — use public-facing pages only

## Dependencies
- Python 3.9+
- `requests` (pip install requests)
- `python-dotenv` (pip install python-dotenv)
- Firecrawl API key (free tier works, paid for higher rate limits)
