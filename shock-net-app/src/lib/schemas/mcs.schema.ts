/**
 * Mechanical Circulatory Support (MCS) Form Validation Schema
 * Based on sql/schema.sql mechanical_circulatory_support table
 */

import { z } from 'zod';

// Device type enum
export const mcsDeviceTypeSchema = z.enum([
  'iabp',
  'impella_25',
  'impella_cp',
  'impella_50',
  'impella_55',
  'impella_rp',
  'va_ecmo',
  'vv_ecmo',
  'ecpella',
  'tandemheart',
  'lvad',
  'rvad',
  'bivad',
  'tah',
]);

// Insertion location enum
export const insertionLocationSchema = z.enum([
  'cath_lab',
  'or',
  'icu_bedside',
  'ed',
  'other_hospital',
]);

// Access site enum
export const accessSiteSchema = z.enum([
  'femoral',
  'axillary',
  'subclavian',
  'central',
]);

// Indication enum
export const mcsIndicationSchema = z.enum([
  'cs_support',
  'bridge_to_decision',
  'bridge_to_recovery',
  'bridge_to_transplant',
  'bridge_to_lvad',
  'high_risk_pci',
  'post_cardiotomy',
  'respiratory',
  'ecpr',
]);

// Removal reason enum
export const removalReasonSchema = z.enum([
  'recovery',
  'bridge_to_durable',
  'transplant',
  'death',
  'complication',
  'futility',
]);

// IABP Settings Schema
export const iabpSettingsSchema = z.object({
  ratio: z.enum(['1:1', '1:2', '1:3']),
  augmentation: z.number().min(0).max(100).optional(),
});

