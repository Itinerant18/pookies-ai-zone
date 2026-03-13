"""
Auto-Update - Fetch and Add to Convex
Fetches tools from sources and adds them to Convex database
"""

import asyncio
import logging
import httpx
from datetime import datetime
from typing import List, Dict, Any
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Use dev deployment for local access
CONVEX_URL = os.environ.get("CONVEX_URL", "https://festive-fish-491.eu-west-1.convex.cloud")

async def call_convex(function_name: str, args: dict) -> dict:
    """Call a Convex function via HTTP API."""
    url = f"{CONVEX_URL}/api/{function_name}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=args)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.warning(f"Convex {function_name}: {resp.status_code}")
                return None
    except Exception as e:
        logger.error(f"Convex error: {e}")
        return None

async def add_tool(tool: dict) -> bool:
    """Add a tool to Convex."""
    result = await call_convex("tools/addTool", tool)
    return result and result.get("success", False)

def map_category(raw: str) -> str:
    cat = raw.lower().strip()
    mapping = {
        "text": "Writing & Content", "image": "Image Generation",
        "video": "Video Generation", "audio": "Music & Audio",
        "code": "Development", "chatbot": "Chatbots & Conversational AI",
        "productivity": "Productivity & Office", "marketing": "Marketing & Sales",
        "analytics": "Data & Analytics", "automation": "Automation & Workflow",
        "api": "API & Testing", "3d": "3D & Creative", "design": "Creative & Design",
        "assistant": "Assistants & Agents", "llm": "LLMs & Chatbots",
    }
    for k, v in mapping.items():
        if k in cat:
            return v
    return "Other"

async def fetch_huggingface() -> List[Dict]:
    logger.info("Fetching from Hugging Face...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get("https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=30")
            if resp.status_code == 200:
                for space in resp.json():
                    tools.append({
                        "name": space.get("id", "")[:50],
                        "description": f"⭐ {space.get('likes', 0)} stars - AI Space on Hugging Face",
                        "category": "Assistants & Agents",
                        "url": f"https://huggingface.co/spaces/{space.get('id')}",
                        "color": "#FF9D00",
                        "source": "huggingface"
                    })
    except Exception as e:
        logger.error(f"HF error: {e}")
    logger.info(f"  Found {len(tools)} from Hugging Face")
    return tools

async def fetch_github() -> List[Dict]:
    logger.info("Fetching from GitHub...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://api.github.com/search/repositories",
                params={"q": "ai OR ml created:>2024-06-01", "sort": "stars", "per_page": 30},
                headers={"Accept": "application/vnd.github.v3+json"}
            )
            if resp.status_code == 200:
                for repo in resp.json().get("items", []):
                    tools.append({
                        "name": repo.get("name", "")[:50],
                        "description": f"⭐ {repo.get('stargazers_count', 0)} stars - {repo.get('description', '')[:80]}",
                        "category": "Development",
                        "url": repo.get("html_url"),
                        "color": "#181717",
                        "source": "github"
                    })
    except Exception as e:
        logger.error(f"GitHub error: {e}")
    logger.info(f"  Found {len(tools)} from GitHub")
    return tools

async def fetch_hackernews() -> List[Dict]:
    logger.info("Fetching from Hacker News...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            if resp.status_code == 200:
                for story_id in resp.json()[:15]:
                    story_resp = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json")
                    if story_resp.status_code == 200:
                        story = story_resp.json()
                        if story and any(k in story.get("title", "").lower() for k in ["ai", "tool", "gpt", "llm"]):
                            tools.append({
                                "name": story.get("title", "")[:50],
                                "description": story.get("title", ""),
                                "category": "Development",
                                "url": story.get("url", f"https://news.ycombinator.com/item?id={story_id}"),
                                "color": "#FF6600",
                                "source": "hackernews"
                            })
    except Exception as e:
        logger.error(f"HN error: {e}")
    logger.info(f"  Found {len(tools)} from Hacker News")
    return tools

async def main():
    logger.info("=" * 60)
    logger.info("AI TOOLS AUTO-UPDATE")
    logger.info("=" * 60)
    
    # Check current stats
    stats = await call_convex("tools/getToolStats", {})
    if stats:
        logger.info(f"Current tools: {stats.get('total', 'N/A')}")
    else:
        logger.warning("Could not connect to Convex (using dev URL)")
        logger.info("Trying with dev server URL...")
    
    # Fetch tools
    logger.info("")
    results = await asyncio.gather(fetch_huggingface(), fetch_github(), fetch_hackernews(), return_exceptions=True)
    
    all_tools = []
    for r in results:
        if isinstance(r, list):
            all_tools.extend(r)
    
    logger.info(f"Total tools to add: {len(all_tools)}")
    
    # Add to Convex
    logger.info("")
    logger.info("Adding tools to database...")
    added = 0
    skipped = 0
    
    for tool in all_tools[:50]:  # Limit to 50
        try:
            result = await add_tool(tool)
            if result:
                added += 1
                logger.info(f"  ✓ Added: {tool['name']}")
            else:
                skipped += 1
        except Exception as e:
            skipped += 1
    
    logger.info("")
    logger.info("=" * 60)
    logger.info(f"DONE! Added: {added}, Skipped: {skipped}")
    logger.info("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
