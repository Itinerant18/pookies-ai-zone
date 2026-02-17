"""
Product Hunt → Convex Pipeline
Fetches AI tools from Product Hunt GraphQL API and pushes them to Convex.

Usage:
    python producthunt_to_convex.py              # Fetch & push AI tools
    python producthunt_to_convex.py --dry-run    # Preview only, don't push
    python producthunt_to_convex.py --count 50   # Fetch up to 50 tools
"""

import asyncio
import logging
import httpx
import json
import sys
import os
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

# Add parent dir for imports
try:
    from auto_update.producthunt_config import PRODUCT_HUNT_API_KEY as API_KEY, PRODUCT_HUNT_API_SECRET as API_SECRET, PRODUCT_HUNT_ACCESS_TOKEN
except ImportError:
    try:
        from producthunt_config import PRODUCT_HUNT_API_KEY as API_KEY, PRODUCT_HUNT_API_SECRET as API_SECRET, PRODUCT_HUNT_ACCESS_TOKEN
    except ImportError as e:
        logger.error(f"Could not import producthunt_config: {e}")
        sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────
CONVEX_URL = "https://festive-fish-491.eu-west-1.convex.cloud"
PH_GRAPHQL = "https://api.producthunt.com/v2/api/graphql"

# Category mapping: PH topic slug → our app category
TOPIC_TO_CATEGORY: Dict[str, str] = {
    "artificial-intelligence": "LLMs & Chatbots",
    "machine-learning": "Data Analysis & Research",
    "chatgpt": "LLMs & Chatbots",
    "gpt": "LLMs & Chatbots",
    "llm": "LLMs & Chatbots",
    "chatbot": "LLMs & Chatbots",
    "generative-ai": "Creative & Design",
    "ai-image": "Image Generation",
    "image-generation": "Image Generation",
    "text-to-image": "Image Generation",
    "ai-art": "Image Generation",
    "ai-writing": "Productivity & Office",
    "copywriting": "Marketing & Sales",
    "ai-video": "Music & Audio",
    "video-generation": "Music & Audio",
    "ai-audio": "Music & Audio",
    "text-to-speech": "Music & Audio",
    "ai-coding": "Development & Engineering",
    "developer-tools": "Development & Engineering",
    "code-assistant": "Development & Engineering",
    "devops": "Development & Engineering",
    "no-code": "Automation & Workflow",
    "automation": "Automation & Workflow",
    "workflow": "Automation & Workflow",
    "productivity": "Productivity & Office",
    "note-taking": "Note-taking & Knowledge",
    "education": "Research & Education",
    "saas": "Productivity & Office",
    "design-tools": "Design & UI",
    "ux-design": "Design & UI",
    "marketing": "Marketing & Sales",
    "seo": "Marketing & Sales",
    "sales": "Marketing & Sales",
    "customer-support": "CRM & Customer Support",
    "analytics": "Data Analysis & Research",
    "data-science": "Data Analysis & Research",
    "fintech": "Finance",
    "health": "Health & Wellness",
    "legal": "Legal",
    "hiring": "HR & Recruitment",
    "e-commerce": "E-commerce",
    "security": "Security & Privacy",
    "chrome-extensions": "Browsers",
    "browser-extension": "Browsers",
    "open-source": "Development & Engineering",
    "api": "Development & Engineering",
    "3d": "3D & Creative",
}

# Color palette for categories
CATEGORY_COLORS: Dict[str, str] = {
    "LLMs & Chatbots": "#10A37F",
    "Development & Engineering": "#6366F1",
    "Productivity & Office": "#3B82F6",
    "Creative & Design": "#EC4899",
    "Image Generation": "#F59E0B",
    "Marketing & Sales": "#EF4444",
    "Data Analysis & Research": "#8B5CF6",
    "Automation & Workflow": "#14B8A6",
    "Design & UI": "#F472B6",
    "Music & Audio": "#A855F7",
    "Research & Education": "#06B6D4",
    "Note-taking & Knowledge": "#84CC16",
    "CRM & Customer Support": "#F97316",
    "Finance": "#22C55E",
    "Health & Wellness": "#EF4444",
    "HR & Recruitment": "#0EA5E9",
    "E-commerce": "#D946EF",
    "Security & Privacy": "#64748B",
    "Browsers": "#F59E0B",
    "Legal": "#6B7280",
    "3D & Creative": "#10B981",
    "Assistants & Agents": "#8B5CF6",
}


# ── Product Hunt GraphQL Queries ──────────────────────────────

QUERY_POSTS = """
query GetPosts($topic: String!, $first: Int!, $after: String) {
  posts(
    topic: $topic
    first: $first
    after: $after
    order: VOTES
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        tagline
        description
        url
        website
        votesCount
        createdAt
        featuredAt
        thumbnail {
          url
        }
        topics {
          edges {
            node {
              name
              slug
            }
          }
        }
        makers {
          name
        }
      }
    }
  }
}
"""

