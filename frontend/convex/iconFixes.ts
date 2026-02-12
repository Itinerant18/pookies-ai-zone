import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Comprehensive icon fixes based on audit results
const ICON_FIXES = [
  // URL Name Mismatches - Fixed icon names
  { toolName: "Panto AI", oldUrl: "https://cdn.simpleicons.org/panto/EF4444", newUrl: "https://cdn.simpleicons.org/pantoai/EF4444" },
  { toolName: "Sourcery AI", oldUrl: "https://cdn.simpleicons.org/sourcery/3B82F6", newUrl: "https://cdn.simpleicons.org/sourceryai/3B82F6" },
  { toolName: "Pabbly Connect", oldUrl: "https://cdn.simpleicons.org/pabbly/00A4EF", newUrl: "https://cdn.simpleicons.org/pabblyconnect/00A4EF" },
  { toolName: "Make.com", oldUrl: "https://cdn.simpleicons.org/make/6366F1", newUrl: "https://cdn.simpleicons.org/makecom/6366F1" },
  { toolName: "Salesforce Einstein", oldUrl: "https://cdn.simpleicons.org/salesforce/8B5CF6", newUrl: "https://cdn.simpleicons.org/salesforceeinstein/8B5CF6" },
  { toolName: "Dia Browser", oldUrl: "https://cdn.simpleicons.org/dia/FF6B35", newUrl: "https://cdn.simpleicons.org/diabrowser/FF6B35" },
  { toolName: "Perplexity Comet", oldUrl: "https://cdn.simpleicons.org/perplexity/2088FF", newUrl: "https://cdn.simpleicons.org/perplexitycomet/2088FF" },
  { toolName: "Sigma AI Browser", oldUrl: "https://cdn.simpleicons.org/sigma/6366F1", newUrl: "https://cdn.simpleicons.org/sigmaaibrowser/6366F1" },
  { toolName: "Zoho CRM", oldUrl: "https://cdn.simpleicons.org/zoho/E42527", newUrl: "https://cdn.simpleicons.org/zohocrm/E42527" },
  { toolName: "You.com", oldUrl: "https://cdn.simpleicons.org/you/FF6B35", newUrl: "https://cdn.simpleicons.org/youcom/FF6B35" },
  { toolName: "Artafact", oldUrl: "https://cdn.simpleicons.org/artefactor/F97316", newUrl: "https://cdn.simpleicons.org/artafact/F97316" },
  { toolName: "Canva AI", oldUrl: "https://cdn.simpleicons.org/canva/F59E0B", newUrl: "https://cdn.simpleicons.org/canvaai/F59E0B" },
  { toolName: "Luma AI", oldUrl: "https://cdn.simpleicons.org/luma/3B82F6", newUrl: "https://cdn.simpleicons.org/lumaai/3B82F6" },
  { toolName: "Ask AI", oldUrl: "https://cdn.simpleicons.org/askui/8B5CF6", newUrl: "https://cdn.simpleicons.org/askai/8B5CF6" },
  { toolName: "Julius AI", oldUrl: "https://cdn.simpleicons.org/julius/F59E0B", newUrl: "https://cdn.simpleicons.org/juliusai/F59E0B" },
  { toolName: "Dataherald", oldUrl: "https://cdn.simpleicons.org/ddlc/8B5CF6", newUrl: "https://cdn.simpleicons.org/dataherald/8B5CF6" },
  { toolName: "GitHub Copilot X", oldUrl: "https://cdn.simpleicons.org/github/6366F1", newUrl: "https://cdn.simpleicons.org/githubcopilot/6366F1" },
  { toolName: "Snyk Code", oldUrl: "https://cdn.simpleicons.org/snyk/F97316", newUrl: "https://cdn.simpleicons.org/snykcode/F97316" },
  { toolName: "Sourcegraph Cody", oldUrl: "https://cdn.simpleicons.org/sourcegraph/22C55E", newUrl: "https://cdn.simpleicons.org/sourcegraphcody/22C55E" },
  { toolName: "Humata AI", oldUrl: "https://cdn.simpleicons.org/humata/10B981", newUrl: "https://cdn.simpleicons.org/humataai/10B981" },
  { toolName: "UPDF AI", oldUrl: "https://cdn.simpleicons.org/updf/EC4899", newUrl: "https://cdn.simpleicons.org/updfai/EC4899" },
  { toolName: "Wix eCommerce", oldUrl: "https://cdn.simpleicons.org/wix/F7A600", newUrl: "https://cdn.simpleicons.org/wixecommerce/F7A600" },
  { toolName: "JetBrains AI", oldUrl: "https://cdn.simpleicons.org/jetbrains/F97316", newUrl: "https://cdn.simpleicons.org/jetbrainsai/F97316" },
  { toolName: "Imagen", oldUrl: "https://cdn.simpleicons.org/google/6366F1", newUrl: "https://cdn.simpleicons.org/imagen/6366F1" },
  { toolName: "DeepMind AlphaFold", oldUrl: "https://cdn.simpleicons.org/deepmind/3B82F6", newUrl: "https://cdn.simpleicons.org/deepmindalphafold/3B82F6" },
  { toolName: "Zillow AI", oldUrl: "https://cdn.simpleicons.org/zillow/F97316", newUrl: "https://cdn.simpleicons.org/zillowai/F97316" },
  { toolName: "Amazon Q", oldUrl: "https://cdn.simpleicons.org/aws/3B82F6", newUrl: "https://cdn.simpleicons.org/amazonq/3B82F6" },
  { toolName: "Claude", oldUrl: "https://cdn.simpleicons.org/anthropic/FF6D00", newUrl: "https://cdn.simpleicons.org/claude/FF6D00" },
  { toolName: "Claude Haiku", oldUrl: "https://cdn.simpleicons.org/anthropic/14B8A6", newUrl: "https://cdn.simpleicons.org/claudehaiku/14B8A6" },
  { toolName: "Gemini", oldUrl: "https://cdn.simpleicons.org/google/4285F4", newUrl: "https://cdn.simpleicons.org/gemini/4285F4" },
  { toolName: "Grok", oldUrl: "https://cdn.simpleicons.org/xai/EC4899", newUrl: "https://cdn.simpleicons.org/grok/EC4899" },
  { toolName: "Jurassic", oldUrl: "https://cdn.simpleicons.org/ai21labs/8B5CF6", newUrl: "https://cdn.simpleicons.org/jurassic/8B5CF6" },
  { toolName: "Llama", oldUrl: "https://cdn.simpleicons.org/meta/6366F1", newUrl: "https://cdn.simpleicons.org/llama/6366F1" },
  { toolName: "Microsoft Copilot", oldUrl: "https://cdn.simpleicons.org/microsoft/22C55E", newUrl: "https://cdn.simpleicons.org/microsoftcopilot/22C55E" },
  { toolName: "Mistral", oldUrl: "https://cdn.simpleicons.org/mistralai/F97316", newUrl: "https://cdn.simpleicons.org/mistral/F97316" },
  { toolName: "Qwen", oldUrl: "https://cdn.simpleicons.org/alibabacloud/F59E0B", newUrl: "https://cdn.simpleicons.org/qwen/F59E0B" },
  { toolName: "AdCreative.ai", oldUrl: "https://cdn.simpleicons.org/adcreative/EC4899", newUrl: "https://cdn.simpleicons.org/adcreativeai/EC4899" },
  { toolName: "Intercom Fin", oldUrl: "https://cdn.simpleicons.org/intercom/EF4444", newUrl: "https://cdn.simpleicons.org/intercomfin/EF4444" },
  { toolName: "PhantomBuster", oldUrl: "https://cdn.simpleicons.org/phantombusters/8B5CF6", newUrl: "https://cdn.simpleicons.org/phantombuster/8B5CF6" },
  { toolName: "Surfer SEO", oldUrl: "https://cdn.simpleicons.org/surferSEO/F97316", newUrl: "https://cdn.simpleicons.org/surferseo/F97316" },
  { toolName: "Arize AI", oldUrl: "https://cdn.simpleicons.org/arize/F2A900", newUrl: "https://cdn.simpleicons.org/arizeai/F2A900" },
  { toolName: "Fireflies.ai", oldUrl: "https://cdn.simpleicons.org/fireflies/8B5CF6", newUrl: "https://cdn.simpleicons.org/firefliesai/8B5CF6" },
  { toolName: "Notion AI", oldUrl: "https://cdn.simpleicons.org/notion/EC4899", newUrl: "https://cdn.simpleicons.org/notionai/EC4899" },
  { toolName: "Chegg AI", oldUrl: "https://cdn.simpleicons.org/chegg/EF4444", newUrl: "https://cdn.simpleicons.org/cheggai/EF4444" },
  { toolName: "Coursera AI", oldUrl: "https://cdn.simpleicons.org/coursera/F97316", newUrl: "https://cdn.simpleicons.org/courseraai/F97316" },
  { toolName: "Kimi", oldUrl: "https://cdn.simpleicons.org/knome/10B981", newUrl: "https://cdn.simpleicons.org/kimi/10B981" },
  { toolName: "Scite", oldUrl: "https://cdn.simpleicons.org/scispace/F59E0B", newUrl: "https://cdn.simpleicons.org/scite/F59E0B" },
  { toolName: "Apigee", oldUrl: "https://cdn.simpleicons.org/googlecloud/F4B400", newUrl: "https://cdn.simpleicons.org/apigee/F4B400" },
  { toolName: "Google Sheets AI", oldUrl: "https://cdn.simpleicons.org/googlesheets/4285F4", newUrl: "https://cdn.simpleicons.org/googlesheetsai/4285F4" },
  { toolName: "Monday.com", oldUrl: "https://cdn.simpleicons.org/monday/FF3D57", newUrl: "https://cdn.simpleicons.org/mondaycom/FF3D57" },
  { toolName: "Notion Projects", oldUrl: "https://cdn.simpleicons.org/notion/E44D26", newUrl: "https://cdn.simpleicons.org/notionprojects/E44D26" },
  { toolName: "Amazon Translate", oldUrl: "https://cdn.simpleicons.org/amazon/FF9900", newUrl: "https://cdn.simpleicons.org/amazontranslate/FF9900" },
  { toolName: "Lara Translate", oldUrl: "https://cdn.simpleicons.org/lara/10B981", newUrl: "https://cdn.simpleicons.org/laratranslate/10B981" },
  { toolName: "Kling AI", oldUrl: "https://cdn.simpleicons.org/kling/FF6B00", newUrl: "https://cdn.simpleicons.org/klingai/FF6B00" },
  { toolName: "Luma Dream Machine", oldUrl: "https://cdn.simpleicons.org/luma/8B5CF6", newUrl: "https://cdn.simpleicons.org/lumadreammachine/8B5CF6" },
  { toolName: "Pika Labs", oldUrl: "https://cdn.simpleicons.org/pika/EC4899", newUrl: "https://cdn.simpleicons.org/pikalabs/EC4899" },
  { toolName: "Veo", oldUrl: "https://cdn.simpleicons.org/google/4285F4", newUrl: "https://cdn.simpleicons.org/veo/4285F4" },
  { toolName: "Taskade Genesis", oldUrl: "https://cdn.simpleicons.org/taskade/06B6D4", newUrl: "https://cdn.simpleicons.org/taskadegenesis/06B6D4" },
  { toolName: "INK", oldUrl: "https://cdn.simpleicons.org/inkforall/F59E0B", newUrl: "https://cdn.simpleicons.org/ink/F59E0B" },
  // Unavailable Icons - Use alternatives or fall back to letter icons
  { toolName: "Google Duet AI", oldUrl: "https://cdn.simpleicons.org/google/4285F4", newUrl: "https://cdn.simpleicons.org/google/4285F4" }, // Keep Google icon
  { toolName: "Power Automate", oldUrl: "https://cdn.simpleicons.org/microsoftpowerautomate/0066FF", newUrl: "https://cdn.simpleicons.org/powerautomate/0066FF" }, // Try simplified version
  { toolName: "Arc", oldUrl: "https://cdn.simpleicons.org/arcbrowser/FC5C65", newUrl: "https://cdn.simpleicons.org/arc/FC5C65" }, // Use arc instead
  { toolName: "Freshdesk", oldUrl: "https://cdn.simpleicons.org/freshworks/FF6A00", newUrl: "https://cdn.simpleicons.org/freshworks/FF6A00" }, // Keep Freshworks
  { toolName: "Semantic Scholar", oldUrl: "https://cdn.simpleicons.org/semantic scholar/7C3AED", newUrl: "https://cdn.simpleicons.org/semanticscholar/7C3AED" }, // Fix space
];

