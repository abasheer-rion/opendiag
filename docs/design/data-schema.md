# OpenDiag Data-Pack Schema and Community Database

Design note. Grounded in `docs/research/` (cited by file name). Not legal advice. Items marked "(unverified)" need confirmation.

## Summary

- The data pack is the product. The wire protocols are public, but the meaning of identifiers and coding bits is what the paid tools sell (`bmw-ista-architecture.md`, `bimmerlink-bimmercode-analysis.md`).
- Packs are plain YAML in git, compiled to signed JSON. One file per module per vendor family.
- Every entry carries provenance, a license and a risk tier. Entries without provenance fail the build.
- The community database is a small Supabase (Postgres) project. It holds contributions and review state, not the packs. Packs ship as signed files from git releases.
- Supabase free tier is 500 MB database, 1 GB file storage, 50,000 monthly users, 5 GB egress. Projects pause after 1 week idle and there are no automatic backups. So git is the source of truth and the database must be rebuildable. [S1]

## 1. Design rules

1. **Original structure, original text.** The schema is ODX-inspired (as suggested in `bmw-ista-architecture.md`) but is not ODX, SGBD or CAFD. Labels are written by contributors in their own words.
2. **Standards-derived data is fine.** UDS services, OBD-II PIDs and the DTC byte layout are described in public summaries (`protocols.md`). Paid standard text and OEM-issued data are never copied (`open-source-landscape-and-legal.md`).
3. **Never ship**: SGBD/PRG, PSdZData, CAFD, Mercedes CBF/SMR-D, OEM ODX, Techstream tables, seed/key algorithms or keys.
4. **User-supplied ODX stays on the user's machine.** odxtools (MIT) can read a PDX the user legally holds. The result is a local, unshared overlay that is never uploaded.
5. **Unknown means read-only.** If a module's identity does not match an entry's applicability, no write is offered (`coding-security-failsafe.md`, pattern 3 and 13).

## 2. Pack layout

```
packs/
  bmw/
    manifest.yaml
    modules/dme-example.yaml
    modules/kombi-example.yaml
  generic/
    obd2-pids.yaml            # SAE J1979 PIDs, own wording
    uds-common-dids.yaml      # F190 VIN, F187, F18C ...
    dtc-generic.yaml          # own descriptions for P0xxx ranges
  schema/
    pack.schema.json
```

Build output: `bmw-2026.11.0.json.zst`, plus `manifest.json` and a detached Ed25519 signature. The app verifies the signature before loading.

### Manifest

```yaml
schema: opendiag.pack/1
pack_id: bmw
version: 2026.11.0
license: CC-BY-4.0          # data license; code is Apache-2.0
min_app: 0.3.0
trademark_note: "Make names used only to state compatibility. Not affiliated with any manufacturer."
modules: [dme-example, kombi-example]
```

## 3. Module file

One module file describes one logical ECU family and its variants. Entries inherit applicability from the module unless they override it.

```yaml
schema: opendiag.module/1
id: kombi-example
name: Instrument cluster
make: bmw
transport:                       # how to reach it
  can:  { tester_id: 0x6F1, ecu_id: 0x600, addressing: extended, target: 0x60 }
  doip: { logical_address: 0x0060 }
identify:                        # how to recognize which variant is present
  - did: 0xF187                  # part number, UDS-standard DID
  - did: 0xF189                  # software version
applicability:
  - id: v1
    chassis: [G05, G06]          # label, not a legal claim
    model_years: [2019, 2023]
    markets: [any]
    hw: { part_numbers: ["*"] }
    sw: { min: "0.0.0", max: "9.9.9", compare: semver }
    i_level: { min: "S15A-19-03-500", max: "S15A-21-11-500" }   # BMW-style label, optional
risk_tier: T0
```

### Applicability matching

- A variant matches when **all** listed selectors match the identity read from the car.
- Selectors: `chassis`, `model_years` (inclusive range), `markets`, `hw.part_numbers` (glob), `sw` (range plus a `compare` mode: `semver`, `lexical`, `exact_list`), `i_level` (range). BMW I-levels and "version drift" are why this matters (`bimmerlink-bimmercode-analysis.md`).
- Chassis and model year are **hints** to narrow a search. The hard gate is the module identity read over UDS (hardware and software IDs). A chassis label alone never enables a write.
- Multiple matches: the most specific wins (more selectors set). A tie is an error at build time.

## 4. Entry types

### 4.1 DID (data identifier)

```yaml
dids:
  - id: 0xF190
    name: VIN
    session: default
    read: { service: 0x22 }
    codec: { type: ascii, length: 17 }
    risk_tier: T0
    provenance: { source_type: public_standard, ref: "ISO 14229 / common practice" }
    license: CC0-1.0
```

Byte example from `protocols.md`: request `7E0: 03 22 F1 90`, positive reply `62 F1 90 <17 ASCII>` over ISO-TP.

Codec types: `ascii`, `uint`, `int`, `bytes`, `bitfield`, `enum`, `scaled` (raw * factor + offset, with unit), `table` (lookup). A codec never contains code, only declarative fields. No expression language in v1, only `factor` and `offset`, so packs cannot execute anything.

