import aiohttp
import logging
import re
from typing import Dict, Any, List, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

# Minimum description length
MIN_DESCRIPTION_LENGTH = 10

# Placeholder patterns to detect
PLACEHOLDER_PATTERNS = [
    r"^placeholder",
    r"^tbd",
    r"^coming soon",
    r"^description",
]


class VerificationResult:
    """Result of verification."""
    
    def __init__(self, passed: bool, message: str = "", details: Dict = None):
        self.passed = passed
        self.message = message
        self.details = details or {}
    
    def to_dict(self) -> Dict:
        return {
            "passed": self.passed,
            "message": self.message,
            "details": self.details
        }


class Verifier:
    """Verify tools before adding to database."""
    
    def __init__(self):
        self.verified_count = 0
        self.failed_count = 0
    
    async def verify_tool(self, tool: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """Verify a single tool."""
        verified_tool = tool.copy()
        verifications = []
        
        # 1. URL Verification
        url_result = await self._verify_url(tool.get("url", ""))
        verifications.append(("url_check", url_result))
        
        # 2. Description Quality Check
        desc_result = self._verify_description(tool.get("description", ""))
        verifications.append(("description_check", desc_result))
        
        # 3. Category Validation
        category_result = self._verify_category(tool.get("category", ""))
        verifications.append(("category_check", category_result))
        
        # Determine overall pass/fail
        all_passed = all(v[1].passed for v in verifications)
        
        # Add verification metadata
        verified_tool["verification"] = {
            "verified_at": datetime.now().isoformat(),
            "checks": {k: v.to_dict() for k, v in verifications},
            "passed": all_passed
        }
        
        if all_passed:
            self.verified_count += 1
        else:
            self.failed_count += 1
        
        return all_passed, verified_tool
    
    async def _verify_url(self, url: str) -> VerificationResult:
        """Check if URL responds with 200 OK."""
        if not url:
            return VerificationResult(False, "URL is empty")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.head(
                    url, 
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=True
                ) as response:
                    if response.status == 200:
                        return VerificationResult(True, "URL is accessible")
                    elif response.status in [301, 302, 303, 307, 308]:
                        return VerificationResult(True, "URL redirects (acceptable)")
                    else:
                        return VerificationResult(
                            False, 
                            f"URL returned {response.status}",
                            {"status": response.status}
                        )
        except aiohttp.ClientError as e:
            return VerificationResult(False, f"URL check failed: {str(e)}")
        except Exception as e:
            return VerificationResult(False, f"Error checking URL: {str(e)}")
    
    def _verify_description(self, description: str) -> VerificationResult:
        """Check description quality."""
        if not description:
            return VerificationResult(False, "Description is empty")
        
        if len(description) < MIN_DESCRIPTION_LENGTH:
            return VerificationResult(
                False, 
                f"Description too short ({len(description)} chars)",
                {"length": len(description)}
            )
        
        # Check for placeholder text
        desc_lower = description.lower()
        for pattern in PLACEHOLDER_PATTERNS:
            if re.match(pattern, desc_lower):
                return VerificationResult(
                    False,
                    "Description appears to be placeholder text",
                    {"pattern": pattern}
                )
        
        return VerificationResult(True, "Description is valid")
    
    def _verify_category(self, category: str) -> VerificationResult:
        """Validate category."""
        # List of known valid categories
        valid_categories = {
            "Assistants & Agents", "Automation & Productivity", "Automation & Workflow",
            "Browsers", "Chatbots & Conversational AI", "Creative & Design",
            "Data & Analytics", "Data Analysis & Research", "Database & Backend",
            "Design & UI", "Development", "Development & Engineering",
            "E-commerce", "Editors & IDEs", "Finance", "Form Builders",
            "HR & Recruitment", "Health & Wellness", "Image Generation",
            "Industry-Specific", "Learning & Education", "Legal", "LLMs & Chatbots",
            "Marketing & Sales", "Monitoring & Observability", "Music & Audio",
            "Note-taking & Knowledge", "Productivity & Office", "Research & Education",
            "Security & Code Quality", "Security & Privacy", "Social Media",
            "Spreadsheets", "Task & Project Management", "Translation",
            "API & Testing", "Analytics", "CRM & Customer Support",
            "Deployment & Hosting", "Document Analysis", "3D & Creative"
        }
        
        if not category:
            return VerificationResult(False, "Category is empty")
        
        if category in valid_categories:
            return VerificationResult(True, "Category is valid")
        
        # Category not in known list - still acceptable but flag it
        return VerificationResult(
            True, 
            f"Category '{category}' not in standard list",
            {"category": category, "warning": True}
        )
    
    def get_stats(self) -> Dict[str, int]:
        """Get verification statistics."""
        return {
            "verified": self.verified_count,
            "failed": self.failed_count,
            "total": self.verified_count + self.failed_count
        }
