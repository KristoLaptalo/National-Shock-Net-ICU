-- ============================================================================
-- NATIONAL SHOCK REGISTRY - ANONYMIZATION SCHEMA
-- ============================================================================
--
-- Privacy-by-design schema for Supabase (PostgreSQL) with Row Level Security
--
-- Key principles:
--   1. TT (Tracking Token) exists only during active phase, never in archive
--   2. AID (Archive ID) generated only at archive moment
--   3. No mapping tables in cloud - re-identification only possible at hospital
--   4. Registry ID displayed to doctor for copying into Decursus Morbi
--   5. Strict role separation: clinicians (active) vs researchers (archive)
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

create extension if not exists pgcrypto;  -- For gen_random_uuid(), encrypt/decrypt


-- ============================================================================
-- SECTION 2: CUSTOM TYPES
-- ============================================================================

-- Shock classification types (matches medical domain)
do $$ begin
  create type public.shock_type_enum as enum (
    'cardiogenic',
    'septic',
    'hypovolemic',
    'distributive',
    'obstructive',
    'mixed',
    'unclassified'
  );
exception when duplicate_object then null;
end $$;

-- SCAI shock stages
do $$ begin
  create type public.scai_stage_enum as enum ('A', 'B', 'C', 'D', 'E');
exception when duplicate_object then null;
end $$;

-- Tracking status
do $$ begin
  create type public.tracking_status_enum as enum ('active', 'closed');
exception when duplicate_object then null;
end $$;

-- Audit event types
do $$ begin
  create type public.audit_event_enum as enum (
    'tracking_created',
    'tracking_updated',
    'tracking_accessed',
    'tracking_archived',
    'tracking_purged',
    'archive_accessed',
    'archive_exported'
  );
exception when duplicate_object then null;
end $$;


-- ============================================================================
-- SECTION 3: HELPER FUNCTIONS
-- ============================================================================

-- Get current user's application role from JWT custom claim
create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'app_role',
    'anonymous'
  );
$$;

-- Check if caller is using service role key
create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'role',
    ''
  ) = 'service_role';
$$;

-- Check if user has clinical access (can access active tracking)
create or replace function public.has_clinical_access()
returns boolean
language sql
stable
as $$
  select public.is_service_role()
    or public.current_app_role() in ('hospital_admin', 'clinician');
$$;

-- Check if user has research access (can access archive)
create or replace function public.has_research_access()
returns boolean
language sql
stable
as $$
  select public.is_service_role()
    or public.current_app_role() in ('hospital_admin', 'researcher');
$$;

-- Check if user has admin access
create or replace function public.has_admin_access()
returns boolean
language sql
stable
as $$
  select public.is_service_role()
    or public.current_app_role() = 'hospital_admin';
$$;

-- Generate human-readable registry ID (NSN-XXXX-XXXX-XXXX format)
create or replace function public.generate_registry_id()
returns text
language plpgsql
as $$
declare
  v_uuid uuid := gen_random_uuid();
  v_hex text;
begin
  -- Take first 12 hex chars from UUID, format with dashes
  v_hex := upper(replace(v_uuid::text, '-', ''));
  return 'NSN-' ||
         substring(v_hex from 1 for 4) || '-' ||
         substring(v_hex from 5 for 4) || '-' ||
         substring(v_hex from 9 for 4);
end;
$$;


-- ============================================================================
-- SECTION 4: VALIDATION FUNCTIONS
-- ============================================================================

-- List of forbidden PII field names
create or replace function public.get_forbidden_pii_fields()
returns text[]
language sql
immutable
as $$
  select array[
    -- Names
    'name', 'patient_name', 'full_name', 'first_name', 'last_name',
    'ime', 'prezime', 'ime_prezime',
    -- National IDs
    'ssn', 'social_security', 'national_id', 'oib', 'jmbg', 'mbo',
    -- Contact info
    'address', 'street', 'city', 'zip', 'postal', 'adresa', 'ulica', 'grad',
    'phone', 'mobile', 'email', 'telefon', 'mobitel',
    -- Medical record numbers (external)
    'mrn', 'medical_record', 'chart_number', 'mbp', 'maticni_broj'
  ];
$$;

-- Validate JSONB contains no PII fields or patterns
create or replace function public.validate_no_pii(p_json jsonb)
returns boolean
language plpgsql
as $$
declare
  v_forbidden text[] := public.get_forbidden_pii_fields();
  v_key text;
  v_text text;
begin
  if p_json is null then
    return true;
  end if;

  -- Check all keys recursively for forbidden names
  for v_key in select jsonb_object_keys(p_json) loop
    if lower(v_key) = any(v_forbidden) then
      raise exception 'PII field detected: %. Remove before submission.', v_key;
    end if;
  end loop;

  -- Check for email patterns in string representation
  v_text := p_json::text;
  if v_text ~ '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' then
    raise exception 'Email pattern detected in data. Remove before submission.';
  end if;

  -- Check for Croatian OIB pattern (11 digits)
  if v_text ~ '\b[0-9]{11}\b' then
    raise warning 'Possible OIB detected. Please verify no national ID is included.';
  end if;

  return true;
end;
$$;

