#!/usr/bin/env python3

import json
import urllib.request
import sys

def test_api():
    """Test AI Tools API"""
    try:
        # Test health endpoint
        print("🔍 Testing API health endpoint...")
        response = urllib.request.urlopen('http://localhost:8081/health', timeout=10)
        if response.status == 200:
            health_data = json.loads(response.read())
            print(f"✅ Health check passed: {health_data['message']}")
        else:
            print(f"❌ Health check failed: {response.status}")
            return False
        
        # Test tools endpoint
        print("🔍 Testing tools endpoint...")
        response = urllib.request.urlopen('http://localhost:8081/api/tools/get', timeout=10)
        if response.status == 200:
            tools = json.loads(response.read())
            print(f"✅ Tools API working: {len(tools)} tools loaded")
            
            # Test a few specific tools
            if len(tools) > 0:
                test_tool = tools[0] if len(tools) > 0 else None
                    test_tool = tools[0]
                    detail_response = urllib.request.urlopen(f'http://localhost:8081/api/tools/get/{test_tool["_id"]}', timeout=5)
                    if detail_response.status == 200:
                        tool = json.loads(detail_response.read())
                        print(f"✅ Tool details working for: {test_tool['name']}")
                    else:
                        print(f"❌ Tool details failed for {test_tool['name']}")
            # Test search functionality
                    search_response = urllib.request.urlopen('http://localhost:8081/api/tools/get?search={test_tool["name"]}', timeout=5)
                    if search_response.status == 200:
                        search_results = json.loads(search_response.read())
                        print(f"✅ Search working: {len(search_results)} results")
                    else:
                        print(f"❌ Search failed: {search_response.status}")
                        return False
                    
                    # Test categories endpoint
                    categories_response = urllib.request.urlopen('http://localhost:8081/api/categories', timeout=5)
                    if categories_response.status == 200:
                        categories = json.loads(categories_response.read())
                        print(f"✅ Categories working: {len(categories)} categories")
                    else:
                        print(f"❌ Categories failed: {categories_response.status}")
                        return False
                    else:
                        print(f"📊 API Summary:")
                        print(f"  - Health: {'✅' if health_passed else '❌'}' '✓ '✅' if tools_loaded else '❌'}'})
                        print(f"  - Tools: {'✅' if tools_loaded else '❌'}'")
                        print(f"  - Categories: {'✅' if categories_loaded else '❌'}'")
                        print(f"  - Overall API: {'❌' if tools_loaded else '❌'}'}")
                        return True
        
        return True

    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_api()