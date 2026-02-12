import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { TOOLS_DATA } from "../data/seedData";

export const get = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let toolsQuery = ctx.db.query("tools");

    if (args.search) {
        const allTools = await toolsQuery.collect();
        const searchLower = args.search.toLowerCase();
        return allTools.filter(t => 
            (t.name.toLowerCase().includes(searchLower) || t.description.toLowerCase().includes(searchLower)) &&
            (!args.category || t.category === args.category) &&
            (args.featured === undefined || t.featured === args.featured)
        );
    }

    if (args.category) {
      toolsQuery = toolsQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      toolsQuery = toolsQuery.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    return await toolsQuery.collect();
  },
});

export const getById = query({
  args: { id: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const categories: Record<string, number> = {};
    
    tools.forEach((tool) => {
      categories[tool.category] = (categories[tool.category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

const insertTool = async (ctx: any, toolData: any) => {
  const slug = toolData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const generatedIconUrl = `https://cdn.simpleicons.org/${slug}/${toolData.color.replace('#', '')}`;
  
  await ctx.db.insert("tools", {
    name: toolData.name,
    description: toolData.description,
    category: toolData.category,
    url: toolData.url,
    icon_letter: toolData.icon_letter || toolData.name.charAt(0).toUpperCase(),
    icon_url: toolData.icon_url || generatedIconUrl,
    color: toolData.color,
    featured: toolData.featured || false,
  });
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tools").first();
    if (existing) return;

    for (const tool of TOOLS_DATA) {
      await insertTool(ctx, tool);
    }
  },
});

export const forceReseed = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    for (const tool of tools) {
      await ctx.db.delete(tool._id);
    }

    for (const tool of TOOLS_DATA) {
      await insertTool(ctx, tool);
    }
  },
});

export const exportJson = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    return JSON.stringify(tools, null, 2);
  },
});
