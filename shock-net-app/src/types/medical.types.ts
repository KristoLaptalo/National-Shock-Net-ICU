/**
 * Medical domain types based on National Shock Net ICU schema
 */

// Shock types from shock_classification table
export type ShockType =
  | 'cardiogenic'
  | 'septic'
  | 'distributive'
  | 'hypovolemic'
  | 'obstructive'
  | 'mixed'
  | 'unclassified';

// SCAI Shock Stages (A-E severity)
export type ScaiStage = 'A' | 'B' | 'C' | 'D' | 'E';

// SCAI stage details
export const SCAI_STAGES: Record<ScaiStage, { label: string; description: string; severity: number }> = {
  A: { label: 'At Risk', description: 'Patient at risk for cardiogenic shock', severity: 1 },
  B: { label: 'Beginning', description: 'Hypotension without hypoperfusion', severity: 2 },
  C: { label: 'Classic', description: 'Hypoperfusion requiring intervention', severity: 3 },
  D: { label: 'Deteriorating', description: 'Failing to respond to initial interventions', severity: 4 },
  E: { label: 'Extremis', description: 'Refractory shock, imminent death', severity: 5 },
};

// Forrester classification (for cardiogenic shock)
export type CongestionStatus = 'dry' | 'wet';
export type PerfusionStatus = 'warm' | 'cold';

export interface ForresterClassification {
  congestion: CongestionStatus;
  perfusion: PerfusionStatus;
}

// ATLS Classification (for hypovolemic shock)
export type AtlsClass = 1 | 2 | 3 | 4;

// Distributive shock subtypes
export type DistributiveType = 'septic' | 'spinal_injury';

// Obstructive shock subtypes
export type ObstructiveType = 'tamponade' | 'pulmonary_embolism' | 'tension_pneumothorax';

// Shock classification data
export interface ShockClassification {
  cardiogenic: boolean;
  scaiStage?: ScaiStage;
  distributive: boolean;
  distributiveType?: DistributiveType;
  obstructive: boolean;
  obstructiveType?: ObstructiveType;
  hypovolemic: boolean;
  atlsClass?: AtlsClass;
  mixed: boolean; // Auto-calculated if 2+ types present
  forrester?: ForresterClassification;
  sofaScore?: number;
}

// Gender values
export type Gender = 'M' | 'F';

// Point of referral options
export type PointOfReferral = 'er' | 'ward' | 'other_icu' | 'other_hospital';

// ICU Unit types
export type IcuType = 'Medical' | 'Surgical' | 'Cardiac' | 'Coronary' | 'Neuro' | 'Trauma' | 'Mixed';

// Hospital types
export type HospitalType = 'University' | 'General' | 'Regional' | 'Private';

// Subscription tiers
export type SubscriptionTier = 'Basic' | 'Standard' | 'Premium' | 'Unlimited';

// Tier limits
export const TIER_LIMITS: Record<SubscriptionTier, { patients: number; beds: number }> = {
  Basic: { patients: 10, beds: 5 },
  Standard: { patients: 25, beds: 15 },
  Premium: { patients: 50, beds: 25 },
  Unlimited: { patients: Infinity, beds: Infinity },
};
