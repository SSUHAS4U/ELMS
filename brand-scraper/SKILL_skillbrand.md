---
name: brand-scraper
description: Scrape any website and extract its complete brand identity — colors, typography, fonts, logos, hero images, button styles, layout patterns, and visual design details — using the Firecrawl API. Use this skill whenever the user wants to analyze a website's design, extract brand assets, reverse-engineer a site's styling, build a brand guide from a URL, replicate or reference another site's look and feel, or gather design data for building a new website. Also trigger when the user mentions brand colors, design systems, style guides, website fonts, or visual identity extraction.
---

# Brand Scraper

Extract comprehensive brand and design data from any website using the Firecrawl API. The output is a structured brand profile plus downloaded visual assets, ready for use in building a new website or creating a brand style guide.

## What This Skill Produces

Given a URL, this skill returns:

1. **Brand Profile JSON** — structured data containing:
   - Color palette (primary, secondary, accent, background, text, semantic colors)
   - Typography system (font families, sizes, weights, line heights)
   - Spacing tokens (base unit, border radius, padding, margins)
   - UI component styles (buttons, inputs, cards)
   - Layout configuration (grid, header/footer heights)
   - Animation/transition settings
   - Brand personality (tone, energy, target audience)
   - Color scheme (light/dark)

2. **Visual Assets** — downloaded to `.tmp/brand-scraper/`:
   - Logo image (if available)
   - Favicon
   - Open Graph / social sharing image
   - Full-page screenshot of the site
   - Hero/header screenshot (viewport-height crop)

3. **Design Analysis** — an LLM-extracted supplement covering:
   - Notable CSS effects (gradients, glassmorphism, shadows, blurs)
   - Navigation patterns
   - Hero section structure
   - CTA button styles and copy
   - Image treatment (rounded corners, overlays, filters)
   - Any distinctive or interesting visual techniques

## How It Works

The skill makes two Firecrawl API calls per URL:

### Call 1: Branding + Screenshot + Markdown
Requests `formats: ["branding", "screenshot", "markdown"]` which returns the structured `BrandingProfile` object, a screenshot URL, and the page content as markdown (useful for understanding page structure).

### Call 2: JSON Extraction for Design Details
Requests `formats: [{ type: "json", prompt: "..." }]` with a prompt asking for supplementary design details that the branding format doesn't capture — things like gradient definitions, shadow styles, hover effects, hero section layout, and notable CSS techniques.

### Then: Asset Download
Downloads logo, favicon, ogImage, and screenshot to local files.

## Prerequisites

- **Firecrawl API key** stored in `.env` as `FIRECRAWL_API_KEY`
- **Python 3.9+** with `requests` and `python-dotenv` packages

## Usage

### Step 1: Make sure the API key is set

Check `.env` for `FIRECRAWL_API_KEY`. If it's missing, ask the user to:
1. Sign up at https://www.firecrawl.dev/app/api-keys
2. Add `FIRECRAWL_API_KEY=fc-...` to `.env`

### Step 2: Run the scraper

```bash
python execution/scrape_brand.py <URL>
```

Example:
```bash
python execution/scrape_brand.py https://stripe.com
```

### Step 3: Read the outputs

The script saves everything to `.tmp/brand-scraper/<domain>/`:

```
.tmp/brand-scraper/stripe.com/
├── brand_guidelines.md     # ⭐ Referenceable brand guide with CSS custom properties
├── brand_profile.json      # Full structured brand data
├── design_analysis.json    # Supplementary design details
├── screenshot.png          # Full-page screenshot
├── hero_screenshot.png     # Above-the-fold screenshot
├── logo.png                # Logo (if available)
├── favicon.ico             # Favicon (if available)
├── og_image.png            # OG image (if available)
└── summary.md              # Quick human-readable summary
```

**Start here:** Read `brand_guidelines.md` — it's a polished, self-contained reference doc with a table of contents, organized design tokens, and ready-to-use CSS custom properties. For raw structured data, see `brand_profile.json`.

## Understanding the Output

### brand_profile.json

This is the raw `branding` object from Firecrawl. Key sections:

- **`colors`**: `primary`, `secondary`, `accent`, `background`, `textPrimary`, `textSecondary`, `link`, `success`, `warning`, `error` — all as hex values
- **`typography.fontFamilies`**: `primary`, `heading`, `code` — the actual font family names
- **`typography.fontSizes`**: `h1`, `h2`, `h3`, `body` — as CSS values like `"48px"`
- **`typography.fontWeights`**: `light`, `regular`, `medium`, `bold` — as numeric values
- **`typography.lineHeights`**: `heading`, `body` — as CSS values
- **`spacing`**: `baseUnit` (in px), `borderRadius`, `padding`, `margins`
- **`components`**: Styles for `buttonPrimary`, `buttonSecondary`, `input` — including background, textColor, borderRadius, borderColor
- **`images`**: URLs for `logo`, `favicon`, `ogImage`
- **`layout`**: Grid system, header/footer heights
- **`animations`**: Transition and animation settings
- **`personality`**: Brand tone, energy level, target audience
- **`colorScheme`**: `"light"` or `"dark"`

### design_analysis.json

Supplementary details that go beyond the structured branding format:

- `gradient_definitions`: Any CSS gradients used prominently
- `shadow_styles`: Box shadows, text shadows
- `hover_effects`: What happens on hover for buttons, links, cards
- `hero_section`: Layout description, background treatment, CTA text
- `notable_techniques`: Glassmorphism, parallax, clip-paths, etc.
- `image_treatments`: Border radius, overlays, filters on images
- `navigation_style`: Sticky, transparent, hamburger, etc.

## Edge Cases and Learnings

- **Some sites return sparse branding data.** If the branding object is mostly null, the script falls back to extracting what it can from the markdown + HTML. The `design_analysis.json` fill often fills gaps.
- **SVG logos can't always be downloaded as images.** The script attempts to handle SVG, PNG, JPG, and ICO formats. SVG files are saved as-is.
- **Screenshots expire after 24 hours** on Firecrawl's side, but we download them immediately so they're persisted locally.
- **Rate limits**: Firecrawl free tier has rate limits. If you're scraping multiple sites, add delays between requests. The script handles 429 responses with exponential backoff.
- **Timeout**: Some heavy sites take a while. The script uses a 60-second timeout by default.

## Using the Output to Build a Website

The `brand_guidelines.md` file is designed to be the single reference when building a new site. It includes:

1. **Ready-to-use CSS custom properties** — copy-paste the `:root` block directly into your stylesheet
2. **Google Fonts import link** — pre-built `<link>` tag for the detected fonts
3. **Spacing token scale** — derived from the base unit (xs through 3xl)
4. **Component specs** — button, input, and card styles in table format
5. **Visual effects** — gradients and shadows as CSS snippets
6. **Brand personality** — tone and audience context for copywriting

Point any other skill or process at this file (e.g., `brand-scraper/brand_guidelines.md`) and it has everything needed to replicate the brand.
