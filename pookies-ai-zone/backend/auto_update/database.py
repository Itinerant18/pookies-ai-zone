import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manage database operations for AI tools."""
    
    def __init__(self, mongo_url: str = None, db_name: str = None):
        if mongo_url is None:
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        if db_name is None:
            db_name = os.environ.get('DB_NAME', 'pookies_ai')
        
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.tools_collection = self.db["tools"]
        self.audit_collection = self.db["audit_log"]
        
        # Create indexes
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes."""
        self.tools_collection.create_index("url", unique=True)
        self.tools_collection.create_index("name")
        self.tools_collection.create_index("category")
        self.tools_collection.create_index("source")
        self.tools_collection.create_index("status")
    
    async def add_tool(self, tool: Dict[str, Any]) -> bool:
        """Add a new tool to the database."""
        try:
            tool["id"] = str(uuid.uuid4())
            tool["status"] = "active"
            tool["created_at"] = datetime.now().isoformat()
            tool["updated_at"] = tool["created_at"]
            
            await self.tools_collection.insert_one(tool)
            
            # Log to audit
            await self._log_audit("add", tool["id"], {"tool": tool})
            
            logger.info(f"Added tool: {tool.get('name')}")
            return True
        except Exception as e:
            if "duplicate key" in str(e).lower():
                logger.info(f"Tool already exists: {tool.get('name')}")
            else:
                logger.error(f"Error adding tool: {e}")
            return False
    
    async def update_tool(self, tool_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing tool."""
        try:
            updates["updated_at"] = datetime.now().isoformat()
            
            result = await self.tools_collection.update_one(
                {"_id": tool_id},
                {"$set": updates}
            )
            
            if result.modified_count > 0:
                await self._log_audit("update", tool_id, {"updates": updates})
                logger.info(f"Updated tool: {tool_id}")
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error updating tool: {e}")
            return False
    
    async def mark_inactive(self, tool_id: str) -> bool:
        """Mark a tool as inactive."""
        return await self.update_tool(tool_id, {"status": "inactive"})
    
    async def tool_exists_by_url(self, url: str) -> bool:
        """Check if a tool with this URL already exists."""
        count = await self.tools_collection.count_documents({"url": url})
        return count > 0
    
    async def get_tool_by_url(self, url: str) -> Dict:
        """Get tool by URL."""
        return await self.tools_collection.find_one({"url": url})
    
    async def refresh_tools(self, tools: List[Dict[str, Any]]) -> Dict[str, int]:
        """Refresh existing tools with new data."""
        stats = {"updated": 0, "checked": 0, "inactive": 0}
        
        for tool in tools:
            stats["checked"] += 1
            url = tool.get("url")
            
            existing = await self.get_tool_by_url(url)
            if existing:
                # Update existing tool
                updates = {
                    "description": tool.get("description"),
                    "category": tool.get("category"),
                    "color": tool.get("color"),
                    "featured": tool.get("featured", False),
                    "confidence_score": tool.get("confidence_score"),
                }
                
                if await self.update_tool(str(existing["_id"]), updates):
                    stats["updated"] += 1
        
        return stats
    
    async def add_tools_batch(self, tools: List[Dict[str, Any]]) -> Dict[str, int]:
        """Add multiple tools (handles duplicates)."""
        stats = {"added": 0, "skipped": 0, "failed": 0}
        
        for tool in tools:
            if await self.tool_exists_by_url(tool.get("url", "")):
                stats["skipped"] += 1
                continue
            
            if await self.add_tool(tool):
                stats["added"] += 1
            else:
                stats["failed"] += 1
        
        return stats
    
    async def check_availability(self) -> Dict[str, int]:
        """Check availability of existing tools (weekly)."""
        import aiohttp
        
        stats = {"checked": 0, "inactive": 0}
        
        async for tool in self.tools_collection.find({"status": "active"}):
            stats["checked"] += 1
            url = tool.get("url", "")
            
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.head(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status != 200:
                            await self.mark_inactive(str(tool["_id"]))
                            stats["inactive"] += 1
                            logger.info(f"Marked inactive: {tool.get('name')}")
            except Exception as e:
                logger.warning(f"Error checking {tool.get('name')}: {e}")
        
        return stats
    
    async def _log_audit(self, action: str, tool_id: str, details: Dict):
        """Log audit entry."""
        entry = {
            "action": action,
            "tool_id": tool_id,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        await self.audit_collection.insert_one(entry)
    
    async def get_audit_log(self, limit: int = 100) -> List[Dict]:
        """Get recent audit log entries."""
        cursor = self.audit_collection.find().sort("timestamp", -1).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_stats(self) -> Dict:
        """Get database statistics."""
        total = await self.tools_collection.count_documents({})
        active = await self.tools_collection.count_documents({"status": "active"})
        inactive = await self.tools_collection.count_documents({"status": "inactive"})
        
        return {
            "total_tools": total,
            "active_tools": active,
            "inactive_tools": inactive
        }
