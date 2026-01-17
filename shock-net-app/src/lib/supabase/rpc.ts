/**
 * Supabase RPC function wrappers for anonymization schema
 * Based on sql/anonymization-schema.sql
 */

import { supabase } from './client';
import type { ShockType, ScaiStage, Gender, OutcomeStatus } from '../../types';

// Types for RPC parameters and returns
export interface CreateTrackingParams {
  shock_type: ShockType;
  scai_stage: ScaiStage;
  age_decade: number;
  sex: Gender;
  admission_data?: Record<string, unknown>;
}

export interface TrackingRecord {
  tt: string; // Tracking Token (UUID)
  shock_type: ShockType;
  scai_stage: ScaiStage;
  age_decade: number;
  sex: Gender;
  status: 'active' | 'closed';
  admission_data: Record<string, unknown>;
  hemodynamics: unknown[];
  laboratory: unknown[];
  ventilation: unknown[];
  medications: unknown[];
  procedures: unknown[];
  notes: unknown[];
  created_at: string;
  updated_at: string;
}

export interface ArchiveRecord {
  aid: string; // Archive ID
  registry_id: string; // NSN-XXXX-XXXX-XXXX format
  shock_type: ShockType;
  scai_stage_admission: ScaiStage;
  scai_stage_worst: ScaiStage;
  age_decade: number;
  sex: Gender;
  outcome_status: OutcomeStatus;
  length_of_stay_days: number;
  icu_days: number;
  archived_at: string;
  aggregated_data: Record<string, unknown>;
}

/**
 * Create a new tracking record (returns temporary TT)
 */
export async function createTracking(params: CreateTrackingParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_tracking', params);

  if (error) {
    throw new Error(`Failed to create tracking: ${error.message}`);
  }

  return data as string;
}

/**
 * Get tracking record by TT (no enumeration possible)
 */
export async function getTracking(tt: string): Promise<TrackingRecord | null> {
  const { data, error } = await supabase.rpc('get_tracking', { p_tt: tt });

  if (error) {
    throw new Error(`Failed to get tracking: ${error.message}`);
  }

  return data as TrackingRecord | null;
}

/**
 * Update tracking record with new data
 */
export async function updateTracking(
  tt: string,
  updates: {
    hemodynamics?: unknown;
    laboratory?: unknown;
    ventilation?: unknown;
    medications?: unknown;
    procedures?: unknown;
    notes?: unknown;
    scai_stage?: ScaiStage;
    // Extended data types
    medical_history?: unknown;
    mcs?: unknown;
    pre_admission_medications?: unknown;
  }
): Promise<void> {
  const { error } = await supabase.rpc('update_tracking', {
    p_tt: tt,
    ...updates,
  });

  if (error) {
    throw new Error(`Failed to update tracking: ${error.message}`);
  }
}

/**
 * Set outcome before archival
 */
export async function setTrackingOutcome(
  tt: string,
  outcome: {
    outcome_status: OutcomeStatus;
    outcome_data?: Record<string, unknown>;
  }
): Promise<void> {
  const { error } = await supabase.rpc('set_tracking_outcome', {
    p_tt: tt,
    p_outcome_status: outcome.outcome_status,
    p_outcome_data: outcome.outcome_data,
  });

  if (error) {
    throw new Error(`Failed to set outcome: ${error.message}`);
  }
}

/**
 * Close and archive tracking - POINT OF NO RETURN
 * Destroys TT, creates AID + Registry ID
 */
export async function closeAndArchiveTracking(tt: string): Promise<{
  registry_id: string;
  aid: string;
}> {
  const { data, error } = await supabase.rpc('close_and_archive_tracking', {
    p_tt: tt,
  });

  if (error) {
    throw new Error(`Failed to archive tracking: ${error.message}`);
  }

  return data as { registry_id: string; aid: string };
}

/**
 * Lookup archive record by Registry ID (NSN-XXXX-XXXX-XXXX)
 */
export async function lookupArchive(registryId: string): Promise<ArchiveRecord | null> {
  const { data, error } = await supabase.rpc('lookup_archive', {
    p_registry_id: registryId,
  });

  if (error) {
    throw new Error(`Failed to lookup archive: ${error.message}`);
  }

  return data as ArchiveRecord | null;
}

/**
 * Get registry statistics for admin dashboard
 */
export async function getRegistryStatistics(): Promise<{
  total_active: number;
  total_archived: number;
  outcomes: Record<string, number>;
}> {
  const { data, error } = await supabase.rpc('get_registry_statistics');

  if (error) {
    throw new Error(`Failed to get statistics: ${error.message}`);
  }

  return data as {
    total_active: number;
    total_archived: number;
    outcomes: Record<string, number>;
  };
}

// ============================================================================
// PHASE 4: ADDITIONAL RPC FUNCTIONS
// ============================================================================

// Types for pending cases
export interface PendingCase {
  tt: string;
  hospital_id: string;
  hospital_name: string;
  shock_type: ShockType;
  scai_stage: ScaiStage;
  age_decade: number;
  sex: Gender;
  created_at: string;
  admission_data: Record<string, unknown>;
}