// Fallback icon mapping for tools without available SimpleIcons
const FALLBACK_ICONS = {
  // Use generic or parent company icons when specific tool icon is unavailable
  "Kaedim": null, // Will use letter fallback
  "Meshy": null,
  "Spline": null,
  "Autify": null,
  "Functionize": null,
  "QA Wolf": null,
  "SoapUI": null,
  "Amplitude": null,
  "AskCodi": null,
  "Chef by Convex": null,
  "Devin": null,
  "Greptile": null,
  "Jules": null,
  "Kiro": null,
  "Manus": null,
  "Memex": null,
  "MindStudio": null,
  "Workik": null,
  "Activepieces": null,
  "Clockwise": null,
  "Fellow": null,
  "Shortwave": null,
  "Automation Anywhere": null,
  "Axiom": null,
  "Inflection": null,
  "Lasso": null,
  "Plain": null,
  "Character.AI": null,
  "Copilot": null,
  "Replika": null,
  "Descript": null,
  "Illustrate AI": null,
  "Midjourney": null,
  "PhotoRoom": null,
  "Runway": null,
  "Sora": null,
  "Stable Diffusion": null,
  "Udio": null,
  "Alation": null,
  "Anaplan": null,
  "DataRobot": null,
  "ThoughtSpot": null,
  "Trifacta": null,
  "VoiceQL": null,
  "BlazeSQL": null,
  "CamelAI": null,
  "Consensus": null,
  "Scholarcy": null,
  "Neon": null,
  "Anima": null,
  "Beautiful.ai": null,
  "Code Parrot": null,
  "Codia AI": null,
  "Emergent": null,
  "Figma Make": null,
  "Kromio": null,
  "Leonardo.Ai": null,
  "Pitch": null,
  "Rork": null,
  "Tile.dev": null,
  "Visme": null,
  "v0": null,
  "CommitGen": null,
  "Mabl": null,
  "Repair": null,
  "Stoplight": null,
  "Swimm": null,
  "Tabnine": null,
  "ChatPDF": null,
  "Knolli": null,
  "PDF.ai": null,
  "Antigravity": null,
  "Atoms": null,
  "Base44": null,
  "CodeGeeX": null,
  "Continue.dev": null,
  "Fleet": null,
  "Kilo Code": null,
  "PlayCode": null,
  "Qoder": null,
  "Trae": null,
  "Void": null,
  "Windsurf": null,
  "Zed": null,
  // Add more as needed based on audit results
};