# Simpler fallback query without topic filter
QUERY_POSTS_SIMPLE = """
query GetPosts($first: Int!, $after: String) {
  posts(
    first: $first
    after: $after
    order: VOTES
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        tagline
        description
        url
        website
        votesCount
        createdAt
        featuredAt
        thumbnail {
          url
        }
        topics {
          edges {
            node {
              name
              slug
            }
          }
        }
      }
    }
  }
}
"""


def classify_category(topics: List[Dict[str, str]], name: str, tagline: str) -> str:
    """Determine the best category for a tool based on its PH topics."""
    # Check topic slugs against our mapping
    for topic in topics:
        slug = topic.get("slug", "").lower()
        if slug in TOPIC_TO_CATEGORY:
            return TOPIC_TO_CATEGORY[slug]

    # Keyword-based fallback from name/tagline
    text = f"{name} {tagline}".lower()
    keyword_map = {
        "chatbot": "LLMs & Chatbots",
        "llm": "LLMs & Chatbots",
        "gpt": "LLMs & Chatbots",
        "chat": "LLMs & Chatbots",
        "ai assistant": "Assistants & Agents",
        "agent": "Assistants & Agents",
        "copilot": "Assistants & Agents",
        "image generat": "Image Generation",
        "text to image": "Image Generation",
        "art generat": "Image Generation",
        "code": "Development & Engineering",
        "developer": "Development & Engineering",
        "ide": "Development & Engineering",
        "debug": "Development & Engineering",
        "design": "Design & UI",
        "ui": "Design & UI",
        "ux": "Design & UI",
        "video": "Music & Audio",
        "music": "Music & Audio",
        "audio": "Music & Audio",
        "voice": "Music & Audio",
        "writing": "Productivity & Office",
        "productivity": "Productivity & Office",
        "workflow": "Automation & Workflow",
        "automat": "Automation & Workflow",
        "marketing": "Marketing & Sales",
        "seo": "Marketing & Sales",
        "sales": "Marketing & Sales",
        "analytics": "Data Analysis & Research",
        "data": "Data Analysis & Research",
        "research": "Research & Education",
        "learn": "Research & Education",
        "education": "Research & Education",
        "note": "Note-taking & Knowledge",
        "knowledge": "Note-taking & Knowledge",
        "customer": "CRM & Customer Support",
        "support": "CRM & Customer Support",
        "security": "Security & Privacy",
        "privacy": "Security & Privacy",
        "finance": "Finance",
        "health": "Health & Wellness",
        "legal": "Legal",
        "hiring": "HR & Recruitment",
        "recruit": "HR & Recruitment",
        "ecommerce": "E-commerce",
        "shop": "E-commerce",
        "3d": "3D & Creative",
        "browser": "Browsers",
        "extension": "Browsers",
    }
    for keyword, category in keyword_map.items():
        if keyword in text:
            return category

    # Default
    return "Productivity & Office"


def get_color(category: str) -> str:
    """Get a brand color for a category."""
    return CATEGORY_COLORS.get(category, "#6366F1")


# ── Product Hunt Fetcher ──────────────────────────────────────