// Types for subscriptions
export interface Subscription {
  id: string;
  hospital_id: string;
  hospital_name: string;
  current_tier: 'basic' | 'standard' | 'premium' | 'unlimited' | null;
  requested_tier: 'basic' | 'standard' | 'premium' | 'unlimited';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  monthly_limit: number;
  current_usage: number;
}

// Types for hospitals
export interface NetworkHospital {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium' | 'unlimited';
  status: 'active' | 'inactive' | 'suspended';
  monthly_limit: number;
  current_usage: number;
  subscription_expires: string;
  last_activity: string;
}

// Types for audit log
export interface AuditLogEntry {
  id: number;
  event_time: string;
  event_type: string;
  actor_role: string;
  actor_id: string | null;
  aid: string | null;
  registry_id: string | null;
  metadata: Record<string, unknown>;
}

export interface AuditLogFilters {
  event_type?: string;
  start_date?: string;
  end_date?: string;
  actor_role?: string;
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// HOSPITAL PORTAL FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Get active cases for a specific hospital
 */
export async function getHospitalActiveCases(hospitalId: string): Promise<PendingCase[]> {
  const { data, error } = await supabase.rpc('get_hospital_active_cases', {
    p_hospital_id: hospitalId,
  });

  if (error) {
    throw new Error(`Failed to get active cases: ${error.message}`);
  }

  return (data as PendingCase[]) || [];
}

/**
 * Get dashboard statistics for a specific hospital
 */
export async function getHospitalDashboardStats(hospitalId: string): Promise<{
  active_cases: number;
  pending_approval: number;
  archived_this_month: number;
  subscription_usage: number;
  subscription_limit: number;
}> {
  const { data, error } = await supabase.rpc('get_hospital_dashboard_stats', {
    p_hospital_id: hospitalId,
  });

  if (error) {
    throw new Error(`Failed to get hospital stats: ${error.message}`);
  }

  return data as {
    active_cases: number;
    pending_approval: number;
    archived_this_month: number;
    subscription_usage: number;
    subscription_limit: number;
  };
}

// -----------------------------------------------------------------------------
// ADMIN PORTAL - CASE MANAGEMENT
// -----------------------------------------------------------------------------

/**
 * Get all pending cases awaiting admin review
 */
export async function getPendingCases(): Promise<PendingCase[]> {
  const { data, error } = await supabase.rpc('get_pending_cases');

  if (error) {
    throw new Error(`Failed to get pending cases: ${error.message}`);
  }

  return (data as PendingCase[]) || [];
}

/**
 * Approve a pending case
 */
export async function approveCase(tt: string, notes?: string): Promise<void> {
  const { error } = await supabase.rpc('approve_case', {
    p_tt: tt,
    p_notes: notes || null,
  });

  if (error) {
    throw new Error(`Failed to approve case: ${error.message}`);
  }
}

/**
 * Reject a pending case
 */
export async function rejectCase(tt: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('reject_case', {
    p_tt: tt,
    p_reason: reason,
  });

  if (error) {
    throw new Error(`Failed to reject case: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// ADMIN PORTAL - SUBSCRIPTION MANAGEMENT
// -----------------------------------------------------------------------------

/**
 * Get all pending subscription requests
 */
export async function getPendingSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase.rpc('get_pending_subscriptions');

  if (error) {
    throw new Error(`Failed to get pending subscriptions: ${error.message}`);
  }

  return (data as Subscription[]) || [];
}

/**
 * Approve a subscription request
 */
export async function approveSubscription(
  hospitalId: string,
  tier: 'basic' | 'standard' | 'premium' | 'unlimited'
): Promise<void> {
  const { error } = await supabase.rpc('approve_subscription', {
    p_hospital_id: hospitalId,
    p_tier: tier,
  });

  if (error) {
    throw new Error(`Failed to approve subscription: ${error.message}`);
  }
}

/**
 * Reject a subscription request
 */
export async function rejectSubscription(hospitalId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('reject_subscription', {
    p_hospital_id: hospitalId,
    p_reason: reason,
  });

  if (error) {
    throw new Error(`Failed to reject subscription: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// ADMIN PORTAL - HOSPITAL MONITORING
// -----------------------------------------------------------------------------

/**
 * Get all hospitals in the network
 */
export async function getNetworkHospitals(): Promise<NetworkHospital[]> {
  const { data, error } = await supabase.rpc('get_network_hospitals');

  if (error) {
    throw new Error(`Failed to get network hospitals: ${error.message}`);
  }

  return (data as NetworkHospital[]) || [];
}

/**
 * Get audit log entries with optional filters
 */
export async function getAuditLog(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase.rpc('get_audit_log', {
    p_event_type: filters?.event_type || null,
    p_start_date: filters?.start_date || null,
    p_end_date: filters?.end_date || null,
    p_actor_role: filters?.actor_role || null,
    p_limit: filters?.limit || 100,
    p_offset: filters?.offset || 0,
  });

  if (error) {
    throw new Error(`Failed to get audit log: ${error.message}`);
  }

  return (data as AuditLogEntry[]) || [];
}
