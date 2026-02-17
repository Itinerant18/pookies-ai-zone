"""
Auto-Update System - Real Sources Connector
Fetches AI tools from multiple sources and adds them to Convex
"""

import asyncio
import logging
import httpx
import os
from datetime import datetime
from typing import List, Dict, Any
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CONVEX_URL = "https://descriptive-swan-405.eu-west-1.convex.cloud"

CATEGORY_MAP = {
    "text": "Writing & Content",
    "image": "Image Generation",
    "video": "Video Generation",
    "audio": "Music & Audio",
    "code": "Development",
    "chatbot": "Chatbots & Conversational AI",
    "productivity": "Productivity & Office",
    "marketing": "Marketing & Sales",
    "analytics": "Data & Analytics",
    "automation": "Automation & Workflow",
    "api": "API & Testing",
    "3d": "3D & Creative",
    "design": "Creative & Design",
    "education": "Learning & Education",
    "health": "Health & Wellness",
    "finance": "Finance",
    "legal": "Legal",
    "hr": "HR & Recruitment",
    "ecommerce": "E-commerce",
    "security": "Security & Privacy",
    "assistant": "Assistants & Agents",
    "llm": "LLMs & Chatbots",
}

def map_category(raw_category: str) -> str:
    """Map source category to our categories."""
    raw = raw_category.lower().strip()
    for key, category in CATEGORY_MAP.items():
        if key in raw:
            return category
    return "Other"

async def call_convex(function_name: str, args: dict) -> dict:
    """Call a Convex function via HTTP API."""
    url = f"{CONVEX_URL}/api/{function_name}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=args)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.warning(f"Convex returned {resp.status_code}")
                return None
    except Exception as e:
        logger.error(f"Convex call failed: {e}")
        return None

async def add_tool_to_convex(tool: dict) -> bool:
    """Add a tool to Convex database."""
    result = await call_convex("tools/addTool", tool)
    return result and result.get("success", False)

class BaseSource:
    """Base class for tool sources."""
    
    def __init__(self, name: str):
        self.name = name
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        """Fetch tools from this source. Override in subclasses."""
        return []
    
    def normalize_tool(self, tool: Dict) -> Dict:
        """Normalize tool to our format. Override in subclasses."""
        return tool


