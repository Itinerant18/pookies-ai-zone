/**
 * Tool Data Enrichment Script
 * 
 * This script adds comparison data to tools based on:
 * 1. Keywords in tool name and description
 * 2. Known patterns for different tool categories
 * 3. Common features of popular AI tools
 * 
 * Run with: node enrich-tool-data.js
 */

const fs = require('fs');
const path = require('path');

// Known pricing patterns by category
const CATEGORY_PRICING = {
    'LLMs & Chatbots': { model: 'freemium', free_tier: true, starting_price: 20 },
    'Image Generation': { model: 'paid', free_tier: true, starting_price: 15 },
    'Video Generation': { model: 'paid', free_tier: true, starting_price: 30 },
    'Code Assistants': { model: 'freemium', free_tier: true, starting_price: 10 },
    'Automation & Productivity': { model: 'freemium', free_tier: true, starting_price: 20 },
    'Web & App Builders': { model: 'freemium', free_tier: true, starting_price: 0 },
    'Database & Backend': { model: 'freemium', free_tier: true, starting_price: 0 },
    'Deployment & Hosting': { model: 'freemium', free_tier: true, starting_price: 5 },
    'Design & UI': { model: 'freemium', free_tier: true, starting_price: 12 },
    'Marketing & Sales': { model: 'freemium', free_tier: true, starting_price: 29 },
    'Productivity & Office': { model: 'freemium', free_tier: true, starting_price: 12 },
    'Analytics': { model: 'freemium', free_tier: true, starting_price: 0 },
    'Default': { model: 'freemium', free_tier: true, starting_price: 0 }
};

// Known platforms by category
const CATEGORY_PLATFORMS = {
    'LLMs & Chatbots': { web: true, api: true },
    'Code Assistants': { web: true, api: true, vscode: true },
    'Image Generation': { web: true, api: true },
    'Video Generation': { web: true, api: true },
    'Web & App Builders': { web: true },
    'Database & Backend': { web: true, api: true, self_hosted: true },
    'Automation & Productivity': { web: true, api: true },
    'Default': { web: true }
};

// Feature keywords mapping
const FEATURE_KEYWORDS = {
    ai_text: ['text', 'write', 'content', 'copy', 'article', 'blog', '文案'],
    ai_image: ['image', 'photo', 'picture', 'art', 'design', 'visual', '生成', 'artwork'],
    ai_video: ['video', 'animation', 'motion', 'clip', ' footage'],
    ai_code: ['code', 'developer', 'programming', 'coding', 'debug', '写代码'],
    ai_audio: ['audio', 'voice', 'speech', 'music', 'sound', 'tts'],
    api_access: ['api', 'integration', 'webhook', 'rest'],
    webhooks: ['webhook', 'automation', 'trigger', 'zapier'],
    sso: ['sso', 'enterprise', 'security', 'auth', '登录'],
    team_collaboration: ['team', 'collaboration', 'shared', 'workspace', 'collaborate'],
    custom_branding: ['branding', 'white-label', 'custom', 'brand'],
    export_pdf: ['pdf', 'export', 'download', 'document'],
    export_csv: ['csv', 'export', 'data', 'spreadsheet']
};

// Use case keywords
const USECASE_KEYWORDS = {
    beginners: ['easy', 'simple', 'beginner', 'no-code', 'nocode', 'quick'],
    developers: ['developer', 'code', 'programmer', 'engineer', 'dev'],
    enterprise: ['enterprise', 'business', 'team', 'company', 'organization'],
    startups: ['startup', 'small business', 'sme', 'founder'],
    designers: ['design', 'designer', 'creative', 'ui', 'ux'],
    marketers: ['marketing', 'seo', 'content', 'social media'],
    researchers: ['research', 'academic', 'paper', 'study', 'science']
};

function getCategoryPricing(category) {
    return CATEGORY_PRICING[category] || CATEGORY_PRICING['Default'];
}

function getCategoryPlatforms(category) {
    return CATEGORY_PLATFORMS[category] || CATEGORY_PLATFORMS['Default'];
}

