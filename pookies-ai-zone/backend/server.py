from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import Optional
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

CONVEX_URL = os.environ.get('EXPO_PUBLIC_CONVEX_URL', 'https://festive-fish-491.eu-west-1.convex.cloud')

app = FastAPI()
api_router = APIRouter(prefix="/api")

import httpx

async def call_convex(function_path: str, args: dict = None):
    """Call Convex function via HTTP API."""
    url = f"{CONVEX_URL}/api/{function_path}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=args or {})
            if resp.status_code == 200:
                return resp.json()
            else:
                logging.warning(f"Convex {function_path} returned {resp.status_code}")
    except Exception as e:
        logging.warning(f"Convex call failed: {e}")
    return None


@app.on_event("startup")
async def startup():
    logging.info(f"Connecting to Convex: {CONVEX_URL}")


@api_router.get("/")
async def root():
    return {"message": "AI Tool Directory API", "backend": "convex"}


@api_router.get("/tools")
async def get_tools(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    sort_by: Optional[str] = Query(None),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
):
    args = {}
    if search:
        args["search"] = search
    if category:
        args["category"] = category
    if featured is not None:
        args["featured"] = featured
    
    tools = await call_convex("tools/get", args)
    
    if not tools:
        return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "pages": 0}, "error": "Convex not connected"}
    
    if not isinstance(tools, list):
        tools = []
    
    if sort_by == "name" and tools:
        tools = sorted(tools, key=lambda t: (t.get("name") or ""), reverse=(sort_order == "desc"))
    
    total = len(tools)
    skip = (page - 1) * limit
    paginated = tools[skip:skip + limit]

    return {
        "data": paginated,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit if limit > 0 else 0
        }
    }


@api_router.get("/tools/{tool_id}")
async def get_tool(tool_id: str):
    tool = await call_convex("tools/getById", {"id": tool_id})
    if not tool:
        return {"error": "Tool not found"}
    return tool


@api_router.get("/categories")
async def get_categories():
    categories = await call_convex("tools/getCategories", {})
    if not categories:
        return []
    return categories


@api_router.get("/filters")
async def get_filters():
    categories = await call_convex("tools/getCategories", {}) or []
    all_tools = await call_convex("tools/get", {}) or []
    featured_count = sum(1 for t in all_tools if t.get("featured", False))
    return {
        "categories": categories,
        "featured": {"true": featured_count, "false": len(all_tools) - featured_count},
        "sort_options": ["name", "featured"]
    }


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
