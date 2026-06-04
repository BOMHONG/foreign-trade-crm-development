# Supabase shared CRM database

This folder contains the first-stage shared database schema for the CRM.

## Apply schema

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Add these Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Do not put `SUPABASE_SERVICE_ROLE_KEY` in browser code. It is used only by
`/api/shared-crm`.

The MVP schema keeps existing CRM string IDs for users, customers, activities,
and outreach tasks. This avoids rewriting existing localStorage records during
the first import.

## First-stage scope

Database-backed in this MVP:

- customer basics and compliance flags
- customer activities / timeline records
- email outreach queue
- outreach activity log
- mock sent records
- outreach settings

Still local in this MVP:

- UI preferences
- recent searches
- column display settings
- temporary AI draft settings
- unrelated module cache

The outreach queue remains mock-only. `email_mock_sent_records` has a database
check constraint requiring `transport = 'mock'` and `is_real_sent = false`.
