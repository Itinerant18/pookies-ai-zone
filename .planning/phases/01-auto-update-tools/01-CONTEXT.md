# Phase 1: Auto-Update AI Tools - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Automatically discover and ingest new AI tools into the database on a daily schedule. The system monitors sources for new tools, verifies them, and adds them to the database without manual intervention.

</domain>

<decisions>
## Implementation Decisions

### Update Frequency
- Run once per day
- Time of day: Claude decides
- Auto-add new tools (no manual approval)
- Send alert on failure
- Skip on failure → retry next day

### Source Strategy
- Monitor: AI directories (Futurepedia, There's an AI for That), GitHub trending, Product Hunt
- Use official APIs when available
- Source count: Claude decides (configurable)
- Prioritize major/established tools over niche
- Sources must be fully configurable (easy to add/remove)
- Duplicate handling: Claude decides
- Track source for each tool (provenance)
- URL verification: Check URL responds (200 OK) before adding
- Capture tool icons
- Category: use source-provided category
- Cache source data to reduce API calls
- Capture company info when available
- Launch date: Claude decides
- Language: any language (not English-only)
- Add subcategories when available

### Verification Workflow
- Run all verification checks before adding: URL, description quality, category validity
- Retry failed verifications automatically in next run
- Maintain full audit trail of all changes
- Assign confidence score based on source quality

### Scoring & Data Enrichment
- System supports confidence scoring based on source quality
- For richer scoring/recommendations, capture additional data:
  - Pricing details (model, free tier, starting price)
  - Platform support (web, mobile, API)
  - Feature flags (AI text, image, code generation)
  - Use case tags
- System works with default values for missing data
- Richer data = better recommendations

### Data Freshness
- Add new tools + refresh existing tool info
- Refresh frequency: weekly
- Refresh all data types: description, pricing, URL, category
- Availability check: Claude decides

</decisions>

<specifics>
## Specific Ideas

- "like per day new ai tool are coming in the world" — user wants continuous automation
- User prefers auto-add over manual approval (simpler workflow)
- Focus on major tools first, then niche
- Scoring system needs enriched data: pricing, platform, features, use cases

</specifics>

<deferred>
## Deferred Ideas

- Manual tool submissions (user-submitted) — future phase
- Scheduled backups — separate phase
- Backup rotation/retention — add to backlog

</deferred>

---

*Phase: 01-auto-update-tools*
*Context gathered: 2026-02-16*
