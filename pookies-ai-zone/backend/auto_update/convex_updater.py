"""
Auto-Update System - Convex Connected
Run this script to check for new AI tools and add them to Convex
"""

import asyncio
import logging
import httpx
import os
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CONVEX_URL = "https://descriptive-swan-405.eu-west-1.convex.cloud"

SAMPLE_NEW_TOOLS = [
    {"name": "GPT-5", "description": "Next generation AI assistant from OpenAI", "category": "LLMs & Chatbots", "url": "https://openai.com/gpt5", "color": "#10A37F", "source": "auto-update"},
    {"name": "Claude 4", "description": "Latest AI assistant from Anthropic", "category": "LLMs & Chatbots", "url": "https://claude.ai/claude4", "color": "#FF6D00", "source": "auto-update"},
]

async def call_convex_mutation(function_name: str, args: dict):
    """Call a Convex mutation via HTTP API."""
    # Convex uses /api/functionName path
    url = f"{CONVEX_URL}/api/{function_name}"
    logger.info(f"Calling: {url}")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=args)
            logger.info(f"Response: {resp.status_code}")
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.warning(f"Convex returned {resp.status_code}: {resp.text[:200]}")
                return None
    except Exception as e:
        logger.error(f"Convex call failed: {e}")
        return None

async def get_tool_stats():
    """Get current tool statistics."""
    result = await call_convex_mutation("tools/getToolStats", {})
    return result

async def add_tool(tool: dict):
    """Add a new tool to Convex."""
    result = await call_convex_mutation("tools/addTool", tool)
    return result

async def check_for_new_tools():
    """Check for new AI tools and add them."""
    logger.info("=" * 50)
    logger.info("Checking for new AI tools...")
    logger.info("=" * 50)
    
    # Get current stats
    stats = await get_tool_stats()
    if stats:
        logger.info(f"Current tools: {stats.get('total', 'N/A')}")
        logger.info(f"Categories: {stats.get('categories', 'N/A')}")
    else:
        logger.warning("Could not connect to Convex")
        return
    
    logger.info("")
    logger.info("Simulating new tool discovery...")
    logger.info("(In production, this would fetch from APIs)")
    
    # For demo, show what would be added
    for tool in SAMPLE_NEW_TOOLS:
        logger.info(f"  Found: {tool['name']} - {tool['category']}")
    
    # Uncomment below to actually add tools:
    # for tool in SAMPLE_NEW_TOOLS:
    #     result = await add_tool(tool)
    #     if result and result.get('success'):
    #         logger.info(f"  Added: {tool['name']}")
    #     else:
    #         logger.info(f"  Skipped: {tool['name']} (already exists)")
    
    logger.info("")
    logger.info(f"Last checked: {datetime.now().isoformat()}")

if __name__ == "__main__":
    asyncio.run(check_for_new_tools())
