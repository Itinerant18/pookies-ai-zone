import aiohttp
import logging
from typing import List, Dict, Any
from datetime import datetime
from ..sources import SourceConnector

logger = logging.getLogger(__name__)


class ProductHuntConnector(SourceConnector):
    """Connector for Product Hunt AI tools."""
    
    def __init__(self, api_url: str = "https://api.producthunt.com",
                 confidence_weight: float = 0.9,
                 api_token: str = None,
                 **kwargs):
        super().__init__("Product Hunt", api_url, confidence_weight)
        self.api_url = api_url
        self.api_token = api_token
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        """Fetch AI tools from Product Hunt."""
        tools = []
        
        headers = {}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get today's popular posts in AI category
                url = f"{self.api_url}/v2/categories/ai/posts"
                params = {"limit": 20}
                
                async with session.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        posts = data.get("posts", [])
                        for post in posts:
                            tool = self._transform_post_to_tool(post)
                            tools.append(tool)
                    else:
                        logger.warning(f"Product Hunt API returned {response.status}")
                        tools = self._get_mock_data()
        except Exception as e:
            logger.error(f"Error fetching from Product Hunt: {e}")
            tools = self._get_mock_data()
        
        return tools
    
    def _transform_post_to_tool(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Product Hunt post to standard tool format."""
        return self.transform_tool({
            "name": post.get("name", ""),
            "description": post.get("tagline", ""),
            "url": post.get("redirect_url", ""),
            "category": "Productivity",
            "color": "#FF6D00",
            "featured": post.get("votes_count", 0) > 100
        })
    
    def _get_mock_data(self) -> List[Dict[str, Any]]:
        """Mock data for testing when API is unavailable."""
        return [
            self.transform_tool({
                "name": "AI Product 1",
                "description": "A new AI product on Product Hunt",
                "url": "https://producthunt.com/posts/example",
                "category": "Productivity",
                "color": "#FF6D00"
            })
        ]