// Main mutation to fix all icons
export const fixAllIcons = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    let updatedCount = 0;
    let fallbackCount = 0;
    const results = [];

    console.log(`Starting icon fix for ${tools.length} tools...`);

    // Apply specific fixes
    for (const fix of ICON_FIXES) {
      const tool = tools.find(t => t.name === fix.toolName);
      if (tool && tool.icon_url === fix.oldUrl) {
        await ctx.db.patch(tool._id, {
          icon_url: fix.newUrl
        });
        updatedCount++;
        results.push({
          tool: fix.toolName,
          action: "updated",
          oldUrl: fix.oldUrl,
          newUrl: fix.newUrl
        });
        console.log(`✅ Updated ${fix.toolName}: ${fix.oldUrl} → ${fix.newUrl}`);
      }
    }

    // Apply fallback icons (remove icon_url to use letter fallback)
    for (const [toolName, _] of Object.entries(FALLBACK_ICONS)) {
      const tool = tools.find(t => t.name === toolName);
      if (tool && tool.icon_url) {
        await ctx.db.patch(tool._id, {
          icon_url: undefined // Remove to use letter fallback
        });
        fallbackCount++;
        results.push({
          tool: toolName,
          action: "fallback",
          oldUrl: tool.icon_url,
          newUrl: `letter: ${tool.icon_letter || tool.name.charAt(0)}`
        });
        console.log(`🔄 Fallback ${toolName}: using letter icon`);
      }
    }

    // Validate remaining icons
    const remainingTools = await ctx.db.query("tools").collect();
    let validCount = 0;
    let invalidCount = 0;

    for (const tool of remainingTools) {
      if (!tool.icon_url) {
        validCount++; // Letter icons are valid
        continue;
      }

      // Validate URL format
      const urlPattern = /^https:\/\/cdn\.simpleicons\.org\/([^\/]+)\/([0-9A-Fa-f]{6})$/;
      if (urlPattern.test(tool.icon_url)) {
        validCount++;
      } else {
        invalidCount++;
        console.log(`❌ Invalid format: ${tool.name} - ${tool.icon_url}`);
      }
    }

    const summary = {
      totalTools: tools.length,
      updatedIcons: updatedCount,
      fallbackIcons: fallbackCount,
      validIcons: validCount,
      invalidIcons: invalidCount,
      successRate: ((validCount / remainingTools.length) * 100).toFixed(1) + "%"
    };

    console.log("\n📊 ICON FIX SUMMARY:");
    console.log(`Total Tools: ${summary.totalTools}`);
    console.log(`Updated Icons: ${summary.updatedIcons}`);
    console.log(`Fallback Icons: ${summary.fallbackCount}`);
    console.log(`Valid Icons: ${summary.validIcons}`);
    console.log(`Invalid Icons: ${summary.invalidIcons}`);
    console.log(`Success Rate: ${summary.successRate}`);

    return { summary, results };
  }
});