-- Validate hemodynamic data structure
create or replace function public.validate_hemodynamics(p_json jsonb)
returns boolean
language plpgsql
as $$
begin
  if p_json is null or p_json = '{}'::jsonb then
    return true;
  end if;

  -- Validate MAP if present
  if p_json ? 'map' then
    if (p_json->>'map')::numeric < 0 or (p_json->>'map')::numeric > 250 then
      raise exception 'MAP value out of valid range (0-250)';
    end if;
  end if;

  -- Validate lactate if present
  if p_json ? 'lactate' then
    if (p_json->>'lactate')::numeric < 0 or (p_json->>'lactate')::numeric > 30 then
      raise exception 'Lactate value out of valid range (0-30)';
    end if;
  end if;

  -- Validate heart rate if present
  if p_json ? 'heart_rate' then
    if (p_json->>'heart_rate')::numeric < 0 or (p_json->>'heart_rate')::numeric > 300 then
      raise exception 'Heart rate out of valid range (0-300)';
    end if;
  end if;

  return true;
end;
$$;


-- ============================================================================
-- SECTION 5: CORE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 5.1 ACTIVE TRACKING TABLE
-- -----------------------------------------------------------------------------
-- Stores cases during active clinical phase
-- TT (Tracking Token) is the primary key - temporary identifier
-- NO AID stored here - generated only at archive time
-- -----------------------------------------------------------------------------

create table if not exists public.active_tracking (
  -- Primary identifier (temporary, destroyed on archive)
  tt uuid primary key default gen_random_uuid(),

  -- Hospital reference (for multi-tenant scenarios)
  hospital_id uuid null,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  closed_at timestamptz null,

  -- Status
  status public.tracking_status_enum not null default 'active',

  -- Clinical classification (structured, type-safe)
  shock_type public.shock_type_enum not null default 'unclassified',
  scai_stage public.scai_stage_enum not null,

  -- Demographics (anonymized: only decade and sex)
  age_decade smallint not null check (age_decade between 0 and 110),
  sex char(1) not null check (sex in ('M', 'F', 'U')),

  -- Clinical data (validated JSONB)
  admission_data jsonb not null default '{}'::jsonb,
  hemodynamics jsonb not null default '[]'::jsonb,  -- Array of timestamped readings
  laboratory jsonb not null default '[]'::jsonb,
  ventilation jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  procedures jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,

  -- Outcome (recorded before archive)
  outcome_status text null check (outcome_status in (
    'discharged_home', 'discharged_rehab', 'discharged_other',
    'transferred', 'deceased', 'ongoing'
  )),
  outcome_data jsonb null,

  -- Constraints
  constraint valid_admission_data check (validate_no_pii(admission_data)),
  constraint valid_hemodynamics check (validate_no_pii(hemodynamics)),
  constraint valid_laboratory check (validate_no_pii(laboratory)),
  constraint valid_notes check (validate_no_pii(notes)),
  constraint valid_outcome_data check (validate_no_pii(outcome_data))
);

-- Indexes for active_tracking
create index if not exists idx_active_tracking_hospital
  on public.active_tracking(hospital_id) where hospital_id is not null;
create index if not exists idx_active_tracking_status
  on public.active_tracking(status);
create index if not exists idx_active_tracking_expires
  on public.active_tracking(expires_at) where status = 'active';
create index if not exists idx_active_tracking_scai
  on public.active_tracking(scai_stage);
create index if not exists idx_active_tracking_created
  on public.active_tracking(created_at);

-- Trigger to update updated_at timestamp
create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trigger_active_tracking_updated on public.active_tracking;
create trigger trigger_active_tracking_updated
  before update on public.active_tracking
  for each row execute function public.update_timestamp();


-- -----------------------------------------------------------------------------
-- 5.2 REGISTRY ARCHIVE TABLE
-- -----------------------------------------------------------------------------
-- Permanent anonymized archive - AID only, NO tracking token
-- This is the research dataset
-- -----------------------------------------------------------------------------

create table if not exists public.registry_archive (
  -- Archive identifier (generated at archive time, never before)
  aid uuid primary key,

  -- Human-readable ID for Decursus Morbi (NSN-XXXX-XXXX-XXXX)
  registry_id text unique not null,

  -- Archive metadata
  archived_at timestamptz not null default now(),
  archive_version smallint not null default 1,

  -- Hospital reference (anonymized - just for statistics)
  hospital_region text null,  -- e.g., 'North', 'South' - not exact hospital

  -- Clinical classification (denormalized for query performance)
  shock_type public.shock_type_enum not null,
  scai_stage_admission public.scai_stage_enum not null,
  scai_stage_worst public.scai_stage_enum null,
  age_decade smallint not null,
  sex char(1) not null,

  -- Aggregated clinical data (no timestamps, no sequence info)
  aggregated_data jsonb not null default '{}'::jsonb,

  -- Outcome
  outcome_status text null,
  length_of_stay_days smallint null,
  icu_days smallint null,

  -- Cohort flags for research queries
  cohort_flags jsonb not null default '{}'::jsonb,

  -- Data integrity
  data_checksum text generated always as (
    encode(sha256(aggregated_data::text::bytea), 'hex')
  ) stored,

  -- Constraints
  constraint valid_aggregated_data check (validate_no_pii(aggregated_data)),
  constraint valid_cohort_flags check (validate_no_pii(cohort_flags))
);

-- Indexes for registry_archive
create index if not exists idx_archive_registry_id
  on public.registry_archive(registry_id);
create index if not exists idx_archive_shock_type
  on public.registry_archive(shock_type);
create index if not exists idx_archive_scai
  on public.registry_archive(scai_stage_admission);
create index if not exists idx_archive_outcome
  on public.registry_archive(outcome_status);
create index if not exists idx_archive_archived_at
  on public.registry_archive(archived_at);
create index if not exists idx_archive_age_sex
  on public.registry_archive(age_decade, sex);


