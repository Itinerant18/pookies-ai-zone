import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Icon updates for tools that need fixing
const ICON_FIXES = [
  {
    toolId: "j57bdfgefw6jgzxk4m9vq1qd8180yk3y", // JMeter
    iconUrl: "https://cdn.simpleicons.org/apachejmeter/D24939",
    iconLetter: "J"
  },
  {
    toolId: "j576ft3sab44r1bjcgqdxynqb980yqgs", // Google Duet AI
    iconUrl: "https://cdn.simpleicons.org/googleduet/4285F4",
    iconLetter: "G"
  },
  {
    toolId: "j574b1s72zmb0fdrmtz2wgj1d580zsw4", // Pabbly Connect
    iconUrl: "https://cdn.simpleicons.org/pabbly/22C55E",
    iconLetter: "P"
  },
  {
    toolId: "j57aw7q3cgg35qfw1k902bmt5wvx80zrn", // Power Automate
    iconUrl: "https://cdn.simpleicons.org/microsoftpowerautomate/0078D4",
    iconLetter: "P"
  },
  {
    toolId: "j57bdfgefw6jgzxk4m9vq1qd8180yk3y", // Make.com
    iconUrl: "https://cdn.simpleicons.org/make/F97316",
    iconLetter: "M"
  },
  {
    toolId: "j57d7z7jqwjyg1japnds3s9gkx80yw0x", // Salesforce Einstein
    iconUrl: "https://cdn.simpleicons.org/salesforce/6366F1",
    iconLetter: "S"
  },
  {
    toolId: "j5745e6dpz28vz93jj4nga12zd80zsw4", // Arc
    iconUrl: "https://cdn.simpleicons.org/arcbrowser/FC5C65",
    iconLetter: "A"
  },
  {
    toolId: "j57r0m2tpvch5abec8dq1xw9hc0zh87", // Dia Browser
    iconUrl: "https://cdn.simpleicons.org/dia/FF6B35",
    iconLetter: "D"
  },
  {
    toolId: "j5742537gty2yv1t9m20z6z7q580zb3y", // Perplexity Comet
    iconUrl: "https://cdn.simpleicons.org/perplexity/EF4444",
    iconLetter: "P"
  },
  {
    toolId: "j5789jk6zd4xkf0w9bnrwkm7cx80zskk", // Sigma AI Browser
    iconUrl: "https://cdn.simpleicons.org/sigma/6366F1",
    iconLetter: "S"
  },
  {
    toolId: "j575zr0cswed7aevj4evcr7wa180zptf", // Freshdesk
    iconUrl: "https://cdn.simpleicons.org/freshworks/FA5000",
    iconLetter: "F"
  },
  {
    toolId: "j57cbmypbms266d54vxj44sgvn80yztr", // Plain
    iconUrl: null, // Will use letter P
    iconLetter: "P"
  },
  {
    toolId: "j577rdapfms0mrrzqqvw6x0wzn80z14r", // Zoho CRM
    iconUrl: "https://cdn.simpleicons.org/zoho/E97131",
    iconLetter: "Z"
  },
  {
    toolId: "j57ag23f4h0fndbvm6t3gqxcjs80y6d1", // Character.AI
    iconUrl: "https://cdn.simpleicons.org/characterai/EC4899",
    iconLetter: "C"
  },
  // Add more fixes here based on the icon-mapping.json data
  // This is a sample - the full list would include all 73+ tools
];

export const updateToolsIcons = mutation({
  args: {
    iconUpdates: v.array(v.object({
      id: v.id("tools"),
      iconUrl: v.optional(v.string()),
      iconLetter: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;
    
    for (const update of args.iconUpdates) {
      const updateData: any = {
        icon_url: update.iconUrl,
        icon_letter: update.iconLetter
      };
      
      // Only set fields that are provided
      if (update.iconUrl !== undefined) {
        updateData.icon_url = update.iconUrl;
      }
      if (update.iconLetter !== undefined) {
        updateData.icon_letter = update.iconLetter;
      }
      
      await ctx.db.patch(update.id, updateData);
      updatedCount++;
    }
    
    console.log(`Updated ${updatedCount} tool icons`);
    return { updated: updatedCount };
  }
});

// Export for easy importing
export { ICON_FIXES };