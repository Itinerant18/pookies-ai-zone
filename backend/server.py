from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Tool(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    url: str
    icon_letter: str
    color: str
    featured: bool = False

class Category(BaseModel):
    name: str
    count: int

# Tools seed data
TOOLS_DATA = [
    # Editors & IDEs
    {"name": "Cursor", "description": "AI-first code editor built on VS Code with intelligent autocomplete and chat.", "category": "Editors & IDEs", "url": "https://cursor.sh", "color": "#7C3AED", "featured": True},
    {"name": "Windsurf", "description": "AI-powered IDE by Codeium for agentic coding workflows.", "category": "Editors & IDEs", "url": "https://codeium.com/windsurf", "color": "#06B6D4", "featured": True},
    {"name": "Void", "description": "Open-source AI code editor with privacy-first local models.", "category": "Editors & IDEs", "url": "https://voideditor.com", "color": "#18181B"},
    {"name": "Trae", "description": "AI-native IDE by ByteDance with integrated AI assistant.", "category": "Editors & IDEs", "url": "https://trae.ai", "color": "#3B82F6"},
    {"name": "Continue.dev", "description": "Open-source AI code assistant that connects any model to any IDE.", "category": "Editors & IDEs", "url": "https://continue.dev", "color": "#F59E0B"},
    {"name": "CodeGeeX", "description": "Multilingual AI code generation tool supporting 20+ languages.", "category": "Editors & IDEs", "url": "https://codegeex.cn", "color": "#10B981"},
    {"name": "Qoder", "description": "AI-enhanced coding environment with smart completions.", "category": "Editors & IDEs", "url": "https://qoder.ai", "color": "#8B5CF6"},
    {"name": "Kilo Code", "description": "AI coding assistant with autonomous multi-file editing capabilities.", "category": "Editors & IDEs", "url": "https://kilocode.ai", "color": "#EC4899"},
    {"name": "Atoms", "description": "Lightweight AI-powered code editor for quick prototyping.", "category": "Editors & IDEs", "url": "https://atoms.dev", "color": "#F97316"},
    {"name": "Base44", "description": "AI development platform for building apps with natural language.", "category": "Editors & IDEs", "url": "https://base44.com", "color": "#14B8A6"},
    {"name": "Antigravity", "description": "AI coding platform for accelerated software development.", "category": "Editors & IDEs", "url": "https://antigravity.dev", "color": "#6366F1", "featured": True},

    # Web & App Builders
    {"name": "Bolt.new", "description": "Full-stack web app builder powered by AI in the browser.", "category": "Web & App Builders", "url": "https://bolt.new", "color": "#EF4444", "featured": True},
    {"name": "Replit", "description": "Cloud IDE with AI-powered app building and instant deployment.", "category": "Web & App Builders", "url": "https://replit.com", "color": "#F97316", "featured": True},
    {"name": "Lovable", "description": "AI full-stack engineer that builds production-ready web apps.", "category": "Web & App Builders", "url": "https://lovable.dev", "color": "#EC4899", "featured": True},
    {"name": "Bolt.diy", "description": "Open-source version of Bolt for self-hosted AI app building.", "category": "Web & App Builders", "url": "https://github.com/stackblitz-labs/bolt.diy", "color": "#F87171"},
    {"name": "Blink.new", "description": "AI-powered rapid web application generator.", "category": "Web & App Builders", "url": "https://blink.new", "color": "#A78BFA"},
    {"name": "FlutterFlow", "description": "Visual builder for Flutter apps with AI-assisted development.", "category": "Web & App Builders", "url": "https://flutterflow.io", "color": "#2563EB"},
    {"name": "A0", "description": "AI app builder for creating production apps from prompts.", "category": "Web & App Builders", "url": "https://a0.dev", "color": "#18181B"},
    {"name": "Firebase Studio", "description": "Google's AI-powered full-stack development environment.", "category": "Web & App Builders", "url": "https://firebase.google.com/studio", "color": "#F59E0B"},
    {"name": "AppGen", "description": "Generate full applications from natural language descriptions.", "category": "Web & App Builders", "url": "https://appgen.dev", "color": "#10B981"},
    {"name": "Dyad", "description": "AI-powered local-first app builder with full code ownership.", "category": "Web & App Builders", "url": "https://dyad.sh", "color": "#8B5CF6"},

    # Assistants & Agents
    {"name": "GitHub Copilot", "description": "AI pair programmer by GitHub that suggests code in real-time.", "category": "Assistants & Agents", "url": "https://github.com/features/copilot", "color": "#6366F1", "featured": True},
    {"name": "Chef by Convex", "description": "AI coding agent that builds full-stack apps on Convex backend.", "category": "Assistants & Agents", "url": "https://chef.convex.dev", "color": "#EF4444"},
    {"name": "Manus", "description": "General-purpose AI agent for complex multi-step tasks.", "category": "Assistants & Agents", "url": "https://manus.im", "color": "#3B82F6"},
    {"name": "MindStudio", "description": "Platform for building and deploying custom AI agents.", "category": "Assistants & Agents", "url": "https://mindstudio.ai", "color": "#7C3AED"},
    {"name": "Google Stitch", "description": "Google's AI prototyping tool for rapid app design.", "category": "Assistants & Agents", "url": "https://stitch.withgoogle.com", "color": "#10B981"},
    {"name": "Memex", "description": "AI-powered knowledge management and research assistant.", "category": "Assistants & Agents", "url": "https://memex.co", "color": "#F59E0B"},
    {"name": "Mocha", "description": "AI coding assistant for test generation and debugging.", "category": "Assistants & Agents", "url": "https://mocha.ai", "color": "#92400E"},
    {"name": "Kiro", "description": "AI development agent by Amazon for spec-driven coding.", "category": "Assistants & Agents", "url": "https://kiro.dev", "color": "#06B6D4", "featured": True},
    {"name": "Pythagora", "description": "AI agent that builds full-stack apps from requirements.", "category": "Assistants & Agents", "url": "https://pythagora.ai", "color": "#8B5CF6"},
    {"name": "Workik", "description": "AI coding workspace with context-aware code generation.", "category": "Assistants & Agents", "url": "https://workik.com", "color": "#EC4899"},

    # Design & UI
    {"name": "v0", "description": "AI UI generator by Vercel that creates React components from prompts.", "category": "Design & UI", "url": "https://v0.dev", "color": "#18181B", "featured": True},
    {"name": "Figma Make", "description": "AI-powered design tool built into Figma for rapid prototyping.", "category": "Design & UI", "url": "https://figma.com/make", "color": "#A259FF"},
    {"name": "Tile.dev", "description": "Visual component builder for React with AI assistance.", "category": "Design & UI", "url": "https://tile.dev", "color": "#3B82F6"},
    {"name": "Emergent", "description": "AI-powered platform for building full-stack mobile and web apps.", "category": "Design & UI", "url": "https://emergentagent.com", "color": "#2563EB", "featured": True},
    {"name": "Codia AI", "description": "AI design-to-code tool that converts Figma to production code.", "category": "Design & UI", "url": "https://codia.ai", "color": "#F97316"},
    {"name": "Code Parrot", "description": "Figma-to-code AI that generates pixel-perfect frontend code.", "category": "Design & UI", "url": "https://codeparrot.ai", "color": "#22C55E"},
    {"name": "Anima", "description": "Design-to-code platform with AI-powered code generation.", "category": "Design & UI", "url": "https://animaapp.com", "color": "#EF4444"},
    {"name": "Kromio", "description": "AI tool for generating color palettes and design systems.", "category": "Design & UI", "url": "https://kromio.ai", "color": "#7C3AED"},
    {"name": "Rork", "description": "AI-powered mobile app builder for React Native apps.", "category": "Design & UI", "url": "https://rork.app", "color": "#06B6D4"},
]

@app.on_event("startup")
async def seed_database():
    count = await db.tools.count_documents({})
    if count == 0:
        tools_to_insert = []
        for t in TOOLS_DATA:
            tool = {
                "id": str(uuid.uuid4()),
                "name": t["name"],
                "description": t["description"],
                "category": t["category"],
                "url": t["url"],
                "icon_letter": t["name"][0].upper(),
                "color": t["color"],
                "featured": t.get("featured", False),
            }
            tools_to_insert.append(tool)
        await db.tools.insert_many(tools_to_insert)
        logging.info(f"Seeded {len(tools_to_insert)} tools")

@api_router.get("/")
async def root():
    return {"message": "AI Tool Directory API"}

@api_router.get("/tools")
async def get_tools(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured

    tools = await db.tools.find(query, {"_id": 0}).to_list(100)
    return tools

@api_router.get("/tools/{tool_id}")
async def get_tool(tool_id: str):
    tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    if not tool:
        return {"error": "Tool not found"}
    return tool

@api_router.get("/categories")
async def get_categories():
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    results = await db.tools.aggregate(pipeline).to_list(20)
    return [{"name": r["_id"], "count": r["count"]} for r in results]

@api_router.post("/seed")
async def reseed():
    await db.tools.delete_many({})
    tools_to_insert = []
    for t in TOOLS_DATA:
        tool = {
            "id": str(uuid.uuid4()),
            "name": t["name"],
            "description": t["description"],
            "category": t["category"],
            "url": t["url"],
            "icon_letter": t["name"][0].upper(),
            "color": t["color"],
            "featured": t.get("featured", False),
        }
        tools_to_insert.append(tool)
    await db.tools.insert_many(tools_to_insert)
    return {"message": f"Seeded {len(tools_to_insert)} tools"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
