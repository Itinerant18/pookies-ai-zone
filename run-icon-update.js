const fs = require('fs');
const path = require('path');
const { updateToolsJson } = require('./tool_icon_updater');

const TOOLS_FILE = 'tools-data.json';
const OUTPUT_FILE = 'tools-data.json'; // Overwrite the original

try {
    console.log(`Reading from ${TOOLS_FILE}...`);
    const rawData = fs.readFileSync(TOOLS_FILE, 'utf8');
    const tools = JSON.parse(rawData);

    console.log(`Found ${tools.length} tools. Updating icons...`);
    const updatedTools = updateToolsJson(tools);

    console.log(`Writing to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedTools, null, 2));

    console.log('✅ Successfully updated tool icons!');
} catch (error) {
    console.error('❌ Error updating tools:', error);
    process.exit(1);
}
