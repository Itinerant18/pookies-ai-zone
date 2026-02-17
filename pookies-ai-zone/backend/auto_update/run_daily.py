"""
Daily Auto-Update Runner
========================
Runs the Product Hunt → Convex pipeline + re-enrichment + multi-source fetch every day.

Usage:
    python auto_update/run_daily.py              # Start daemon (runs at 06:00 UTC)
    python auto_update/run_daily.py --run-now    # Run once immediately
"""

import asyncio
import logging
import sys
import os
from datetime import datetime, timezone

# Add parent dir for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from auto_update.producthunt_to_convex import fetch_ph_tools, push_to_convex, PRODUCT_HUNT_ACCESS_TOKEN
from auto_update.scheduler import Scheduler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("DailyRunner")

MAX_RETRIES = 3
RETRY_DELAY = 30  # seconds


async def _run_with_retry(func, label: str, *args, **kwargs):
    """Run a function with retries."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.warning(f"  ⚠️  {label} attempt {attempt}/{MAX_RETRIES} failed: {e}")
            if attempt < MAX_RETRIES:
                logger.info(f"  Retrying in {RETRY_DELAY}s...")
                await asyncio.sleep(RETRY_DELAY)
            else:
                logger.error(f"  ❌ {label} failed after {MAX_RETRIES} attempts")
                raise


async def fetch_and_push_new_tools():
    """Step 1: Fetch new tools from Product Hunt and push with enrichment."""
    logger.info("📥 Step 1: Fetching new tools from Product Hunt...")
    topics = ["artificial-intelligence", "developer-tools", "productivity"]
    tools = await _run_with_retry(
        fetch_ph_tools, "PH Fetch",
        PRODUCT_HUNT_ACCESS_TOKEN, max_count=20, topics=topics
    )

    if tools:
        logger.info(f"  Fetched {len(tools)} tools. Enriching & pushing to Convex...")
        stats = await push_to_convex(tools)
        logger.info(f"  ✅ New tools: Added {stats['added']}, Skipped {stats['skipped']}, "
                     f"Failed {stats['failed']}, Icons {stats.get('icons_uploaded', 0)}")
        return stats
    else:
        logger.warning("  No tools fetched this run.")
        return {"added": 0, "skipped": 0, "failed": 0}


async def re_enrich_stale_tools():
    """Step 2: Re-enrich existing stale tools."""
    logger.info("\n🔄 Step 2: Re-enriching stale tools...")
    try:
        from auto_update.re_enrich_existing import fetch_all_tools, needs_enrichment
        from auto_update.enrichment_engine import enrich_tools_batch, get_best_icon_url
        from auto_update.producthunt_to_convex import upload_image_to_convex, CONVEX_URL
        import httpx

        all_tools = await fetch_all_tools()
        stale_tools = [t for t in all_tools if needs_enrichment(t, stale_days=7)]

        if not stale_tools:
            logger.info("  ✅ No stale tools found.")
            return {"updated": 0}

        # Limit to 20 per run to avoid overload
        batch = stale_tools[:20]
        logger.info(f"  Found {len(stale_tools)} stale tools, processing batch of {len(batch)}")

        enriched = await enrich_tools_batch(batch, tiers=[1, 2], concurrency=3)
        updated = 0

        async with httpx.AsyncClient(timeout=60.0) as client:
            for tool in enriched:
                # Try logo upgrade
                best_icon = await get_best_icon_url(tool, client)
                if best_icon and best_icon != tool.get("icon_url"):
                    if best_icon.startswith("http") and "simpleicons" not in best_icon:
                        sid = await upload_image_to_convex(best_icon)
                        if sid:
                            tool["icon_url"] = sid

                # Push update
                description = tool.get("long_description") or tool.get("description", "")
                url = f"{CONVEX_URL}/api/run/tools/addOrUpdateTool"
                payload = {
                    "args": {
                        "name": tool["name"],
                        "description": description[:500],
                        "category": tool["category"],
                        "url": tool["url"],
                        "color": tool.get("color", "#6366F1"),
                        "source": tool.get("source", "enriched"),
                        "icon_url": tool.get("icon_url"),
                        "comparison_data": tool.get("comparison_data"),
                        "pros": tool.get("pros"),
                        "cons": tool.get("cons"),
                    },
                    "format": "json",
                }
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    updated += 1

        logger.info(f"  ✅ Re-enriched {updated}/{len(batch)} tools")
        return {"updated": updated}

    except Exception as e:
        logger.error(f"  ❌ Re-enrichment failed: {e}")
        return {"updated": 0, "error": str(e)}


async def fetch_from_multi_sources():
    """Step 3: Fetch from HuggingFace, GitHub Trending, Reddit."""
    logger.info("\n🌐 Step 3: Fetching from multi-sources (HuggingFace/GitHub/Reddit)...")
    try:
        from auto_update.multi_source_fetcher import run_multi_source
        stats = await run_multi_source(max_per_source=10, dry_run=False)
        logger.info(f"  ✅ Multi-source: Added {stats.get('added', 0)}, "
                     f"Failed {stats.get('failed', 0)}, Icons {stats.get('icons_uploaded', 0)}")
        return stats
    except Exception as e:
        logger.error(f"  ❌ Multi-source fetch failed: {e}")
        return {"added": 0, "failed": 0, "error": str(e)}


async def update_job():
    """The daily job: fetch new + re-enrich stale + multi-source."""
    start = datetime.now(timezone.utc)
    logger.info("=" * 60)
    logger.info(f"⏰ Daily Update — {start.strftime('%Y-%m-%d %H:%M UTC')}")
    logger.info("=" * 60)

    # Step 1: New tools from Product Hunt
    new_stats = await fetch_and_push_new_tools()

    # Step 2: Re-enrich stale tools
    re_stats = await re_enrich_stale_tools()

    # Step 3: Multi-source (HuggingFace, GitHub, Reddit)
    ms_stats = await fetch_from_multi_sources()

    # Summary
    elapsed = (datetime.now(timezone.utc) - start).total_seconds()
    logger.info(f"\n{'=' * 60}")
    logger.info(f"📊 Daily Summary")
    logger.info(f"   New tools (PH):        {new_stats.get('added', 0)}")
    logger.info(f"   New tools (PH skip):   {new_stats.get('skipped', 0)}")
    logger.info(f"   Tools re-enriched:     {re_stats.get('updated', 0)}")
    logger.info(f"   Multi-source added:    {ms_stats.get('added', 0)}")
    logger.info(f"   Duration: {elapsed:.1f}s")
    logger.info(f"{'=' * 60}\n")


async def main():
    run_time = "06:00"
    scheduler = Scheduler(run_time=run_time)
    stop_event = asyncio.Event()

    logger.info(f"🚀 Auto-Update Daemon started.")
    logger.info(f"   Schedule: Run daily at {run_time} UTC")
    logger.info(f"   Press Ctrl+C to stop.")

    try:
        if "--run-now" in sys.argv:
            await update_job()

        await scheduler.run_daily(update_job, stop_event)
    except KeyboardInterrupt:
        logger.info("Stopping...")
        stop_event.set()

if __name__ == "__main__":
    asyncio.run(main())