### 4.2 PID (OBD-II mode 01)

```yaml
pids:
  - id: 0x0C
    name: Engine speed
    mode: 0x01
    bytes: 2
    formula: { kind: linear, expr_ref: "(256*A+B)/4", factor: 0.25, offset: 0, unit: rpm }
    provenance: { source_type: public_standard, ref: "SAE J1979 summaries" }
```

Check: reply `41 0C 1A F8` gives (256*0x1A + 0xF8)/4 = 1726 rpm (`protocols.md`). The validator replays this as a unit test.

### 4.3 DTC description

```yaml
dtcs:
  - code: P0133
    format: obd2_2byte              # or uds_3byte
    system: powertrain
    text: "Upstream oxygen sensor reacts slowly"   # contributor's own words
    class: emissions                # emissions | safety | comfort | network | unknown
    plain: "The sensor before the catalytic converter is slow to respond."
    likely_causes: [sensor_aged, wiring, exhaust_leak]
    freeze_frame_hint: [0x0C, 0x05, 0x04]
    clear_policy: after_repair
    applicability_ref: v1
    provenance: { source_type: community_report, contributors: [ "gh:alice" ] }
```

- `text` is written, not copied. SAE J2012 wording is paid; generic P0xxx text must be paraphrased (open question 6 in `open-source-landscape-and-legal.md`).
- `class` drives the fault policy in `fault-handling.md`. Default for unknown is `safety` (strictest).
- 3-byte UDS codes use a 6-hex `code` plus optional `fault_type_byte`.

### 4.4 Coding option

This is the BimmerCode-style catalogue, as open data.

```yaml
coding:
  - id: ambient-colour-count        # illustrative placeholder
    label: "Ambient light colours available"
    category: lighting
    module: kombi-example
    applicability_ref: v1
    block: { did: 0x3000, length: 64 }          # the coding block read/written
    field:
      byte_offset: 12                           # 0-based
      bit_offset: 4                             # 0 = LSB of the byte
      bit_length: 2
      endianness: big                           # only matters if bit_length spans bytes
    values:
      - { raw: 0b00, label: "Off" }
      - { raw: 0b01, label: "Standard" }
      - { raw: 0b10, label: "Extended" }
    default_raw: 0b01
    integrity:
      checksum: { kind: crc16_ccitt, covers: [0, 61], store_at: 62, store_len: 2 }
    requires: ["variant matches v1", "backup exists"]
    side_effects: []
    revertable: true
    risk_tier: T1
    warnings: ["Back up first. Setting is applied after ignition cycle."]
    provenance:
      source_type: owner_capture
      method: "diff of coding block before/after toggling the setting in the car's own menu"
      tested_on:
        - { chassis: G05, model_year: 2021, hw: "<id>", sw: "<ver>", date: 2026-09-02, result: pass, contributors: ["gh:bob"] }
      confidence: medium
    license: CC-BY-4.0
```

All values above are illustrative. Real offsets only come from owner captures.

Rules:
- Offsets are bytes from the start of the block, bits from the LSB. Fields may not overlap unless marked `shared: true`.
- `integrity.checksum` is mandatory for T1+ entries unless `checksum: none` is justified in `provenance.notes`. The research says the checksum belongs in the data model and the tool must refuse to write if it does not know it (`coding-security-failsafe.md` section 4).
- Discovery by diffing the car's own menu states is the clean method named in `bimmerlink-bimmercode-analysis.md` (open question 1). It is also the only evidence type accepted for new coding entries.
- `revertable: false` forces stronger confirmation. It is set when the module has anti-rollback or signed config (open question 5, `coding-security-failsafe.md`).

### 4.5 Routine and service function

Only routines with a declared `risk_tier` and a `purpose` enum (`service_reset`, `battery_registration`, `actuator_test`, `calibration`). Routines in the deny classes (section 6) cannot be defined.

## 5. Provenance and license fields

| Field | Values | Notes |
|---|---|---|
| `source_type` | `public_standard`, `vendor_public_doc`, `owner_capture`, `community_report`, `maintainer_lab` | `user_supplied_odx` is **never** accepted in shared packs |
| `ref` | URL or doc name | Required for the first two |
| `method` | free text | Required for `owner_capture` |
| `tested_on[]` | chassis, year, hw, sw, date, result, contributors | At least one `pass` for T1+ |
| `confidence` | low, medium, high | high needs two independent testers |
| `license` | SPDX id | Allowed: CC0-1.0, CC-BY-4.0 |
| `contributor_attestation` | bool | Contributor states they own the capture and had the right to submit (per `open-source-landscape-and-legal.md`, implication 3) |

Data-file licensing is separate from code licensing. The pack repo uses CC-BY-4.0 (attribution kept) with CC0 for pure standards facts.

## 6. Validation tooling

CLI `opendiag-pack` (Python, uses odxtools only for the optional ODX-import helper):

