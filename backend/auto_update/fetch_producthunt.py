"""
Product Hunt API Integration - Fetch AI Tools
"""

import asyncio
import logging
import httpx
import base64
from typing import List, Dict
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from producthunt_config import PRODUCT_HUNT_ACCESS_TOKEN

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def fetch_producthunt_ai_tools() -> List[Dict]:
    """Fetch AI products from Product Hunt using the API."""
    logger.info("Fetching from Product Hunt...")
    tools = []
    
    headers = {
        "Authorization": f"Bearer {PRODUCT_HUNT_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try different endpoints
            endpoints = [
                "https://api.producthunt.com/v2/posts/all?category=ai&limit=20",
                "https://api.producthunt.com/v2/collections/ai-tools/posts?limit=20",
                "https://api.producthunt.com/v2/posts?search=ai&limit=20",
            ]
            
            for url in endpoints:
                logger.info(f"  Trying: {url}")
                resp = await client.get(url, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    posts = data.get("posts", [])
                    if posts:
                        logger.info(f"  Found {len(posts)} posts!")
                        for post in posts[:10]:
                            tool = {
                                "name": post.get("name", ""),
                                "description": post.get("tagline", ""),
                                "category": "Productivity & Office",
                                "url": post.get("redirect_url", ""),
                                "color": "#FF6D00"
                            }
                            if tool["name"]:
                                tools.append(tool)
                                logger.info(f"    - {tool['name']}")
                        break
                else:
                    logger.warning(f"    Status: {resp.status_code}")
                    
    except Exception as e:
        logger.error(f"Product Hunt error: {e}")
    
    logger.info(f"  Total: {len(tools)} tools from Product Hunt")
    return tools

async def main():
    logger.info("=" * 50)
    logger.info("Product Hunt API Test")
    logger.info("=" * 50)
    
    tools = await fetch_producthunt_ai_tools()
    
    logger.info(f"\nFound {len(tools)} AI products")

if __name__ == "__main__":
    asyncio.run(main())
