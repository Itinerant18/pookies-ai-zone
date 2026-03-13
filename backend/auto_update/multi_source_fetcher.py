"""
Multi-Source Fetcher
====================
Orchestrates fetching AI tools from HuggingFace, GitHub Trending, and Reddit,
then enriches and pushes to Convex. Designed to be called from run_daily.py.
"""

import asyncio
import logging
from typing import List, Dict, Any

from auto_update.source_connectors import (
    HuggingFaceSource,
    GitHubTrendingSource,
    RedditSource,
)
from auto_update.enrichment_engine import enrich_tools_batch, get_best_icon_url
from auto_update.producthunt_to_convex import upload_image_to_convex, CONVEX_URL
import httpx

logger = logging.getLogger("MultiSourceFetcher")

# Sources to use
SOURCES = [
    HuggingFaceSource(),
    GitHubTrendingSource(),
    RedditSource(),
]


async def fetch_from_all_sources(max_per_source: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch tools from HuggingFace, GitHub Trending, and Reddit concurrently.
    Returns a deduplicated list of normalized tool dicts.
    """
    logger.info(f"🌐 Fetching from {len(SOURCES)} sources (max {max_per_source} each)...")

    all_tools: List[Dict[str, Any]] = []
    seen_urls: set = set()

    for source in SOURCES:
        try:
            tools = await source.fetch_tools()
            # Limit per source
            tools = tools[:max_per_source]
            # Deduplicate by URL
            for t in tools:
                url = t.get("url", "").lower().rstrip("/")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    t["source"] = source.name.lower().replace(" ", "_")
                    all_tools.append(t)
            logger.info(f"  ✅ {source.name}: {len(tools)} tools fetched")
        except Exception as e:
            logger.warning(f"  ⚠️  {source.name} failed: {e}")

    logger.info(f"  📊 Total: {len(all_tools)} unique tools from all sources")
    return all_tools


async def enrich_and_push(tools: List[Dict[str, Any]], dry_run: bool = False) -> Dict[str, int]:
    """
    Enrich tools (pricing, platforms, features, icons) and push to Convex.
    Returns stats dict {added, skipped, failed, icons_uploaded}.
    """
    if not tools:
        return {"added": 0, "skipped": 0, "failed": 0, "icons_uploaded": 0}

    # Enrich
    logger.info(f"🔬 Enriching {len(tools)} tools...")
    enriched = await enrich_tools_batch(tools, tiers=[1, 2], concurrency=3)

    if dry_run:
        for t in enriched:
            logger.info(f"  [DRY-RUN] {t['name']} ({t.get('source', 'unknown')})")
        return {"added": 0, "skipped": len(enriched), "failed": 0, "icons_uploaded": 0}

    added = 0
    skipped = 0
    failed = 0
    icons_uploaded = 0

    async with httpx.AsyncClient(timeout=60.0) as client:
        for tool in enriched:
            try:
                # Logo upgrade
                best_icon = await get_best_icon_url(tool, client)
                if best_icon and best_icon.startswith("http"):
                    sid = await upload_image_to_convex(best_icon)
                    if sid:
                        tool["icon_url"] = sid
                        icons_uploaded += 1

                # Push to Convex
                description = tool.get("long_description") or tool.get("description", "")
                url = f"{CONVEX_URL}/api/run/tools/addOrUpdateTool"

                # Build args, omitting None values for optional fields
                args = {
                    "name": tool["name"],
                    "description": description[:500],
                    "category": tool.get("category", "Other"),
                    "url": tool["url"],
                    "color": tool.get("color", "#6366F1"),
                    "source": tool.get("source", "multi_source"),
                }
                # Only include optional fields if they have valid values
                if tool.get("icon_url"):
                    args["icon_url"] = tool["icon_url"]
                if tool.get("comparison_data"):
                    args["comparison_data"] = tool["comparison_data"]
                if tool.get("pros"):
                    args["pros"] = tool["pros"]
                if tool.get("cons"):
                    args["cons"] = tool["cons"]

                payload = {"args": args, "format": "json"}
                resp = await client.post(url, json=payload)

                if resp.status_code == 200:
                    result = resp.json()

                    # Convex can return 200 with errors in the body
                    if isinstance(result, dict) and result.get("status") == "error":
                        failed += 1
                        err_msg = result.get("errorMessage", "Unknown error")
                        logger.warning(f"  ❌ [CONVEX ERROR] {tool['name']}: {err_msg[:200]}")
                        continue

                    # Parse the value (Convex wraps in {"status":"success","value":{...}})
                    value = result.get("value", result)
                    if isinstance(value, dict):
                        if value.get("success"):
                            msg = value.get("message", "OK")
                            if "added" in msg.lower():
                                added += 1
                                logger.info(f"  ✅ [ADDED] {tool['name']} (from {tool.get('source', '?')})")
                            else:
                                skipped += 1
                                logger.info(f"  🔄 [UPDATED] {tool['name']} (from {tool.get('source', '?')})")
                        else:
                            skipped += 1
                            logger.info(f"  ⏭️  Skipped {tool['name']}: {value.get('message', 'already exists')}")
                    else:
                        added += 1
                        logger.info(f"  ✅ {tool['name']} (from {tool.get('source', '?')})")
                else:
                    failed += 1
                    logger.warning(f"  ❌ {tool['name']}: HTTP {resp.status_code} - {resp.text[:200]}")
            except Exception as e:
                failed += 1
                logger.warning(f"  ❌ {tool['name']}: {e}")

    return {"added": added, "skipped": skipped, "failed": failed, "icons_uploaded": icons_uploaded}


async def run_multi_source(max_per_source: int = 10, dry_run: bool = False) -> Dict[str, int]:
    """Main entry point: fetch → enrich → push."""
    tools = await fetch_from_all_sources(max_per_source)
    stats = await enrich_and_push(tools, dry_run=dry_run)

    logger.info(f"\n📊 Multi-Source Results:")
    logger.info(f"   Added: {stats['added']}")
    logger.info(f"   Skipped: {stats['skipped']}")
    logger.info(f"   Failed: {stats['failed']}")
    logger.info(f"   Icons: {stats['icons_uploaded']}")

    return stats


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    asyncio.run(run_multi_source(max_per_source=5, dry_run=dry))
