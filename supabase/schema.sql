-- Merit Roofing · Variable Compensation
-- Paste this whole file into Supabase -> SQL Editor -> Run.

create extension if not exists "pgcrypto";

-- ============ TABLES ============

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'employee' check (role in ('admin','employee')),
  job_title   text not null default '',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.accounts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references public.profiles(id) on delete restrict,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.engagements (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.accounts(id) on delete cascade,
  name            text not null default 'New engagement',
  comp_type       text not null default 'contract'
                  check (comp_type in ('contract','target_margin','margin_growth')),
  rate            numeric(6,3) not null default 0,
  contract_value  numeric(14,2) not null default 0,
  margin_value    numeric(14,2) not null default 0,
  margin_baseline numeric(14,2) not null default 0,
  period          text not null default 'Q1 2026',
  paid            boolean not null default false,
  paid_date       date,
  created_at      timestamptz not null default now()
);

create table if not exists public.requests (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.profiles(id) on delete cascade,
  account_name   text not null,
  narrative      text not null default '',
  status         text not null default 'pending' check (status in ('pending','approved','denied')),
  admin_remarks  text not null default '',
  comp_type      text check (comp_type in ('contract','target_margin','margin_growth')),
  rate           numeric(6,3),
  account_id     uuid references public.accounts(id) on delete set null,
  submitted_at   timestamptz not null default now(),
  reviewed_at    timestamptz
);

create index if not exists accounts_owner_idx     on public.accounts(owner_id);
create index if not exists engagements_acct_idx   on public.engagements(account_id);
create index if not exists requests_employee_idx  on public.requests(employee_id);
create index if not exists requests_status_idx    on public.requests(status);

-- ============ AUTO-CREATE A PROFILE FOR EVERY NEW LOGIN ============

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ SECURITY ============

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

alter table public.profiles    enable row level security;
alter table public.accounts    enable row level security;
alter table public.engagements enable row level security;
alter table public.requests    enable row level security;

-- profiles
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- accounts: an employee sees only accounts they own; admin sees and edits everything
drop policy if exists accounts_read on public.accounts;
create policy accounts_read on public.accounts for select
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists accounts_admin_write on public.accounts;
create policy accounts_admin_write on public.accounts for all
  using (public.is_admin()) with check (public.is_admin());

-- engagements: carry the comp numbers, so employees may read but never write
drop policy if exists engagements_read on public.engagements;
create policy engagements_read on public.engagements for select
  using (
    public.is_admin()
    or exists (select 1 from public.accounts a where a.id = account_id and a.owner_id = auth.uid())
  );

drop policy if exists engagements_admin_write on public.engagements;
create policy engagements_admin_write on public.engagements for all
  using (public.is_admin()) with check (public.is_admin());

-- requests: an employee reads and creates their own; only admin decides them
drop policy if exists requests_read on public.requests;
create policy requests_read on public.requests for select
  using (employee_id = auth.uid() or public.is_admin());

drop policy if exists requests_insert_own on public.requests;
create policy requests_insert_own on public.requests for insert
  with check (employee_id = auth.uid() and status = 'pending');

drop policy if exists requests_admin_write on public.requests;
create policy requests_admin_write on public.requests for all
  using (public.is_admin()) with check (public.is_admin());
