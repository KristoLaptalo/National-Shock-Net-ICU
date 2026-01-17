/**
 * Pre-Admission Medications Form Validation Schema
 * Based on sql/schema.sql pre_admission_medications table
 * Captures 37 medication categories with dosing levels
 */

import { z } from 'zod';

// Dose level enum for heart failure medications (0-No / 1-<=25% / 2-<=50% / 3->50% dose)
export const doseLevel4Schema = z.enum(['0', '1', '2', '3']);

// Binary yes/no
export const binaryMedSchema = z.enum(['0', '1']);

// Anticoagulants Schema
export const anticoagulantsSchema = z.object({
  warfarin: binaryMedSchema.default('0'),
  dabigatran: z.enum(['0', '1', '2']).default('0'), // 0-No / 1-2x110mg / 2-2x150mg
  apixaban: z.enum(['0', '1', '2']).default('0'), // 0-No / 1-2x5mg / 2-2x2.5mg
  rivaroxaban: z.enum(['0', '1', '2', '3', '4']).default('0'), // 0-No / 1-20mg / 2-15mg / 3-2x2.5mg / 4-2x15mg
  edoxaban: z.enum(['0', '1', '2', '3']).default('0'), // 0-No / 1-60mg / 2-30mg / 3-15mg
});

// Antiplatelets Schema
export const antiplateletsSchema = z.object({
  aspirin: binaryMedSchema.default('0'),
  clopidogrel: binaryMedSchema.default('0'),
  ticagrelor: binaryMedSchema.default('0'),
  prasugrel: binaryMedSchema.default('0'),
});

// Heart Failure Medications Schema
export const heartFailureMedsSchema = z.object({
  betaBlocker: doseLevel4Schema.default('0'),
  betaBlockerName: z.string().optional(),
  aceInhibitor: doseLevel4Schema.default('0'),
  aceInhibitorName: z.string().optional(),
  arb: doseLevel4Schema.default('0'),
  arbName: z.string().optional(),
  arni: doseLevel4Schema.default('0'), // Sacubitril/Valsartan
  mra: doseLevel4Schema.default('0'), // Spironolactone/Eplerenone
  mraName: z.string().optional(),
  sglt2Inhibitor: binaryMedSchema.default('0'),
  sglt2InhibitorName: z.string().optional(),
});

// Diuretics Schema
export const diureticsSchema = z.object({
  furosemide: z.enum(['0', '1', '2', '3', '4']).default('0'), // 0-No / 1-<=40mg / 2-<=125mg / 3->125mg / 4->250mg
  furosemideDose: z.number().min(0).max(1000).optional(), // Actual dose in mg
  torasemide: binaryMedSchema.default('0'),
  torasemideDose: z.number().min(0).max(200).optional(),
  thiazide: binaryMedSchema.default('0'),
});

// Pulmonary Hypertension Medications
export const pulmonaryHTNMedsSchema = z.object({
  sildenafil: binaryMedSchema.default('0'),
  tadalafil: binaryMedSchema.default('0'),
  bosentan: binaryMedSchema.default('0'),
  ambrisentan: binaryMedSchema.default('0'),
  riociguat: binaryMedSchema.default('0'),
  epoprostenol: binaryMedSchema.default('0'),
});

// Antiarrhythmics Schema
export const antiarrhythmicsSchema = z.object({
  flecainide: binaryMedSchema.default('0'),
  propafenone: binaryMedSchema.default('0'),
  verapamilDiltiazem: binaryMedSchema.default('0'),
  amiodarone: binaryMedSchema.default('0'),
  mexiletine: binaryMedSchema.default('0'),
  sotalol: binaryMedSchema.default('0'),
  dronedarone: binaryMedSchema.default('0'),
  otherAntiarrhythmic: binaryMedSchema.default('0'),
  otherAntiarrhythmicName: z.string().optional(),
});

// Lipid Lowering Schema
export const lipidLoweringSchema = z.object({
  statin: doseLevel4Schema.default('0'),
  statinName: z.string().optional(),
  ezetimibe: binaryMedSchema.default('0'),
  pcsk9Inhibitor: binaryMedSchema.default('0'),
  pcsk9InhibitorName: z.string().optional(),
  fibrate: binaryMedSchema.default('0'),
});

