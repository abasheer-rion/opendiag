-- OpenDiag community database. Source: docs/design/data-schema.md section 7

create extension if not exists pgcrypto;

create type contribution_status as enum
  ('draft','submitted','in_review','changes_requested','approved','rejected','merged','withdrawn');
create type app_role as enum ('contributor','reviewer','maintainer');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique check (handle ~ '^[a-z0-9_-]{3,32}$'),
  role app_role not null default 'contributor',
  attested_rights boolean not null default false,   -- contributor agreement accepted
  created_at timestamptz not null default now()
);

create table contributions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete restrict,
  pack_id text not null,
  module_id text not null,
  entry_type text not null check (entry_type in ('did','pid','dtc','coding','routine')),
  payload jsonb not null,                     -- one entry, validated against pack schema
  payload_hash bytea not null,
  status contribution_status not null default 'draft',
  tested_on jsonb,
  license text not null check (license in ('CC0-1.0','CC-BY-4.0')),
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pg_column_size(payload) < 65536)
);
create index on contributions (author_id);
create index on contributions (status, pack_id);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references contributions(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  verdict text not null check (verdict in ('approve','request_changes','reject')),
  comment text not null check (length(comment) < 4000),
  checklist jsonb not null,                   -- provenance ok, no proprietary text, deny-class ok
  created_at timestamptz not null default now(),
  unique (contribution_id, reviewer_id)
);

create table attachments (                    -- capture logs, in Storage; row holds the pointer
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references contributions(id) on delete cascade,
  storage_path text not null,
  sha256 bytea not null,
  bytes int not null check (bytes <= 5242880)
);

create table releases (                       -- public record of signed packs
  pack_id text, version text, sha256 bytea not null, signature bytea not null,
  signer_key_id text not null, released_at timestamptz not null default now(),
  primary key (pack_id, version)
);

create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid, action text not null, subject uuid, at timestamptz not null default now()
);

create function public.role_of(uid uuid) returns app_role
language sql stable security definer set search_path = public as
$$ select role from profiles where id = uid $$;
revoke execute on function public.role_of from anon;

alter table profiles      enable row level security;
alter table contributions enable row level security;
alter table reviews       enable row level security;
alter table attachments   enable row level security;
alter table releases      enable row level security;
alter table audit_log     enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on releases to anon, authenticated;
grant select, insert, update on profiles, contributions to authenticated;
grant select, insert on reviews, attachments to authenticated;

-- profiles
create policy profiles_read_own on profiles for select to authenticated
  using ((select auth.uid()) is not null and id = (select auth.uid()));
create policy profiles_update_own on profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select role_of(auth.uid())));  -- cannot self-promote

-- contributions: authors see and edit their own drafts
create policy contrib_select_own on contributions for select to authenticated
  using (author_id = (select auth.uid()));
create policy contrib_select_reviewers on contributions for select to authenticated
  using ((select role_of(auth.uid())) in ('reviewer','maintainer') and status <> 'draft');
create policy contrib_insert on contributions for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'draft'
              and exists (select 1 from profiles p where p.id = (select auth.uid()) and p.attested_rights));
create policy contrib_update_own on contributions for update to authenticated
  using (author_id = (select auth.uid()) and status in ('draft','changes_requested'))
  with check (author_id = (select auth.uid()) and status in ('draft','submitted','withdrawn'));

-- reviews: reviewers only, never on own work
create policy reviews_insert on reviews for insert to authenticated
  with check (reviewer_id = (select auth.uid())
    and (select role_of(auth.uid())) in ('reviewer','maintainer')
    and not exists (select 1 from contributions c where c.id = contribution_id and c.author_id = (select auth.uid())));
create policy reviews_select on reviews for select to authenticated
  using ((select role_of(auth.uid())) in ('reviewer','maintainer')
         or exists (select 1 from contributions c where c.id = contribution_id and c.author_id = (select auth.uid())));

-- releases: public read, no client writes (service role from CI only)
create policy releases_read on releases for select to anon, authenticated using (true);

revoke execute on function public.role_of(uuid) from public;
