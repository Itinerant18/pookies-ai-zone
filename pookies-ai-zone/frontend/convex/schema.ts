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