| Command | Does |
|---|---|
| `lint` | JSON Schema validation (draft 2020-12) plus semantic rules below |
| `test` | Replays golden byte vectors against the pure-Python fake ECU on python-can's virtual bus (tier 1 test rig in `open-source-landscape-and-legal.md`) |
| `diffcheck` | Compares coding fields against two captured blocks and confirms only the declared bits changed |
| `build` | Compiles YAML to JSON, hashes, writes manifest |
| `sign` | Ed25519 signature, run offline by maintainers only |
| `scan` | Provenance and banned-content scan |

Semantic rules (CI blocks merge on any failure):
1. No overlapping fields in one block unless `shared`.
2. Offsets and lengths fit the block. Checksum range does not overlap a field it must cover incorrectly.
3. Every `values[].raw` fits `bit_length`.
4. Applicability ranges parse and have no equal-specificity overlaps.
5. T1+ entries have a passing `tested_on` and a `revertable` flag.
6. **Banned content scan**: reject file extensions and names tied to OEM data, any field named seed/key/algorithm, byte strings that look like secrets, text that matches known OEM tool strings, and any entry with `class: emissions` that disables or masks (see `fault-handling.md`, blocked list).
7. Deny-class check: routines or coding that touch airbag/SRS, immobilizer, odometer, speed limiter, or emissions suppression fail the build (refusal list, `open-source-landscape-and-legal.md` implication 5).
8. Text similarity check against a hash list of known-proprietary strings, maintained by maintainers (unverified feasibility).
9. License is allowed SPDX and attestation is true.

## 7. Community database (Supabase / Postgres)

Role of the database: collect contributions, run review, record release signatures. It is not on the read path of the app. The app works fully offline with a signed pack. Optional sign-in is only needed to contribute or sync personal backups (backups stay local by default).

Capacity check: YAML submissions are small, so 500 MB is ample. Keep file uploads (capture logs) under the 50 MB per-file limit, cap each at 5 MB and prune after review. Add a nightly `pg_dump` from a scheduled job to git or object storage because the free tier has no automatic backups. [S1]

### Schema

```sql
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
```

### Helper functions

```sql
create function public.role_of(uid uuid) returns app_role
language sql stable security definer set search_path = public as
$$ select role from profiles where id = uid $$;
revoke execute on function public.role_of from anon;
```

### RLS policies

Rules follow Supabase guidance: enable RLS on every exposed table, name roles with `to`, wrap `auth.uid()` in `select` for per-statement evaluation, check non-null, and write one policy per command. [S2]

```sql
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
```

Notes:
- Status moves `submitted -> in_review -> approved/rejected` happen in a `security definer` function `review_transition(contribution_id, verdict)` that checks two distinct reviewers approved. Clients cannot set those states directly (the update policy only permits author-side states).
- `merged` is set by CI using the secret key, which bypasses RLS only when no user token is attached. The secret key lives in the CI secret store, never in the app or browser. [S2]
- Anonymous sign-in users have the `authenticated` role, so `attested_rights` and a handle are required to insert. Anonymous browsing needs no account. [S2]
- Add pgTAP tests for allow and deny cases (author reads other's draft: deny; self-promotion: deny; reviewer on own work: deny). [S2]
- Rate limit with an Edge Function in front of insert (free tier allows 500,000 invocations). [S1]

### Review workflow

1. Contributor opens the in-app "Submit finding" form. The app runs `opendiag-pack lint` locally first.
2. Server-side schema check on insert (`payload_hash`, size cap).
3. Two reviewers tick the checklist: provenance real, wording original, no deny-class, `tested_on` plausible.
4. CI turns approved rows into a git pull request on the pack repo. The merge is the source of truth.
5. Maintainers build, sign offline, publish a release. A row goes into `releases` with the hash and signature. The app checks it.

### Signed packs

- Ed25519 key kept offline (hardware token). Public key is compiled into the app, with a second backup key for rotation.
- The signature covers the manifest hash, which lists each file hash. Replay protection: `version` must increase and the app stores the highest seen.
- Per the device rules, creating the key is an owner decision and gets a registry row in `~/.claude/CREDENTIALS.md` (name only, no value).

## Open questions

1. Is a coding-bit map derived from an owner's own diff capture free of copyright and database-right claims? (`mercedes-xentry-das.md`, open question; needs counsel.)
2. Are paraphrased generic DTC texts safe relative to SAE J2012 wording?
3. Can banned-content similarity scanning work without holding the proprietary strings it checks for?
4. Is the free tier enough once attachments grow? Plan a move to a paid tier or Cloudflare R2 for captures.
5. Checksum location and who computes it per module needs bench verification (`coding-security-failsafe.md` open question 3).

## Sources

- [S1] Supabase pricing and free-plan limits: https://supabase.com/pricing
- [S2] Supabase Row Level Security guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- odxtools (MIT): https://github.com/mercedes-benz/odxtools
- JSON Schema 2020-12: https://json-schema.org/draft/2020-12
- Research notes used: `bmw-ista-architecture.md`, `bimmerlink-bimmercode-analysis.md`, `coding-security-failsafe.md`, `open-source-landscape-and-legal.md`, `protocols.md`, `mercedes-xentry-das.md`, `toyota-lexus-techstream.md`
