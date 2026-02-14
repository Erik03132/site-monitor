# Site Monitor - Project Context for OpenCode

## Overview

Website monitoring app with chunk-based change detection and LLM summaries.

**Stack:** Next.js 15 + Supabase (PostgreSQL + Edge Functions) + Vercel

---

## Project Structure

```
site-monitor/
├── src/app/              # Pages (dashboard, login, sites, changes)
├── src/app/api/          # API routes (sites, changes)
├── src/lib/supabase/     # Supabase clients (client.ts, server.ts)
├── src/types/database.ts # TypeScript interfaces
├── supabase/schema.sql   # Database schema (run in Supabase SQL Editor)
└── .env.example          # Environment template
```

---

## What's Done (Phase 1) ✅

- Next.js 15 project with Tailwind CSS
- Supabase Auth integration (login/register)
- Dashboard with sidebar layout
- Sites CRUD API (`/api/sites`)
- Changes API (`/api/changes`)
- 6 database tables with RLS (see `supabase/schema.sql`)

---

## What's Needed (Phase 2) 🚧

### 1. Page Fetching Service

Create `supabase/functions/fetch-page/index.ts`:

- Async HTTP client (fetch API)
- Content hash comparison (skip unchanged)
- Timeout: 30s, retry: 3 attempts
- Rate limiting: 1 req/sec per domain

### 2. HTML Parser Service

Create `supabase/functions/parse-html/index.ts`:

- Use linkedom for DOM parsing (Deno compatible)
- Remove: nav, footer, script, style, aside
- Extract: main, article, headings, paragraphs, lists, tables

### 3. Chunking Service

Create `supabase/functions/chunk-content/index.ts`:

- Split content into 200-400 token chunks
- 50 token overlap between chunks
- Preserve: sentence boundaries, block types
- Store: position, block_type, content, token_count

### 4. Diff Service

Create `supabase/functions/diff-chunks/index.ts`:

- Compare old vs new chunk versions
- Detect: added, removed, modified
- Calculate similarity (Levenshtein or cosine)
- Threshold: 0.8 for "same chunk"

### 5. LLM Summary Service

Create `supabase/functions/llm-summarize/index.ts`:

- Call Perplexity API (sonar-pro model)
- Generate 1-2 sentence change summary
- Store in `chunk_changes.summary`

### 6. Scan Trigger API

Create `src/app/api/sites/[id]/scan/route.ts`:

- POST endpoint to trigger scan
- Call Edge Functions in sequence
- Update `sites.last_scanned_at`

### 7. Vercel Cron

Create `src/app/api/cron/scan/route.ts`:

- Run every 15 minutes
- Query sites where: `is_active = true AND last_scanned_at < now() - interval`
- Trigger scan for each

---

## Database Tables

- `sites` - user's monitored URLs
- `pages` - fetched page snapshots
- `chunks` - semantic content chunks
- `chunk_changes` - detected differences
- `keywords` - user's tracked terms
- `notification_settings` - email preferences

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PERPLEXITY_API_KEY=...
```

---

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
supabase start     # Start local Supabase
supabase functions serve  # Run Edge Functions locally
```

---

## Priority Order

1. Scan trigger API (simplest, tests the flow)
2. Fetch + Parse services
3. Chunking service
4. Diff + Store changes
5. LLM summaries
6. Cron job