class HuggingFaceSource(BaseSource):
    """Hugging Face Spaces - AI models and apps."""
    
    def __init__(self):
        super().__init__("Hugging Face")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Hugging Face...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get trending spaces
                resp = await client.get(
                    "https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=50",
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                if resp.status_code == 200:
                    spaces = resp.json()
                    for space in spaces:
                        try:
                            tool = {
                                "name": space.get("title", space.get("id", "")),
                                "description": space.get("emoji", "") + " " + ", ".join(space.get("tags", [])),
                                "category": map_category(space.get("sdk", "other")),
                                "url": f"https://huggingface.co/spaces/{space.get('id')}",
                                "color": "#FF9D00",
                                "source": "huggingface",
                            }
                            if tool["name"]:
                                tools.append(tool)
                        except Exception as e:
                            logger.warning(f"  HF item skip: {e}")
                            continue
        except Exception as e:
            logger.error(f"Hugging Face error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from Hugging Face")
        return tools


class GitHubTrendingSource(BaseSource):
    """GitHub Trending AI/ML repositories."""
    
    def __init__(self):
        super().__init__("GitHub Trending")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from GitHub Trending...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Search for AI/ML repos
                resp = await client.get(
                    "https://api.github.com/search/repositories",
                    params={
                        "q": "ai OR ml OR machine-learning created:>2024-01-01",
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 50
                    },
                    headers={"Accept": "application/vnd.github.v3+json"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for repo in data.get("items", []):
                        tool = {
                            "name": repo.get("name"),
                            "description": repo.get("description", "")[:200],
                            "category": "Development",
                            "url": repo.get("html_url"),
                            "color": "#181717",
                            "source": "github",
                        }
                        if tool["name"]:
                            tools.append(tool)
        except Exception as e:
            logger.error(f"GitHub error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from GitHub")
        return tools


class ProductHuntSource(BaseSource):
    """Product Hunt AI products."""
    
    def __init__(self):
        super().__init__("Product Hunt")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Product Hunt...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Product Hunt has a public API
                resp = await client.get(
                    "https://api.producthunt.com/v2/categories/ai/posts",
                    params={"limit": 50}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for post in data.get("posts", []):
                        tool = {
                            "name": post.get("name"),
                            "description": post.get("tagline", ""),
                            "category": "Productivity & Office",
                            "url": post.get("redirect_url", ""),
                            "color": "#FF6D00",
                            "source": "producthunt",
                        }
                        if tool["name"]:
                            tools.append(tool)
        except Exception as e:
            logger.error(f"Product Hunt error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from Product Hunt")
        return tools


class FuturepediaSource(BaseSource):
    """Futurepedia AI tools directory."""
    
    def __init__(self):
        super().__init__("Futurepedia")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Futurepedia...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get("https://www.futurepedia.io/api/tools?page=1")
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("tools", [])[:50]:
                        tool = {
                            "name": item.get("name"),
                            "description": item.get("description", ""),
                            "category": map_category(item.get("category", "")),
                            "url": item.get("websiteUrl", ""),
                            "color": "#6366F1",
                            "source": "futurepedia",
                        }
                        if tool["name"] and tool["url"]:
                            tools.append(tool)
        except Exception as e:
            logger.error(f"Futurepedia error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from Futurepedia")
        return tools


class ThereIsAnAIForThatSource(BaseSource):
    """There's an AI for That directory."""
    
    def __init__(self):
        super().__init__("There's an AI for That")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from There's an AI for That...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get("https://thereisan.ai/api/v1/tools?limit=50")
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("data", []):
                        tool = {
                            "name": item.get("name"),
                            "description": item.get("description", ""),
                            "category": map_category(item.get("category", "")),
                            "url": item.get("url", ""),
                            "color": "#10B981",
                            "source": "thereisanai",
                        }
                        if tool["name"] and tool["url"]:
                            tools.append(tool)
        except Exception as e:
            logger.error(f"There's an AI error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from There's an AI for That")
        return tools


class TwitterSource(BaseSource):
    """Twitter/X trending AI tools (via search)."""
    
    def __init__(self):
        super().__init__("Twitter/X")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Twitter (note: requires API key for real-time)...")
        logger.info("  Skipping - would need Twitter API key")
        return []


class RedditSource(BaseSource):
    """Reddit AI tools subreddits."""
    
    def __init__(self):
        super().__init__("Reddit")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Reddit...")
        tools = []
        
        # Common AI tool subreddits
        subreddits = ["ArtificialIntelligence", "MachineLearning", "GPT", "LocalLLaMA"]
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                for sub in subreddits[:1]:  # Limit to avoid rate limits
                    resp = await client.get(
                        f"https://www.reddit.com/r/{sub}/hot.json",
                        params={"limit": 25},
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        for post in data.get("data", {}).get("children", []):
                            title = post.get("data", {}).get("title", "")
                            if any(keyword in title.lower() for keyword in ["tool", "app", "new", "release"]):
                                tool = {
                                    "name": title[:50],
                                    "description": title,
                                    "category": "Assistants & Agents",
                                    "url": f"https://reddit.com{post.get('data', {}).get('permalink', '')}",
                                    "color": "#FF4500",
                                    "source": "reddit",
                                }
                                tools.append(tool)
                    else:
                         logger.warning(f"Reddit error: {resp.status_code} - {resp.text[:100]}")
        except Exception as e:
            logger.error(f"Reddit error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from Reddit")
        return tools


class HackerNewsSource(BaseSource):
    """Hacker News AI tools."""
    
    def __init__(self):
        super().__init__("Hacker News")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from Hacker News...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get top AI stories
                resp = await client.get(
                    "https://hacker-news.firebaseio.com/v0/topstories.json"
                )
                if resp.status_code == 200:
                    story_ids = resp.json()[:30]
                    for story_id in story_ids[:10]:
                        story_resp = await client.get(
                            f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                        )
                        if story_resp.status_code == 200:
                            story = story_resp.json()
                            if story and "ai" in story.get("title", "").lower():
                                tool = {
                                    "name": story.get("title", "")[:50],
                                    "description": story.get("title", ""),
                                    "category": "Development",
                                    "url": story.get("url", f"https://news.ycombinator.com/item?id={story_id}"),
                                    "color": "#FF6600",
                                    "source": "hackernews",
                                }
                                tools.append(tool)
        except Exception as e:
            logger.error(f"Hacker News error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from Hacker News")
        return tools


class GptStoreSource(BaseSource):
    """OpenAI GPT Store."""
    
    def __init__(self):
        super().__init__("GPT Store")
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        logger.info("Fetching from GPT Store...")
        tools = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # GPT Store doesn't have public API, but we can check ChatGPT site
                resp = await client.get("https://chat.openai.com/gpts")
                # Would need authentication for real data
                logger.info("  Note: GPT Store requires authentication for real data")
        except Exception as e:
            logger.error(f"GPT Store error: {e}")
        
        logger.info(f"  Found {len(tools)} tools from GPT Store")
        return tools


async def fetch_all_sources() -> List[Dict[str, Any]]:
    """Fetch tools from all sources."""
    
    sources = [
        HuggingFaceSource(),
        GitHubTrendingSource(),
        ProductHuntSource(),
        FuturepediaSource(),
        ThereIsAnAIForThatSource(),
        RedditSource(),
        HackerNewsSource(),
    ]
    
    all_tools = []
    
    for source in sources:
        try:
            tools = await source.fetch_tools()
            all_tools.extend(tools)
        except Exception as e:
            logger.error(f"Error fetching from {source.name}: {e}")
    
    return all_tools

async def main():
    """Main function to check and update tools."""
    logger.info("=" * 60)
    logger.info("AI TOOLS AUTO-UPDATE SYSTEM")
    logger.info("=" * 60)
    logger.info(f"Started: {datetime.now().isoformat()}")
    logger.info("")
    
    # Get current stats
    stats = await call_convex("tools/getToolStats", {})
    if stats:
        logger.info(f"Current tools in database: {stats.get('total', 'N/A')}")
    else:
        logger.warning("Could not connect to Convex database")
        return
    
    logger.info("")
    logger.info("Fetching tools from all sources...")
    logger.info("-" * 40)
    
    tools = await fetch_all_sources()
    
    logger.info("")
    logger.info(f"Total tools found: {len(tools)}")
    
    # Add tools to Convex
    logger.info("")
    logger.info("Adding tools to database...")
    logger.info("-" * 40)
    
    added = 0
    skipped = 0
    
    for tool in tools[:20]:  # Limit to 20 for demo
        result = await add_tool_to_convex(tool)
        if result:
            added += 1
            logger.info(f"  Added: {tool['name']}")
        else:
            skipped += 1
    
    logger.info("")
    logger.info("=" * 60)
    logger.info(f"SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Tools found: {len(tools)}")
    logger.info(f"Added: {added}")
    logger.info(f"Skipped (already exists): {skipped}")
    logger.info(f"Completed: {datetime.now().isoformat()}")

if __name__ == "__main__":
    asyncio.run(main())