-- -----------------------------------------------------------------------------
-- 5.3 AUDIT LOG TABLE
-- -----------------------------------------------------------------------------
-- Append-only audit trail for compliance
-- NEVER logs TT - only AID after archival
-- -----------------------------------------------------------------------------

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,

  -- Event details
  event_time timestamptz not null default now(),
  event_type public.audit_event_enum not null,

  -- Actor information
  actor_role text not null,
  actor_id uuid null,  -- From auth.uid() if available

  -- Reference (NEVER TT, only AID after archive)
  aid uuid null,
  registry_id text null,

  -- Request metadata
  ip_address inet null,
  user_agent text null,

  -- Additional context
  metadata jsonb not null default '{}'::jsonb,

  -- Constraints
  constraint valid_audit_metadata check (validate_no_pii(metadata))
);

-- Indexes for audit_log
create index if not exists idx_audit_event_time
  on public.audit_log(event_time);
create index if not exists idx_audit_event_type
  on public.audit_log(event_type);
create index if not exists idx_audit_aid
  on public.audit_log(aid) where aid is not null;
create index if not exists idx_audit_actor
  on public.audit_log(actor_role, actor_id);


-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table public.active_tracking enable row level security;
alter table public.registry_archive enable row level security;
alter table public.audit_log enable row level security;

-- -----------------------------------------------------------------------------
-- 6.1 ACTIVE TRACKING POLICIES
-- -----------------------------------------------------------------------------
-- Clinicians: access via RPC only (no direct SELECT to prevent enumeration)
-- Hospital Admin / Service Role: full access
-- Researchers: NO access
-- -----------------------------------------------------------------------------

-- Admin/Service: full access
create policy active_tracking_admin_all
  on public.active_tracking
  for all
  using (public.has_admin_access())
  with check (public.has_admin_access());

-- Clinician: can INSERT new cases
create policy active_tracking_clinician_insert
  on public.active_tracking
  for insert
  with check (public.current_app_role() = 'clinician');

-- NOTE: No SELECT policy for clinicians - they must use RPC functions
-- This prevents enumeration of tracking tokens


-- -----------------------------------------------------------------------------
-- 6.2 REGISTRY ARCHIVE POLICIES
-- -----------------------------------------------------------------------------
-- Researchers: read-only access
-- Hospital Admin / Service: full access
-- Clinicians: read-only access
-- -----------------------------------------------------------------------------

-- Admin/Service: full access
create policy registry_archive_admin_all
  on public.registry_archive
  for all
  using (public.has_admin_access())
  with check (public.has_admin_access());

-- Research read access
create policy registry_archive_research_read
  on public.registry_archive
  for select
  using (public.has_research_access());

-- Clinician read access (to verify their archived cases)
create policy registry_archive_clinician_read
  on public.registry_archive
  for select
  using (public.current_app_role() = 'clinician');


-- -----------------------------------------------------------------------------
-- 6.3 AUDIT LOG POLICIES
-- -----------------------------------------------------------------------------
-- Insert: service role only (via functions)
-- Select: admin only
-- Update/Delete: nobody
-- -----------------------------------------------------------------------------

-- Insert via service role
create policy audit_log_insert
  on public.audit_log
  for insert
  with check (public.is_service_role());

-- Admin read access
create policy audit_log_admin_read
  on public.audit_log
  for select
  using (public.has_admin_access());


-- ============================================================================
-- SECTION 7: DATA AGGREGATION FUNCTIONS
-- ============================================================================

