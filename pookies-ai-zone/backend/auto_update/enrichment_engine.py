"""
Enrichment Engine for AI Tool Data
===================================
3-tier enrichment system:
  Tier 1: Keyword heuristics (no API cost)
  Tier 2: Website metadata scraping (no API cost)
  Tier 3: LLM-powered enrichment (optional, API cost)
"""

import asyncio
import logging
import re
import httpx
from typing import Dict, Any, List, Optional, Tuple
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


# ── Tier 1: Keyword Heuristics ────────────────────────────────

# Detailed pricing patterns with regex
PRICING_PATTERNS = {
    "free": [
        r"\bfree\b", r"\bno.?cost\b", r"\b100%\s*free\b",
    ],
    "freemium": [
        r"\bfreemium\b", r"\bfree\s*(plan|tier|version)\b",
        r"\bfree\s*to\s*start\b", r"\btry\s*for\s*free\b",
    ],
    "open-source": [
        r"\bopen[\s-]?source\b", r"\bgpl\b", r"\bmit\s*licen[sc]e\b",
        r"\bapache\s*licen[sc]e\b", r"\bfoss\b",
    ],
    "paid": [
        r"\$\d+", r"\bpaid\b", r"\bpremium\b", r"\bsubscription\b",
        r"\bper\s*month\b", r"\b/mo\b", r"\b/yr\b", r"\bmonthly\b",
    ],
    "enterprise": [
        r"\benterprise\b", r"\bcustom\s*pricing\b", r"\bcontact\s*(us|sales)\b",
        r"\brequest\s*a?\s*(demo|quote)\b",
    ],
}

# Extract price amounts from text
PRICE_EXTRACT_RE = re.compile(r"\$(\d+(?:\.\d{2})?)\s*(?:/\s*(?:mo(?:nth)?|month|yr|year|user))?", re.IGNORECASE)

# Platform detection keywords
PLATFORM_KEYWORDS = {
    "web": [r"\bweb\s*(app)?\b", r"\bbrowser\b", r"\bsaas\b", r"\bcloud\b", r"\bonline\b"],
    "ios": [r"\bios\b", r"\biphone\b", r"\bipad\b", r"\bapp\s*store\b"],
    "android": [r"\bandroid\b", r"\bgoogle\s*play\b", r"\bapk\b"],
    "macos": [r"\bmac\s?os\b", r"\bmac\s*app\b", r"\bmacintosh\b"],
    "windows": [r"\bwindows\b", r"\bwin\d+\b", r"\b\.exe\b"],
    "linux": [r"\blinux\b", r"\bubuntu\b", r"\bdebian\b", r"\bfedora\b"],
    "api": [r"\bapi\b", r"\brest\s*api\b", r"\bgraphql\b", r"\bsdk\b", r"\bendpoint\b"],
    "self_hosted": [r"\bself[\s-]?hosted\b", r"\bon[\s-]?premise\b", r"\bdocker\b"],
}

# Feature detection
FEATURE_KEYWORDS = {
    "ai_text": [r"\btext\s*generat", r"\bwriting\b", r"\bcopywriting\b", r"\bnlp\b", r"\blanguage\s*model\b"],
    "ai_image": [r"\bimage\s*generat", r"\btext.to.image\b", r"\bimage\s*edit", r"\bphoto\b"],
    "ai_video": [r"\bvideo\s*generat", r"\btext.to.video\b", r"\bvideo\s*edit\b"],
    "ai_code": [r"\bcode\s*(generat|complet|assist)", r"\bcoding\b", r"\bide\b", r"\bdebug\b"],
    "ai_audio": [r"\baudio\b", r"\bmusic\b", r"\bspeech\b", r"\btts\b", r"\bvoice\b"],
    "ai_chat": [r"\bchat\s*bot\b", r"\bconversation\b", r"\bchat\b", r"\bassistant\b"],
    "api_access": [r"\bapi\s*access\b", r"\bapi\s*key\b", r"\brest\s*api\b"],
    "team_collaboration": [r"\bteam\b", r"\bcollaborat", r"\bshare\b", r"\bworkspace\b"],
}

