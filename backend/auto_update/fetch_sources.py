"""
Auto-Update System - Real Sources Connector
Fetches AI tools from multiple sources
"""

import asyncio
import logging
import httpx
from datetime import datetime
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def map_category(raw_category: str) -> str:
    """Map source category to our categories."""
    cat = raw_category.lower().strip()
    mapping = {
        "text": "Writing & Content", "image": "Image Generation",
        "video": "Video Generation", "audio": "Music & Audio",
        "code": "Development", "chatbot": "Chatbots & Conversational AI",
        "productivity": "Productivity & Office", "marketing": "Marketing & Sales",
        "analytics": "Data & Analytics", "automation": "Automation & Workflow",
        "api": "API & Testing", "3d": "3D & Creative", "design": "Creative & Design",
        "assistant": "Assistants & Agents", "llm": "LLMs & Chatbots",
    }
    for key, val in mapping.items():
        if key in cat:
            return val
    return "Other"

async def fetch_huggingface() -> List[Dict]:
    """Fetch trending AI Spaces from Hugging Face."""
    logger.info("Fetching from Hugging Face...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=30"
            )
            if resp.status_code == 200:
                for space in resp.json():
                    tools.append({
                        "name": space.get("id", "")[:50],
                        "description": f"⭐ {space.get('likes', 0)} - AI Space on Hugging Face",
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
    """Fetch trending GitHub AI/ML repos."""
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
                        "description": f"⭐ {repo.get('stargazers_count', 0)} - {repo.get('description', '')[:100]}",
                        "category": "Development",
                        "url": repo.get("html_url"),
                        "color": "#181717",
                        "source": "github"
                    })
    except Exception as e:
        logger.error(f"GitHub error: {e}")
    logger.info(f"  Found {len(tools)} from GitHub")
    return tools

async def fetch_producthunt() -> List[Dict]:
    """Fetch AI products from Product Hunt."""
    logger.info("Fetching from Product Hunt...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://api.producthunt.com/v2/categories/ai/posts",
                params={"limit": 30}
            )
            if resp.status_code == 200:
                for post in resp.json().get("posts", []):
                    tools.append({
                        "name": post.get("name", "")[:50],
                        "description": post.get("tagline", ""),
                        "category": "Productivity & Office",
                        "url": post.get("redirect_url", ""),
                        "color": "#FF6D00",
                        "source": "producthunt"
                    })
    except Exception as e:
        logger.error(f"Product Hunt error: {e}")
    logger.info(f"  Found {len(tools)} from Product Hunt")
    return tools

async def fetch_hackernews() -> List[Dict]:
    """Fetch AI tools from Hacker News."""
    logger.info("Fetching from Hacker News...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            if resp.status_code == 200:
                for story_id in resp.json()[:20]:
                    story_resp = await client.get(
                        f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                    )
                    if story_resp.status_code == 200:
                        story = story_resp.json()
                        if story and any(k in story.get("title", "").lower() for k in ["ai", "tool", "app", "gpt"]):
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

async def fetch_reddit() -> List[Dict]:
    """Fetch AI tools from Reddit."""
    logger.info("Fetching from Reddit...")
    tools = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://www.reddit.com/r/ArtificialIntelligence/hot.json",
                params={"limit": 25}
            )
            if resp.status_code == 200:
                for post in resp.json().get("data", {}).get("children", []):
                    title = post.get("data", {}).get("title", "")
                    if any(k in title.lower() for k in ["tool", "app", "new", "release", "launch"]):
                        tools.append({
                            "name": title[:50],
                            "description": title,
                            "category": "Assistants & Agents",
                            "url": f"https://reddit.com{post.get('data', {}).get('permalink', '')}",
                            "color": "#FF4500",
                            "source": "reddit"
                        })
    except Exception as e:
        logger.error(f"Reddit error: {e}")
    logger.info(f"  Found {len(tools)} from Reddit")
    return tools

async def main():
    logger.info("=" * 50)
    logger.info("AI TOOLS AUTO-UPDATE - FETCHING FROM SOURCES")
    logger.info("=" * 50)
    
    # Fetch from all sources in parallel
    results = await asyncio.gather(
        fetch_huggingface(),
        fetch_github(),
        fetch_producthunt(),
        fetch_hackernews(),
        fetch_reddit(),
        return_exceptions=True
    )
    
    all_tools = []
    for r in results:
        if isinstance(r, list):
            all_tools.extend(r)
    
    logger.info("")
    logger.info(f"Total tools found: {len(all_tools)}")
    
    # Show sample
    logger.info("")
    logger.info("Sample tools:")
    for tool in all_tools[:5]:
        logger.info(f"  - {tool['name']} ({tool['source']})")

if __name__ == "__main__":
    asyncio.run(main())
