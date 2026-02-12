#!/usr/bin/env node

/**
 * Icon Fix Script for AI Tools Directory
 * Fixes all 293 tools with proper icons
 */

const fs = require('fs');
const path = require('path');

// Load icon mappings
const iconMappings = JSON.parse(fs.readFileSync('./icon-data/icon-mapping.json', 'utf8'));

// Load current tools from database
async function loadCurrentTools() {
  const { execSync } = require('child_process');
  try {
    const result = execSync('npx convex run tools:get', { encoding: 'utf8', cwd: '../frontend' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error loading tools from database:', error.message);
    process.exit(1);
  }
}

// Check if icon exists on SimpleIcons CDN
async function checkIconExists(iconName) {
  const https = require('https');
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${iconName}.svg`;
  
  try {
    const response = await https.get(url);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
}

// Generate proper icon URL
function generateIconUrl(toolName, iconMapping, color) {
  if (iconMapping.corrections[toolName]) {
    // Use corrected icon name
    return `https://cdn.simpleicons.org/${iconMapping.corrections[toolName]}/${color}`;
  } else if (iconMapping.fallbacks && iconMapping.fallbacks[toolName]) {
    // Use letter fallback
    const fallback = iconMapping.fallbacks[toolName];
    return null; // Will be handled as letter icon
  } else {
    // Default: clean tool name for SimpleIcons
    const cleanName = toolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '')
      .replace('ai', '')
      .replace('inc', '')
      .replace('.com', '')
      .replace('llc', '')
      .replace('ai', '');
    return `https://cdn.simpleicons.org/${cleanName}/${color}`;
  }
}

// Main execution function
async function main() {
  console.log('🎯 Loading current tools from database...');
  const tools = await loadCurrentTools();
  console.log(`✅ Loaded ${tools.length} tools`);

  let fixes = [];
  let validationResults = [];

  console.log('🔍 Analyzing icon issues...');
  
  for (const tool of tools) {
    const toolName = tool.name;
    const currentIconUrl = tool.icon_url || '';
    const color = tool.color;
    
    // Determine fix strategy
    let fixStrategy = 'none';
    let newIconUrl = currentIconUrl;
    let iconLetter = tool.icon_letter;

    if (currentIconUrl.includes('simpleicons.org')) {
      // Check for URL name mismatch
      const urlParts = currentIconUrl.split('/');
      if (urlParts.length >= 3) {
        const urlIconName = urlParts[3].toLowerCase();
        const expectedName = urlIconName;
        const actualCleanName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (expectedName !== actualCleanName && iconMappings.corrections[toolName]) {
          fixStrategy = 'url_correction';
          newIconUrl = generateIconUrl(toolName, iconMappings, color);
        }
      }
    }

    // Check if icon needs fallback (unavailable on CDN)
    if (fixStrategy === 'none' || !newIconUrl) {
      const cleanName = toolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace('ai', '')
        .replace('inc', '')
        .replace('.com', '')
        .replace('llc', '')
        .replace(/[^a-z0-9]/g, '');

      const iconExists = await checkIconExists(cleanName);
      
      if (!iconExists || iconMappings.fallbacks[toolName]) {
        fixStrategy = 'letter_fallback';
        newIconUrl = null;
        iconLetter = tool.icon_letter || tool.name.charAt(0).toUpperCase();
      }
    }

    // Record the fix if needed
    if (fixStrategy !== 'none' || iconLetter !== tool.icon_letter) {
      fixes.push({
        toolId: tool._id,
        toolName: toolName,
        strategy: fixStrategy,
        oldIconUrl: currentIconUrl,
        newIconUrl: newIconUrl,
        iconLetter: iconLetter,
        category: tool.category,
        color: color
      });
    }
  }

  console.log(`\n📊 Analysis Results:`);
  console.log(`  Tools analyzed: ${tools.length}`);
  console.log(`  Tools needing fixes: ${fixes.length}`);
  console.log(`  Strategies applied:`);

  const strategyCounts = {};
  fixes.forEach(fix => {
    strategyCounts[fix.strategy] = (strategyCounts[fix.strategy] || 0) + 1;
  });

  Object.entries(strategyCounts).forEach(([strategy, count]) => {
    console.log(`    ${strategy}: ${count} tools`);
  });

  // Save fixes to file for review
  fs.writeFileSync('./icon-data/icon-fixes.json', JSON.stringify(fixes, null, 2));
  console.log('\n💾 Saved fixes to icon-data/icon-fixes.json');

  // Generate Convex mutation updates
  const convexUpdates = fixes.map(fix => ({
    id: fix.toolId,
    icon_url: fix.newIconUrl,
    icon_letter: fix.iconLetter
  })).filter(update => update.newIconUrl || update.icon_letter);

  console.log(`\n🔄 Generated ${convexUpdates.length} Convex updates`);

  // Save to file for Convex import
  fs.writeFileSync('./icon-data/convex-updates.json', JSON.stringify(convexUpdates, null, 2));
  console.log('💾 Saved Convex updates to icon-data/convex-updates.json');

  return {
    totalTools: tools.length,
    fixesNeeded: fixes.length,
    convexUpdates: convexUpdates.length,
    strategyCounts
  };
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === '--validate') {
  console.log('🔍 Validation mode - checking icon availability...');
  main().then(results => {
    console.log('\n✅ Validation complete!');
    console.log('🚀 Ready to run: npm run fix:icons --execute');
  }).catch(console.error);
} else if (command === '--execute') {
  console.log('🚀 Execution mode - applying fixes...');
  main().then(results => {
    console.log('\n✅ Icon fixes generated!');
    console.log('📋 Next steps:');
    console.log('1. Review: icon-data/icon-fixes.json');
    console.log('2. Deploy: npx convex import icon-data/convex-updates.json');
    console.log('3. Verify: npm run validate:icons');
  }).catch(console.error);
} else {
  console.log('Usage:');
  console.log('  npm run fix:icons --validate  # Validate icon availability');
  console.log('  npm run fix:icons --execute   # Generate and apply fixes');
}