-- Aggregate time-series hemodynamic data into summary statistics
create or replace function public.aggregate_hemodynamics(p_data jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_map_values numeric[];
  v_lactate_values numeric[];
  v_hr_values numeric[];
begin
  if p_data is null or jsonb_array_length(p_data) = 0 then
    return v_result;
  end if;

  -- Extract MAP values
  select array_agg((elem->>'map')::numeric)
  into v_map_values
  from jsonb_array_elements(p_data) as elem
  where elem ? 'map' and elem->>'map' is not null;

  -- Extract Lactate values
  select array_agg((elem->>'lactate')::numeric)
  into v_lactate_values
  from jsonb_array_elements(p_data) as elem
  where elem ? 'lactate' and elem->>'lactate' is not null;

  -- Extract Heart Rate values
  select array_agg((elem->>'heart_rate')::numeric)
  into v_hr_values
  from jsonb_array_elements(p_data) as elem
  where elem ? 'heart_rate' and elem->>'heart_rate' is not null;

  -- Build aggregated result
  if array_length(v_map_values, 1) > 0 then
    v_result := v_result || jsonb_build_object(
      'map_min', (select min(v) from unnest(v_map_values) v),
      'map_max', (select max(v) from unnest(v_map_values) v),
      'map_avg', round((select avg(v) from unnest(v_map_values) v)::numeric, 1),
      'map_readings', array_length(v_map_values, 1)
    );
  end if;

  if array_length(v_lactate_values, 1) > 0 then
    v_result := v_result || jsonb_build_object(
      'lactate_min', (select min(v) from unnest(v_lactate_values) v),
      'lactate_max', (select max(v) from unnest(v_lactate_values) v),
      'lactate_avg', round((select avg(v) from unnest(v_lactate_values) v)::numeric, 2),
      'lactate_readings', array_length(v_lactate_values, 1)
    );
  end if;

  if array_length(v_hr_values, 1) > 0 then
    v_result := v_result || jsonb_build_object(
      'hr_min', (select min(v) from unnest(v_hr_values) v),
      'hr_max', (select max(v) from unnest(v_hr_values) v),
      'hr_avg', round((select avg(v) from unnest(v_hr_values) v)::numeric, 0),
      'hr_readings', array_length(v_hr_values, 1)
    );
  end if;

  return v_result;
end;
$$;

-- Build complete aggregated payload for archive
create or replace function public.build_archive_payload(
  p_admission_data jsonb,
  p_hemodynamics jsonb,
  p_laboratory jsonb,
  p_ventilation jsonb,
  p_medications jsonb,
  p_procedures jsonb
)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_result jsonb := '{}'::jsonb;
begin
  -- Aggregate hemodynamics
  v_result := v_result || jsonb_build_object(
    'hemodynamics', public.aggregate_hemodynamics(p_hemodynamics)
  );

  -- Count entries (no details, just counts)
  v_result := v_result || jsonb_build_object(
    'lab_count', coalesce(jsonb_array_length(p_laboratory), 0),
    'vent_readings', coalesce(jsonb_array_length(p_ventilation), 0),
    'medication_count', coalesce(jsonb_array_length(p_medications), 0),
    'procedure_count', coalesce(jsonb_array_length(p_procedures), 0)
  );

  -- Include admission criteria (already structured)
  if p_admission_data is not null and p_admission_data != '{}'::jsonb then
    v_result := v_result || jsonb_build_object(
      'admission_criteria', p_admission_data
    );
  end if;

  return v_result;
end;
$$;


-- ============================================================================
-- SECTION 8: RPC FUNCTIONS - TRACKING OPERATIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 8.1 CREATE NEW TRACKING
-- -----------------------------------------------------------------------------
create or replace function public.create_tracking(
  p_hospital_id uuid,
  p_shock_type public.shock_type_enum,
  p_scai_stage public.scai_stage_enum,
  p_age_decade smallint,
  p_sex char(1),
  p_admission_data jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tt uuid;
begin
  -- Check authorization
  if not public.has_clinical_access() then
    raise exception 'Not authorized to create tracking';
  end if;

  -- Validate inputs
  if not public.validate_no_pii(p_admission_data) then
    raise exception 'PII detected in admission data';
  end if;

  -- Create tracking record
  insert into public.active_tracking (
    hospital_id,
    shock_type,
    scai_stage,
    age_decade,
    sex,
    admission_data
  ) values (
    p_hospital_id,
    p_shock_type,
    p_scai_stage,
    p_age_decade,
    p_sex,
    p_admission_data
  )
  returning tt into v_tt;

  -- Log event (no TT in log!)
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_created',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object('hospital_id', p_hospital_id)
  );

  -- Return TT to caller (hospital stores this temporarily)
  return jsonb_build_object(
    'success', true,
    'tracking_token', v_tt,
    'expires_at', now() + interval '90 days',
    'message', 'Store this token securely. It will be destroyed on archive.'
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- 8.2 GET TRACKING BY TOKEN (No enumeration possible)
-- -----------------------------------------------------------------------------
create or replace function public.get_tracking(p_tt uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
begin
  -- Check authorization
  if not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  -- Fetch record
  select
    tt, hospital_id, created_at, updated_at, expires_at, status,
    shock_type, scai_stage, age_decade, sex,
    admission_data, hemodynamics, laboratory, ventilation,
    medications, procedures, notes, outcome_status, outcome_data
  into v_record
  from public.active_tracking
  where tt = p_tt;

  if v_record.tt is null then
    raise exception 'Tracking token not found';
  end if;

  -- Log access
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_accessed',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object('action', 'read')
  );

  return to_jsonb(v_record);
end;
$$;


-- -----------------------------------------------------------------------------
-- 8.3 UPDATE TRACKING DATA
-- -----------------------------------------------------------------------------
create or replace function public.update_tracking(
  p_tt uuid,
  p_hemodynamics jsonb default null,
  p_laboratory jsonb default null,
  p_ventilation jsonb default null,
  p_medications jsonb default null,
  p_procedures jsonb default null,
  p_notes jsonb default null,
  p_scai_stage public.scai_stage_enum default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  -- Check authorization
  if not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  -- Check if record exists
  select exists(select 1 from public.active_tracking where tt = p_tt and status = 'active')
  into v_exists;

  if not v_exists then
    raise exception 'Tracking token not found or case is closed';
  end if;

  -- Update fields (append to arrays)
  update public.active_tracking
  set
    hemodynamics = case
      when p_hemodynamics is not null then hemodynamics || p_hemodynamics
      else hemodynamics
    end,
    laboratory = case
      when p_laboratory is not null then laboratory || p_laboratory
      else laboratory
    end,
    ventilation = case
      when p_ventilation is not null then ventilation || p_ventilation
      else ventilation
    end,
    medications = case
      when p_medications is not null then medications || p_medications
      else medications
    end,
    procedures = case
      when p_procedures is not null then procedures || p_procedures
      else procedures
    end,
    notes = case
      when p_notes is not null then notes || p_notes
      else notes
    end,
    scai_stage = coalesce(p_scai_stage, scai_stage)
  where tt = p_tt;

  -- Log update
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_updated',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object('action', 'data_update')
  );

  return jsonb_build_object('success', true, 'updated_at', now());
end;
$$;


-- -----------------------------------------------------------------------------
-- 8.4 SET OUTCOME (Before archive)
-- -----------------------------------------------------------------------------
create or replace function public.set_tracking_outcome(
  p_tt uuid,
  p_outcome_status text,
  p_outcome_data jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check authorization
  if not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  -- Validate outcome status
  if p_outcome_status not in (
    'discharged_home', 'discharged_rehab', 'discharged_other',
    'transferred', 'deceased', 'ongoing'
  ) then
    raise exception 'Invalid outcome status';
  end if;

  -- Update outcome
  update public.active_tracking
  set
    outcome_status = p_outcome_status,
    outcome_data = p_outcome_data,
    status = 'closed',
    closed_at = now()
  where tt = p_tt and status = 'active';

  if not found then
    raise exception 'Tracking token not found or already closed';
  end if;

  return jsonb_build_object(
    'success', true,
    'message', 'Outcome recorded. Case ready for archival.'
  );
end;
$$;


-- ============================================================================
-- SECTION 9: RPC FUNCTIONS - ARCHIVE OPERATIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 9.1 CLOSE AND ARCHIVE TRACKING (Main archive function)
-- -----------------------------------------------------------------------------
-- This is the "point of no return" - TT is destroyed, AID is created
-- Returns Registry ID for doctor to copy into Decursus Morbi
-- -----------------------------------------------------------------------------
create or replace function public.close_and_archive_tracking(p_tt uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
  v_aid uuid;
  v_registry_id text;
  v_aggregated jsonb;
  v_scai_worst public.scai_stage_enum;
  v_los_days smallint;
  v_icu_days smallint;
begin
  -- Check authorization (hospital admin or service role only)
  if not public.has_admin_access() then
    raise exception 'Not authorized to archive cases';
  end if;

  -- Lock and fetch the record
  select *
  into v_record
  from public.active_tracking
  where tt = p_tt
  for update;

  if v_record.tt is null then
    raise exception 'Tracking token not found';
  end if;

  if v_record.outcome_status is null then
    raise exception 'Cannot archive: outcome not recorded. Call set_tracking_outcome first.';
  end if;

  -- Generate archive identifiers NOW (not before)
  v_aid := gen_random_uuid();
  v_registry_id := public.generate_registry_id();

  -- Calculate derived fields
  v_los_days := extract(day from (coalesce(v_record.closed_at, now()) - v_record.created_at))::smallint;
  v_icu_days := v_los_days;  -- Simplified; could be calculated differently

  -- Determine worst SCAI stage from hemodynamics history
  -- (This is a placeholder - implement based on your tracking of SCAI changes)
  v_scai_worst := v_record.scai_stage;

  -- Build aggregated payload (removes all temporal/sequential info)
  v_aggregated := public.build_archive_payload(
    v_record.admission_data,
    v_record.hemodynamics,
    v_record.laboratory,
    v_record.ventilation,
    v_record.medications,
    v_record.procedures
  );

  -- Add outcome data to aggregated payload
  v_aggregated := v_aggregated || jsonb_build_object(
    'outcome', v_record.outcome_data
  );

  -- INSERT into archive (AID and Registry ID created here)
  insert into public.registry_archive (
    aid,
    registry_id,
    archived_at,
    shock_type,
    scai_stage_admission,
    scai_stage_worst,
    age_decade,
    sex,
    aggregated_data,
    outcome_status,
    length_of_stay_days,
    icu_days
  ) values (
    v_aid,
    v_registry_id,
    now(),
    v_record.shock_type,
    v_record.scai_stage,
    v_scai_worst,
    v_record.age_decade,
    v_record.sex,
    v_aggregated,
    v_record.outcome_status,
    v_los_days,
    v_icu_days
  );

  -- DESTROY tracking token (point of no return)
  delete from public.active_tracking where tt = p_tt;

  -- Log archive event (includes AID, never TT)
  insert into public.audit_log (event_type, actor_role, actor_id, aid, registry_id, metadata)
  values (
    'tracking_archived',
    public.current_app_role(),
    auth.uid(),
    v_aid,
    v_registry_id,
    jsonb_build_object(
      'outcome', v_record.outcome_status,
      'los_days', v_los_days
    )
  );

  -- Return Registry ID for Decursus Morbi
  return jsonb_build_object(
    'success', true,
    'registry_id', v_registry_id,
    'archived_at', now(),
    'message', 'Case archived. Copy Registry ID to patient Decursus Morbi.',
    'important', 'This is the only link between registry data and patient identity.'
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- 9.2 LOOKUP ARCHIVE BY REGISTRY ID
-- -----------------------------------------------------------------------------
create or replace function public.lookup_archive(p_registry_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
begin
  -- Check authorization
  if not public.has_research_access() and not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  -- Normalize input
  p_registry_id := upper(trim(p_registry_id));

  -- Fetch record
  select
    aid, registry_id, archived_at,
    shock_type, scai_stage_admission, scai_stage_worst,
    age_decade, sex, aggregated_data,
    outcome_status, length_of_stay_days, icu_days
  into v_record
  from public.registry_archive
  where registry_id = p_registry_id;

  if v_record.aid is null then
    raise exception 'Registry ID not found';
  end if;

  -- Log access
  insert into public.audit_log (event_type, actor_role, actor_id, aid, registry_id)
  values (
    'archive_accessed',
    public.current_app_role(),
    auth.uid(),
    v_record.aid,
    v_record.registry_id
  );

  return to_jsonb(v_record);
end;
$$;


-- ============================================================================
-- SECTION 10: RESEARCH VIEW WITH K-ANONYMITY
-- ============================================================================

-- View that suppresses rare combinations to protect patient identity
create or replace view public.research_archive_safe as
with base as (
  select
    aid,
    registry_id,
    archived_at,
    shock_type,
    scai_stage_admission,
    scai_stage_worst,
    age_decade,
    sex,
    aggregated_data,
    outcome_status,
    length_of_stay_days,
    icu_days
  from public.registry_archive
),
with_cell_counts as (
  select
    *,
    count(*) over (
      partition by shock_type, scai_stage_admission, age_decade, sex
    ) as cell_size
  from base
)
select
  aid,
  registry_id,
  archived_at,
  shock_type,
  scai_stage_admission,
  scai_stage_worst,
  -- Suppress rare demographics
  case when cell_size >= 5 then age_decade else null end as age_decade_safe,
  case when cell_size >= 5 then sex else null end as sex_safe,
  -- Suppress detailed data for rare combinations
  case
    when cell_size >= 5 then aggregated_data
    else jsonb_build_object('suppressed', true, 'reason', 'k-anonymity')
  end as aggregated_data_safe,
  outcome_status,
  length_of_stay_days,
  icu_days,
  cell_size >= 5 as is_fully_releasable,
  cell_size as cohort_size
from with_cell_counts;

-- Grant access to researchers
grant select on public.research_archive_safe to authenticated;


-- ============================================================================
-- SECTION 11: MAINTENANCE FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 11.1 PURGE EXPIRED TRACKING (Scheduled cleanup)
-- -----------------------------------------------------------------------------
create or replace function public.purge_expired_tracking()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auto_archived int := 0;
  v_purged int := 0;
  v_record record;
begin
  -- Service role only
  if not public.is_service_role() then
    raise exception 'Not authorized';
  end if;

  -- Auto-archive expired active cases (preserve data)
  for v_record in
    select tt
    from public.active_tracking
    where expires_at < now()
      and status = 'active'
      and outcome_status is not null  -- Only if outcome recorded
  loop
    begin
      perform public.close_and_archive_tracking(v_record.tt);
      v_auto_archived := v_auto_archived + 1;
    exception when others then
      -- Log but continue
      raise warning 'Failed to auto-archive: %', sqlerrm;
    end;
  end loop;

  -- Purge closed cases older than 30 days (already archived)
  delete from public.active_tracking
  where status = 'closed'
    and closed_at < now() - interval '30 days';

  get diagnostics v_purged = row_count;

  -- Purge expired cases WITHOUT outcome (data loss - but they expired)
  delete from public.active_tracking
  where expires_at < now() - interval '30 days'
    and outcome_status is null;

  get diagnostics v_purged = v_purged + row_count;

  -- Log purge event
  insert into public.audit_log (event_type, actor_role, metadata)
  values (
    'tracking_purged',
    'service_role',
    jsonb_build_object(
      'auto_archived', v_auto_archived,
      'purged', v_purged,
      'timestamp', now()
    )
  );

  return jsonb_build_object(
    'success', true,
    'auto_archived', v_auto_archived,
    'purged', v_purged,
    'executed_at', now()
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- 11.2 GET REGISTRY STATISTICS (For admin dashboard)
-- -----------------------------------------------------------------------------
create or replace function public.get_registry_statistics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  return jsonb_build_object(
    'active_cases', (select count(*) from public.active_tracking where status = 'active'),
    'closed_pending_archive', (select count(*) from public.active_tracking where status = 'closed'),
    'archived_total', (select count(*) from public.registry_archive),
    'archived_this_month', (
      select count(*) from public.registry_archive
      where archived_at >= date_trunc('month', now())
    ),
    'outcome_distribution', (
      select jsonb_object_agg(outcome_status, cnt)
      from (
        select outcome_status, count(*) as cnt
        from public.registry_archive
        group by outcome_status
      ) t
    ),
    'shock_type_distribution', (
      select jsonb_object_agg(shock_type, cnt)
      from (
        select shock_type::text, count(*) as cnt
        from public.registry_archive
        group by shock_type
      ) t
    ),
    'generated_at', now()
  );
end;
$$;


-- ============================================================================
-- SECTION 12: PHASE 4 - ADDITIONAL RPC FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 12.1 HOSPITAL TABLE (for multi-tenant support)
-- -----------------------------------------------------------------------------
create table if not exists public.hospital (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text null,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hospital_status on public.hospital(status);

-- -----------------------------------------------------------------------------
-- 12.2 SUBSCRIPTION TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.subscription (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospital(id),
  current_tier text null check (current_tier in ('basic', 'standard', 'premium', 'unlimited')),
  requested_tier text null check (requested_tier in ('basic', 'standard', 'premium', 'unlimited')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  monthly_limit integer not null default 10,
  current_usage integer not null default 0,
  expires_at timestamptz null,
  requested_at timestamptz not null default now(),
  approved_at timestamptz null,
  rejected_at timestamptz null,
  rejection_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscription_hospital on public.subscription(hospital_id);
create index if not exists idx_subscription_status on public.subscription(status);

-- Enable RLS
alter table public.hospital enable row level security;
alter table public.subscription enable row level security;

-- Policies
create policy hospital_admin_all on public.hospital for all using (public.has_admin_access());
create policy hospital_read on public.hospital for select using (public.has_clinical_access());
create policy subscription_admin_all on public.subscription for all using (public.has_admin_access());
create policy subscription_read on public.subscription for select using (public.has_clinical_access());

-- -----------------------------------------------------------------------------
-- 12.3 ADD APPROVAL STATUS TO TRACKING
-- -----------------------------------------------------------------------------
-- Add approval_status column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'active_tracking' and column_name = 'approval_status'
  ) then
    alter table public.active_tracking add column approval_status text
      default 'pending' check (approval_status in ('pending', 'approved', 'rejected'));
    alter table public.active_tracking add column approval_notes text null;
    alter table public.active_tracking add column rejection_reason text null;
    create index idx_active_tracking_approval on public.active_tracking(approval_status);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 12.4 GET HOSPITAL ACTIVE CASES
-- -----------------------------------------------------------------------------
create or replace function public.get_hospital_active_cases(p_hospital_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  return coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'tt', t.tt,
        'hospital_id', t.hospital_id,
        'hospital_name', coalesce(h.name, 'Unknown'),
        'shock_type', t.shock_type,
        'scai_stage', t.scai_stage,
        'age_decade', t.age_decade,
        'sex', t.sex,
        'created_at', t.created_at,
        'approval_status', coalesce(t.approval_status, 'pending'),
        'admission_data', t.admission_data
      )
    )
    from public.active_tracking t
    left join public.hospital h on h.id = t.hospital_id
    where t.hospital_id = p_hospital_id
      and t.status = 'active'),
    '[]'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.5 GET HOSPITAL DASHBOARD STATS
-- -----------------------------------------------------------------------------
create or replace function public.get_hospital_dashboard_stats(p_hospital_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active int;
  v_pending int;
  v_archived int;
  v_usage int;
  v_limit int;
begin
  if not public.has_clinical_access() then
    raise exception 'Not authorized';
  end if;

  -- Count active cases
  select count(*) into v_active
  from public.active_tracking
  where hospital_id = p_hospital_id and status = 'active';

  -- Count pending approval
  select count(*) into v_pending
  from public.active_tracking
  where hospital_id = p_hospital_id
    and status = 'active'
    and approval_status = 'pending';

  -- Count archived this month (from audit log)
  select count(*) into v_archived
  from public.audit_log
  where event_type = 'tracking_archived'
    and event_time >= date_trunc('month', now())
    and metadata->>'hospital_id' = p_hospital_id::text;

  -- Get subscription info
  select coalesce(current_usage, 0), coalesce(monthly_limit, 10)
  into v_usage, v_limit
  from public.subscription
  where hospital_id = p_hospital_id
    and status = 'approved'
  order by approved_at desc
  limit 1;

  return jsonb_build_object(
    'active_cases', coalesce(v_active, 0),
    'pending_approval', coalesce(v_pending, 0),
    'archived_this_month', coalesce(v_archived, 0),
    'subscription_usage', coalesce(v_usage, 0),
    'subscription_limit', coalesce(v_limit, 10)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.6 GET PENDING CASES (Admin)
-- -----------------------------------------------------------------------------
create or replace function public.get_pending_cases()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  return coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'tt', t.tt,
        'hospital_id', t.hospital_id,
        'hospital_name', coalesce(h.name, 'Unknown Hospital'),
        'shock_type', t.shock_type,
        'scai_stage', t.scai_stage,
        'age_decade', t.age_decade,
        'sex', t.sex,
        'created_at', t.created_at,
        'admission_data', t.admission_data
      )
      order by
        case t.scai_stage
          when 'E' then 1
          when 'D' then 2
          when 'C' then 3
          when 'B' then 4
          else 5
        end,
        t.created_at asc
    )
    from public.active_tracking t
    left join public.hospital h on h.id = t.hospital_id
    where t.status = 'active'
      and coalesce(t.approval_status, 'pending') = 'pending'),
    '[]'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.7 APPROVE CASE
-- -----------------------------------------------------------------------------
create or replace function public.approve_case(p_tt uuid, p_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  update public.active_tracking
  set
    approval_status = 'approved',
    approval_notes = p_notes,
    updated_at = now()
  where tt = p_tt and status = 'active';

  if not found then
    raise exception 'Case not found or already closed';
  end if;

  -- Log the approval
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_updated',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object('action', 'case_approved', 'notes', p_notes)
  );

  return jsonb_build_object('success', true, 'message', 'Case approved');
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.8 REJECT CASE
-- -----------------------------------------------------------------------------
create or replace function public.reject_case(p_tt uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Rejection reason is required';
  end if;

  update public.active_tracking
  set
    approval_status = 'rejected',
    rejection_reason = p_reason,
    updated_at = now()
  where tt = p_tt and status = 'active';

  if not found then
    raise exception 'Case not found or already closed';
  end if;

  -- Log the rejection
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_updated',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object('action', 'case_rejected', 'reason', p_reason)
  );

  return jsonb_build_object('success', true, 'message', 'Case rejected');
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.9 GET PENDING SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
create or replace function public.get_pending_subscriptions()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  return coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'hospital_id', s.hospital_id,
        'hospital_name', coalesce(h.name, 'Unknown Hospital'),
        'current_tier', s.current_tier,
        'requested_tier', s.requested_tier,
        'status', s.status,
        'requested_at', s.requested_at,
        'monthly_limit', s.monthly_limit,
        'current_usage', s.current_usage
      )
      order by s.requested_at asc
    )
    from public.subscription s
    join public.hospital h on h.id = s.hospital_id
    where s.status = 'pending'),
    '[]'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.10 APPROVE SUBSCRIPTION
-- -----------------------------------------------------------------------------
create or replace function public.approve_subscription(p_hospital_id uuid, p_tier text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  -- Determine limit based on tier
  v_limit := case p_tier
    when 'basic' then 10
    when 'standard' then 25
    when 'premium' then 50
    when 'unlimited' then 999999
    else 10
  end;

  update public.subscription
  set
    status = 'approved',
    current_tier = p_tier,
    monthly_limit = v_limit,
    approved_at = now(),
    expires_at = now() + interval '1 year',
    updated_at = now()
  where hospital_id = p_hospital_id and status = 'pending';

  if not found then
    raise exception 'Pending subscription not found';
  end if;

  -- Log the approval
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_updated',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object(
      'action', 'subscription_approved',
      'hospital_id', p_hospital_id,
      'tier', p_tier
    )
  );

  return jsonb_build_object('success', true, 'message', 'Subscription approved');
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.11 REJECT SUBSCRIPTION
-- -----------------------------------------------------------------------------
create or replace function public.reject_subscription(p_hospital_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Rejection reason is required';
  end if;

  update public.subscription
  set
    status = 'rejected',
    rejection_reason = p_reason,
    rejected_at = now(),
    updated_at = now()
  where hospital_id = p_hospital_id and status = 'pending';

  if not found then
    raise exception 'Pending subscription not found';
  end if;

  -- Log the rejection
  insert into public.audit_log (event_type, actor_role, actor_id, metadata)
  values (
    'tracking_updated',
    public.current_app_role(),
    auth.uid(),
    jsonb_build_object(
      'action', 'subscription_rejected',
      'hospital_id', p_hospital_id,
      'reason', p_reason
    )
  );

  return jsonb_build_object('success', true, 'message', 'Subscription rejected');
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.12 GET NETWORK HOSPITALS
-- -----------------------------------------------------------------------------
create or replace function public.get_network_hospitals()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  return coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'id', h.id,
        'name', h.name,
        'tier', coalesce(s.current_tier, 'none'),
        'status', h.status,
        'monthly_limit', coalesce(s.monthly_limit, 0),
        'current_usage', coalesce(s.current_usage, 0),
        'subscription_expires', s.expires_at,
        'last_activity', (
          select max(created_at)
          from public.active_tracking
          where hospital_id = h.id
        )
      )
      order by h.name asc
    )
    from public.hospital h
    left join public.subscription s on s.hospital_id = h.id and s.status = 'approved'),
    '[]'::jsonb
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12.13 GET AUDIT LOG
-- -----------------------------------------------------------------------------
create or replace function public.get_audit_log(
  p_event_type text default null,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_actor_role text default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_access() then
    raise exception 'Not authorized';
  end if;

  return coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'event_time', a.event_time,
        'event_type', a.event_type,
        'actor_role', a.actor_role,
        'actor_id', a.actor_id,
        'aid', a.aid,
        'registry_id', a.registry_id,
        'metadata', a.metadata
      )
      order by a.event_time desc
    )
    from (
      select *
      from public.audit_log
      where (p_event_type is null or event_type::text = p_event_type)
        and (p_start_date is null or event_time >= p_start_date)
        and (p_end_date is null or event_time <= p_end_date)
        and (p_actor_role is null or actor_role = p_actor_role)
      order by event_time desc
      limit p_limit
      offset p_offset
    ) a),
    '[]'::jsonb
  );