// Impella Settings Schema
export const impellaSettingsSchema = z.object({
  pLevel: z.enum(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9']),
  flow: z.number().min(0).max(6).optional(), // L/min
  motorCurrent: z.number().min(0).max(2).optional(), // Amps
  purgeFlow: z.number().min(0).max(30).optional(), // mL/hr
  purgePressure: z.number().min(0).max(1000).optional(), // mmHg
  placementSignal: z.enum(['optimal', 'suboptimal', 'repositioning_needed']).optional(),
});

// ECMO Settings Schema
export const ecmoSettingsSchema = z.object({
  flow: z.number().min(0).max(8).optional(), // L/min
  rpm: z.number().min(1000).max(6000).optional(),
  fio2: z.number().min(21).max(100).optional(), // %
  sweepGas: z.number().min(0).max(10).optional(), // L/min
  bloodFlow: z.number().min(0).max(8).optional(), // L/min
  // Oxygenator monitoring
  preMembranePressure: z.number().min(-100).max(500).optional(), // mmHg
  postMembranePressure: z.number().min(-100).max(500).optional(), // mmHg
  transmembranePressure: z.number().min(0).max(200).optional(), // mmHg
  // Anticoagulation
  heparinRate: z.number().min(0).max(2000).optional(), // units/hr
  act: z.number().min(100).max(600).optional(), // seconds
  antiXa: z.number().min(0).max(2).optional(), // IU/mL
});

// Complications Schema
export const mcsComplicationsSchema = z.object({
  bleeding: z.boolean().default(false),
  bleedingSite: z.string().optional(),
  hemolysis: z.boolean().default(false),
  ldh: z.number().min(0).max(10000).optional(), // U/L
  plasmaFreeHgb: z.number().min(0).max(500).optional(), // mg/dL
  limbIschemia: z.boolean().default(false),
  limbIschemiaDetails: z.string().optional(),
  thrombosis: z.boolean().default(false),
  thrombosisLocation: z.string().optional(),
  stroke: z.boolean().default(false),
  strokeType: z.enum(['ischemic', 'hemorrhagic']).optional(),
  infection: z.boolean().default(false),
  infectionSite: z.string().optional(),
  migration: z.boolean().default(false),
  vascularInjury: z.boolean().default(false),
  vascularDetails: z.string().optional(),
  airEmbolism: z.boolean().default(false),
  pumpFailure: z.boolean().default(false),
});

// Complete MCS Entry Schema
export const mcsEntrySchema = z.object({
  // Device Selection (can have multiple active)
  deviceType: mcsDeviceTypeSchema,
  isActive: z.boolean().default(true),

  // Insertion Details
  insertionDate: z.string().min(1, 'Insertion date is required'),
  insertionTime: z.string().optional(),
  insertionLocation: insertionLocationSchema,
  accessSite: accessSiteSchema,
  accessSide: z.enum(['left', 'right', 'bilateral']).optional(),

  // Indication
  indication: mcsIndicationSchema,
  indicationNotes: z.string().optional(),

  // Device-specific settings
  iabpSettings: iabpSettingsSchema.optional(),
  impellaSettings: impellaSettingsSchema.optional(),
  ecmoSettings: ecmoSettingsSchema.optional(),

  // Cannulation (for ECMO)
  arterialCannulaSize: z.number().min(12).max(24).optional(), // Fr
  venousCannulaSize: z.number().min(18).max(32).optional(), // Fr
  drainageCannulaLocation: z.string().optional(),
  returnCannulaLocation: z.string().optional(),

  // Complications
  complications: mcsComplicationsSchema.optional(),

  // Daily monitoring notes
  dailyAssessment: z.string().optional(),

  // Weaning
  weaningStarted: z.boolean().default(false),
  weaningProtocol: z.string().optional(),
  weaningNotes: z.string().optional(),

  // Removal
  removalDate: z.string().optional(),
  removalTime: z.string().optional(),
  removalReason: removalReasonSchema.optional(),
  removalNotes: z.string().optional(),
});

export type MCSEntryFormData = z.infer<typeof mcsEntrySchema>;
export type MCSDeviceType = z.infer<typeof mcsDeviceTypeSchema>;
export type MCSIndication = z.infer<typeof mcsIndicationSchema>;
export type IABPSettings = z.infer<typeof iabpSettingsSchema>;
export type ImpellaSettings = z.infer<typeof impellaSettingsSchema>;
export type ECMOSettings = z.infer<typeof ecmoSettingsSchema>;
export type MCSComplications = z.infer<typeof mcsComplicationsSchema>;

// Device type options for UI
export const MCS_DEVICE_OPTIONS = [
  { value: 'iabp', label: 'IABP', description: 'Intra-Aortic Balloon Pump' },
  { value: 'impella_25', label: 'Impella 2.5', description: '2.5 L/min max flow' },
  { value: 'impella_cp', label: 'Impella CP', description: '4.0 L/min max flow' },
  { value: 'impella_50', label: 'Impella 5.0', description: '5.0 L/min max flow' },
  { value: 'impella_55', label: 'Impella 5.5', description: '5.5 L/min max flow' },
  { value: 'impella_rp', label: 'Impella RP', description: 'Right-sided support' },
  { value: 'va_ecmo', label: 'VA-ECMO', description: 'Veno-Arterial ECMO' },
  { value: 'vv_ecmo', label: 'VV-ECMO', description: 'Veno-Venous ECMO' },
  { value: 'ecpella', label: 'ECPELLA', description: 'ECMO + Impella combination' },
  { value: 'tandemheart', label: 'TandemHeart', description: 'Percutaneous VAD' },
  { value: 'lvad', label: 'LVAD', description: 'Durable Left VAD' },
  { value: 'rvad', label: 'RVAD', description: 'Right VAD' },
  { value: 'bivad', label: 'BiVAD', description: 'Biventricular VAD' },
  { value: 'tah', label: 'TAH', description: 'Total Artificial Heart' },
];

// Insertion location options
export const INSERTION_LOCATION_OPTIONS = [
  { value: 'cath_lab', label: 'Cath Lab' },
  { value: 'or', label: 'Operating Room' },
  { value: 'icu_bedside', label: 'ICU Bedside' },
  { value: 'ed', label: 'Emergency Department' },
  { value: 'other_hospital', label: 'Other Hospital' },
];

// Access site options
export const ACCESS_SITE_OPTIONS = [
  { value: 'femoral', label: 'Femoral' },
  { value: 'axillary', label: 'Axillary' },
  { value: 'subclavian', label: 'Subclavian' },
  { value: 'central', label: 'Central (Surgical)' },
];

// Indication options
export const MCS_INDICATION_OPTIONS = [
  { value: 'cs_support', label: 'Cardiogenic Shock Support' },
  { value: 'bridge_to_decision', label: 'Bridge to Decision' },
  { value: 'bridge_to_recovery', label: 'Bridge to Recovery' },
  { value: 'bridge_to_transplant', label: 'Bridge to Transplant' },
  { value: 'bridge_to_lvad', label: 'Bridge to Durable LVAD' },
  { value: 'high_risk_pci', label: 'High-Risk PCI Support' },
  { value: 'post_cardiotomy', label: 'Post-Cardiotomy Shock' },
  { value: 'respiratory', label: 'Respiratory Failure' },
  { value: 'ecpr', label: 'ECPR (Extracorporeal CPR)' },
];

// Removal reason options
export const REMOVAL_REASON_OPTIONS = [
  { value: 'recovery', label: 'Myocardial Recovery' },
  { value: 'bridge_to_durable', label: 'Bridged to Durable Device' },
  { value: 'transplant', label: 'Heart Transplant' },
  { value: 'death', label: 'Patient Death' },
  { value: 'complication', label: 'Device Complication' },
  { value: 'futility', label: 'Futility/Withdrawal of Care' },
];

// Impella P-level options
export const IMPELLA_P_LEVEL_OPTIONS = [
  { value: 'P1', label: 'P1 (Standby)' },
  { value: 'P2', label: 'P2 (Min Support)' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
  { value: 'P5', label: 'P5' },
  { value: 'P6', label: 'P6' },
  { value: 'P7', label: 'P7' },
  { value: 'P8', label: 'P8' },
  { value: 'P9', label: 'P9 (Max Support)' },
];

// IABP ratio options
export const IABP_RATIO_OPTIONS = [
  { value: '1:1', label: '1:1 (Full Support)' },
  { value: '1:2', label: '1:2 (Weaning)' },
  { value: '1:3', label: '1:3 (Pre-Removal)' },
];
