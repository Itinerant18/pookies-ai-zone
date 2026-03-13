import aiohttp
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..sources import SourceConnector

logger = logging.getLogger(__name__)


class GitHubConnector(SourceConnector):
    """Connector for GitHub trending AI/ML repositories."""
    
    def __init__(self, api_url: str = "https://api.github.com", 
                 confidence_weight: float = 0.8, 
                 github_token: str = None,
                 **kwargs):
        super().__init__("GitHub", api_url, confidence_weight)
        self.api_url = api_url
        self.github_token = github_token
    
    async def fetch_tools(self) -> List[Dict[str, Any]]:
        """Fetch trending AI/ML repositories from GitHub."""
        tools = []
        
        headers = {"Accept": "application/vnd.github.v3+json"}
        if self.github_token:
            headers["Authorization"] = f"token {self.github_token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get trending repos in AI category
                since = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
                url = f"{self.api_url}/search/repositories"
                params = {
                    "q": "ai OR ml OR machine-learning created:>" + since,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 30
                }
                
                async with session.get(
                    url, 
                    params=params, 
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        for repo in data.get("items", [])[:20]:
                            tool = self._transform_repo_to_tool(repo)
                            tools.append(tool)
                    else:
                        logger.warning(f"GitHub API returned {response.status}")
                        tools = self._get_mock_data()
        except Exception as e:
            logger.error(f"Error fetching from GitHub: {e}")
            tools = self._get_mock_data()
        
        return tools
    
    def _transform_repo_to_tool(self, repo: Dict[str, Any]) -> Dict[str, Any]:
        """Transform GitHub repository to standard tool format."""
        return self.transform_tool({
            "name": repo.get("name", ""),
            "description": repo.get("description", "") or "AI/ML project on GitHub",
            "url": repo.get("html_url", ""),
            "category": "Development",
            "color": "#6366F1",
            "featured": repo.get("stargazers_count", 0) > 1000
        })
    
    def _get_mock_data(self) -> List[Dict[str, Any]]:
        """Mock data for testing when API is unavailable."""
        return [
            self.transform_tool({
                "name": "awesome-ai-tools",
                "description": "A curated list of AI tools and resources",
                "url": "https://github.com/example/awesome-ai",
                "category": "Development",
                "color": "#6366F1"
            })
        ]