// Diabetes Medications Schema
export const diabetesMedsSchema = z.object({
  metformin: binaryMedSchema.default('0'),
  metforminDose: z.number().min(0).max(3000).optional(),
  insulin: binaryMedSchema.default('0'),
  insulinType: z.string().optional(), // e.g., "Lantus + NovoRapid"
  insulinDose: z.string().optional(), // e.g., "20U basal + sliding scale"
  dpp4Inhibitor: binaryMedSchema.default('0'),
  dpp4InhibitorName: z.string().optional(),
  glp1Agonist: binaryMedSchema.default('0'),
  glp1AgonistName: z.string().optional(),
  pioglitazone: binaryMedSchema.default('0'),
  sulfonylurea: binaryMedSchema.default('0'),
  sulfonylureaName: z.string().optional(),
});

// Other Medications Schema
export const otherMedsSchema = z.object({
  immunomodulator: binaryMedSchema.default('0'),
  immunomodulatorName: z.string().optional(),
  corticosteroidChronic: binaryMedSchema.default('0'),
  corticosteroidDose: z.string().optional(), // e.g., "Prednisolone 10mg"
  chemotherapy: binaryMedSchema.default('0'),
  chemotherapyRegimen: z.string().optional(),
  inhaledIcsLamaLaba: binaryMedSchema.default('0'),
  inhalerDetails: z.string().optional(),
  protonPumpInhibitor: binaryMedSchema.default('0'),
  thyroidMedication: binaryMedSchema.default('0'),
  antidepressant: binaryMedSchema.default('0'),
  antipsychotic: binaryMedSchema.default('0'),
  anticonvulsant: binaryMedSchema.default('0'),
  opioidChronic: binaryMedSchema.default('0'),
});

// Complete Pre-Admission Medications Schema
export const preAdmissionMedicationsSchema = z.object({
  // Timestamp
  recordedAt: z.string().optional(),

  // Medication categories
  anticoagulants: anticoagulantsSchema.optional(),
  antiplatelets: antiplateletsSchema.optional(),
  heartFailureMeds: heartFailureMedsSchema.optional(),
  diuretics: diureticsSchema.optional(),
  pulmonaryHTNMeds: pulmonaryHTNMedsSchema.optional(),
  antiarrhythmics: antiarrhythmicsSchema.optional(),
  lipidLowering: lipidLoweringSchema.optional(),
  diabetesMeds: diabetesMedsSchema.optional(),
  otherMeds: otherMedsSchema.optional(),

  // Free text for additional medications
  otherMedicationsList: z.string().optional(),

  // Medication reconciliation
  medicationReconciliationDone: z.boolean().default(false),
  reconciliationSource: z.enum(['patient', 'family', 'pharmacy', 'records', 'unknown']).optional(),

  // Notes
  medicationNotes: z.string().optional(),
  allergies: z.string().optional(),
  adverseReactions: z.string().optional(),
});

export type PreAdmissionMedicationsFormData = z.infer<typeof preAdmissionMedicationsSchema>;
export type AnticoagulantsData = z.infer<typeof anticoagulantsSchema>;
export type AntiplateletsData = z.infer<typeof antiplateletsSchema>;
export type HeartFailureMedsData = z.infer<typeof heartFailureMedsSchema>;
export type DiureticsData = z.infer<typeof diureticsSchema>;
export type AntiarrhythmicsData = z.infer<typeof antiarrhythmicsSchema>;
export type LipidLoweringData = z.infer<typeof lipidLoweringSchema>;
export type DiabetesMedsData = z.infer<typeof diabetesMedsSchema>;

// Dose level options for heart failure medications
export const DOSE_LEVEL_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '≤25% target dose' },
  { value: '2', label: '≤50% target dose' },
  { value: '3', label: '>50% target dose' },
];

// Dabigatran dosing options
export const DABIGATRAN_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '110mg twice daily' },
  { value: '2', label: '150mg twice daily' },
];

// Apixaban dosing options
export const APIXABAN_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '5mg twice daily' },
  { value: '2', label: '2.5mg twice daily' },
];

// Rivaroxaban dosing options
export const RIVAROXABAN_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '20mg once daily' },
  { value: '2', label: '15mg once daily' },
  { value: '3', label: '2.5mg twice daily (vascular)' },
  { value: '4', label: '15mg twice daily (DVT/PE acute)' },
];