# Use-case extraction
USE_CASE_KEYWORDS = {
    "content-creation": [r"\bcontent\b", r"\bblog\b", r"\barticle\b", r"\bcopy\b"],
    "coding": [r"\bcode\b", r"\bprogram", r"\bdevelop", r"\bsoftware\b"],
    "design": [r"\bdesign\b", r"\bui\b", r"\bux\b", r"\bgraphic\b", r"\blogo\b"],
    "marketing": [r"\bmarket", r"\bseo\b", r"\bad\s*(campaign|creative)\b", r"\bsocial\s*media\b"],
    "research": [r"\bresearch\b", r"\banalys", r"\bdata\b", r"\binsight\b"],
    "customer-support": [r"\bcustomer\b", r"\bsupport\b", r"\bticket\b", r"\bhelp\s*desk\b"],
    "writing": [r"\bwrit", r"\bedit\b", r"\bgrammar\b", r"\bproofread\b"],
    "automation": [r"\bautomat", r"\bworkflow\b", r"\bintegrat", r"\bzapier\b"],
    "education": [r"\blearn", r"\beducat", r"\btutor", r"\bcourse\b"],
    "data-analysis": [r"\bdata\b", r"\banalytic", r"\bdashboard\b", r"\bvisuali"],
}

# Well-known tool pricing data (curated for popular tools)
KNOWN_TOOL_PRICING: Dict[str, Dict[str, Any]] = {
    "chatgpt": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "gpt-4": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "gpt-4o": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "claude": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "gemini": {"model": "freemium", "free_tier": True, "starting_price": 19.99, "currency": "USD"},
    "midjourney": {"model": "paid", "free_tier": False, "starting_price": 10, "currency": "USD"},
    "dall-e 3": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "stable diffusion": {"model": "open-source", "free_tier": True, "starting_price": 0},
    "github copilot": {"model": "freemium", "free_tier": True, "starting_price": 10, "currency": "USD"},
    "github copilot x": {"model": "freemium", "free_tier": True, "starting_price": 10, "currency": "USD"},
    "grammarly": {"model": "freemium", "free_tier": True, "starting_price": 12, "currency": "USD"},
    "notion ai": {"model": "freemium", "free_tier": True, "starting_price": 10, "currency": "USD"},
    "jasper": {"model": "paid", "free_tier": False, "starting_price": 49, "currency": "USD"},
    "runway": {"model": "freemium", "free_tier": True, "starting_price": 12, "currency": "USD"},
    "perplexity": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "deepseek": {"model": "freemium", "free_tier": True, "starting_price": 0},
    "suno": {"model": "freemium", "free_tier": True, "starting_price": 10, "currency": "USD"},
    "canva ai": {"model": "freemium", "free_tier": True, "starting_price": 12.99, "currency": "USD"},
    "otter.ai": {"model": "freemium", "free_tier": True, "starting_price": 16.99, "currency": "USD"},
    "superhuman": {"model": "paid", "free_tier": False, "starting_price": 30, "currency": "USD"},
    "grok": {"model": "freemium", "free_tier": True, "starting_price": 8, "currency": "USD"},
    "microsoft copilot": {"model": "freemium", "free_tier": True, "starting_price": 20, "currency": "USD"},
    "tabnine": {"model": "freemium", "free_tier": True, "starting_price": 12, "currency": "USD"},
    "llama": {"model": "open-source", "free_tier": True, "starting_price": 0},
    "mistral": {"model": "open-source", "free_tier": True, "starting_price": 0},
    "sora": {"model": "paid", "free_tier": False, "starting_price": 20, "currency": "USD"},
    "adobe firefly": {"model": "freemium", "free_tier": True, "starting_price": 22.99, "currency": "USD"},
    "descript": {"model": "freemium", "free_tier": True, "starting_price": 24, "currency": "USD"},
    "surfer seo": {"model": "paid", "free_tier": False, "starting_price": 89, "currency": "USD"},
    "hootsuite": {"model": "paid", "free_tier": False, "starting_price": 99, "currency": "USD"},
    "intercom fin": {"model": "enterprise", "free_tier": False, "custom_pricing": True},
    "gong": {"model": "enterprise", "free_tier": False, "custom_pricing": True},
}

