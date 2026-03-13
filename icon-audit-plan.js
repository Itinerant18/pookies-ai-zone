#!/usr/bin/env node

/**
 * AI Tools Icon Audit & Fix Plan
 * 
 * This script analyzes all 293 AI tools for icon issues and creates a comprehensive fix plan.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// SimpleIcons CDN base URL
const SIMPLIICONS_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/';
const SIMPLIICONS_URL_BASE = 'https://cdn.simpleicons.org/';

// Color hex validation regex
const COLOR_REGEX = /^[0-9A-Fa-f]{6}$/;

// Read the seed data
const seedDataPath = path.join(__dirname, 'pookies-ai-zone/frontend/data/seedData.ts');
const seedDataContent = fs.readFileSync(seedDataPath, 'utf8');

// Extract tools data using regex
const toolsMatch = seedDataContent.match(/export const TOOLS_DATA = (\[[\s\S]*\]);/);
if (!toolsMatch) {
    console.error('Could not extract TOOLS_DATA');
    process.exit(1);
}

let tools;
try {
    tools = eval(toolsMatch[1]);
} catch (error) {
    console.error('Error parsing tools data:', error);
    process.exit(1);
}

console.log(`🔍 Auditing ${tools.length} AI tools for icon issues...\n`);

// Analysis results
const issues = {
    totalTools: tools.length,
    urlNameMismatches: [],
    invalidFormats: [],
    missingIcons: [],
    validIcons: [],
    unavailableIcons: [],
    edgeCases: []
};

// Icon name mapping for common issues
const iconMappings = {
    // URL name corrections
    'apachejmeter': 'apachejmeter',
    'googleanalytics': 'googleanalytics',
    'githubcopilot': 'githubcopilot',
    'microsoftcopilot': 'microsoftcopilot',
    'freshworks': 'freshworks',
    'characterai': 'characterai',
    'openai': 'openai',
    'microsoftpowerautomate': 'microsoftpowerautomate',
    'arcbrowser': 'arc',
    'figmamake': 'figma',
    'stabilityai': 'stabilityai',
    'semantic scholar': 'semanticscholar', // Space in URL
    // Add more mappings as needed
};

// Function to validate icon URL format
function validateIconUrl(url) {
    if (!url) return { valid: false, error: 'Missing URL' };
    
    const simpleIconsPattern = /^https:\/\/cdn\.simpleicons\.org\/([^\/]+)\/([0-9A-Fa-f]{6})$/;
    const match = url.match(simpleIconsPattern);
    
    if (!match) {
        return { valid: false, error: 'Invalid URL format' };
    }
    
    const [, iconName, color] = match;
    
    if (!COLOR_REGEX.test(color)) {
        return { valid: false, error: 'Invalid color format' };
    }
    
    return { valid: true, iconName, color };
}

// Function to check if icon exists on SimpleIcons CDN
function checkIconAvailability(iconName) {
    return new Promise((resolve) => {
        const url = `${SIMPLIICONS_CDN}${iconName}.svg`;
        const request = https.get(url, (response) => {
            resolve(response.statusCode === 200);
        });
        
        request.on('error', () => resolve(false));
        request.setTimeout(5000, () => {
            request.destroy();
            resolve(false);
        });
    });
}

// Function to generate correct icon URL
function generateCorrectIconUrl(toolName, currentColor) {
    // Convert tool name to simpleicons format (lowercase, alphanumeric only)
    let iconName = toolName.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');
    
    // Apply known mappings
    if (iconMappings[iconName]) {
        iconName = iconMappings[iconName];
    }
    
    // Special cases
    const specialCases = {
        'ChatGPT': 'openai',
        'Google Duet AI': 'google',
        'Google Stitch': 'google',
        'Character.AI': 'characterai',
        'Semantic Scholar': 'semanticscholar',
        'Adobe Firefly': 'adobe',
        'DALL-E 3': 'openai',
        'Sora': 'sora',
        'Stable Diffusion': 'stabilityai',
        'GitHub Copilot X': 'githubcopilot',
        'JMeter': 'apachejmeter',
        'Google Analytics': 'googleanalytics',
        'Freshdesk': 'freshworks',
        'Arc Browser': 'arc',
        'Figma Make': 'figma',
        'Microsoft Power Automate': 'microsoftpowerautomate',
        // Add more special cases as needed
    };
    
    if (specialCases[toolName]) {
        iconName = specialCases[toolName];
    }
    
    return `${SIMPLIICONS_URL_BASE}${iconName}/${currentColor.replace('#', '')}`;
}

// Main analysis function
async function analyzeIcons() {
    for (const tool of tools) {
        const validation = validateIconUrl(tool.icon_url);
        
        if (!validation.valid) {
            issues.invalidFormats.push({
                tool: tool.name,
                currentUrl: tool.icon_url,
                error: validation.error
            });
            continue;
        }
        
        // Check for URL name mismatches
        const expectedIconName = tool.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/\s+/g, '');
        
        if (validation.iconName !== expectedIconName && !iconMappings[validation.iconName]) {
            issues.urlNameMismatches.push({
                tool: tool.name,
                currentUrl: tool.icon_url,
                currentIconName: validation.iconName,
                expectedIconName,
                suggestedFix: generateCorrectIconUrl(tool.name, tool.color)
            });
        }
        
        // Check icon availability (sample check - we'll batch this)
        const isAvailable = await checkIconAvailability(validation.iconName);
        
        if (!isAvailable) {
            issues.unavailableIcons.push({
                tool: tool.name,
                currentUrl: tool.icon_url,
                iconName: validation.iconName,
                suggestedFix: generateCorrectIconUrl(tool.name, tool.color)
            });
        } else {
            issues.validIcons.push({
                tool: tool.name,
                url: tool.icon_url
            });
        }
    }
    
    // Generate report
    console.log('📊 ICON AUDIT REPORT\n');
    console.log(`Total Tools: ${issues.totalTools}`);
    console.log(`Valid Icons: ${issues.validIcons.length}`);
    console.log(`URL Name Mismatches: ${issues.urlNameMismatches.length}`);
    console.log(`Invalid Formats: ${issues.invalidFormats.length}`);
    console.log(`Unavailable Icons: ${issues.unavailableIcons.length}`);
    console.log(`Missing Icons: ${issues.missingIcons.length}`);
    
    console.log('\n🔧 DETAILED ISSUES\n');
    
    if (issues.urlNameMismatches.length > 0) {
        console.log('\n❌ URL NAME MISMATCHES:');
        issues.urlNameMismatches.forEach(issue => {
            console.log(`  ${issue.tool}:`);
            console.log(`    Current: ${issue.currentUrl}`);
            console.log(`    Expected: ${issue.suggestedFix}`);
        });
    }
    
    if (issues.invalidFormats.length > 0) {
        console.log('\n❌ INVALID FORMATS:');
        issues.invalidFormats.forEach(issue => {
            console.log(`  ${issue.tool}: ${issue.error}`);
            console.log(`    Current: ${issue.currentUrl}`);
        });
    }
    
    if (issues.unavailableIcons.length > 0) {
        console.log('\n❌ UNAVAILABLE ICONS:');
        issues.unavailableIcons.forEach(issue => {
            console.log(`  ${issue.tool}:`);
            console.log(`    Current: ${issue.currentUrl}`);
            console.log(`    Suggested: ${issue.suggestedFix}`);
        });
    }
    
    // Generate fix script
    generateFixScript();
}

// Generate fix script
function generateFixScript() {
    console.log('\n🛠️  GENERATING FIX SCRIPT...\n');
    
    const fixes = [];
    
    // Add fixes for URL name mismatches
    issues.urlNameMismatches.forEach(issue => {
        fixes.push({
            toolName: issue.tool,
            field: 'icon_url',
            oldValue: issue.currentUrl,
            newValue: issue.suggestedFix
        });
    });
    
    // Add fixes for invalid formats
    issues.invalidFormats.forEach(issue => {
        const tool = tools.find(t => t.name === issue.tool);
        if (tool) {
            fixes.push({
                toolName: issue.tool,
                field: 'icon_url',
                oldValue: issue.currentUrl,
                newValue: generateCorrectIconUrl(issue.tool, tool.color)
            });
        }
    });
    
    // Add fixes for unavailable icons
    issues.unavailableIcons.forEach(issue => {
        fixes.push({
            toolName: issue.tool,
            field: 'icon_url',
            oldValue: issue.currentUrl,
            newValue: issue.suggestedFix
        });
    });
    
    // Create the fix script
    const fixScript = `
// AI Tools Icon Fix Script
// Generated on: ${new Date().toISOString()}

const iconFixes = ${JSON.stringify(fixes, null, 2)};

// Convex mutation to update icons
export const fixIcons = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    let updatedCount = 0;
    
    for (const fix of iconFixes) {
      const tool = tools.find(t => t.name === fix.toolName);
      if (tool) {
        await ctx.db.patch(tool._id, {
          [fix.field]: fix.newValue
        });
        updatedCount++;
        console.log(\`Updated \${fix.toolName}: \${fix.oldValue} -> \${fix.newValue}\`);
      }
    }
    
    return { updatedCount, totalFixes: iconFixes.length };
  }
});

// Alternative: Update seed data directly
const updatedSeedData = tools.map(tool => {
  const fix = iconFixes.find(f => f.toolName === tool.name);
  if (fix) {
    return { ...tool, [fix.field]: fix.newValue };
  }
  return tool;
});

console.log(\`Icon fixes prepared: \${iconFixes.length} tools to update\`);
`;
    
    fs.writeFileSync(path.join(__dirname, 'icon-fixes.js'), fixScript);
    console.log(`✅ Fix script generated: icon-fixes.js`);
    console.log(`📊 Total fixes needed: ${fixes.length}`);
}

// Run the analysis
analyzeIcons().catch(console.error);