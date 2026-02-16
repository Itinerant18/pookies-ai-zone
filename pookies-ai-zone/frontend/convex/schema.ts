import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tools: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    url: v.string(),
    icon_letter: v.string(),
    icon_url: v.optional(v.string()),
    color: v.string(),
    featured: v.boolean(),
    
    // Enriched fields
    pricing: v.optional(v.object({
      model: v.string(), // free, freemium, paid, enterprise, open-source
      free_tier: v.boolean(),
      starting_price: v.optional(v.number()),
      currency: v.optional(v.string()),
    })),
    platforms: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    updated_at: v.optional(v.string()),
  })
    .searchIndex("search_name_desc", {
      searchField: "name",
      filterFields: ["category", "featured"],
    })
    .searchIndex("search_desc", {
      searchField: "description",
      filterFields: ["category", "featured"],
    }),
});