# Category-based pros/cons templates
CATEGORY_PROS_CONS: Dict[str, Dict[str, List[str]]] = {
    "LLMs & Chatbots": {
        "pros": [
            "Natural language understanding and generation",
            "Versatile across many tasks",
            "Continuously improving with updates",
        ],
        "cons": [
            "May generate inaccurate information",
            "Usage costs can scale quickly",
        ],
    },
    "Development & Engineering": {
        "pros": [
            "Accelerates coding productivity",
            "Reduces boilerplate and repetitive tasks",
            "Integrates with popular IDEs",
        ],
        "cons": [
            "Generated code may need review",
            "Learning curve for advanced features",
        ],
    },
    "Creative & Design": {
        "pros": [
            "Rapid creative asset generation",
            "Accessible to non-designers",
            "High-quality visual output",
        ],
        "cons": [
            "Limited fine-grained control",
            "Copyright and originality concerns",
        ],
    },
    "Productivity & Office": {
        "pros": [
            "Saves time on repetitive tasks",
            "Integrates with existing workflows",
            "Improves output quality",
        ],
        "cons": [
            "May require training to use effectively",
            "Premium features behind paywall",
        ],
    },
    "Marketing & Sales": {
        "pros": [
            "Automates content creation at scale",
            "Data-driven optimization insights",
            "Reduces time-to-market",
        ],
        "cons": [
            "Output may need human refinement",
            "Higher pricing for enterprise features",
        ],
    },
    "Data Analysis & Research": {
        "pros": [
            "Transforms complex data into insights",
            "Natural language querying of data",
            "Reduces reliance on technical expertise",
        ],
        "cons": [
            "Results depend on data quality",
            "May struggle with domain-specific contexts",
        ],
    },
    "Automation & Workflow": {
        "pros": [
            "Eliminates manual repetitive tasks",
            "Connects multiple tools and services",
            "Scales operations without headcount",
        ],
        "cons": [
            "Complex workflows can be hard to debug",
            "Vendor lock-in risk",
        ],
    },
    "Image Generation": {
        "pros": [
            "Creates unique visuals from text prompts",
            "Rapid iteration on creative concepts",
            "No design experience needed",
        ],
        "cons": [
            "Results can be unpredictable",
            "Ethical and copyright considerations",
        ],
    },
}

# Default pros/cons for uncovered categories
DEFAULT_PROS = [
    "AI-powered efficiency improvements",
    "Easy to get started",
    "Regular updates and improvements",
]
DEFAULT_CONS = [
    "May require internet connection",
    "Free tier has limitations",
]


def _match_patterns(text: str, patterns: List[str]) -> bool:
    """Check if any regex pattern matches the text."""
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            return True
    return False


