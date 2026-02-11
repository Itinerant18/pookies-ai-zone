"""
Backend API Tests for AI Tools Directory
Tests all CRUD operations and filtering functionality
"""
import pytest
import requests
import os

# Get BASE_URL from environment or construct from frontend .env
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    # Try reading from frontend .env
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().strip('"')
                    break
    except:
        pass

if not BASE_URL:
    raise ValueError("EXPO_PUBLIC_BACKEND_URL not found in environment or frontend .env")

BASE_URL = BASE_URL.rstrip('/')

class TestHealthEndpoint:
    """Test API root endpoint"""
    
    def test_root_endpoint(self):
        """Test API root returns correct message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "AI Tool Directory API"

class TestToolsEndpoint:
    """Test GET /api/tools with various filters"""
    
    def test_get_all_tools(self):
        """Test getting all tools returns 40 tools"""
        response = requests.get(f"{BASE_URL}/api/tools")
        assert response.status_code == 200
        
        tools = response.json()
        assert isinstance(tools, list)
        assert len(tools) == 40, f"Expected 40 tools, got {len(tools)}"
        
        # Verify tool structure
        first_tool = tools[0]
        required_fields = ['id', 'name', 'description', 'category', 'url', 'icon_letter', 'color', 'featured']
        for field in required_fields:
            assert field in first_tool, f"Missing field: {field}"
        
        # Verify no MongoDB _id is exposed
        assert "_id" not in first_tool, "MongoDB _id should be excluded"
    
    def test_search_tools_by_name(self):
        """Test search filter by tool name"""
        response = requests.get(f"{BASE_URL}/api/tools?search=cursor")
        assert response.status_code == 200
        
        tools = response.json()
        assert isinstance(tools, list)
        assert len(tools) >= 1, "Should find at least 1 tool with 'cursor'"
        
        # Verify Cursor tool is in results
        cursor_found = any(t['name'].lower() == 'cursor' for t in tools)
        assert cursor_found, "Cursor tool should be in search results"
    
    def test_search_tools_case_insensitive(self):
        """Test search is case insensitive"""
        response_lower = requests.get(f"{BASE_URL}/api/tools?search=cursor")
        response_upper = requests.get(f"{BASE_URL}/api/tools?search=CURSOR")
        
        assert response_lower.status_code == 200
        assert response_upper.status_code == 200
        
        # Both should return same results
        assert len(response_lower.json()) == len(response_upper.json())
    
    def test_filter_by_category(self):
        """Test category filter"""
        category = "Design & UI"
        response = requests.get(f"{BASE_URL}/api/tools?category={category}")
        assert response.status_code == 200
        
        tools = response.json()
        assert isinstance(tools, list)
        assert len(tools) >= 1, f"Should have tools in {category} category"
        
        # Verify all tools are in the correct category
        for tool in tools:
            assert tool['category'] == category, f"Tool {tool['name']} has wrong category"
    
    def test_filter_by_featured(self):
        """Test featured filter"""
        response = requests.get(f"{BASE_URL}/api/tools?featured=true")
        assert response.status_code == 200
        
        tools = response.json()
        assert isinstance(tools, list)
        assert len(tools) >= 1, "Should have featured tools"
        
        # Verify all tools are featured
        for tool in tools:
            assert tool['featured'] is True, f"Tool {tool['name']} should be featured"
    
    def test_search_no_results(self):
        """Test search with no matching results"""
        response = requests.get(f"{BASE_URL}/api/tools?search=nonexistenttoolxyz123")
        assert response.status_code == 200
        
        tools = response.json()
        assert isinstance(tools, list)
        assert len(tools) == 0, "Should return empty list for non-matching search"

class TestCategoriesEndpoint:
    """Test GET /api/categories"""
    
    def test_get_categories(self):
        """Test getting all categories returns 4 categories with counts"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert isinstance(categories, list)
        assert len(categories) == 4, f"Expected 4 categories, got {len(categories)}"
        
        # Verify category structure
        for cat in categories:
            assert "name" in cat, "Category missing 'name' field"
            assert "count" in cat, "Category missing 'count' field"
            assert isinstance(cat['count'], int), "Count should be integer"
            assert cat['count'] > 0, "Each category should have at least 1 tool"
        
        # Verify expected categories exist
        expected_categories = [
            'Editors & IDEs',
            'Web & App Builders',
            'Assistants & Agents',
            'Design & UI'
        ]
        category_names = [c['name'] for c in categories]
        for expected in expected_categories:
            assert expected in category_names, f"Missing category: {expected}"
    
    def test_categories_count_matches_tools(self):
        """Test that category counts match actual tools in each category"""
        categories_response = requests.get(f"{BASE_URL}/api/categories")
        assert categories_response.status_code == 200
        categories = categories_response.json()
        
        for cat in categories:
            # Get tools for this category
            tools_response = requests.get(f"{BASE_URL}/api/tools?category={cat['name']}")
            assert tools_response.status_code == 200
            tools = tools_response.json()
            
            # Count should match
            assert len(tools) == cat['count'], \
                f"Category {cat['name']} count mismatch: expected {cat['count']}, got {len(tools)} tools"