// Edoxaban dosing options
export const EDOXABAN_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '60mg once daily' },
  { value: '2', label: '30mg once daily' },
  { value: '3', label: '15mg once daily' },
];

// Furosemide dosing options
export const FUROSEMIDE_OPTIONS = [
  { value: '0', label: 'Not taking' },
  { value: '1', label: '≤40mg daily' },
  { value: '2', label: '41-125mg daily' },
  { value: '3', label: '126-250mg daily' },
  { value: '4', label: '>250mg daily' },
];

// Beta blocker name options
export const BETA_BLOCKER_OPTIONS = [
  { value: 'bisoprolol', label: 'Bisoprolol' },
  { value: 'carvedilol', label: 'Carvedilol' },
  { value: 'metoprolol_succinate', label: 'Metoprolol Succinate' },
  { value: 'nebivolol', label: 'Nebivolol' },
  { value: 'atenolol', label: 'Atenolol' },
  { value: 'other', label: 'Other' },
];

// ACE inhibitor name options
export const ACE_INHIBITOR_OPTIONS = [
  { value: 'ramipril', label: 'Ramipril' },
  { value: 'perindopril', label: 'Perindopril' },
  { value: 'lisinopril', label: 'Lisinopril' },
  { value: 'enalapril', label: 'Enalapril' },
  { value: 'captopril', label: 'Captopril' },
  { value: 'other', label: 'Other' },
];

// ARB name options
export const ARB_OPTIONS = [
  { value: 'losartan', label: 'Losartan' },
  { value: 'valsartan', label: 'Valsartan' },
  { value: 'candesartan', label: 'Candesartan' },
  { value: 'irbesartan', label: 'Irbesartan' },
  { value: 'telmisartan', label: 'Telmisartan' },
  { value: 'other', label: 'Other' },
];

// MRA name options
export const MRA_OPTIONS = [
  { value: 'spironolactone', label: 'Spironolactone' },
  { value: 'eplerenone', label: 'Eplerenone' },
];

// SGLT2 inhibitor name options
export const SGLT2_INHIBITOR_OPTIONS = [
  { value: 'dapagliflozin', label: 'Dapagliflozin (Forxiga)' },
  { value: 'empagliflozin', label: 'Empagliflozin (Jardiance)' },
  { value: 'canagliflozin', label: 'Canagliflozin (Invokana)' },
  { value: 'sotagliflozin', label: 'Sotagliflozin' },
];

// Statin name options
export const STATIN_OPTIONS = [
  { value: 'atorvastatin', label: 'Atorvastatin' },
  { value: 'rosuvastatin', label: 'Rosuvastatin' },
  { value: 'simvastatin', label: 'Simvastatin' },
  { value: 'pravastatin', label: 'Pravastatin' },
  { value: 'fluvastatin', label: 'Fluvastatin' },
  { value: 'pitavastatin', label: 'Pitavastatin' },
];

// PCSK9 inhibitor options
export const PCSK9_INHIBITOR_OPTIONS = [
  { value: 'evolocumab', label: 'Evolocumab (Repatha)' },
  { value: 'alirocumab', label: 'Alirocumab (Praluent)' },
  { value: 'inclisiran', label: 'Inclisiran (Leqvio)' },
];

// GLP-1 agonist options
export const GLP1_AGONIST_OPTIONS = [
  { value: 'semaglutide', label: 'Semaglutide (Ozempic/Wegovy)' },
  { value: 'liraglutide', label: 'Liraglutide (Victoza)' },
  { value: 'dulaglutide', label: 'Dulaglutide (Trulicity)' },
  { value: 'exenatide', label: 'Exenatide (Byetta/Bydureon)' },
  { value: 'tirzepatide', label: 'Tirzepatide (Mounjaro)' },
];

// Reconciliation source options
export const RECONCILIATION_SOURCE_OPTIONS = [
  { value: 'patient', label: 'Patient Interview' },
  { value: 'family', label: 'Family/Caregiver' },
  { value: 'pharmacy', label: 'Community Pharmacy' },
  { value: 'records', label: 'Medical Records' },
  { value: 'unknown', label: 'Unknown/Unable to Verify' },
];