def tier1_enrich(tool: Dict[str, Any]) -> Dict[str, Any]:
    """
    Tier 1: Keyword-based heuristic enrichment.
    Enriches pricing, platforms, features, use_cases, pros, cons, difficulty.
    """
    name = tool.get("name", "")
    desc = tool.get("description", "")
    category = tool.get("category", "")
    url = tool.get("url", "")
    text = f"{name} {desc} {category}".lower()

    # ── Pricing ──
    name_lower = name.lower()
    if name_lower in KNOWN_TOOL_PRICING:
        pricing = dict(KNOWN_TOOL_PRICING[name_lower])
    else:
        pricing = {"model": "freemium", "free_tier": True}  # default
        for model, patterns in PRICING_PATTERNS.items():
            if _match_patterns(text, patterns):
                pricing["model"] = model
                if model in ("free", "open-source"):
                    pricing["free_tier"] = True
                    pricing["starting_price"] = 0
                elif model in ("paid", "enterprise"):
                    pricing["free_tier"] = False
                break

        # Try to extract actual price
        price_match = PRICE_EXTRACT_RE.search(desc)
        if price_match:
            pricing["starting_price"] = float(price_match.group(1))
            pricing["currency"] = "USD"

    # ── Platforms ──
    platforms: Dict[str, bool] = {"web": True}  # assume web by default
    for plat, patterns in PLATFORM_KEYWORDS.items():
        if _match_patterns(text, patterns):
            platforms[plat] = True

    # Infer platforms from URL patterns
    if url:
        domain = urlparse(url).netloc.lower()
        if "github.com" in domain or "gitlab.com" in domain:
            platforms["self_hosted"] = True
            platforms["api"] = True

    # ── Features ──
    features: Dict[str, bool] = {}
    for feat, patterns in FEATURE_KEYWORDS.items():
        if _match_patterns(text, patterns):
            features[feat] = True

    # ── Use Cases ──
    use_cases: List[str] = []
    for uc, patterns in USE_CASE_KEYWORDS.items():
        if _match_patterns(text, patterns):
            use_cases.append(uc)
    if not use_cases:
        use_cases = ["general"]

    # ── Difficulty ──
    difficulty = 2  # default: easy
    if _match_patterns(text, [r"\bapi\b", r"\bsdk\b", r"\bdeveloper\b", r"\bcode\b"]):
        difficulty = 3
    if _match_patterns(text, [r"\benterprise\b", r"\bdevops\b", r"\binfrastructure\b"]):
        difficulty = 4
    if _match_patterns(text, [r"\bself[\s-]?hosted\b", r"\bkubernetes\b", r"\bdocker\b"]):
        difficulty = 4

    # ── Pros/Cons ──
    cat_data = CATEGORY_PROS_CONS.get(category, {})
    pros = list(cat_data.get("pros", DEFAULT_PROS))
    cons = list(cat_data.get("cons", DEFAULT_CONS))

    # Add pricing-specific pros/cons
    if pricing.get("free_tier"):
        pros.append("Free tier available")
    if pricing.get("model") == "open-source":
        pros.append("Open-source and transparent")
        pros.append("Self-hostable for data privacy")
    if pricing.get("model") == "enterprise":
        cons.append("Pricing requires contacting sales")

    # Add feature-specific pros
    if features.get("api_access"):
        pros.append("API access for custom integrations")
    if features.get("team_collaboration"):
        pros.append("Team collaboration features")

    # Build comparison_data
    tool["comparison_data"] = {
        "pricing": pricing,
        "platforms": platforms,
        "features": features,
        "use_cases": use_cases,
        "difficulty": min(difficulty, 5),
    }
    tool["pros"] = pros[:5]  # cap at 5
    tool["cons"] = cons[:3]  # cap at 3

    return tool


# ── Tier 2: Website Metadata Scraping ─────────────────────────

# Common meta tag patterns to extract
OG_META_TAGS = [
    ("og:description", "long_description"),
    ("description", "meta_description"),
    ("og:image", "og_image"),
]

FAVICON_PATTERNS = [
    r'<link[^>]+rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]+href=["\']([^"\']+)["\']',
    r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\']',
]


def _extract_meta(html: str, property_name: str) -> Optional[str]:
    """Extract a meta tag content from HTML."""
    # Try property= first (og: tags)
    match = re.search(
        rf'<meta[^>]+(?:property|name)=["\'](?:{property_name})["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.IGNORECASE
    )
    if match:
        return match.group(1).strip()
    # Try reversed attribute order
    match = re.search(
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\'](?:{property_name})["\']',
        html, re.IGNORECASE
    )
    if match:
        return match.group(1).strip()
    return None


def _extract_favicon(html: str, base_url: str) -> Optional[str]:
    """Extract the best favicon URL from HTML."""
    for pattern in FAVICON_PATTERNS:
        matches = re.findall(pattern, html, re.IGNORECASE)
        if matches:
            # Prefer apple-touch-icon (higher quality)
            for m in matches:
                favicon = m.strip()
                if not favicon.startswith("http"):
                    parsed = urlparse(base_url)
                    if favicon.startswith("//"):
                        favicon = f"{parsed.scheme}:{favicon}"
                    elif favicon.startswith("/"):
                        favicon = f"{parsed.scheme}://{parsed.netloc}{favicon}"
                    else:
                        favicon = f"{parsed.scheme}://{parsed.netloc}/{favicon}"
                return favicon
    return None


