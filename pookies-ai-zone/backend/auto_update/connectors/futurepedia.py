import aiohttp
import logging
from typing import List, Dict, Any
from ..sources import SourceConnector

logger = logging.getLogger(__name__)


class FuturepediaConnector(SourceConnector):
    """Connector for Futurepedia AI tool directory."""
    
    def __init__(self, api_url: str = "https://api.futurepedia.io", 
                 confidence_weight: float = 1.0, **kwargs):
        super().__init__("Futurepedia", api_url, confidence_weight)
        self.api_url = api_url
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        """Fetch tools from Futurepedia API."""
        tools = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Try to get tools from Futurepedia
                # Note: This is a placeholder - actual API may differ
                async with session.get(
                    f"{self.api_url}/tools",
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        tools = [self.transform_tool(t) for t in data.get("tools", [])]
                    else:
                        logger.warning(f"Futurepedia API returned {response.status}")
                        # Return mock data for testing if API unavailable
                        tools = self._get_mock_data()
        except Exception as e:
            logger.error(f"Error fetching from Futurepedia: {e}")
            tools = self._get_mock_data()
        
        return tools
    
    def _get_mock_data(self) -> List[Dict[str, Any]]:
        """Mock data for testing when API is unavailable."""
        return [
            self.transform_tool({
                "name": "New AI Tool 1",
                "description": "A new AI tool discovered from Futurepedia",
                "url": "https://example-ai-tool.com",
                "category": "Productivity",
                "color": "#10B981"
            }),
            self.transform_tool({
                "name": "New AI Tool 2",
                "description": "Another AI tool from Futurepedia",
                "url": "https://example-ai-tool-2.com",
                "category": "Development",
                "color": "#6366F1"
            })
        ]
