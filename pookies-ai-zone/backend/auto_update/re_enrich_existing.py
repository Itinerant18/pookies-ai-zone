"""
Re-Enrich Existing Tools
========================
Fetches all tools from Convex, identifies those needing enrichment,
runs them through the enrichment engine, and pushes updates back.

Usage:
    python re_enrich_existing.py              # Enrich stale tools
    python re_enrich_existing.py --dry-run    # Preview only
    python re_enrich_existing.py --limit 10   # Limit to 10 tools
    python re_enrich_existing.py --force      # Re-enrich all, ignore staleness
"""

import asyncio
import logging
import httpx
import json
import sys
import os
import argparse
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

# Add parent dir for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from auto_update.enrichment_engine import enrich_tools_batch, get_best_icon_url
    from auto_update.producthunt_to_convex import upload_image_to_convex, CONVEX_URL
except ImportError:
    from enrichment_engine import enrich_tools_batch, get_best_icon_url
    from producthunt_to_convex import upload_image_to_convex, CONVEX_URL

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def fetch_all_tools() -> List[Dict[str, Any]]:
    """Fetch all tools from Convex."""
    url = f"{CONVEX_URL}/api/run/tools/get"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json={"args": {}, "format": "json"})
        if resp.status_code != 200:
            logger.error(f"Failed to fetch tools: {resp.status_code} - {resp.text[:200]}")
            return []
        
        result = resp.json()
        tools = result.get("value", [])
        if isinstance(tools, list):
            logger.info(f"Fetched {len(tools)} tools from Convex")
            return tools
        return []


def needs_enrichment(tool: Dict[str, Any], force: bool = False, stale_days: int = 7) -> bool:
    """Check if a tool needs enrichment."""
    if force:
        return True

    # Check if updated recently
    updated_at = tool.get("updated_at")
    if updated_at:
        try:
            last_update = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) - last_update < timedelta(days=stale_days):
                return False
        except (ValueError, TypeError):
            pass

    # Check for missing data
    desc = tool.get("description", "")
    if len(desc) < 50:
        return True  # Short description

    if not tool.get("pros") or len(tool.get("pros", [])) == 0:
        return True  # No pros

    if not tool.get("cons") or len(tool.get("cons", [])) == 0:
        return True  # No cons

    comparison = tool.get("comparison_data", {})
    if not comparison:
        return True  # No comparison data

    pricing = comparison.get("pricing", {})
    if not pricing or pricing.get("model") == "freemium":
        # Default pricing, might need real data
        return True

    return False


async def push_enriched_tool(tool: Dict[str, Any], client: httpx.AsyncClient) -> bool:
    """Push an enriched tool back to Convex."""
    description = tool.get("long_description") or tool.get("description", "")
    
    url = f"{CONVEX_URL}/api/run/tools/addOrUpdateTool"
    payload = {
        "args": {
            "name": tool["name"],
            "description": description[:500],
            "category": tool["category"],
            "url": tool["url"],
            "color": tool.get("color", "#6366F1"),
            "featured": tool.get("featured", False),
            "source": tool.get("source", "enriched"),
            "icon_url": tool.get("icon_url"),
            "comparison_data": tool.get("comparison_data"),
            "pros": tool.get("pros"),
            "cons": tool.get("cons"),
        },
        "format": "json",
    }

    try:
        resp = await client.post(url, json=payload)
        if resp.status_code == 200:
            result = resp.json()
            value = result.get("value", {})
            if isinstance(value, dict) and value.get("success"):
                return True
        else:
            logger.warning(f"  Failed to push {tool['name']}: HTTP {resp.status_code}")
    except Exception as e:
        logger.error(f"  Error pushing {tool['name']}: {e}")
    
    return False


async def main():
    parser = argparse.ArgumentParser(description="Re-enrich existing tools in Convex")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, don't push")
    parser.add_argument("--limit", type=int, default=0, help="Max tools to enrich (0=all)")
    parser.add_argument("--force", action="store_true", help="Re-enrich all, ignore staleness check")
    parser.add_argument("--stale-days", type=int, default=7, help="Days before a tool is considered stale")
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("🔄 Re-Enrichment Pipeline")
    logger.info(f"   Dry run: {args.dry_run}")
    logger.info(f"   Force: {args.force}")
    logger.info(f"   Stale threshold: {args.stale_days} days")
    logger.info("=" * 60)

    # 1. Fetch all tools
    all_tools = await fetch_all_tools()
    if not all_tools:
        logger.warning("No tools to process")
        return

    # 2. Filter tools needing enrichment
    tools_to_enrich = [
        t for t in all_tools
        if needs_enrichment(t, force=args.force, stale_days=args.stale_days)
    ]

    if args.limit > 0:
        tools_to_enrich = tools_to_enrich[:args.limit]

    logger.info(f"\n📊 {len(tools_to_enrich)}/{len(all_tools)} tools need enrichment")

    if not tools_to_enrich:
        logger.info("✅ All tools are up-to-date!")
        return

    # 3. Enrich tools
    logger.info(f"\n🔬 Enriching {len(tools_to_enrich)} tools...")
    enriched = await enrich_tools_batch(tools_to_enrich, tiers=[1, 2], concurrency=3)

    # 4. Preview or push
    stats = {"updated": 0, "failed": 0, "icons_upgraded": 0}

    if args.dry_run:
        logger.info("\n🔍 DRY RUN — Preview of enriched tools:")
        for i, tool in enumerate(enriched, 1):
            comp = tool.get("comparison_data", {})
            pricing = comp.get("pricing", {})
            pros = tool.get("pros", [])
            desc = tool.get("long_description") or tool.get("description", "")
            logger.info(f"  {i}. {tool['name']}")
            logger.info(f"     Description: {desc[:100]}...")
            logger.info(f"     Pricing: {pricing.get('model', 'unknown')} (${pricing.get('starting_price', '?')})")
            logger.info(f"     Pros: {pros[:2]}")
            logger.info(f"     Cons: {tool.get('cons', [])[:2]}")
    else:
        async with httpx.AsyncClient(timeout=60.0) as client:
            for tool in enriched:
                # Try logo waterfall
                best_icon = await get_best_icon_url(tool, client)
                if best_icon and best_icon != tool.get("icon_url"):
                    # Upload to CDN
                    if best_icon.startswith("http") and "simpleicons" not in best_icon:
                        storage_id = await upload_image_to_convex(best_icon)
                        if storage_id:
                            tool["icon_url"] = storage_id
                            stats["icons_upgraded"] += 1
                    else:
                        tool["icon_url"] = best_icon

                # Push to Convex
                if await push_enriched_tool(tool, client):
                    stats["updated"] += 1
                    logger.info(f"  ✅ Updated: {tool['name']}")
                else:
                    stats["failed"] += 1

    logger.info(f"\n{'=' * 40}")
    logger.info(f"📊 Re-Enrichment Results:")
    logger.info(f"   Updated: {stats['updated']}")
    logger.info(f"   Icons upgraded: {stats['icons_upgraded']}")
    logger.info(f"   Failed: {stats['failed']}")
    logger.info(f"{'=' * 40}")
    logger.info(f"\n✅ Done at {datetime.now(timezone.utc).isoformat()}")


if __name__ == "__main__":
    asyncio.run(main())