function detectFeatures(text) {
    const textLower = text.toLowerCase();
    const features = {};

    for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
        features[feature] = keywords.some(kw => textLower.includes(kw));
    }

    return features;
}

function detectUseCases(text) {
    const textLower = text.toLowerCase();
    const useCases = [];

    for (const [useCase, keywords] of Object.entries(USECASE_KEYWORDS)) {
        if (keywords.some(kw => textLower.includes(kw))) {
            useCases.push(useCase);
        }
    }

    return useCases.length > 0 ? useCases : ['general'];
}

function detectDifficulty(text, category) {
    const textLower = text.toLowerCase();

    // Easy indicators
    if (textLower.includes('easy') || textLower.includes('simple') ||
        textLower.includes('no-code') || textLower.includes('beginner') ||
        textLower.includes('quick') || textLower.includes('instant')) {
        return 1;
    }

    // Medium indicators  
    if (textLower.includes('advanced') || textLower.includes('pro') ||
        textLower.includes('powerful') || textLower.includes('flexible')) {
        return 3;
    }

    // Hard indicators
    if (textLower.includes('developer') || textLower.includes('api') ||
        textLower.includes('code') || textLower.includes('technical')) {
        return 4;
    }

    // Default based on category
    if (category.includes('Dev') || category.includes('Database') ||
        category.includes('API')) {
        return 4;
    }

    return 2; // Default to easy-medium
}

