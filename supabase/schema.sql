create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique,
  password_hash text,
  role text not null default 'user',
  disabled boolean not null default false,
  session_version integer not null default 1,
  password_changed_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  company text not null,
  contact text,
  title text,
  email text,
  email_key text generated always as (lower(coalesce(email, ''))) stored,
  country text,
  grade text,
  priority text,
  customer_type text,
  segment text,
  product text,
  outreach_product text,
  owner_user_id text references public.users(id),
  do_not_email boolean not null default false,
  unsubscribed boolean not null default false,
  email_bounced boolean not null default false,
  outreach_replied boolean not null default false,
  stop_outreach boolean not null default false,
  notes text,
  raw_json jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_key_unique
  on public.customers (email_key)
  where email_key <> '';

create unique index if not exists customers_company_country_unique
  on public.customers (lower(company), lower(coalesce(country, '')))
  where coalesce(email, '') = '';

create table if not exists public.customer_activities (
  id text primary key default gen_random_uuid()::text,
  customer_id text not null references public.customers(id) on delete cascade,
  type text not null,
  channel text,
  summary text,
  content text,
  next_action text,
  next_date date,
  source text,
  raw_json jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_outreach_queue (
  id text primary key default gen_random_uuid()::text,
  customer_id text not null references public.customers(id) on delete cascade,
  company text,
  contact text,
  email text,
  country text,
  grade text,
  recommended_product text,
  brand_name text not null default 'FORYAL',
  subject text,
  body text,
  status text not null,
  scheduled_at timestamptz,
  last_contact_at timestamptz,
  sender_email text,
  followup_delay_days integer,
  review_required boolean not null default true,
  auto_send_allowed boolean not null default false,
  failure_reason text,
  stop_reason text,
  raw_json jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  approved_by text references public.users(id),
  sent_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  sent_at timestamptz,
  stopped_at timestamptz,
  constraint email_outreach_queue_status_check check (
    status in ('pending_review', 'approved', 'scheduled', 'sent', 'failed', 'stopped')
  )
);

create unique index if not exists email_outreach_one_open_task_per_customer
  on public.email_outreach_queue (customer_id)
  where status in ('pending_review', 'approved', 'scheduled');

create table if not exists public.email_outreach_activity (
  id text primary key default gen_random_uuid()::text,
  task_id text references public.email_outreach_queue(id) on delete set null,
  customer_id text references public.customers(id) on delete set null,
  type text not null,
  note text,
  status text,
  subject text,
  raw_json jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_mock_sent_records (
  id text primary key default gen_random_uuid()::text,
  task_id text not null references public.email_outreach_queue(id) on delete cascade,
  customer_id text references public.customers(id) on delete set null,
  from_email text,
  to_email text,
  subject text,
  body text,
  transport text not null default 'mock',
  is_real_sent boolean not null default false,
  raw_json jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  sent_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_mock_sent_records_mock_only check (transport = 'mock' and is_real_sent = false)
);

create table if not exists public.crm_settings (
  id text primary key default gen_random_uuid()::text,
  scope text not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_by text references public.users(id),
  updated_by text references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, key)
);

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.customer_activities enable row level security;
alter table public.email_outreach_queue enable row level security;
alter table public.email_outreach_activity enable row level security;
alter table public.email_mock_sent_records enable row level security;
alter table public.crm_settings enable row level security;