end;
$$;


-- ============================================================================
-- SECTION 13: GRANT PERMISSIONS
-- ============================================================================

-- Revoke all from public first
revoke all on all functions in schema public from public;
revoke all on all tables in schema public from public;

-- Grant execute on RPC functions to authenticated users
grant execute on function public.create_tracking(uuid, public.shock_type_enum, public.scai_stage_enum, smallint, char, jsonb) to authenticated;
grant execute on function public.get_tracking(uuid) to authenticated;
grant execute on function public.update_tracking(uuid, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, public.scai_stage_enum) to authenticated;
grant execute on function public.set_tracking_outcome(uuid, text, jsonb) to authenticated;
grant execute on function public.close_and_archive_tracking(uuid) to authenticated;
grant execute on function public.lookup_archive(text) to authenticated;
grant execute on function public.get_registry_statistics() to authenticated;
grant execute on function public.purge_expired_tracking() to authenticated;

-- Phase 4 RPC functions
grant execute on function public.get_hospital_active_cases(uuid) to authenticated;
grant execute on function public.get_hospital_dashboard_stats(uuid) to authenticated;
grant execute on function public.get_pending_cases() to authenticated;
grant execute on function public.approve_case(uuid, text) to authenticated;
grant execute on function public.reject_case(uuid, text) to authenticated;
grant execute on function public.get_pending_subscriptions() to authenticated;
grant execute on function public.approve_subscription(uuid, text) to authenticated;
grant execute on function public.reject_subscription(uuid, text) to authenticated;
grant execute on function public.get_network_hospitals() to authenticated;
grant execute on function public.get_audit_log(text, timestamptz, timestamptz, text, integer, integer) to authenticated;

-- Grant usage on types
grant usage on type public.shock_type_enum to authenticated;
grant usage on type public.scai_stage_enum to authenticated;
grant usage on type public.tracking_status_enum to authenticated;
grant usage on type public.audit_event_enum to authenticated;


-- ============================================================================
-- SECTION 13: COMMENTS / DOCUMENTATION
-- ============================================================================

comment on table public.active_tracking is
  'Active patient tracking with TT (Tracking Token). TT is destroyed on archive.';

comment on table public.registry_archive is
  'Permanent anonymized archive. AID and Registry ID generated at archive time only.';

comment on table public.audit_log is
  'Append-only audit log. Never contains TT, only AID after archival.';

comment on function public.close_and_archive_tracking(uuid) is
  'Point of no return: destroys TT, generates AID and Registry ID, moves data to archive.';

comment on function public.generate_registry_id() is
  'Generates human-readable Registry ID (NSN-XXXX-XXXX-XXXX) for Decursus Morbi.';

comment on view public.research_archive_safe is
  'K-anonymity protected view. Suppresses data where cohort size < 5.';


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
