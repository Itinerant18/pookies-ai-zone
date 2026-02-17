
// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ NODE.JS VERSION - SAVE AS fix-tools.js AND RUN: node fix-tools.js ⚡
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');

// STEP 1: SAVE YOUR JSON TO A FILE NAMED "tools.json" IN THE SAME FOLDER

// Icon mappings (292 AI tools)
const ICONS = {
  kaedim: 'threedotjs', meshy: 'threedotjs', spline: 'threejs', autify: 'testinglibrary',
  bruno: 'bruno', functionize: 'jest', hoppscotch: 'hoppscotch', jmeter: 'apachejmeter',
  postman: 'postman', qawolf: 'jest', soapui: 'soap', amplitude: 'amplitude',
  googleanalytics: 'googleanalytics', mixpanel: 'mixpanel', askcodi: 'codecov',
  chefbyconvex: 'chef', coderabbit: 'githubactions', devin: 'dev.to',
  githubcopilot: 'githubcopilot', googleduetai: 'google', googlestitch: 'google',
  greptile: 'grep', jules: 'julia', kiro: 'kibana', manus: 'man', memex: 'memcached',
  mindstudio: 'minds', mocha: 'mocha', pantoai: 'pantone', pythagora: 'python',
  sourceryai: 'sourcetree', workik: 'workplace', activepieces: 'activecampaign',
  clockwise: 'clock', fellow: 'fellowship', make: 'make', pabblyconnect: 'packagist',
  powerautomate: 'microsoftpowerautomate', shortwave: 'shortwave', n8n: 'n8n',
  automationanywhere: 'robotframework', axiom: 'axiom', inflection: 'inflection',
  lasso: 'lasso', salesforceeinstein: 'salesforce', zapier: 'zapier', arc: 'arcbrowser',
  brave: 'brave', diabrowser: 'dia', perplexitycomet: 'perplexity', sigmaaibrowser: 'sigma',
  freshdesk: 'freshdesk', hubspot: 'hubspot', intercom: 'intercom', plain: 'plain',
  salesforce: 'salesforce', zendesk: 'zendesk', zohocrm: 'zoho', characterai: 'characterai',
  chatgpt: 'openai', copilot: 'microsoftcopilot', poe: 'poe', replika: 'replika',
  youcom: 'you', adobefirefly: 'adobe', artafact: 'artifactregistry', canvaai: 'canva',
  dalle3: 'openai', descript: 'descript', illustrateai: 'illustrator', lumaai: 'lumen',
  midjourney: 'midjourney', photoroom: 'photon', photon: 'photon', runway: 'runwayml',
  sora: 'openai', stablediffusion: 'stabilityai', suno: 'sun', udio: 'udacity',
  alation: 'ala', anaplan: 'anaplan', askai: 'ask', datarobot: 'datarobot',
  looker: 'looker', thoughtspot: 'thoughtspot', trifacta: 'trifacta', voiceql: 'voice',
  blazesql: 'blazemeter', camelai: 'apachecamel', consensus: 'consensus', juliusai: 'julia',
  scholarcy: 'scholar', semanticscholar: 'semanticweb', firebase: 'firebase', neon: 'neon',
  railway: 'railway', supabase: 'supabase', turso: 'turso', digitalocean: 'digitalocean',
  netlify: 'netlify', render: 'render', vercel: 'vercel', anima: 'anima',
  beautifulai: 'beautifulsoup', canva: 'canva', codeparrot: 'codecov', codiaai: 'codio',
  emergent: 'emergency', figmamake: 'figma', kromio: 'kroma', leonardoai: 'leonardo',
  pitch: 'pitch', rork: 'r', tiledev: 'tile', visme: 'visme', v0: 'v', commitgen: 'commitlint',
  dataherald: 'datagrip', githubcopilotx: 'github', mabl: 'mabl', repair: 'repair',
  snykcode: 'snyk', sourcegraphcody: 'sourcegraph', stoplight: 'stoplight', swimm: 'swim',
  tabnine: 'tabnine', chatpdf: 'chat', humataai: 'humane', knolli: 'knowledgebase',
  pdfai: 'pdf', updfai: 'up', bigcommerce: 'bigcommerce', shopify: 'shopify',
  wixecommerce: 'wix', antigravity: 'antigravity', atoms: 'atom', base44: 'base',
  codegeex: 'codegeex', continuedev: 'confluence', cursor: 'cursor', fleet: 'fleet',
  jetbrainsai: 'jetbrains', kilocode: 'kibana', playcode: 'play', qoder: 'qodana',
  trae: 'travis', void: 'void', windsurf: 'wind', zed: 'zedindustries', bench: 'bench',
  wealthfront: 'wealthfront', jotform: 'jotform', tally: 'tally', typeform: 'typeform',
  greenhouse: 'greenhouse', lever: 'lever', myfitnesspal: 'myfitnesspal', wysa: 'wysa',
  ideogram: 'ide', imagen: 'google', nightcafe: 'night', artificialsolutions: 'artificialintelligence',
  ayasdi: 'ayasdi', casetext: 'case', deepmindalphafold: 'deepmind', fourkite: 'four',
  ironclad: 'iron', paradox: 'paradox', pathai: 'path', zesty: 'zesty', zillowai: 'zillow',
  amazonq: 'aws', claude: 'anthropic', claudehaiku: 'anthropic', deepseek: 'deepseek',
  gpt4: 'openai', gpt4o: 'openai', gemini: 'google', grok: 'xai', jurassic: 'jurassic',
  llama: 'meta', microsoftcopilot: 'microsoft', mistral: 'mistralai', perplexity: 'perplexity',
  qwen: 'alibabacloud', stablelm: 'stabilityai', coursera: 'coursera', duolingo: 'duolingo',
  khanacademy: 'khanacademy', udemy: 'udemy', lexion: 'lexicon', adcreativeai: 'adcreative',
  gong: 'gong', hootsuite: 'hootsuite', intercomfin: 'intercom', jasper: 'jasper',
  klaviyo: 'klaviyo', marketmuse: 'marketmuse', phantombuster: 'phantom', surferseo: 'surfer',
  vidiq: 'vidiq', arizeai: 'arize', datadog: 'datadog', grafana: 'grafana',
  montecarlo: 'montecarlo', newrelic: 'newrelic', aiva: 'aiva', boomy: 'boomy',
  elevenlabs: 'eleven', lovo: 'lovo', mureka: 'mureka', murf: 'murf', soundraw: 'soundraw',
  logseq: 'logseq', mem: 'mem', notion: 'notion', obsidian: 'obsidian', roamresearch: 'roamresearch',
  tana: 'tana', documize: 'documize', firefliesai: 'fireflies', gamma: 'gamma',
  grammarly: 'grammarly', motion: 'motion', notionai: 'notion', otterai: 'otter',
  reclaimai: 'reclaim', rowzero: 'row', superhuman: 'superhuman', anki: 'anki',
  cheggai: 'chegg', courseraai: 'coursera', elicit: 'elicit', guru: 'guru', kimi: 'kimi',
  scite: 'scite', apigee: 'googlecloud', snyk: 'snyk', sonarqube: 'sonarqube',
  checkmarx: 'checkmarx', crowdstrike: 'crowdstrike', onfido: 'onfido',
  sentinelone: 'sentinel', veriff: 'veriff', buffer: 'buffer', later: 'later',
  socialpilot: 'socialpilot', googlesheetsai: 'googlesheets', quadratic: 'quadratic',
  rows: 'rows', asana: 'asana', clickup: 'clickup', mondaycom: 'monday',
  notionprojects: 'notion', trello: 'trello', amazontranslate: 'amazon', deepl: 'deepl',
  googletranslate: 'googletranslate', laratranslate: 'lara', microsofttranslator: 'microsofttranslator',
  capcut: 'capcut', did: 'did', heygen: 'hey', klingai: 'kling', lumadreammachine: 'luma',
  pikalabs: 'pika', synthesia: 'synthesia', veo: 'google', a0: 'a', appgen: 'appgen',
  blinknew: 'blink', boltdiy: 'bolt', boltnew: 'bolt', dyad: 'dyad', firebasestudio: 'firebase',
  flutterflow: 'flutterflow', lovable: 'lovable', meku: 'meku', replit: 'replit',
  softr: 'softr', taskadegenesis: 'taskade', weweb: 'weweb', anyword: 'anyword',
  clearscope: 'clearscope', copyai: 'copyai', frase: 'frase', ink: 'ink', quillbot: 'quillbot',
  rytr: 'rytr', writer: 'writer', writesonic: 'writesonic'
};

function fixIcon(tool) {
  const key = tool.name.toLowerCase().replace(/[ .-]/g, '');
  const c = tool.color.replace('#', '');
  if (ICONS[key]) return `https://cdn.simpleicons.org/${ICONS[key]}/${c}`;
  const d = tool.url.replace(/^https?:\/\//, '').split('/')[0];
  return `https://www.google.com/s2/favicons?domain=${d}&sz=128`;
}

// Read, fix, and save
const tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));
tools.forEach(t => t.icon_url = fixIcon(t));
fs.writeFileSync('tools_fixed.json', JSON.stringify(tools, null, 2));
console.log(`✅ Fixed ${tools.length} tools! Saved to tools_fixed.json`);
