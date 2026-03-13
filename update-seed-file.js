const fs = require('fs');
const path = require('path');

const JSON_FILE = 'tools-data.json';
const TS_FILE = path.join('frontend', 'data', 'seedData.ts');

try {
    console.log(`Reading ${JSON_FILE}...`);
    const tools = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

    const tsContent = `export const TOOLS_DATA = ${JSON.stringify(tools, null, 4)};\n`;

    console.log(`Writing to ${TS_FILE}...`);
    fs.writeFileSync(TS_FILE, tsContent);

    console.log('✅ Updated seedData.ts successfully!');
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
