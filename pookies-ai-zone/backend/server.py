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
    {"name": "Kaedim", "description": "AI 3D model generation platform.", "category": "3D & Creative", "url": "https://kaedim3d.com", "color": "#10B981", "featured": False},
    {"name": "Meshy", "description": "AI 3D model generator from text or images.", "category": "3D & Creative", "url": "https://meshy.ai", "color": "#FF6B6B", "featured": False},
    {"name": "Spline", "description": "AI-powered 3D design tool.", "category": "3D & Creative", "url": "https://spline.design", "color": "#6366F1", "featured": False},
    {"name": "Autify", "description": "No-code test automation with AI adaptation.", "category": "API & Testing", "url": "https://autify.com", "color": "#EC4899", "featured": False},
    {"name": "Bruno", "description": "Local-first, Git-friendly API client.", "category": "API & Testing", "url": "https://bruno.so", "color": "#000000", "featured": False},
    {"name": "Functionize", "description": "AI-driven test automation platform.", "category": "API & Testing", "url": "https://functionize.com", "color": "#6366F1", "featured": False},
    {"name": "Hoppscotch", "description": "Open-source API testing platform.", "category": "API & Testing", "url": "https://hoppscotch.io", "color": "#10B981", "featured": False},
    {"name": "JMeter", "description": "Load and performance testing tool.", "category": "API & Testing", "url": "https://jmeter.apache.org", "color": "#D24939", "featured": False},
    {"name": "Postman", "description": "API development and testing platform.", "category": "API & Testing", "url": "https://postman.com", "color": "#FF6C37", "featured": True},
    {"name": "QA Wolf", "description": "End-to-end automated testing platform.", "category": "API & Testing", "url": "https://qawolf.com", "color": "#22C55E", "featured": False},
    {"name": "SoapUI", "description": "API testing framework for REST and SOAP.", "category": "API & Testing", "url": "https://soapui.org", "color": "#F4D03F", "featured": False},
    {"name": "Amplitude", "description": "Product analytics with AI insights.", "category": "Analytics", "url": "https://amplitude.com", "color": "#00A4EF", "featured": False},
    {"name": "Google Analytics", "description": "Web analytics with AI insights.", "category": "Analytics", "url": "https://analytics.google.com", "color": "#E37400", "featured": True},
    {"name": "Mixpanel", "description": "Product analytics with AI features.", "category": "Analytics", "url": "https://mixpanel.com", "color": "#8B5CF6", "featured": False},
    {"name": "AskCodi", "description": "AI code completion and chat assistant.", "category": "Assistants & Agents", "url": "https://askcodi.com", "color": "#00A4EF", "featured": False},
    {"name": "Chef by Convex", "description": "AI coding agent that builds full-stack apps on Convex backend.", "category": "Assistants & Agents", "url": "https://chef.convex.dev", "color": "#EF4444", "featured": False},
    {"name": "CodeRabbit", "description": "AI code review tool with automated PR summaries.", "category": "Assistants & Agents", "url": "https://coderabbit.ai", "color": "#E11D48", "featured": False},
    {"name": "Devin", "description": "AI coding agent that autonomously builds and deploys software.", "category": "Assistants & Agents", "url": "https://cognition.ai", "color": "#F97316", "featured": True},
    {"name": "GitHub Copilot", "description": "AI pair programmer by GitHub that suggests code in real-time.", "category": "Assistants & Agents", "url": "https://github.com/features/copilot", "color": "#6366F1", "featured": True},
    {"name": "Google Duet AI", "description": "Google's AI assistant for workspace and coding.", "category": "Assistants & Agents", "url": "https://workspace.google.com/products/duet-ai", "color": "#4285F4", "featured": False},
    {"name": "Google Stitch", "description": "Google's AI prototyping tool for rapid app design.", "category": "Assistants & Agents", "url": "https://stitch.withgoogle.com", "color": "#10B981", "featured": False},
    {"name": "Greptile", "description": "AI code review with architectural awareness.", "category": "Assistants & Agents", "url": "https://greptile.com", "color": "#F59E0B", "featured": False},
    {"name": "Jules", "description": "Google's AI coding agent for software development.", "category": "Assistants & Agents", "url": "https://jules.google", "color": "#7C3AED", "featured": False},
    {"name": "Kiro", "description": "AI development agent by Amazon for spec-driven coding.", "category": "Assistants & Agents", "url": "https://kiro.dev", "color": "#06B6D4", "featured": True},
    {"name": "Manus", "description": "General-purpose AI agent for complex multi-step tasks.", "category": "Assistants & Agents", "url": "https://manus.im", "color": "#3B82F6", "featured": False},
    {"name": "Memex", "description": "AI-powered knowledge management and research assistant.", "category": "Assistants & Agents", "url": "https://memex.co", "color": "#F59E0B", "featured": False},
    {"name": "MindStudio", "description": "Platform for building and deploying custom AI agents.", "category": "Assistants & Agents", "url": "https://mindstudio.ai", "color": "#7C3AED", "featured": False},
    {"name": "Mocha", "description": "AI coding assistant for test generation and debugging.", "category": "Assistants & Agents", "url": "https://mocha.ai", "color": "#92400E", "featured": False},
    {"name": "Panto AI", "description": "AI code review agent with business context integration.", "category": "Assistants & Agents", "url": "https://getpanto.ai", "color": "#EF4444", "featured": False},
    {"name": "Pythagora", "description": "AI agent that builds full-stack apps from requirements.", "category": "Assistants & Agents", "url": "https://pythagora.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Sourcery AI", "description": "AI code review and refactoring suggestions.", "category": "Assistants & Agents", "url": "https://sourcery.ai", "color": "#3B82F6", "featured": False},
    {"name": "Workik", "description": "AI coding workspace with context-aware code generation.", "category": "Assistants & Agents", "url": "https://workik.com", "color": "#EC4899", "featured": False},
    {"name": "Activepieces", "description": "AI-powered automation with intelligent agents.", "category": "Automation & Productivity", "url": "https://activepieces.com", "color": "#635BFF", "featured": False},
    {"name": "Clockwise", "description": "AI calendar optimization for focused work.", "category": "Automation & Productivity", "url": "https://getclockwise.com", "color": "#3B82F6", "featured": False},
    {"name": "Fellow", "description": "AI meeting assistant for agendas and notes.", "category": "Automation & Productivity", "url": "https://fellow.app", "color": "#7C3AED", "featured": False},
    {"name": "Make", "description": "Visual workflow automation with complex branching.", "category": "Automation & Productivity", "url": "https://make.com", "color": "#7B68EE", "featured": True},
    {"name": "Pabbly Connect", "description": "Cost-effective automation with lifetime deals.", "category": "Automation & Productivity", "url": "https://pabbly.com/connect", "color": "#00A4EF", "featured": False},
    {"name": "Power Automate", "description": "Microsoft's workflow automation for enterprise.", "category": "Automation & Productivity", "url": "https://flow.microsoft.com", "color": "#0066FF", "featured": False},
    {"name": "Shortwave", "description": "AI email assistant with agentic capabilities.", "category": "Automation & Productivity", "url": "https://shortwave.com", "color": "#FF6B6B", "featured": False},
    {"name": "n8n", "description": "Open-source workflow automation with self-hosting.", "category": "Automation & Productivity", "url": "https://n8n.io", "color": "#FF6D5A", "featured": True},
    {"name": "Automation Anywhere", "description": "AI workflow builder for business processes.", "category": "Automation & Workflow", "url": "https://automationanywhere.com", "color": "#10B981", "featured": True},
    {"name": "Axiom", "description": "AI-powered browser automation.", "category": "Automation & Workflow", "url": "https://axiom.ai", "color": "#EF4444", "featured": False},
    {"name": "Inflection", "description": "AI-powered personal task assistant.", "category": "Automation & Workflow", "url": "https://inflection.ai", "color": "#EC4899", "featured": False},
    {"name": "Lasso", "description": "AI agent platform for business automation.", "category": "Automation & Workflow", "url": "https://lasso.ai", "color": "#3B82F6", "featured": False},
    {"name": "Make.com", "description": "AI-powered workflow automation platform.", "category": "Automation & Workflow", "url": "https://make.com", "color": "#6366F1", "featured": True},
    {"name": "Salesforce Einstein", "description": "AI CRM with workflow automation.", "category": "Automation & Workflow", "url": "https://salesforce.com", "color": "#8B5CF6", "featured": False},
    {"name": "Zapier", "description": "AI automation and integration platform.", "category": "Automation & Workflow", "url": "https://zapier.com", "color": "#F97316", "featured": True},
    {"name": "Arc", "description": "AI browser with tab management and Arc Max.", "category": "Browsers", "url": "https://arc.net", "color": "#FC5C65", "featured": True},
    {"name": "Brave", "description": "Privacy-focused browser with AI assistant Leo.", "category": "Browsers", "url": "https://brave.com", "color": "#FB542B", "featured": True},
    {"name": "Dia Browser", "description": "AI browser with contextual assistant.", "category": "Browsers", "url": "https://dia.browser", "color": "#FF6B35", "featured": False},
    {"name": "Perplexity Comet", "description": "AI browser with research and agentic workflow.", "category": "Browsers", "url": "https://perplexity.ai/comet", "color": "#2088FF", "featured": False},
    {"name": "Sigma AI Browser", "description": "AI browser with end-to-end encryption.", "category": "Browsers", "url": "https://sigmaos.com", "color": "#6366F1", "featured": False},
    {"name": "Freshdesk", "description": "AI helpdesk with Freddy AI.", "category": "CRM & Customer Support", "url": "https://freshdesk.com", "color": "#FF6A00", "featured": False},
    {"name": "HubSpot", "description": "AI-powered CRM for marketing and sales.", "category": "CRM & Customer Support", "url": "https://hubspot.com", "color": "#FF7A59", "featured": True},
    {"name": "Intercom", "description": "AI chatbot and customer messaging platform.", "category": "CRM & Customer Support", "url": "https://intercom.com", "color": "#1F8DED", "featured": False},
    {"name": "Plain", "description": "AI-native customer support platform.", "category": "CRM & Customer Support", "url": "https://plain.com", "color": "#1F8DED", "featured": False},
    {"name": "Salesforce", "description": "Enterprise CRM with Einstein AI.", "category": "CRM & Customer Support", "url": "https://salesforce.com", "color": "#00A1E0", "featured": True},
    {"name": "Zendesk", "description": "AI-powered customer service platform.", "category": "CRM & Customer Support", "url": "https://zendesk.com", "color": "#03363D", "featured": True},
    {"name": "Zoho CRM", "description": "AI-powered CRM with Zia assistant.", "category": "CRM & Customer Support", "url": "https://zoho.com/crm", "color": "#E42527", "featured": False},
    {"name": "Character.AI", "description": "AI character chat platform for immersive roleplay conversations.", "category": "Chatbots & Conversational AI", "url": "https://character.ai", "color": "#EC4899", "featured": False},
    {"name": "ChatGPT", "description": "OpenAI's versatile AI assistant for conversation, coding, and creativity.", "category": "Chatbots & Conversational AI", "url": "https://chat.openai.com", "color": "#10A37F", "featured": True},
    {"name": "Copilot", "description": "Microsoft's AI assistant integrated across Microsoft 365.", "category": "Chatbots & Conversational AI", "url": "https://copilot.microsoft.com", "color": "#6366F1", "featured": True},
    {"name": "Poe", "description": "AI assistant for creating personalized conversational experiences.", "category": "Chatbots & Conversational AI", "url": "https://poe.com", "color": "#FF4500", "featured": False},
    {"name": "Replika", "description": "AI companion focused on emotional intelligence and conversation.", "category": "Chatbots & Conversational AI", "url": "https://replika.ai", "color": "#8B5CF6", "featured": False},
    {"name": "You.com", "description": "AI search engine with privacy focus and custom AI models.", "category": "Chatbots & Conversational AI", "url": "https://you.com", "color": "#FF6B35", "featured": False},
    {"name": "Adobe Firefly", "description": "AI-powered photo editing and image enhancement.", "category": "Creative & Design", "url": "https://adobe.com/firefly", "color": "#6366F1", "featured": False},
    {"name": "Artafact", "description": "AI headshot and portrait enhancement.", "category": "Creative & Design", "url": "https://artafact.com", "color": "#F97316", "featured": False},
    {"name": "Canva AI", "description": "AI design tool for logos, presentations, and graphics.", "category": "Creative & Design", "url": "https://canva.com", "color": "#F59E0B", "featured": False},
    {"name": "DALL-E 3", "description": "OpenAI's text-to-image generation model.", "category": "Creative & Design", "url": "https://openai.com/dall-e-3", "color": "#3B82F6", "featured": True},
    {"name": "Descript", "description": "AI video editing with auto-re framing and captioning.", "category": "Creative & Design", "url": "https://descript.com", "color": "#EC4899", "featured": False},
    {"name": "Illustrate AI", "description": "AI vector graphics generation.", "category": "Creative & Design", "url": "https://illustrate.ai", "color": "#14B8A6", "featured": False},
    {"name": "Luma AI", "description": "AI-powered 3D object creation from text.", "category": "Creative & Design", "url": "https://luma.ai", "color": "#3B82F6", "featured": False},
    {"name": "Midjourney", "description": "AI image generation tool for photorealistic images.", "category": "Creative & Design", "url": "https://midjourney.com", "color": "#EC4899", "featured": True},
    {"name": "PhotoRoom", "description": "AI image editing with intelligent masking and generation.", "category": "Creative & Design", "url": "https://photoroom.com", "color": "#22C55E", "featured": False},
    {"name": "Photon", "description": "AI-powered product photography.", "category": "Creative & Design", "url": "https://photon.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Runway", "description": "AI-powered video creation and editing platform.", "category": "Creative & Design", "url": "https://runway.ml", "color": "#8B5CF6", "featured": True},
    {"name": "Sora", "description": "AI video generation from text prompts.", "category": "Creative & Design", "url": "https://openai.com/sora", "color": "#06B6D4", "featured": True},
    {"name": "Stable Diffusion", "description": "Open-source image generation model.", "category": "Creative & Design", "url": "https://stability.ai/stable-diffusion", "color": "#F97316", "featured": True},
    {"name": "Suno", "description": "AI music and audio generation platform.", "category": "Creative & Design", "url": "https://suno.ai", "color": "#10B981", "featured": True},
    {"name": "Udio", "description": "AI-powered audio generation and music creation.", "category": "Creative & Design", "url": "https://udio.com", "color": "#EF4444", "featured": False},
    {"name": "Alation", "description": "AI-powered data catalog and discovery.", "category": "Data & Analytics", "url": "https://alation.com", "color": "#F97316", "featured": False},
    {"name": "Anaplan", "description": "AI-driven business forecasting and planning.", "category": "Data & Analytics", "url": "https://anaplan.com", "color": "#06B6D4", "featured": False},
    {"name": "Ask AI", "description": "AI SQL query generator for non-technical users.", "category": "Data & Analytics", "url": "https://askql.com", "color": "#8B5CF6", "featured": False},
    {"name": "DataRobot", "description": "AI-powered predictive analytics platform.", "category": "Data & Analytics", "url": "https://datarobot.com", "color": "#3B82F6", "featured": False},
    {"name": "Looker", "description": "AI-powered data visualization and dashboards.", "category": "Data & Analytics", "url": "https://looker.com", "color": "#10B981", "featured": True},
    {"name": "ThoughtSpot", "description": "AI-powered business intelligence and analytics.", "category": "Data & Analytics", "url": "https://thoughtspot.com", "color": "#6366F1", "featured": True},
    {"name": "Trifacta", "description": "AI-powered data cleaning and preparation.", "category": "Data & Analytics", "url": "https://trifacta.com", "color": "#EF4444", "featured": False},
    {"name": "VoiceQL", "description": "AI-powered natural language data querying.", "category": "Data & Analytics", "url": "https://voiceql.com", "color": "#EC4899", "featured": False},
    {"name": "BlazeSQL", "description": "AI SQL query generator and data analyst.", "category": "Data Analysis & Research", "url": "https://blazesql.com", "color": "#EC4899", "featured": False},
    {"name": "CamelAI", "description": "AI data analysis connected to live databases.", "category": "Data Analysis & Research", "url": "https://camelai.com", "color": "#10B981", "featured": False},
    {"name": "Consensus", "description": "AI research assistant for consensus finding.", "category": "Data Analysis & Research", "url": "https://consensus.app", "color": "#6366F1", "featured": False},
    {"name": "Julius AI", "description": "AI data analysis tool for spreadsheets.", "category": "Data Analysis & Research", "url": "https://julius.ai", "color": "#F59E0B", "featured": False},
    {"name": "Scholarcy", "description": "AI research assistant for paper summaries.", "category": "Data Analysis & Research", "url": "https://scholarcy.com", "color": "#F97316", "featured": False},
    {"name": "Semantic Scholar", "description": "AI-powered search for research papers.", "category": "Data Analysis & Research", "url": "https://semanticscholar.org", "color": "#7C3AED", "featured": False},
    {"name": "Firebase", "description": "Google's backend-as-a-service platform.", "category": "Database & Backend", "url": "https://firebase.google.com", "color": "#FFCA28", "featured": True},
    {"name": "Neon", "description": "Serverless Postgres database platform.", "category": "Database & Backend", "url": "https://neon.tech", "color": "#000000", "featured": False},
    {"name": "Railway", "description": "Managed PostgreSQL with AI features.", "category": "Database & Backend", "url": "https://railway.app", "color": "#336791", "featured": False},
    {"name": "Supabase", "description": "Open-source Firebase alternative with AI.", "category": "Database & Backend", "url": "https://supabase.com", "color": "#3ECF8E", "featured": True},
    {"name": "Turso", "description": "Edge-compatible serverless database.", "category": "Database & Backend", "url": "https://turso.tech", "color": "#00E699", "featured": False},
    {"name": "DigitalOcean", "description": "Cloud platform for apps, databases, and AI.", "category": "Deployment & Hosting", "url": "https://digitalocean.com", "color": "#0061FF", "featured": False},
    {"name": "Netlify", "description": "Web hosting and automation platform.", "category": "Deployment & Hosting", "url": "https://netlify.com", "color": "#00C7B7", "featured": True},
    {"name": "Render", "description": "Cloud platform for deploying applications.", "category": "Deployment & Hosting", "url": "https://render.com", "color": "#1B1F24", "featured": False},
    {"name": "Vercel", "description": "Frontend cloud platform for deployment.", "category": "Deployment & Hosting", "url": "https://vercel.com", "color": "#000000", "featured": True},
    {"name": "Anima", "description": "Design-to-code platform with AI-powered code generation.", "category": "Design & UI", "url": "https://animaapp.com", "color": "#EF4444", "featured": False},
    {"name": "Beautiful.ai", "description": "AI-powered presentation software with smart templates.", "category": "Design & UI", "url": "https://beautiful.ai", "color": "#FF6B6B", "featured": False},
    {"name": "Canva", "description": "All-in-one design platform with AI-powered Magic Studio.", "category": "Design & UI", "url": "https://canva.com", "color": "#00C4CC", "featured": True},
    {"name": "Code Parrot", "description": "Figma-to-code AI that generates pixel-perfect frontend code.", "category": "Design & UI", "url": "https://codeparrot.ai", "color": "#22C55E", "featured": False},
    {"name": "Codia AI", "description": "AI design-to-code tool that converts Figma to production code.", "category": "Design & UI", "url": "https://codia.ai", "color": "#F97316", "featured": False},
    {"name": "Emergent", "description": "AI-powered platform for building full-stack mobile and web apps.", "category": "Design & UI", "url": "https://emergentagent.com", "color": "#2563EB", "featured": True},
    {"name": "Figma Make", "description": "AI-powered design tool built into Figma for rapid prototyping.", "category": "Design & UI", "url": "https://figma.com/make", "color": "#A259FF", "featured": False},
    {"name": "Kromio", "description": "AI tool for generating color palettes and design systems.", "category": "Design & UI", "url": "https://kromio.ai", "color": "#7C3AED", "featured": False},
    {"name": "Leonardo.Ai", "description": "AI-powered design tool for creating visual content.", "category": "Design & UI", "url": "https://leonardo.ai", "color": "#7C3AED", "featured": False},
    {"name": "Pitch", "description": "AI presentation tool with smart templates.", "category": "Design & UI", "url": "https://pitch.com", "color": "#FF6B6B", "featured": False},
    {"name": "Rork", "description": "AI-powered mobile app builder for React Native apps.", "category": "Design & UI", "url": "https://rork.app", "color": "#06B6D4", "featured": False},
    {"name": "Tile.dev", "description": "Visual component builder for React with AI assistance.", "category": "Design & UI", "url": "https://tile.dev", "color": "#3B82F6", "featured": False},
    {"name": "Visme", "description": "AI-powered visual content creation.", "category": "Design & UI", "url": "https://visme.co", "color": "#6366F1", "featured": False},
    {"name": "v0", "description": "AI UI generator by Vercel that creates React components from prompts.", "category": "Design & UI", "url": "https://v0.dev", "color": "#18181B", "featured": True},
    {"name": "CommitGen", "description": "AI-powered Git assistant for commit messages and PR reviews.", "category": "Development & Engineering", "url": "https://commitgen.ai", "color": "#F59E0B", "featured": False},
    {"name": "Dataherald", "description": "AI-powered database query generation.", "category": "Development & Engineering", "url": "https://dataherald.com", "color": "#8B5CF6", "featured": False},
    {"name": "GitHub Copilot X", "description": "GitHub's AI-powered coding assistant.", "category": "Development & Engineering", "url": "https://github.com/features/copilot", "color": "#6366F1", "featured": True},
    {"name": "Mabl", "description": "AI-powered test generation and maintenance.", "category": "Development & Engineering", "url": "https://mabl.com", "color": "#EF4444", "featured": False},
    {"name": "Repair", "description": "AI debugging and error resolution assistant.", "category": "Development & Engineering", "url": "https://repair.ai", "color": "#3B82F6", "featured": False},
    {"name": "Snyk Code", "description": "AI code review and security analysis.", "category": "Development & Engineering", "url": "https://snyk.io", "color": "#F97316", "featured": True},
    {"name": "Sourcegraph Cody", "description": "AI code search and documentation tool.", "category": "Development & Engineering", "url": "https://sourcegraph.com/cody", "color": "#22C55E", "featured": False},
    {"name": "Stoplight", "description": "AI-powered API design and documentation.", "category": "Development & Engineering", "url": "https://stoplight.io", "color": "#06B6D4", "featured": False},
    {"name": "Swimm", "description": "AI-powered documentation generator.", "category": "Development & Engineering", "url": "https://swimm.io", "color": "#EC4899", "featured": False},
    {"name": "Tabnine", "description": "AI-powered code completion and refactoring.", "category": "Development & Engineering", "url": "https://tabnine.com", "color": "#10B981", "featured": True},
    {"name": "ChatPDF", "description": "Chat with PDFs and get instant answers.", "category": "Document Analysis", "url": "https://chatpdf.com", "color": "#3B82F6", "featured": True},
    {"name": "Humata AI", "description": "AI document analysis for research workflows.", "category": "Document Analysis", "url": "https://humata.ai", "color": "#10B981", "featured": False},
    {"name": "Knolli", "description": "Multi-document AI workspace for research.", "category": "Document Analysis", "url": "https://knolli.ai", "color": "#F59E0B", "featured": False},
    {"name": "PDF.ai", "description": "AI PDF chat and analysis tool.", "category": "Document Analysis", "url": "https://pdf.ai", "color": "#6366F1", "featured": False},
    {"name": "UPDF AI", "description": "Full PDF editor with integrated AI chat.", "category": "Document Analysis", "url": "https://updf.com", "color": "#EC4899", "featured": False},
    {"name": "BigCommerce", "description": "AI e-commerce platform for enterprises.", "category": "E-commerce", "url": "https://bigcommerce.com", "color": "#000000", "featured": False},
    {"name": "Shopify", "description": "AI-powered e-commerce platform.", "category": "E-commerce", "url": "https://shopify.com", "color": "#96BF48", "featured": True},
    {"name": "Wix eCommerce", "description": "AI-powered online store builder.", "category": "E-commerce", "url": "https://wix.com/ecommerce", "color": "#F7A600", "featured": False},
    {"name": "Antigravity", "description": "AI coding platform for accelerated software development.", "category": "Editors & IDEs", "url": "https://antigravity.dev", "color": "#6366F1", "featured": True},
    {"name": "Atoms", "description": "Lightweight AI-powered code editor for quick prototyping.", "category": "Editors & IDEs", "url": "https://atoms.dev", "color": "#F97316", "featured": False},
    {"name": "Base44", "description": "AI development platform for building apps with natural language.", "category": "Editors & IDEs", "url": "https://base44.com", "color": "#14B8A6", "featured": False},
    {"name": "CodeGeeX", "description": "Multilingual AI code generation tool supporting 20+ languages.", "category": "Editors & IDEs", "url": "https://codegeex.cn", "color": "#10B981", "featured": False},
    {"name": "Continue.dev", "description": "Open-source AI code assistant that connects any model to any IDE.", "category": "Editors & IDEs", "url": "https://continue.dev", "color": "#F59E0B", "featured": False},
    {"name": "Cursor", "description": "AI-first code editor built on VS Code with intelligent autocomplete and chat.", "category": "Editors & IDEs", "url": "https://cursor.sh", "color": "#7C3AED", "featured": True},
    {"name": "Fleet", "description": "Lightweight editor by JetBrains that scales to full IDE features.", "category": "Editors & IDEs", "url": "https://jetbrains.com/fleet", "color": "#7C3AED", "featured": False},
    {"name": "JetBrains AI", "description": "AI assistant embedded directly into JetBrains IDEs.", "category": "Editors & IDEs", "url": "https://jetbrains.com/ai", "color": "#F97316", "featured": False},
    {"name": "Kilo Code", "description": "AI coding assistant with autonomous multi-file editing capabilities.", "category": "Editors & IDEs", "url": "https://kilocode.ai", "color": "#EC4899", "featured": False},
    {"name": "PlayCode", "description": "Browser-based AI coding environment with 15+ AI models.", "category": "Editors & IDEs", "url": "https://playcode.io", "color": "#E11D48", "featured": False},
    {"name": "Qoder", "description": "AI-enhanced coding environment with smart completions.", "category": "Editors & IDEs", "url": "https://qoder.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Trae", "description": "AI-native IDE by ByteDance with integrated AI assistant.", "category": "Editors & IDEs", "url": "https://trae.ai", "color": "#3B82F6", "featured": False},
    {"name": "Void", "description": "Open-source AI code editor with privacy-first local models.", "category": "Editors & IDEs", "url": "https://voideditor.com", "color": "#18181B", "featured": False},
    {"name": "Windsurf", "description": "AI-powered IDE by Codeium for agentic coding workflows.", "category": "Editors & IDEs", "url": "https://codeium.com/windsurf", "color": "#06B6D4", "featured": True},
    {"name": "Zed", "description": "High-performance code editor with AI features built for speed.", "category": "Editors & IDEs", "url": "https://zed.dev", "color": "#22C55E", "featured": False},
    {"name": "Bench", "description": "AI bookkeeping for small businesses.", "category": "Finance", "url": "https://bench.co", "color": "#F06B6B", "featured": False},
    {"name": "Wealthfront", "description": "AI-powered investment platform.", "category": "Finance", "url": "https://wealthfront.com", "color": "#00D09C", "featured": True},
    {"name": "Jotform", "description": "AI-powered online form builder.", "category": "Form Builders", "url": "https://jotform.com", "color": "#FFA500", "featured": False},
    {"name": "Tally", "description": "AI-powered form builder with beautiful design.", "category": "Form Builders", "url": "https://tally.so", "color": "#EF4444", "featured": False},
    {"name": "Typeform", "description": "AI form builder with conversational interface.", "category": "Form Builders", "url": "https://typeform.com", "color": "#262627", "featured": True},
    {"name": "Greenhouse", "description": "AI recruiting software.", "category": "HR & Recruitment", "url": "https://greenhouse.io", "color": "#FF6B6B", "featured": False},
    {"name": "Lever", "description": "AI-powered applicant tracking system.", "category": "HR & Recruitment", "url": "https://lever.co", "color": "#4285F4", "featured": False},
    {"name": "MyFitnessPal", "description": "AI nutrition and calorie tracking.", "category": "Health & Wellness", "url": "https://myfitnesspal.com", "color": "#22C55E", "featured": False},
    {"name": "Wysa", "description": "AI mental health support and therapy.", "category": "Health & Wellness", "url": "https://wysa.io", "color": "#FF6B6B", "featured": False},
    {"name": "Ideogram", "description": "Free AI image generator with multiple model options.", "category": "Image Generation", "url": "https://ideogram.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Imagen", "description": "Google's AI image generator with high-fidelity output.", "category": "Image Generation", "url": "https://deepmind.google/technologies/imagen", "color": "#6366F1", "featured": False},
    {"name": "Leonardo AI", "description": "AI image generator with strong gaming and 3D design focus.", "category": "Image Generation", "url": "https://leonardo.ai", "color": "#22C55E", "featured": False},
    {"name": "NightCafe", "description": "AI art generator with style transfer and creative tools.", "category": "Image Generation", "url": "https://nightcafe.studio", "color": "#F59E0B", "featured": False},
    {"name": "Artificial Solutions", "description": "AI customer service for telecom.", "category": "Industry-Specific", "url": "https://artificial-solutions.com", "color": "#22C55E", "featured": False},
    {"name": "Ayasdi", "description": "AI-powered financial analysis and fraud detection.", "category": "Industry-Specific", "url": "https://ayasdi.com", "color": "#EF4444", "featured": True},
    {"name": "Casetext", "description": "AI legal research and document analysis.", "category": "Industry-Specific", "url": "https://casetext.com", "color": "#10B981", "featured": True},
    {"name": "DeepMind AlphaFold", "description": "AI-powered drug discovery platform.", "category": "Industry-Specific", "url": "https://deepmind.com/alphafold", "color": "#3B82F6", "featured": False},
    {"name": "FourKite", "description": "AI supply chain optimization.", "category": "Industry-Specific", "url": "https://fourkite.com", "color": "#06B6D4", "featured": False},
    {"name": "Ironclad", "description": "AI legal contract analysis.", "category": "Industry-Specific", "url": "https://ironclad.ai", "color": "#EC4899", "featured": False},
    {"name": "Paradox", "description": "AI-powered human resources and recruiting.", "category": "Industry-Specific", "url": "https://paradox.ai", "color": "#F59E0B", "featured": False},
    {"name": "PathAI", "description": "AI-powered medical imaging analysis.", "category": "Industry-Specific", "url": "https://pathai.com", "color": "#6366F1", "featured": True},
    {"name": "Zesty", "description": "AI-powered insurance underwriting.", "category": "Industry-Specific", "url": "https://zesty.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Zillow AI", "description": "AI real estate valuation and insights.", "category": "Industry-Specific", "url": "https://zillow.com", "color": "#F97316", "featured": False},
    {"name": "Amazon Q", "description": "Amazon's AI assistant for customer service and enterprise use.", "category": "LLMs & Chatbots", "url": "https://aws.amazon.com/q", "color": "#3B82F6", "featured": False},
    {"name": "Claude", "description": "Anthropic's helpful and harmless AI assistant.", "category": "LLMs & Chatbots", "url": "https://claude.ai", "color": "#FF6D00", "featured": True},
    {"name": "Claude Haiku", "description": "Anthropic's faster and cheaper model for scaled applications.", "category": "LLMs & Chatbots", "url": "https://claude.ai", "color": "#14B8A6", "featured": False},
    {"name": "DeepSeek", "description": "DeepSeek's open-source large language model for reasoning tasks.", "category": "LLMs & Chatbots", "url": "https://deepseek.com", "color": "#06B6D4", "featured": True},
    {"name": "GPT-4", "description": "OpenAI's flagship language model for advanced reasoning and generation.", "category": "LLMs & Chatbots", "url": "https://chat.openai.com", "color": "#10B981", "featured": True},
    {"name": "GPT-4o", "description": "OpenAI's cost-effective model for scaled applications.", "category": "LLMs & Chatbots", "url": "https://chat.openai.com", "color": "#A78BFA", "featured": False},
    {"name": "Gemini", "description": "Google's large language model for advanced AI applications.", "category": "LLMs & Chatbots", "url": "https://gemini.google.com", "color": "#4285F4", "featured": True},
    {"name": "Grok", "description": "xAI's large-scale language model for scientific discovery.", "category": "LLMs & Chatbots", "url": "https://grok.com", "color": "#EC4899", "featured": True},
    {"name": "Jurassic", "description": "AI21 Labs' language model for enterprise applications.", "category": "LLMs & Chatbots", "url": "https://ai21.com", "color": "#8B5CF6", "featured": False},
    {"name": "Llama", "description": "Meta's open-source large language model for research and commercial use.", "category": "LLMs & Chatbots", "url": "https://llama.com", "color": "#6366F1", "featured": False},
    {"name": "Microsoft Copilot", "description": "Microsoft's enterprise AI assistant with Copilot integration.", "category": "LLMs & Chatbots", "url": "https://copilot.microsoft.com", "color": "#22C55E", "featured": True},
    {"name": "Mistral", "description": "Mistral AI's open-source language model with strong performance.", "category": "LLMs & Chatbots", "url": "https://mistral.ai", "color": "#F97316", "featured": False},
    {"name": "Perplexity", "description": "Perplexity's AI-powered search and question-answering engine.", "category": "LLMs & Chatbots", "url": "https://perplexity.ai", "color": "#EF4444", "featured": True},
    {"name": "Qwen", "description": "Alibaba's large language model for business applications.", "category": "LLMs & Chatbots", "url": "https://qianwen.aliyun.com", "color": "#F59E0B", "featured": False},
    {"name": "Stable LM", "description": "Stability AI's language model for creative applications.", "category": "LLMs & Chatbots", "url": "https://stability.ai", "color": "#84CC16", "featured": False},
    {"name": "Coursera", "description": "AI-powered online learning platform.", "category": "Learning & Education", "url": "https://coursera.org", "color": "#0056D2", "featured": True},
    {"name": "Duolingo", "description": "AI language learning with personalized lessons.", "category": "Learning & Education", "url": "https://duolingo.com", "color": "#58CC02", "featured": True},
    {"name": "Khan Academy", "description": "AI-powered interactive learning platform.", "category": "Learning & Education", "url": "https://khanacademy.org", "color": "#00C7B7", "featured": False},
    {"name": "Udemy", "description": "AI-enhanced online course platform.", "category": "Learning & Education", "url": "https://udemy.com", "color": "#A435F0", "featured": True},
    {"name": "Lexion", "description": "AI contract analysis and review.", "category": "Legal", "url": "https://lexion.ai", "color": "#003366", "featured": False},
    {"name": "AdCreative.ai", "description": "AI-powered ad creative generation.", "category": "Marketing & Sales", "url": "https://adcreative.ai", "color": "#EC4899", "featured": False},
    {"name": "Gong", "description": "AI sales engagement and automation platform.", "category": "Marketing & Sales", "url": "https://gong.io", "color": "#6366F1", "featured": True},
    {"name": "Hootsuite", "description": "AI-powered social media management.", "category": "Marketing & Sales", "url": "https://hootsuite.com", "color": "#10B981", "featured": True},
    {"name": "Intercom Fin", "description": "AI-powered customer support and engagement.", "category": "Marketing & Sales", "url": "https://intercom.com", "color": "#EF4444", "featured": False},
    {"name": "Jasper", "description": "AI-powered content marketing platform.", "category": "Marketing & Sales", "url": "https://jasper.ai", "color": "#7C3AED", "featured": True},
    {"name": "Klaviyo", "description": "AI email marketing and personalization.", "category": "Marketing & Sales", "url": "https://klaviyo.com", "color": "#3B82F6", "featured": False},
    {"name": "MarketMuse", "description": "AI content brief and SEO optimization.", "category": "Marketing & Sales", "url": "https://marketmuse.com", "color": "#F59E0B", "featured": False},
    {"name": "PhantomBuster", "description": "AI lead generation and enrichment.", "category": "Marketing & Sales", "url": "https://phantombuster.com", "color": "#8B5CF6", "featured": False},
    {"name": "Surfer SEO", "description": "AI SEO optimization and content strategy.", "category": "Marketing & Sales", "url": "https://surferseo.com", "color": "#F97316", "featured": True},
    {"name": "VidIQ", "description": "AI-powered video repurposing for social media.", "category": "Marketing & Sales", "url": "https://vidiq.com", "color": "#06B6D4", "featured": False},
    {"name": "Arize AI", "description": "AI observability for machine learning models.", "category": "Monitoring & Observability", "url": "https://arize.com", "color": "#F2A900", "featured": False},
    {"name": "Datadog", "description": "Cloud monitoring and observability platform.", "category": "Monitoring & Observability", "url": "https://datadoghq.com", "color": "#632CA6", "featured": True},
    {"name": "Grafana", "description": "Open observability platform with dashboards.", "category": "Monitoring & Observability", "url": "https://grafana.com", "color": "#F46800", "featured": False},
    {"name": "Monte Carlo", "description": "Data observability and AI monitoring.", "category": "Monitoring & Observability", "url": "https://montecarlodata.com", "color": "#FF6B6B", "featured": False},
    {"name": "New Relic", "description": "Full-stack observability platform.", "category": "Monitoring & Observability", "url": "https://newrelic.com", "color": "#1CE783", "featured": True},
    {"name": "AIVA", "description": "AI music composer for cinematic and orchestral pieces.", "category": "Music & Audio", "url": "https://aiva.ai", "color": "#3B82F6", "featured": False},
    {"name": "Boomy", "description": "AI music generator for beginners and streaming.", "category": "Music & Audio", "url": "https://boomy.com", "color": "#22C55E", "featured": False},
    {"name": "ElevenLabs", "description": "AI voice generator with hyper-realistic voices.", "category": "Music & Audio", "url": "https://elevenlabs.io", "color": "#6366F1", "featured": True},
    {"name": "Lovo", "description": "AI voice generator with extensive voice library.", "category": "Music & Audio", "url": "https://lovo.ai", "color": "#F59E0B", "featured": False},
    {"name": "Mureka", "description": "AI music generator with voice cloning capabilities.", "category": "Music & Audio", "url": "https://mureka.ai", "color": "#E11D48", "featured": False},
    {"name": "Murf", "description": "AI voice generator for professional voiceovers.", "category": "Music & Audio", "url": "https://murf.ai", "color": "#06B6D4", "featured": False},
    {"name": "Soundraw", "description": "AI music generator for video creators.", "category": "Music & Audio", "url": "https://soundraw.io", "color": "#8B5CF6", "featured": False},
    {"name": "Logseq", "description": "Open-source local-first outliner notes.", "category": "Note-taking & Knowledge", "url": "https://logseq.com", "color": "#22C55E", "featured": False},
    {"name": "Mem", "description": "AI-powered note-taking with automatic organization.", "category": "Note-taking & Knowledge", "url": "https://mem.ai", "color": "#7C3AED", "featured": False},
    {"name": "Notion", "description": "All-in-one workspace with AI-powered notes and databases.", "category": "Note-taking & Knowledge", "url": "https://notion.so", "color": "#000000", "featured": True},
    {"name": "Obsidian", "description": "Local-first knowledge base with graph view.", "category": "Note-taking & Knowledge", "url": "https://obsidian.md", "color": "#483699", "featured": True},
    {"name": "Roam Research", "description": "Networked note-taking with daily notes.", "category": "Note-taking & Knowledge", "url": "https://roamresearch.com", "color": "#3B82F6", "featured": False},
    {"name": "Tana", "description": "Structured notes tied to tasks and calendars.", "category": "Note-taking & Knowledge", "url": "https://tana.inc", "color": "#7C3AED", "featured": False},
    {"name": "Documize", "description": "AI document processing and Q&A platform.", "category": "Productivity & Office", "url": "https://documize.ai", "color": "#3B82F6", "featured": False},
    {"name": "Fireflies.ai", "description": "AI meeting notes and action items generator.", "category": "Productivity & Office", "url": "https://fireflies.ai", "color": "#8B5CF6", "featured": False},
    {"name": "Gamma", "description": "AI-powered presentation generator for professional slides.", "category": "Productivity & Office", "url": "https://gamma.app", "color": "#F97316", "featured": True},
    {"name": "Grammarly", "description": "AI-powered writing assistant for documents and emails.", "category": "Productivity & Office", "url": "https://grammarly.com", "color": "#7C3AED", "featured": True},
    {"name": "Motion", "description": "AI calendar assistant for automated scheduling.", "category": "Productivity & Office", "url": "https://usemotion.com", "color": "#EF4444", "featured": False},
    {"name": "Notion AI", "description": "AI note-taking and knowledge management app.", "category": "Productivity & Office", "url": "https://notion.so", "color": "#EC4899", "featured": False},
    {"name": "Otter.ai", "description": "AI meeting assistant for transcription and summarization.", "category": "Productivity & Office", "url": "https://otter.ai", "color": "#10B981", "featured": True},
    {"name": "Reclaim.ai", "description": "AI-powered calendar and scheduling assistant.", "category": "Productivity & Office", "url": "https://reclaim.ai", "color": "#06B6D4", "featured": False},
    {"name": "Row Zero", "description": "AI spreadsheet assistant for data analysis and formulas.", "category": "Productivity & Office", "url": "https://rowzero.io", "color": "#F59E0B", "featured": False},
    {"name": "Superhuman", "description": "AI-powered email management and drafting tool.", "category": "Productivity & Office", "url": "https://superhuman.com", "color": "#6366F1", "featured": True},
    {"name": "Anki", "description": "AI-powered flashcards and spaced repetition.", "category": "Research & Education", "url": "https://ankiweb.net", "color": "#EC4899", "featured": False},
    {"name": "Chegg AI", "description": "AI tutoring and homework help.", "category": "Research & Education", "url": "https://chegg.com", "color": "#EF4444", "featured": False},
    {"name": "Coursera AI", "description": "AI-powered online learning platform.", "category": "Research & Education", "url": "https://coursera.org", "color": "#F97316", "featured": False},
    {"name": "Elicit", "description": "AI-powered research synthesis and summarization.", "category": "Research & Education", "url": "https://elicit.org", "color": "#6366F1", "featured": True},
    {"name": "Guru", "description": "AI knowledge base and documentation.", "category": "Research & Education", "url": "https://getguru.com", "color": "#3B82F6", "featured": False},
    {"name": "Kimi", "description": "AI research assistant for literature review.", "category": "Research & Education", "url": "https://kimi.ai", "color": "#10B981", "featured": True},
    {"name": "Scite", "description": "AI research paper writing assistant.", "category": "Research & Education", "url": "https://scite.ai", "color": "#F59E0B", "featured": False},
    {"name": "Apigee", "description": "Google Cloud's API management platform.", "category": "Security & Code Quality", "url": "https://cloud.google.com/apigee", "color": "#F4B400", "featured": False},
    {"name": "Snyk", "description": "Security scanning for code and dependencies.", "category": "Security & Code Quality", "url": "https://snyk.io", "color": "#4B32C3", "featured": True},
    {"name": "SonarQube", "description": "Code quality and security analysis platform.", "category": "Security & Code Quality", "url": "https://sonarqube.org", "color": "#499CD2", "featured": True},
    {"name": "Checkmarx", "description": "AI code security scanning.", "category": "Security & Privacy", "url": "https://checkmarx.com", "color": "#6366F1", "featured": False},
    {"name": "CrowdStrike", "description": "AI-powered threat detection and response.", "category": "Security & Privacy", "url": "https://crowdstrike.com", "color": "#EF4444", "featured": True},
    {"name": "Onfido", "description": "AI identity verification platform.", "category": "Security & Privacy", "url": "https://onfido.com", "color": "#3B82F6", "featured": False},
    {"name": "SentinelOne", "description": "AI-driven endpoint protection.", "category": "Security & Privacy", "url": "https://sentinelone.com", "color": "#10B981", "featured": False},
    {"name": "Veriff", "description": "AI-powered compliance and security monitoring.", "category": "Security & Privacy", "url": "https://veriff.com", "color": "#F97316", "featured": False},
    {"name": "Buffer", "description": "AI-powered social media management.", "category": "Social Media", "url": "https://buffer.com", "color": "#377E00", "featured": True},
    {"name": "Later", "description": "AI social media scheduling and analytics.", "category": "Social Media", "url": "https://later.com", "color": "#E85D75", "featured": False},
    {"name": "SocialPilot", "description": "AI content creation for social media.", "category": "Social Media", "url": "https://socialpilot.co", "color": "#FF4F00", "featured": False},
    {"name": "Google Sheets AI", "description": "AI features in Google's spreadsheet app.", "category": "Spreadsheets", "url": "https://sheets.google.com", "color": "#4285F4", "featured": False},
    {"name": "Quadratic", "description": "AI spreadsheet with Python integration.", "category": "Spreadsheets", "url": "https://quadratichq.com", "color": "#7C3AED", "featured": False},
    {"name": "Rows", "description": "AI-powered spreadsheet with automation.", "category": "Spreadsheets", "url": "https://rows.com", "color": "#217346", "featured": True},
    {"name": "Asana", "description": "Work management platform with AI features.", "category": "Task & Project Management", "url": "https://asana.com", "color": "#F06A6A", "featured": True},
    {"name": "ClickUp", "description": "All-in-one project management with AI.", "category": "Task & Project Management", "url": "https://clickup.com", "color": "#7B68EE", "featured": True},
    {"name": "Monday.com", "description": "Work operating system with AI automation.", "category": "Task & Project Management", "url": "https://monday.com", "color": "#FF3D57", "featured": False},
    {"name": "Notion Projects", "description": "Collaborative project management for teams.", "category": "Task & Project Management", "url": "https://notion.so/product/projects", "color": "#E44D26", "featured": False},
    {"name": "Trello", "description": "Visual project management with AI.", "category": "Task & Project Management", "url": "https://trello.com", "color": "#2684FF", "featured": False},
    {"name": "Amazon Translate", "description": "AWS AI translation service for developers.", "category": "Translation", "url": "https://aws.amazon.com/translate", "color": "#FF9900", "featured": False},
    {"name": "DeepL", "description": "AI translation with superior accuracy.", "category": "Translation", "url": "https://deepl.com", "color": "#0F2B46", "featured": True},
    {"name": "Google Translate", "description": "Google's AI translation service.", "category": "Translation", "url": "https://translate.google.com", "color": "#4285F4", "featured": False},
    {"name": "Lara Translate", "description": "Specialized AI translation for business documents.", "category": "Translation", "url": "https://lara.translate", "color": "#10B981", "featured": False},
    {"name": "Microsoft Translator", "description": "Microsoft's AI translation for enterprise.", "category": "Translation", "url": "https://translator.microsoft.com", "color": "#00A4EF", "featured": False},
    {"name": "CapCut", "description": "AI video editing platform.", "category": "Video Generation", "url": "https://capcut.com", "color": "#00C7B7", "featured": False},
    {"name": "D-ID", "description": "AI avatar creation and video generation platform.", "category": "Video Generation", "url": "https://d-id.com", "color": "#F97316", "featured": False},
    {"name": "HeyGen", "description": "AI avatar video generator for business presentations.", "category": "Video Generation", "url": "https://heygen.com", "color": "#22C55E", "featured": False},
    {"name": "Kling AI", "description": "High-quality AI video generator with cinematic capabilities.", "category": "Video Generation", "url": "https://klingai.com", "color": "#FF6B00", "featured": True},
    {"name": "Luma Dream Machine", "description": "AI video generator for product showcases.", "category": "Video Generation", "url": "https://lumalabs.ai/dream-machine", "color": "#8B5CF6", "featured": False},
    {"name": "Pika Labs", "description": "AI video generation platform for creative content.", "category": "Video Generation", "url": "https://pika.art", "color": "#EC4899", "featured": False},
    {"name": "Synthesia", "description": "AI video platform for creating professional avatar videos.", "category": "Video Generation", "url": "https://synthesia.io", "color": "#3B82F6", "featured": False},
    {"name": "Veo", "description": "Google's AI video generator with native audio sync.", "category": "Video Generation", "url": "https://deepmind.google/technologies/veo", "color": "#4285F4", "featured": True},
    {"name": "A0", "description": "AI app builder for creating production apps from prompts.", "category": "Web & App Builders", "url": "https://a0.dev", "color": "#18181B", "featured": False},
    {"name": "AppGen", "description": "Generate full applications from natural language descriptions.", "category": "Web & App Builders", "url": "https://appgen.dev", "color": "#10B981", "featured": False},
    {"name": "Blink.new", "description": "AI-powered rapid web application generator.", "category": "Web & App Builders", "url": "https://blink.new", "color": "#A78BFA", "featured": False},
    {"name": "Bolt.diy", "description": "Open-source version of Bolt for self-hosted AI app building.", "category": "Web & App Builders", "url": "https://github.com/stackblitz-labs/bolt.diy", "color": "#F87171", "featured": False},
    {"name": "Bolt.new", "description": "Full-stack web app builder powered by AI in the browser.", "category": "Web & App Builders", "url": "https://bolt.new", "color": "#EF4444", "featured": True},
    {"name": "Dyad", "description": "AI-powered local-first app builder with full code ownership.", "category": "Web & App Builders", "url": "https://dyad.sh", "color": "#8B5CF6", "featured": False},
    {"name": "Firebase Studio", "description": "Google's AI-powered full-stack development environment.", "category": "Web & App Builders", "url": "https://firebase.google.com/studio", "color": "#F59E0B", "featured": False},
    {"name": "FlutterFlow", "description": "Visual builder for Flutter apps with AI-assisted development.", "category": "Web & App Builders", "url": "https://flutterflow.io", "color": "#2563EB", "featured": False},
    {"name": "Lovable", "description": "AI full-stack engineer that builds production-ready web apps.", "category": "Web & App Builders", "url": "https://lovable.dev", "color": "#EC4899", "featured": True},
    {"name": "Meku", "description": "AI web app builder generating React + Tailwind + Supabase apps.", "category": "Web & App Builders", "url": "https://meku.app", "color": "#EC4899", "featured": False},
    {"name": "Replit", "description": "Cloud IDE with AI-powered app building and instant deployment.", "category": "Web & App Builders", "url": "https://replit.com", "color": "#F97316", "featured": True},
    {"name": "Softr", "description": "Builds portals and internal tools on existing data sources.", "category": "Web & App Builders", "url": "https://softr.io", "color": "#F59E0B", "featured": False},
    {"name": "Taskade Genesis", "description": "No-code app builder that eliminates the need to code entirely.", "category": "Web & App Builders", "url": "https://taskade.com", "color": "#06B6D4", "featured": False},
    {"name": "WeWeb", "description": "AI-assisted visual builder for production-grade SaaS apps.", "category": "Web & App Builders", "url": "https://weweb.io", "color": "#6366F1", "featured": False},
    {"name": "Anyword", "description": "Data-driven AI copywriting with predictive performance scores.", "category": "Writing & Content", "url": "https://anyword.com", "color": "#EC4899", "featured": False},
    {"name": "Clearscope", "description": "AI content quality and semantic relevance optimization.", "category": "Writing & Content", "url": "https://clearscope.io", "color": "#6366F1", "featured": False},
    {"name": "Copy.ai", "description": "AI copywriting tool for marketing and sales content.", "category": "Writing & Content", "url": "https://copy.ai", "color": "#6366F1", "featured": True},
    {"name": "Frase", "description": "SERP-based content briefs and FAQ optimization.", "category": "Writing & Content", "url": "https://frase.io", "color": "#06B6D4", "featured": False},
    {"name": "INK", "description": "AI content optimization platform.", "category": "Writing & Content", "url": "https://inkforall.com", "color": "#F59E0B", "featured": False},
    {"name": "QuillBot", "description": "AI paraphrasing and text enhancement tool.", "category": "Writing & Content", "url": "https://quillbot.com", "color": "#3B82F6", "featured": False},
    {"name": "Rytr", "description": "Affordable AI writing assistant for short-form content.", "category": "Writing & Content", "url": "https://rytr.me", "color": "#F59E0B", "featured": False},
    {"name": "Writer", "description": "AI writing assistant for teams.", "category": "Writing & Content", "url": "https://writer.com", "color": "#7C3AED", "featured": False},
    {"name": "Writesonic", "description": "AI writing tool for SEO-optimized blog posts and content.", "category": "Writing & Content", "url": "https://writesonic.com", "color": "#10B981", "featured": False}
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
