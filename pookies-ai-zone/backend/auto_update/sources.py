import os
import json
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class SourceConnector(ABC):
    """Base class for all source connectors."""
    
    def __init__(self, name: str, base_url: str, confidence_weight: float = 1.0):
        self.name = name
        self.base_url = base_url
        self.confidence_weight = confidence_weight
    
    @abstractmethod
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        """Fetch tools from this source."""
        pass
    
    def transform_tool(self, raw_tool: Dict[str, Any]) -> Dict[str, Any]:
        """Transform raw tool data to standard format."""
        return {
            "name": raw_tool.get("name", ""),
            "description": raw_tool.get("description", ""),
            "url": raw_tool.get("url", ""),
            "category": raw_tool.get("category", "Other"),
            "source": self.name,
            "confidence_score": self.confidence_weight,
            "fetched_at": datetime.now().isoformat(),
            "icon_letter": raw_tool.get("name", "?").upper()[:1] if raw_tool.get("name") else "?",
            "color": raw_tool.get("color", "#6366F1"),
            "featured": raw_tool.get("featured", False),
        }


class ConfigManager:
    """Manage source configuration."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), "sources_config.json")
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                return json.load(f)
        return self._default_config()
    
    def _default_config(self) -> Dict:
        return {
            "sources": {
                "futurepedia": {
                    "enabled": True,
                    "confidence_weight": 1.0,
                    "api_url": "https://api.futurepedia.io"
                },
                "thereisanai": {
                    "enabled": True,
                    "confidence_weight": 1.0,
                    "api_url": "https://thereisan.ai/api"
                },
                "github": {
                    "enabled": True,
                    "confidence_weight": 0.8,
                    "api_url": "https://api.github.com"
                },
                "producthunt": {
                    "enabled": True,
                    "confidence_weight": 0.9,
                    "api_url": "https://api.producthunt.com"
                }
            },
            "scheduler": {
                "run_time": "06:00",
                "timezone": "UTC"
            },
            "alerts": {
                "enabled": True,
                "channels": ["log"]
            }
        }
    
    def save_config(self):
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def get_enabled_sources(self) -> List[str]:
        return [k for k, v in self.config.get("sources", {}).items() 
                if v.get("enabled", False)]
    
    def get_source_config(self, source_name: str) -> Dict:
        return self.config.get("sources", {}).get(source_name, {})


class SourceFactory:
    """Factory to create source connectors."""
    
    @staticmethod
    def create_connector(source_name: str, config: Dict = None) -> Optional[SourceConnector]:
        if config is None:
            config = {}
        
        # Import here to avoid circular imports
        from .connectors.futurepedia import FuturepediaConnector
        from .connectors.github import GitHubConnector
        from .connectors.producthunt import ProductHuntConnector
        
        connectors = {
            "futurepedia": FuturepediaConnector,
            "github": GitHubConnector,
            "producthunt": ProductHuntConnector,
        }
        
        connector_class = connectors.get(source_name.lower())
        if connector_class:
            return connector_class(**config)
        return None
    
    @staticmethod
    async def fetch_from_all_sources(config_manager: ConfigManager) -> List[Dict[str, Any]]:
        """Fetch tools from all enabled sources."""
        all_tools = []
        
        for source_name in config_manager.get_enabled_sources():
            source_config = config_manager.get_source_config(source_name)
            connector = SourceFactory.create_connector(source_name, source_config)
            
            if connector:
                try:
                    tools = await connector.fetch_tools()
                    all_tools.extend(tools)
                    logger.info(f"Fetched {len(tools)} tools from {source_name}")
                except Exception as e:
                    logger.error(f"Error fetching from {source_name}: {e}")
        
        return all_tools