def _detect_pricing_page(html: str, base_url: str) -> Optional[str]:
    """Try to detect a pricing page link in the HTML."""
    match = re.search(
        r'<a[^>]+href=["\']([^"\']*pric[^"\']*)["\']',
        html, re.IGNORECASE
    )
    if match:
        link = match.group(1)
        if not link.startswith("http"):
            parsed = urlparse(base_url)
            if link.startswith("/"):
                link = f"{parsed.scheme}://{parsed.netloc}{link}"
            else:
                link = f"{parsed.scheme}://{parsed.netloc}/{link}"
        return link
    return None


async def tier2_enrich(tool: Dict[str, Any], client: httpx.AsyncClient) -> Dict[str, Any]:
    """
    Tier 2: Website metadata scraping.
    Fetches the tool's homepage and extracts og:description, og:image, favicon.
    """
    url = tool.get("url", "")
    if not url:
        return tool

    try:
        resp = await client.get(
            url,
            follow_redirects=True,
            timeout=15.0,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; PookiesBot/1.0; +https://pookies.ai)",
                "Accept": "text/html",
            },
        )
        if resp.status_code != 200:
            logger.debug(f"  Tier2: {url} returned {resp.status_code}")
            return tool

        html = resp.text[:100_000]  # limit to 100KB to avoid memory issues

        # Extract og:description for richer description
        og_desc = _extract_meta(html, "og:description")
        meta_desc = _extract_meta(html, "description")
        best_desc = og_desc or meta_desc

        if best_desc and len(best_desc) > len(tool.get("description", "")):
            # Only update if scraped description is meaningfully longer
            tool["long_description"] = best_desc[:500]

        # Extract og:image for logo/icon
        og_image = _extract_meta(html, "og:image")
        if og_image:
            tool["_scraped_og_image"] = og_image

        # Extract favicon
        favicon = _extract_favicon(html, url)
        if favicon:
            tool["_scraped_favicon"] = favicon

        # Detect pricing page
        pricing_page = _detect_pricing_page(html, url)
        if pricing_page:
            tool["_pricing_page_url"] = pricing_page

        # Re-scan the homepage text for better enrichment
        # Strip HTML tags for text analysis
        clean_text = re.sub(r"<[^>]+>", " ", html[:50_000]).lower()

        # Better pricing detection from homepage
        if tool.get("comparison_data", {}).get("pricing", {}).get("model") == "freemium":
            # Check if homepage reveals better pricing info
            for model, patterns in PRICING_PATTERNS.items():
                if _match_patterns(clean_text, patterns):
                    tool["comparison_data"]["pricing"]["model"] = model
                    if model in ("free", "open-source"):
                        tool["comparison_data"]["pricing"]["free_tier"] = True
                        tool["comparison_data"]["pricing"]["starting_price"] = 0
                    break

            # Extract price from homepage
            price_match = PRICE_EXTRACT_RE.search(clean_text)
            if price_match:
                tool["comparison_data"]["pricing"]["starting_price"] = float(price_match.group(1))
                tool["comparison_data"]["pricing"]["currency"] = "USD"

        # Better platform detection from homepage
        for plat, patterns in PLATFORM_KEYWORDS.items():
            if _match_patterns(clean_text, patterns):
                tool.setdefault("comparison_data", {}).setdefault("platforms", {})[plat] = True

        logger.info(f"  Tier2: Scraped metadata from {url}")

    except httpx.TimeoutException:
        logger.debug(f"  Tier2: Timeout scraping {url}")
    except Exception as e:
        logger.debug(f"  Tier2: Error scraping {url}: {e}")

    return tool


# ── Logo Waterfall ────────────────────────────────────────────