class TestToolDetailEndpoint:
    """Test GET /api/tools/{tool_id}"""
    
    def test_get_tool_by_id(self):
        """Test getting a single tool by ID"""
        # First get all tools to get a valid ID
        all_tools_response = requests.get(f"{BASE_URL}/api/tools")
        assert all_tools_response.status_code == 200
        tools = all_tools_response.json()
        assert len(tools) > 0, "Need at least one tool to test detail endpoint"
        
        # Get first tool's ID
        tool_id = tools[0]['id']
        
        # Test detail endpoint
        response = requests.get(f"{BASE_URL}/api/tools/{tool_id}")
        assert response.status_code == 200
        
        tool = response.json()
        assert tool['id'] == tool_id
        assert 'name' in tool
        assert 'description' in tool
        assert 'category' in tool
        assert 'url' in tool
        assert "_id" not in tool, "MongoDB _id should be excluded"
    
    def test_get_specific_tools(self):
        """Test getting specific well-known tools"""
        # Get all tools first
        all_tools_response = requests.get(f"{BASE_URL}/api/tools")
        tools = all_tools_response.json()
        
        # Find Cursor tool
        cursor_tool = next((t for t in tools if t['name'] == 'Cursor'), None)
        assert cursor_tool is not None, "Cursor tool should exist"
        
        # Get Cursor by ID
        response = requests.get(f"{BASE_URL}/api/tools/{cursor_tool['id']}")
        assert response.status_code == 200
        tool = response.json()
        assert tool['name'] == 'Cursor'
        assert tool['category'] == 'Editors & IDEs'
        assert 'url' in tool and tool['url']
    
    def test_get_nonexistent_tool(self):
        """Test getting a tool with invalid ID returns error"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{BASE_URL}/api/tools/{fake_id}")
        
        # Should return 200 with error message (based on backend code)
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        assert data["error"] == "Tool not found"

class TestDataIntegrity:
    """Test overall data integrity and structure"""
    
    def test_all_tools_have_valid_categories(self):
        """Test all tools belong to valid categories"""
        # Get valid categories
        cat_response = requests.get(f"{BASE_URL}/api/categories")
        categories = cat_response.json()
        valid_categories = [c['name'] for c in categories]
        
        # Get all tools
        tools_response = requests.get(f"{BASE_URL}/api/tools")
        tools = tools_response.json()
        
        # Verify each tool has a valid category
        for tool in tools:
            assert tool['category'] in valid_categories, \
                f"Tool {tool['name']} has invalid category: {tool['category']}"
    
    def test_featured_tools_exist(self):
        """Test that featured tools exist"""
        response = requests.get(f"{BASE_URL}/api/tools?featured=true")
        assert response.status_code == 200
        
        featured = response.json()
        assert len(featured) >= 10, "Should have at least 10 featured tools"
        
        # Verify specific featured tools exist
        featured_names = [t['name'] for t in featured]
        expected_featured = ['Cursor', 'Windsurf', 'Bolt.new', 'v0', 'GitHub Copilot']
        for name in expected_featured:
            assert name in featured_names, f"{name} should be featured"
    
    def test_all_tools_have_urls(self):
        """Test that all tools have valid URLs"""
        response = requests.get(f"{BASE_URL}/api/tools")
        tools = response.json()
        
        for tool in tools:
            assert 'url' in tool, f"Tool {tool['name']} missing URL"
            assert tool['url'].startswith('http'), f"Tool {tool['name']} has invalid URL: {tool['url']}"
