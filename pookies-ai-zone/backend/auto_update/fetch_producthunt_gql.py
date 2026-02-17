"""
Product Hunt API Integration - Fetch AI Tools using GraphQL (V2 API)
"""

import asyncio
import logging
import httpx
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from producthunt_config import PRODUCT_HUNT_ACCESS_TOKEN

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def fetch_producthunt_ai_tools() -> list:
    """Fetch AI products from Product Hunt using GraphQL."""
    logger.info("Fetching from Product Hunt (GraphQL)...")
    tools = []
    
    url = "https://api.producthunt.com/v2/api/graphql"
    headers = {
        "Authorization": f"Bearer {PRODUCT_HUNT_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # GraphQL query to get trending posts in AI
    query = """
    {
      posts(topic: "ai", first: 20) {
        edges {
          node {
            name
            tagline
            url
            votesCount
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
    """
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json={"query": query})
            
            if resp.status_code == 200:
                data = resp.json()
                if "errors" in data:
                    logger.warning(f"GraphQL Errors: {data['errors']}")
                    # If topic filter fails, try a simpler query
                    query_simple = """
                    {
                      posts(first: 20) {
                        edges {
                          node {
                            name
                            tagline
                            url
                            votesCount
                          }
                        }
                      }
                    }
                    """
                    resp = await client.post(url, headers=headers, json={"query": query_simple})
                    data = resp.json()

                posts = data.get("data", {}).get("posts", {}).get("edges", [])
                for edge in posts:
                    node = edge.get("node", {})
                    tool = {
                        "name": node.get("name", ""),
                        "description": node.get("tagline", ""),
                        "category": "Productivity & Office", # Default
                        "url": node.get("url", ""),
                        "color": "#FF6D00",
                        "source": "producthunt"
                    }
                    if tool["name"]:
                        tools.append(tool)
                        logger.info(f"  Found: {tool['name']}")
            else:
                logger.warning(f"  Product Hunt API returned {resp.status_code}: {resp.text[:200]}")
                    
    except Exception as e:
        logger.error(f"Product Hunt error: {e}")
    
    logger.info(f"  Total: {len(tools)} tools from Product Hunt")
    return tools

if __name__ == "__main__":
    tools = asyncio.run(fetch_producthunt_ai_tools())
    print(f"\nDone. Found {len(tools)} tools.")