async def get_best_icon_url(
    tool: Dict[str, Any],
    client: httpx.AsyncClient,
) -> Optional[str]:
    """
    Get the best available icon URL using a waterfall strategy:
    1. Clearbit Logo API (high quality, free)
    2. Google Favicon API (reliable fallback)
    3. Scraped og:image
    4. Existing PH thumbnail
    5. SimpleIcons CDN (last resort)
    """
    url = tool.get("url", "")
    name = tool.get("name", "")
    existing = tool.get("icon_url", "")

    if not url:
        return existing

    domain = urlparse(url).netloc
    if not domain:
        return existing

    # Remove www. prefix for Clearbit
    clean_domain = domain.replace("www.", "")

    # 1. Clearbit Logo API
    clearbit_url = f"https://logo.clearbit.com/{clean_domain}"
    try:
        resp = await client.head(clearbit_url, timeout=5.0, follow_redirects=True)
        if resp.status_code == 200:
            content_type = resp.headers.get("content-type", "")
            if "image" in content_type:
                logger.info(f"  Icon: Clearbit logo for {clean_domain}")
                return clearbit_url
    except Exception:
        pass

    # 2. Google Favicon API
    google_favicon = f"https://www.google.com/s2/favicons?domain={clean_domain}&sz=128"
    try:
        resp = await client.head(google_favicon, timeout=5.0, follow_redirects=True)
        if resp.status_code == 200:
            logger.info(f"  Icon: Google favicon for {clean_domain}")
            return google_favicon
    except Exception:
        pass

    # 3. Scraped og:image (from Tier 2)
    og_image = tool.get("_scraped_og_image")
    if og_image:
        try:
            resp = await client.head(og_image, timeout=5.0, follow_redirects=True)
            if resp.status_code == 200:
                logger.info(f"  Icon: og:image for {name}")
                return og_image
        except Exception:
            pass

    # 4. Scraped favicon
    favicon = tool.get("_scraped_favicon")
    if favicon:
        logger.info(f"  Icon: Scraped favicon for {name}")
        return favicon

    # 5. Keep existing (PH thumbnail or SimpleIcons)
    if existing and existing.startswith("http"):
        return existing

    # 6. SimpleIcons fallback
    slug = re.sub(r"[^a-z0-9]", "", name.lower())
    color = tool.get("color", "#6366F1").replace("#", "")
    return f"https://cdn.simpleicons.org/{slug}/{color}"


# ── Main Enrichment Pipeline ─────────────────────────────────

async def enrich_tool(
    tool: Dict[str, Any],
    client: Optional[httpx.AsyncClient] = None,
    tiers: List[int] = [1, 2],
) -> Dict[str, Any]:
    """
    Run the enrichment pipeline on a single tool.
    
    Args:
        tool: Tool data dictionary
        client: httpx client (required for Tier 2)
        tiers: Which enrichment tiers to run [1, 2, 3]
    """
    # Always run Tier 1
    if 1 in tiers:
        tool = tier1_enrich(tool)

    # Run Tier 2 if client provided
    if 2 in tiers and client:
        tool = await tier2_enrich(tool, client)

    # Tier 3 (LLM) - placeholder for future
    # if 3 in tiers:
    #     tool = await tier3_llm_enrich(tool, client)

    return tool


async def enrich_tools_batch(
    tools: List[Dict[str, Any]],
    tiers: List[int] = [1, 2],
    concurrency: int = 5,
) -> List[Dict[str, Any]]:
    """
    Enrich a batch of tools with rate limiting.
    """
    enriched = []
    semaphore = asyncio.Semaphore(concurrency)

    async with httpx.AsyncClient(
        timeout=20.0,
        follow_redirects=True,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; PookiesBot/1.0; +https://pookies.ai)",
        },
    ) as client:
        async def _enrich_one(tool: Dict[str, Any]) -> Dict[str, Any]:
            async with semaphore:
                result = await enrich_tool(tool, client, tiers)
                # Small delay between requests to be respectful
                await asyncio.sleep(0.5)
                return result

        tasks = [_enrich_one(t) for t in tools]
        enriched = await asyncio.gather(*tasks)

    return list(enriched)
