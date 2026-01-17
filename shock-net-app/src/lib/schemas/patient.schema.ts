/**
 * Patient Form Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod';

// Shock types enum
export const shockTypeSchema = z.enum([
  'cardiogenic',
  'septic',
  'hypovolemic',
  'distributive',
  'obstructive',
  'mixed',
]);

// SCAI stages enum
export const scaiStageSchema = z.enum(['A', 'B', 'C', 'D', 'E']);

// Sex enum
export const sexSchema = z.enum(['M', 'F']);

// New Patient Form Schema
export const newPatientSchema = z.object({
  // Demographics (anonymized)
  ageBracket: z.string().min(1, 'Age bracket is required'),
  sex: sexSchema,

  // Shock Classification
  shockType: shockTypeSchema,
  scaiStage: scaiStageSchema,

  // Admission Criteria
  mapBelow65: z.boolean().optional().default(false),
  sbpBelow90: z.boolean().optional().default(false),
  lactateAbove2: z.boolean().optional().default(false),
  lactateValue: z.number().min(0).max(30).optional(),

  // Working Diagnosis
  primaryDiagnosis: z.string().min(1, 'Primary diagnosis is required'),
  secondaryDiagnoses: z.string().optional(),

  // Medical History
  hasCAD: z.boolean().default(false),
  hasHF: z.boolean().default(false),
  hasDM: z.boolean().default(false),
  hasHTN: z.boolean().default(false),
  hasCKD: z.boolean().default(false),
  hasCOPD: z.boolean().default(false),
  hasStroke: z.boolean().default(false),
  otherHistory: z.string().optional(),
});

export type NewPatientFormData = z.infer<typeof newPatientSchema>;

// Age bracket options
export const AGE_BRACKETS = [
  { value: '18-29', label: '18-29 years' },
  { value: '30-39', label: '30-39 years' },
  { value: '40-49', label: '40-49 years' },
  { value: '50-59', label: '50-59 years' },
  { value: '60-69', label: '60-69 years' },
  { value: '70-79', label: '70-79 years' },
  { value: '80+', label: '80+ years' },
];

// Shock type options
export const SHOCK_TYPE_OPTIONS = [
  { value: 'cardiogenic', label: 'Cardiogenic' },
  { value: 'septic', label: 'Septic' },
  { value: 'hypovolemic', label: 'Hypovolemic' },
  { value: 'distributive', label: 'Distributive' },
  { value: 'obstructive', label: 'Obstructive' },
  { value: 'mixed', label: 'Mixed' },
];

// SCAI stage options
export const SCAI_STAGE_OPTIONS = [
  { value: 'A', label: 'A - At Risk' },
  { value: 'B', label: 'B - Beginning' },
  { value: 'C', label: 'C - Classic' },
  { value: 'D', label: 'D - Deteriorating' },
  { value: 'E', label: 'E - Extremis' },
];
