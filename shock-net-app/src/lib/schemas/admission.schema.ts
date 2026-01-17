/**
 * Admission Form Validation Schemas
 */

import { z } from 'zod';

// ICU Admission Schema
export const admissionSchema = z.object({
  // Bed Assignment
  icuUnit: z.string().min(1, 'ICU unit is required'),
  bedNumber: z.string().min(1, 'Bed number is required'),

  // Care Team
  attendingPhysician: z.string().min(1, 'Attending physician is required'),
  primaryNurse: z.string().optional(),

  // Admission Details
  admissionDateTime: z.string().min(1, 'Admission date/time is required'),
  admissionSource: z.string().min(1, 'Admission source is required'),

  // Initial Assessment
  initialGCS: z.number().min(3).max(15).optional(),
  initialSOFA: z.number().min(0).max(24).optional(),

  // Monitoring
  hasArterialLine: z.boolean().optional().default(false),
  hasCentralLine: z.boolean().optional().default(false),
  hasPAC: z.boolean().optional().default(false), // Pulmonary Artery Catheter

  // Vasopressors
  onVasopressors: z.boolean().optional().default(false),
  vasopressorDetails: z.string().optional(),

  // Ventilation
  onMechanicalVent: z.boolean().optional().default(false),
  ventMode: z.string().optional(),

  // Notes
  admissionNotes: z.string().optional(),
});

export type AdmissionFormData = z.infer<typeof admissionSchema>;

// Admission source options
export const ADMISSION_SOURCE_OPTIONS = [
  { value: 'emergency', label: 'Emergency Department' },
  { value: 'ward', label: 'Hospital Ward' },
  { value: 'or', label: 'Operating Room' },
  { value: 'cath_lab', label: 'Cath Lab' },
  { value: 'transfer', label: 'External Transfer' },
  { value: 'other', label: 'Other' },
];

// Ventilation mode options
export const VENT_MODE_OPTIONS = [
  { value: 'ac_vc', label: 'AC-VC (Volume Control)' },
  { value: 'ac_pc', label: 'AC-PC (Pressure Control)' },
  { value: 'simv', label: 'SIMV' },
  { value: 'psv', label: 'PSV (Pressure Support)' },
  { value: 'cpap', label: 'CPAP' },
  { value: 'aprv', label: 'APRV' },
  { value: 'hfov', label: 'HFOV' },
];
