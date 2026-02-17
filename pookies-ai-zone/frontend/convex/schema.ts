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
    source: v.optional(v.string()),

    // Enriched fields
    comparison_data: v.optional(v.object({
      pricing: v.optional(v.object({
        model: v.optional(v.string()), // Relaxed from union for seeding
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
      features: v.optional(v.object({
        ai_text: v.optional(v.boolean()),
        ai_image: v.optional(v.boolean()),
        ai_video: v.optional(v.boolean()),
        ai_code: v.optional(v.boolean()),
        ai_audio: v.optional(v.boolean()),
        ai_chat: v.optional(v.boolean()),
        api_access: v.optional(v.boolean()),
        webhooks: v.optional(v.boolean()),
        sso: v.optional(v.boolean()),
        team_collaboration: v.optional(v.boolean()),
        custom_branding: v.optional(v.boolean()),
        export_pdf: v.optional(v.boolean()),
        export_csv: v.optional(v.boolean()),
      })),
      use_cases: v.optional(v.array(v.string())),
      difficulty: v.optional(v.union(
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5)
      )),
    })),
    // Deprecated fields (kept for backward compatibility or migration)
    pricing: v.optional(v.any()),
    platforms: v.optional(v.any()),
    features: v.optional(v.any()),
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
