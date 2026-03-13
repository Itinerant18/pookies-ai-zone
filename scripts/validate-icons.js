#!/usr/bin/env node

/**
 * Icon Validator for AI Tools Directory
 * Validates that all icons are working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function loadCurrentTools() {
  try {
    const result = execSync('npx convex run tools:get', { encoding: 'utf8', cwd: '../frontend' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error loading tools from database:', error.message);
    process.exit(1);
  }
}

async function validateIcon(tool) {
  const https = require('https');
  
  if (!tool.icon_url) {
    // Check letter-based icons
    if (!tool.icon_letter) {
      return { valid: false, reason: 'No icon_url or icon_letter' };
    }
    return { valid: true, type: 'letter', reason: 'Letter-based icon' };
  }

  // Check SimpleIcons URLs
  if (!tool.icon_url.includes('cdn.simpleicons.org')) {
    return { valid: false, reason: 'Non-SimpleIcons URL' };
  }

  try {
    const response = await https.get(tool.icon_url);
    if (response.statusCode !== 200) {
      return { valid: false, reason: `HTTP ${response.statusCode}` };
    }
    
    // Check content type to ensure it's an SVG
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('image/svg')) {
      return { valid: false, reason: 'Not SVG content' };
    }
    
    return { valid: true, type: 'simpleicons', reason: 'SimpleIcons working' };
  } catch (error) {
    return { valid: false, reason: `Network error: ${error.message}` };
  }
}

async function main() {
  console.log('🔍 Validating all 293 tool icons...');
  
  const tools = await loadCurrentTools();
  const results = {
    total: tools.length,
    valid: 0,
    invalid: 0,
    brokenByCategory: {},
    brokenByReason: {},
    details: []
  };

  console.log('Checking each tool icon...');

  for (const tool of tools) {
    const validation = await validateIcon(tool);
    
    if (validation.valid) {
      results.valid++;
    } else {
      results.invalid++;
      
      // Track by category
      results.brokenByCategory[tool.category] = (results.brokenByCategory[tool.category] || 0) + 1;
      
      // Track by reason
      results.brokenByReason[validation.reason] = (results.brokenByReason[validation.reason] || 0) + 1;
      
      results.details.push({
        toolName: tool.name,
        category: tool.category,
        url: tool.icon_url,
        issue: validation.reason,
        type: validation.type
      });
    }
    
    // Progress indicator
    if ((results.valid + results.invalid) % 20 === 0) {
      console.log(`Progress: ${results.valid + results.invalid}/${tools.length} (${((results.valid + results.invalid) / tools.length * 100).toFixed(1)}%)`);
    }
  }

  console.log('\n📊 VALIDATION RESULTS:');
  console.log(`✅ Valid icons: ${results.valid}`);
  console.log(`❌ Invalid icons: ${results.invalid}`);
  console.log(`📈 Success rate: ${((results.valid / tools.length) * 100).toFixed(1)}%`);

  console.log('\n📈 BROKEN BY CATEGORY:');
  Object.entries(results.brokenByCategory)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} tools`);
    });

  console.log('\n🔧 BROKEN BY REASON:');
  Object.entries(results.brokenByReason)
    .sort(([,a], [,b]) => b - a)
    .forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count} tools`);
    });

  if (results.invalid > 0) {
    console.log('\n🔧 FIRST 10 BROKEN ICONS:');
    results.details
      .filter(detail => !detail.toolName.toLowerCase().includes('test'))
      .slice(0, 10)
      .forEach(detail => {
        console.log(`  ❌ ${detail.toolName} (${detail.category}): ${detail.issue}`);
        console.log(`     URL: ${detail.url}`);
      });
  }

  // Save detailed report
  fs.writeFileSync('./icon-data/validation-report.json', JSON.stringify({
    ...results,
    timestamp: new Date().toISOString(),
    details: results.details.slice(0, 50) // Save first 50 broken ones
  }, null, 2));

  console.log('\n💾 Detailed report saved to icon-data/validation-report.json');
  
  return results;
}

// Command handling
const args = process.argv.slice(2);
const command = args[0];

if (command === '--check') {
  main().then(results => {
    if (results.invalid === 0) {
      console.log('\n🎉 ALL ICONS ARE VALID!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${results.invalid} icons need attention`);
      process.exit(1);
    }
  }).catch(console.error);
} else if (command === '--summary') {
  loadCurrentTools().then(tools => {
    const validCount = tools.filter(t => t.icon_url && t.icon_url.includes('cdn.simpleicons.org')).length;
    const letterCount = tools.filter(t => !t.icon_url || t.icon_url.includes('cdn.simpleicons.org')).length;
    
    console.log(`📊 QUICK SUMMARY:`);
    console.log(`  Total tools: ${tools.length}`);
    console.log(`  SimpleIcons: ${validCount}`);
    console.log(`  Letter icons: ${letterCount}`);
    console.log(`  Estimated issues: ${tools.length - validCount}`);
  });
} else {
  console.log('Usage:');
  console.log('  npm run validate:icons --check     # Full validation of all icons');
  console.log('  npm run validate:icons --summary   # Quick summary of icon status');
}