// Main enrichment function
function enrichToolData(inputFile, outputFile) {
    console.log('📊 Enriching tool data...\n');

    // Read the seed data
    const seedDataPath = path.join(__dirname, 'frontend', 'data', 'seedData.ts');
    let content = fs.readFileSync(seedDataPath, 'utf8');

    // Extract the TOOLS_DATA array
    const match = content.match(/export const TOOLS_DATA = \[([\s\S]*?)\];/);
    if (!match) {
        console.error('❌ Could not find TOOLS_DATA in seedData.ts');
        return;
    }

    // Parse each tool entry
    const toolMatches = match[1].matchAll(/\{([^}]+)\}/g);
    const enrichedTools = [];

    for (const toolMatch of toolMatches) {
        const toolStr = '{' + toolMatch[1] + '}';

        // Extract basic fields using regex
        const nameMatch = toolStr.match(/"name":\s*"([^"]+)"/);
        const descMatch = toolStr.match(/"description":\s*"([^"]+)"/);
        const catMatch = toolStr.match(/"category":\s*"([^"]+)"/);
        const urlMatch = toolStr.match(/"url":\s*"([^"]+)"/);
        const colorMatch = toolStr.match(/"color":\s*"([^"]+)"/);
        const featuredMatch = toolStr.match(/"featured":\s*(true|false)/);
        const iconLetterMatch = toolStr.match(/"icon_letter":\s*"([^"]+)"/);
        const iconUrlMatch = toolStr.match(/"icon_url":\s*"([^"]+)"/);

        if (!nameMatch) continue;

        const name = nameMatch[1];
        const description = descMatch ? descMatch[1] : '';
        const category = catMatch ? catMatch[1] : 'Other';
        const url = urlMatch ? urlMatch[1] : '';
        const color = colorMatch ? colorMatch[1] : '#6366F1';
        const featured = featuredMatch ? featuredMatch[1] === 'true' : false;
        const iconLetter = iconLetterMatch ? iconLetterMatch[1] : name[0].toUpperCase();
        const iconUrl = iconUrlMatch ? iconUrlMatch[1] : '';

        // Combine name and description for analysis
        const analysisText = `${name} ${description}`;

        // Generate comparison data
        const pricing = getCategoryPricing(category);
        const platforms = getCategoryPlatforms(category);
        const features = detectFeatures(analysisText);
        const use_cases = detectUseCases(analysisText);
        const difficulty = detectDifficulty(analysisText, category);

        // Check for specific tools we know about
        // Open Source tools
        if (name.toLowerCase().includes('open') || name.toLowerCase().includes('source') ||
            ['Supabase', 'PostgreSQL', 'n8n', 'Hoppscotch', 'Ollama', 'Llama'].includes(name)) {
            pricing.model = 'open-source';
            pricing.free_tier = true;
            pricing.starting_price = 0;
            platforms.self_hosted = true;
        }

        // Free tools
        if (name.toLowerCase().includes('free') || description.toLowerCase().includes('free')) {
            pricing.model = 'free';
            pricing.free_tier = true;
            pricing.starting_price = 0;
        }

        // Enterprise tools
        if (description.toLowerCase().includes('enterprise') || description.toLowerCase().includes('business')) {
            pricing.model = 'enterprise';
            pricing.custom_pricing = true;
            pricing.starting_price = undefined;
            platforms.web = true;
        }

        // Mobile apps
        if (description.toLowerCase().includes('ios') || description.toLowerCase().includes('android') ||
            description.toLowerCase().includes('mobile app')) {
            platforms.ios = true;
            platforms.android = true;
        }

        enrichedTools.push({
            name,
            description,
            category,
            url,
            color,
            featured,
            icon_letter: iconLetter,
            icon_url: iconUrl,
            comparison_data: {
                pricing,
                platforms,
                features,
                use_cases,
                difficulty
            }
        });
    }

    console.log(`✅ Enriched ${enrichedTools.length} tools\n`);

    // Generate the new seed file content
    let newContent = `// Auto-generated enriched seed data\nexport const TOOLS_DATA = [\n`;

    for (const tool of enrichedTools) {
        newContent += `    {\n`;
        newContent += `        name: "${tool.name}",\n`;
        newContent += `        description: "${tool.description}",\n`;
        newContent += `        category: "${tool.category}",\n`;
        newContent += `        url: "${tool.url}",\n`;
        newContent += `        color: "${tool.color}",\n`;
        newContent += `        featured: ${tool.featured},\n`;
        newContent += `        icon_letter: "${tool.icon_letter}",\n`;
        newContent += `        icon_url: "${tool.icon_url}",\n`;
        newContent += `        comparison_data: {\n`;
        newContent += `            pricing: {\n`;
        newContent += `                model: "${tool.comparison_data.pricing.model}",\n`;
        newContent += `                free_tier: ${tool.comparison_data.pricing.free_tier},\n`;
        if (tool.comparison_data.pricing.starting_price !== undefined) {
            newContent += `                starting_price: ${tool.comparison_data.pricing.starting_price},\n`;
        }
        newContent += `            },\n`;
        newContent += `            platforms: {\n`;
        for (const [platform, supported] of Object.entries(tool.comparison_data.platforms)) {
            newContent += `                ${platform}: ${supported},\n`;
        }
        newContent += `            },\n`;
        newContent += `            features: {\n`;
        for (const [feature, supported] of Object.entries(tool.comparison_data.features)) {
            newContent += `                ${feature}: ${supported},\n`;
        }
        newContent += `            },\n`;
        newContent += `            use_cases: [${tool.comparison_data.use_cases.map(u => `"${u}"`).join(', ')}],\n`;
        newContent += `            difficulty: ${tool.comparison_data.difficulty},\n`;
        newContent += `        },\n`;
        newContent += `    },\n`;
    }

    newContent += `];\n`;

    // Write to output file
    fs.writeFileSync(outputFile, newContent);
    console.log(`📁 Enriched data saved to: ${outputFile}`);
    console.log('\n✨ Data enrichment complete!');
    console.log('\nTo use this data:');
    console.log('1. Copy the content from enriched-seed-data.ts');
    console.log('2. Replace TOOLS_DATA in frontend/data/seedData.ts');
    console.log('3. Rebuild the app');
}

// Run if executed directly
if (require.main === module) {
    const outputPath = path.join(__dirname, 'enriched-seed-data.ts');
    enrichToolData(null, outputPath);
}

module.exports = { enrichToolData };