async def fetch_ph_tools(
    token: str,
    max_count: int = 20,
    topics: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Fetch AI tools from Product Hunt GraphQL API."""
    if topics is None:
        topics = ["artificial-intelligence"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    all_tools: List[Dict[str, Any]] = []
    seen_names: set = set()

    async with httpx.AsyncClient(timeout=30.0) as client:
        for topic_slug in topics:
            logger.info(f"Fetching topic: {topic_slug}")
            cursor: Optional[str] = None
            page = 0

            while len(all_tools) < max_count:
                page += 1
                per_page = min(20, max_count - len(all_tools))

                # Try with topic filter first
                variables: Dict[str, Any] = {
                    "topic": topic_slug,
                    "first": per_page,
                }
                if cursor:
                    variables["after"] = cursor

                try:
                    resp = await client.post(
                        PH_GRAPHQL,
                        headers=headers,
                        json={"query": QUERY_POSTS, "variables": variables},
                    )

                    if resp.status_code != 200:
                        logger.warning(f"  PH API returned {resp.status_code}: {resp.text[:300]}")
                        break

                    data = resp.json()

                    # If there are GraphQL errors, try simpler query
                    if "errors" in data:
                        logger.warning(f"  GraphQL errors for topic '{topic_slug}': {data['errors'][0].get('message', '')}")
                        logger.info("  Falling back to simple query...")

                        variables_simple = {"first": per_page}
                        if cursor:
                            variables_simple["after"] = cursor

                        resp = await client.post(
                            PH_GRAPHQL,
                            headers=headers,
                            json={"query": QUERY_POSTS_SIMPLE, "variables": variables_simple},
                        )
                        data = resp.json()
                        if "errors" in data:
                            logger.error(f"  Fallback also failed: {data['errors']}")
                            break

                    posts_data = data.get("data", {}).get("posts", {})
                    edges = posts_data.get("edges", [])
                    page_info = posts_data.get("pageInfo", {})
                    total = posts_data.get("totalCount", 0)

                    if page == 1:
                        logger.info(f"  Total available: {total}")

                    if not edges:
                        logger.info(f"  No more posts for topic '{topic_slug}'")
                        break

                    for edge in edges:
                        node = edge.get("node", {})
                        name = node.get("name", "").strip()

                        if not name or name.lower() in seen_names:
                            continue
                        seen_names.add(name.lower())

                        # Extract topics
                        node_topics = [
                            t["node"]
                            for t in node.get("topics", {}).get("edges", [])
                        ]

                        tagline = node.get("tagline", "")
                        category = classify_category(node_topics, name, tagline)
                        color = get_color(category)

                        # Build tool object
                        website = node.get("website") or node.get("url", "")
                        slug = re.sub(r"[^a-z0-9]", "", name.lower())
                        icon_url = f"https://cdn.simpleicons.org/{slug}/{color.replace('#', '')}"

                        # Use thumbnail if available
                        thumbnail = node.get("thumbnail", {})
                        thumb_url = thumbnail.get("url", "") if thumbnail else ""

                        tool: Dict[str, Any] = {
                            "name": name,
                            "description": tagline or node.get("description", "")[:200],
                            "category": category,
                            "url": website,
                            "color": color,
                            "icon_letter": name[0].upper() if name else "?",
                            "icon_url": thumb_url or icon_url,
                            "featured": (node.get("votesCount", 0) or 0) > 100,
                            "source": "producthunt",
                        }

                        all_tools.append(tool)
                        logger.info(f"  ✓ {name} → {category} ({node.get('votesCount', 0)} votes)")

                    # Pagination
                    if page_info.get("hasNextPage") and len(all_tools) < max_count:
                        cursor = page_info.get("endCursor")
                    else:
                        break

                except httpx.TimeoutException:
                    logger.error(f"  Timeout fetching topic '{topic_slug}'")
                    break
                except Exception as e:
                    logger.error(f"  Error: {e}")
                    break

    logger.info(f"\nTotal fetched: {len(all_tools)} tools from Product Hunt")
    return all_tools


# ── Image Upload & Enrichment ─────────────────────────────────

async def upload_image_to_convex(image_url: str) -> Optional[str]:
    """Download image from URL and upload to Convex Storage."""
    if not image_url or image_url.startswith("https://cdn.simpleicons.org"):
        return None

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 1. Download image
            img_resp = await client.get(image_url)
            if img_resp.status_code != 200:
                return None
            
            image_data = img_resp.content
            content_type = img_resp.headers.get("content-type", "image/jpeg")

            # 2. Get Upload URL
            # Convex HTTP API: POST /api/run/files/generateUploadUrl
            url_gen = f"{CONVEX_URL}/api/run/files/generateUploadUrl"
            resp_gen = await client.post(url_gen, json={"args": {}, "format": "json"})
            if resp_gen.status_code != 200:
                logger.warning(f"  Failed to generate upload URL: {resp_gen.text}")
                return None
            
            upload_url = resp_gen.json().get("value")
            if not upload_url:
                return None

            # 3. Upload to Storage
            resp_upload = await client.post(
                upload_url,
                content=image_data,
                headers={"Content-Type": content_type}
            )
            if resp_upload.status_code != 200:
                logger.warning(f"  Failed to upload image: {resp_upload.text}")
                return None
            
            # Convex returns { "storageId": "..." }
            storage_id = resp_upload.json().get("storageId")
            return storage_id

    except Exception as e:
        logger.warning(f"  Image upload failed for {image_url}: {e}")
        return None

# Import enrichment engine
try:
    from auto_update.enrichment_engine import enrich_tools_batch, get_best_icon_url
except ImportError:
    from enrichment_engine import enrich_tools_batch, get_best_icon_url

# ── Convex Pusher ─────────────────────────────────────────────

async def push_to_convex(tools: List[Dict[str, Any]]) -> Dict[str, int]:
    """Enrich tools and push to Convex via the addOrUpdateTool mutation."""
    stats = {"added": 0, "skipped": 0, "failed": 0, "icons_uploaded": 0}

    # ── Step 1: Batch enrich all tools (Tier 1 + Tier 2) ──
    logger.info(f"\n🔬 Enriching {len(tools)} tools (Tier 1 + Tier 2)...")
    enriched_tools = await enrich_tools_batch(tools, tiers=[1, 2], concurrency=5)
    logger.info(f"✅ Enrichment complete for {len(enriched_tools)} tools")

    # ── Step 2: Push each tool to Convex ──
    async with httpx.AsyncClient(timeout=60.0) as client:
        for tool in enriched_tools:
            try:
                logger.info(f"Processing: {tool['name']}")

                # ── Logo waterfall: find the best icon ──
                best_icon = await get_best_icon_url(tool, client)
                if best_icon and best_icon != tool.get("icon_url"):
                    tool["icon_url"] = best_icon

                # Upload icon to Convex Storage (CDN)
                original_icon = tool.get("icon_url", "")
                if original_icon and original_icon.startswith("http") and "simpleicons" not in original_icon:
                    logger.info(f"  Uploading icon to CDN...")
                    storage_id = await upload_image_to_convex(original_icon)
                    if storage_id:
                        tool["icon_url"] = storage_id
                        stats["icons_uploaded"] += 1
                        logger.info(f"  ✓ Icon uploaded: {storage_id}")

                # Use enriched long_description if available
                description = tool.get("long_description") or tool.get("description", "")

                # Convex HTTP API
                url = f"{CONVEX_URL}/api/run/tools/addOrUpdateTool"
                payload = {
                    "args": {
                        "name": tool["name"],
                        "description": description[:500],  # cap at 500 chars
                        "category": tool["category"],
                        "url": tool["url"],
                        "color": tool.get("color", "#6366F1"),
                        "featured": tool.get("featured", False),
                        "source": tool.get("source", "producthunt"),
                        "icon_url": tool.get("icon_url"),
                        "comparison_data": tool.get("comparison_data"),
                        "pros": tool.get("pros"),
                        "cons": tool.get("cons"),
                    },
                    "format": "json",
                }

                resp = await client.post(url, json=payload)

                if resp.status_code == 200:
                    result = resp.json()
                    value = result.get("value", result)
                    if isinstance(value, dict):
                        if value.get("success"):
                            stats["added"] += 1
                            msg = value.get("message", "OK")
                            logger.info(f"  ✅ {msg}")
                        else:
                            stats["skipped"] += 1
                            logger.info(f"  ⏭️  Skipped ({value.get('message', 'already exists')})")
                    else:
                        stats["added"] += 1
                        logger.info(f"  ✅ Added to DB")
                else:
                    stats["failed"] += 1
                    error_text = resp.text[:200]
                    logger.warning(f"  ❌ Failed DB Push - HTTP {resp.status_code}: {error_text}")

            except Exception as e:
                stats["failed"] += 1
                logger.error(f"  ❌ Error pushing {tool['name']}: {e}")

    logger.info(f"\n📊 Push Stats: {stats}")
    return stats


# ── Main ──────────────────────────────────────────────────────

async def main():
    """Main pipeline: Fetch from Product Hunt → Push to Convex."""
    import argparse

    parser = argparse.ArgumentParser(description="Product Hunt → Convex Pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, don't push to Convex")
    parser.add_argument("--count", type=int, default=20, help="Max tools to fetch (default: 20)")
    parser.add_argument("--output", type=str, default=None, help="Save fetched tools to JSON file")
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("🚀 Product Hunt → Convex Pipeline")
    logger.info(f"   Max tools: {args.count}")
    logger.info(f"   Dry run: {args.dry_run}")
    logger.info(f"   Convex: {CONVEX_URL}")
    logger.info("=" * 60)

    # 1. Fetch from Product Hunt
    topics = [
        "artificial-intelligence",
        "machine-learning",
        "developer-tools",
        "productivity",
    ]
    tools = await fetch_ph_tools(
        token=PRODUCT_HUNT_ACCESS_TOKEN,
        max_count=args.count,
        topics=topics,
    )

    if not tools:
        logger.warning("No tools fetched. Check your API token.")
        return

    # 2. Save to JSON if requested
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(tools, f, indent=2, ensure_ascii=False)
        logger.info(f"\n📄 Saved {len(tools)} tools to {args.output}")

    # 3. Push to Convex
    if not args.dry_run:
        logger.info("\n📤 Pushing to Convex...")
        stats = await push_to_convex(tools)
        logger.info("\n" + "=" * 40)
        logger.info(f"📊 Results:")
        logger.info(f"   Added:   {stats['added']}")
        logger.info(f"   Skipped: {stats['skipped']}")
        logger.info(f"   Failed:  {stats['failed']}")
        logger.info("=" * 40)
    else:
        logger.info("\n🔍 DRY RUN - Tools that would be pushed:")
        for i, tool in enumerate(tools, 1):
            logger.info(f"  {i}. {tool['name']} [{tool['category']}] - {tool['url']}")

    logger.info(f"\n✅ Done at {datetime.now(timezone.utc).isoformat()}")


if __name__ == "__main__":
    asyncio.run(main())
