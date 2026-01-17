/**
 * Discharge Form Validation Schema
 * Outcome recording and case archival
 */

import { z } from 'zod';
import { scaiStageSchema } from './patient.schema';

// Outcome status enum
export const outcomeStatusSchema = z.enum([
  'survived_icu',
  'survived_hospital',
  'died_icu',
  'died_hospital',
  'transferred',
  'unknown',
]);

// Discharge destination enum
export const dischargeDestinationSchema = z.enum([
  'ward',
  'step_down',
  'rehab',
  'ltac',
  'home',
  'hospice',
  'other_hospital',
  'morgue',
]);

// Discharge Schema
export const dischargeSchema = z.object({
  // Discharge Details
  dischargeDateTime: z.string().min(1, 'Discharge date/time is required'),
  destination: dischargeDestinationSchema,

  // Outcome
  outcomeStatus: outcomeStatusSchema,

  // ICU Stay Summary
  icuLengthOfStays: z.number().min(0).optional(),
  totalVentDays: z.number().min(0).optional(),
  totalVasopressorDays: z.number().min(0).optional(),
  peakScaiStage: scaiStageSchema.optional(),
  finalScaiStage: scaiStageSchema.optional(),

  // Complications
  hadAKI: z.boolean().optional().default(false),
  hadARDS: z.boolean().optional().default(false),
  hadInfection: z.boolean().optional().default(false),
  hadBleeding: z.boolean().optional().default(false),
  hadStroke: z.boolean().optional().default(false),
  hadArrhythmia: z.boolean().optional().default(false),
  otherComplications: z.string().optional(),

  // Interventions Summary
  hadPCI: z.boolean().optional().default(false),
  hadCABG: z.boolean().optional().default(false),
  hadIABP: z.boolean().optional().default(false),
  hadImpella: z.boolean().optional().default(false),
  hadECMO: z.boolean().optional().default(false),
  hadRRT: z.boolean().optional().default(false), // Renal Replacement Therapy
  otherInterventions: z.string().optional(),

  // Discharge Condition
  dischargeGCS: z.number().min(3).max(15).optional(),
  dischargeSOFA: z.number().min(0).max(24).optional(),
  ambulatoryStatus: z.string().optional(),

  // Archive Consent
  consentToArchive: z.boolean().optional().default(true),

  // Notes
  dischargeSummary: z.string().optional(),
  followUpPlan: z.string().optional(),
});

export type DischargeFormData = z.infer<typeof dischargeSchema>;

// Discharge destination options
export const DISCHARGE_DESTINATION_OPTIONS = [
  { value: 'ward', label: 'Hospital Ward' },
  { value: 'step_down', label: 'Step-Down Unit' },
  { value: 'rehab', label: 'Rehabilitation Facility' },
  { value: 'ltac', label: 'Long-Term Acute Care' },
  { value: 'home', label: 'Home' },
  { value: 'hospice', label: 'Hospice' },
  { value: 'other_hospital', label: 'Transfer to Other Hospital' },
  { value: 'morgue', label: 'Morgue' },
];

// Outcome status options
export const OUTCOME_STATUS_OPTIONS = [
  { value: 'survived_icu', label: 'Survived ICU Discharge' },
  { value: 'survived_hospital', label: 'Survived Hospital Discharge' },
  { value: 'died_icu', label: 'Died in ICU' },
  { value: 'died_hospital', label: 'Died in Hospital (post-ICU)' },
  { value: 'transferred', label: 'Transferred (Unknown Outcome)' },
  { value: 'unknown', label: 'Unknown' },
];
