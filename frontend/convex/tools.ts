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
      const filtered = allTools.filter(t =>
        (t.name.toLowerCase().includes(searchLower) || t.description.toLowerCase().includes(searchLower)) &&
        (!args.category || t.category === args.category) &&
        (args.featured === undefined || t.featured === args.featured)
      );

      return await Promise.all(filtered.map(async (t) => {
        if (t.icon_url && !t.icon_url.startsWith("http")) {
          const url = await ctx.storage.getUrl(t.icon_url);
          if (url) return { ...t, icon_url: url };
        }
        return t;
      }));
    }

    if (args.category) {
      toolsQuery = toolsQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      toolsQuery = toolsQuery.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    const tools = await toolsQuery.collect();
    return await Promise.all(tools.map(async (t) => {
      if (t.icon_url && !t.icon_url.startsWith("http")) {
        const url = await ctx.storage.getUrl(t.icon_url);
        if (url) return { ...t, icon_url: url };
      }
      return t;
    }));
  },
});

export const getById = query({
  args: { id: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.id);
    if (!tool) return null;

    if (tool.icon_url && !tool.icon_url.startsWith("http")) {
      const url = await ctx.storage.getUrl(tool.icon_url);
      if (url) return { ...tool, icon_url: url };
    }
    return tool;
  },
});

export const getByIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results: any[] = [];
    for (const id of args.ids) {
      try {
        const doc = await ctx.db.get(id as any);
        if (doc) {
          if (doc.icon_url && !doc.icon_url.startsWith("http")) {
            const url = await ctx.storage.getUrl(doc.icon_url);
            if (url) doc.icon_url = url;
          }
          results.push(doc);
        }
      } catch (e) {
        // skip invalid ids
      }
    }
    return results;
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
    pricing: toolData.pricing,
    platforms: toolData.platforms,
    features: toolData.features,
    pros: toolData.pros,
    cons: toolData.cons,
    comparison_data: toolData.comparison_data,
    updated_at: toolData.updated_at,
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

export const seedEnriched = mutation({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    for (const tool of TOOLS_DATA) {
      // Check if tool exists
      const existingTool = await ctx.db
        .query("tools")
        .withSearchIndex("search_name_desc", (q) => q.search("name", tool.name))
        .first();

      if (existingTool) {
        // Update comparison data
        await ctx.db.patch(existingTool._id, {
          comparison_data: tool.comparison_data as any, // Cast to any to bypass strict type check for now if needed
        });
        count++;
      } else {
        // Insert new
        await insertTool(ctx, tool);
        count++;
      }
    }
    return `Seeded/Updated ${count} tools`;
  },
});

export const exportJson = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    return JSON.stringify(tools, null, 2);
  },
});

export const addTool = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    url: v.string(),
    color: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if tool already exists by URL
    const existing = await ctx.db.query("tools")
      .filter(q => q.eq(q.field("url"), args.url))
      .first();

    if (existing) {
      return { success: false, message: "Tool already exists", id: existing._id };
    }

    const slug = args.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const color = args.color || "#6366F1";
    const iconUrl = `https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}`;

    const id = await ctx.db.insert("tools", {
      name: args.name,
      description: args.description,
      category: args.category,
      url: args.url,
      icon_letter: args.name.charAt(0).toUpperCase(),
      icon_url: iconUrl,
      color: color,
      featured: args.featured || false,
      source: args.source || "manual",
    });

    return { success: true, message: "Tool added", id };
  },
});

export const addOrUpdateTool = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    url: v.string(),
    color: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    source: v.optional(v.string()),
    icon_url: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    comparison_data: v.optional(v.object({
      pricing: v.optional(v.object({
        model: v.optional(v.string()),
        free_tier: v.optional(v.boolean()),
        starting_price: v.optional(v.number()),
        currency: v.optional(v.string()),
        per_user: v.optional(v.boolean()),
        custom_pricing: v.optional(v.boolean()),
      })),
      platforms: v.optional(v.object({
        web: v.optional(v.boolean()),
        ios: v.optional(v.boolean()),
        android: v.optional(v.boolean()),
        macos: v.optional(v.boolean()),
        windows: v.optional(v.boolean()),
        linux: v.optional(v.boolean()),
        api: v.optional(v.boolean()),
        self_hosted: v.optional(v.boolean()),
      })),
      features: v.optional(v.any()), // flexible
      use_cases: v.optional(v.array(v.string())),
      difficulty: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5))),
    })),
  },
  handler: async (ctx, args) => {
    // Check if tool already exists by URL
    const existing = await ctx.db.query("tools")
      .filter(q => q.eq(q.field("url"), args.url))
      .first();

    const slug = args.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const color = args.color || "#6366F1";
    const defaultIconUrl = `https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}`;

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        description: args.description,
        category: args.category,
        icon_url: args.icon_url || existing.icon_url,
        color: color,
        featured: args.featured !== undefined ? args.featured : existing.featured,
        source: args.source || existing.source,
        pros: args.pros || existing.pros,
        cons: args.cons || existing.cons,
        comparison_data: args.comparison_data || existing.comparison_data,
        updated_at: new Date().toISOString(),
      });
      return { success: true, message: "Tool updated", id: existing._id };
    } else {
      // Insert new
      const id = await ctx.db.insert("tools", {
        name: args.name,
        description: args.description,
        category: args.category,
        url: args.url,
        icon_letter: args.name.charAt(0).toUpperCase(),
        icon_url: args.icon_url || defaultIconUrl,
        color: color,
        featured: args.featured || false,
        source: args.source || "manual",
        pros: args.pros,
        cons: args.cons,
        comparison_data: args.comparison_data,
        updated_at: new Date().toISOString(),
      });
      return { success: true, message: "Tool added", id };
    }
  },
});

export const getToolStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db.query("tools").collect();
    const categories: Record<string, number> = {};
    let featuredCount = 0;

    allTools.forEach((tool) => {
      categories[tool.category] = (categories[tool.category] || 0) + 1;
      if (tool.featured) featuredCount++;
    });

    return {
      total: allTools.length,
      featured: featuredCount,
      categories: Object.keys(categories).length,
      byCategory: categories,
    };
  },
});
