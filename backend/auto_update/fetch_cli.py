"""
Auto-Update - Fetch and Add to Convex via CLI
Run from frontend directory
"""

import asyncio
import logging
import httpx
import subprocess
import json
import os
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def run_convex_cli(tool: dict) -> bool:
    """Run convex CLI to add a tool."""
    args = json.dumps(tool)
    cmd = f'npx convex run "tools:addTool" {args}'
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=os.path.join(os.path.dirname(__file__), "..", "frontend"),
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and "success" in result.stdout.lower():
            return True
    except Exception:
        pass
    return False

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
            resp = await client.get("https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=20")
            if resp.status_code == 200:
                for space in resp.json():
                    tools.append({
                        "name": space.get("id", "")[:50],
                        "description": f"⭐ {space.get('likes', 0)} stars - AI Space on Hugging Face",
                        "category": "Assistants & Agents",
                        "url": f"https://huggingface.co/spaces/{space.get('id')}",
                        "color": "#FF9D00"
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
                params={"q": "ai OR ml created:>2024-06-01", "sort": "stars", "per_page": 20},
                headers={"Accept": "application/vnd.github.v3+json"}
            )
            if resp.status_code == 200:
                for repo in resp.json().get("items", []):
                    tools.append({
                        "name": repo.get("name", "")[:50],
                        "description": f"⭐ {repo.get('stargazers_count', 0)} stars - {repo.get('description', '')[:80]}",
                        "category": "Development",
                        "url": repo.get("html_url"),
                        "color": "#181717"
                    })
    except Exception as e:
        logger.error(f"GitHub error: {e}")
    logger.info(f"  Found {len(tools)} from GitHub")
    return tools

async def main():
    logger.info("=" * 60)
    logger.info("AI TOOLS AUTO-UPDATE - CLI MODE")
    logger.info("=" * 60)
    
    # Fetch tools
    results = await asyncio.gather(fetch_huggingface(), fetch_github(), return_exceptions=True)
    
    all_tools = []
    for r in results:
        if isinstance(r, list):
            all_tools.extend(r)
    
    logger.info(f"Total tools: {len(all_tools)}")
    logger.info("")
    logger.info("Adding tools to database...")
    
    added = 0
    for tool in all_tools[:30]:
        logger.info(f"  Adding: {tool['name']}...")
        if await run_convex_cli(tool):
            added += 1
            logger.info(f"    ✓ Added")
        else:
            logger.info(f"    ✗ Skipped")
    
    logger.info("")
    logger.info("=" * 60)
    logger.info(f"DONE! Added: {added}")
    logger.info("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