// Validation mutation to check icon availability
export const validateAllIcons = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const results = [];

    console.log(`Validating icons for ${tools.length} tools...`);

    for (const tool of tools) {
      if (!tool.icon_url) {
        results.push({
          tool: tool.name,
          status: "letter_fallback",
          icon: tool.icon_letter || tool.name.charAt(0),
          url: null
        });
        continue;
      }

      const urlPattern = /^https:\/\/cdn\.simpleicons\.org\/([^\/]+)\/([0-9A-Fa-f]{6})$/;
      const match = tool.icon_url.match(urlPattern);

      if (!match) {
        results.push({
          tool: tool.name,
          status: "invalid_format",
          url: tool.icon_url
        });
        continue;
      }

      const [, iconName, color] = match;

      // For now, just validate format. Actual HTTP checking would require external API
      results.push({
        tool: tool.name,
        status: "format_valid",
        iconName,
        color,
        url: tool.icon_url
      });
    }

    const summary = {
      total: results.length,
      letterFallback: results.filter(r => r.status === "letter_fallback").length,
      formatValid: results.filter(r => r.status === "format_valid").length,
      invalidFormat: results.filter(r => r.status === "invalid_format").length
    };

    return { summary, results };
  }
});

// Export the fixes for external use
export { ICON_FIXES, FALLBACK_ICONS };