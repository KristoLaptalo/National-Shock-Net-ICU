/**
 * Daily Entry Form Validation Schemas
 * Comprehensive ICU daily monitoring data
 */

import { z } from 'zod';
import { scaiStageSchema } from './patient.schema';

// Hemodynamic Data Schema
export const hemodynamicSchema = z.object({
  timestamp: z.string().min(1, 'Time is required'),
  heartRate: z.number().min(20).max(300).optional(),
  sbp: z.number().min(40).max(300).optional(),
  dbp: z.number().min(20).max(200).optional(),
  map: z.number().min(20).max(200).optional(),
  cvp: z.number().min(-10).max(40).optional(),
  cardiacOutput: z.number().min(0).max(20).optional(),
  cardiacIndex: z.number().min(0).max(10).optional(),
  svr: z.number().min(100).max(5000).optional(),
  scvo2: z.number().min(0).max(100).optional(),
});

// Blood Gas Schema
export const bloodGasSchema = z.object({
  timestamp: z.string().min(1, 'Time is required'),
  type: z.enum(['arterial', 'venous', 'mixed']),
  ph: z.number().min(6.5).max(8.0).optional(),
  pco2: z.number().min(10).max(150).optional(),
  po2: z.number().min(10).max(700).optional(),
  hco3: z.number().min(5).max(50).optional(),
  baseExcess: z.number().min(-30).max(30).optional(),
  lactate: z.number().min(0).max(30).optional(),
  sao2: z.number().min(0).max(100).optional(),
});

// Ventilator Settings Schema
export const ventilatorSchema = z.object({
  timestamp: z.string().min(1, 'Time is required'),
  mode: z.string().optional(),
  fio2: z.number().min(21).max(100).optional(),
  peep: z.number().min(0).max(30).optional(),
  tidalVolume: z.number().min(100).max(1500).optional(),
  respiratoryRate: z.number().min(4).max(60).optional(),
  pip: z.number().min(0).max(80).optional(),
  plateau: z.number().min(0).max(60).optional(),
  minuteVentilation: z.number().min(0).max(30).optional(),
});

// Laboratory Results Schema
export const laboratorySchema = z.object({
  timestamp: z.string().min(1, 'Time is required'),
  // CBC
  hemoglobin: z.number().min(3).max(25).optional(),
  hematocrit: z.number().min(10).max(70).optional(),
  wbc: z.number().min(0.1).max(100).optional(),
  platelets: z.number().min(5).max(1000).optional(),
  // Chemistry
  sodium: z.number().min(100).max(180).optional(),
  potassium: z.number().min(1).max(10).optional(),
  chloride: z.number().min(70).max(130).optional(),
  bicarbonate: z.number().min(5).max(50).optional(),
  bun: z.number().min(1).max(200).optional(),
  creatinine: z.number().min(0.1).max(20).optional(),
  glucose: z.number().min(20).max(800).optional(),
  // Liver
  ast: z.number().min(1).max(10000).optional(),
  alt: z.number().min(1).max(10000).optional(),
  bilirubin: z.number().min(0.1).max(50).optional(),
  albumin: z.number().min(1).max(6).optional(),
  // Cardiac markers
  troponin: z.number().min(0).max(100).optional(),
  bnp: z.number().min(0).max(50000).optional(),
  // Coagulation
  pt: z.number().min(8).max(100).optional(),
  inr: z.number().min(0.5).max(20).optional(),
  ptt: z.number().min(15).max(200).optional(),
});

// Echocardiography Schema
export const echoSchema = z.object({
  timestamp: z.string().min(1, 'Time is required'),
  lvef: z.number().min(5).max(80).optional(),
  rvFunction: z.enum(['normal', 'mildly_reduced', 'moderately_reduced', 'severely_reduced']).optional(),
  wallMotion: z.string().optional(),
  valvular: z.string().optional(),
  pericardialEffusion: z.boolean().optional().default(false),
  ivcCollapsibility: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

// Complete Daily Entry Schema
export const dailyEntrySchema = z.object({
  entryDate: z.string().min(1, 'Entry date is required'),
  dayNumber: z.number().min(1, 'Day number is required'),

  // Current status
  currentScaiStage: scaiStageSchema,

  // Hemodynamics (multiple entries per day)
  hemodynamics: z.array(hemodynamicSchema).optional(),

  // Blood gas (multiple entries per day)
  bloodGas: z.array(bloodGasSchema).optional(),

  // Ventilator (single or multiple)
  ventilator: ventilatorSchema.optional(),

  // Labs (typically once daily)
  laboratory: laboratorySchema.optional(),

  // Echo (if performed)
  echo: echoSchema.optional(),

  // Interventions
  interventions: z.object({
    vasopressorChanges: z.string().optional(),
    newProcedures: z.string().optional(),
    medicationChanges: z.string().optional(),
  }).optional(),

  // Clinical Notes
  clinicalNotes: z.string().optional(),

  // Assessment
  assessment: z.object({
    improving: z.boolean().optional(),
    stable: z.boolean().optional(),
    deteriorating: z.boolean().optional(),
    comment: z.string().optional(),
  }).optional(),
});

export type DailyEntryFormData = z.infer<typeof dailyEntrySchema>;
export type HemodynamicData = z.infer<typeof hemodynamicSchema>;
export type BloodGasData = z.infer<typeof bloodGasSchema>;
export type VentilatorData = z.infer<typeof ventilatorSchema>;
export type LaboratoryData = z.infer<typeof laboratorySchema>;
export type EchoData = z.infer<typeof echoSchema>;

// RV Function options
export const RV_FUNCTION_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'mildly_reduced', label: 'Mildly Reduced' },
  { value: 'moderately_reduced', label: 'Moderately Reduced' },
  { value: 'severely_reduced', label: 'Severely Reduced' },
];

// Blood gas type options
export const BLOOD_GAS_TYPE_OPTIONS = [
  { value: 'arterial', label: 'Arterial (ABG)' },
  { value: 'venous', label: 'Venous (VBG)' },
  { value: 'mixed', label: 'Mixed Venous' },
];
