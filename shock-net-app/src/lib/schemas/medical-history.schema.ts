/**
 * Medical History Form Validation Schema
 * Based on sql/schema.sql medical_history table
 * 28 comorbidity fields + Charlson Comorbidity Index
 */

import { z } from 'zod';

// Severity levels used across multiple conditions
export const severityLevel4Schema = z.enum(['0', '1', '2', '3']);
export const severityLevel5Schema = z.enum(['0', '1', '2', '3', '4']);
export const binarySchema = z.enum(['0', '1']);

// Cardiovascular History Schema
export const cardiovascularHistorySchema = z.object({
  // Coronary Artery Disease
  cad: binarySchema.default('0'),
  cadDetails: z.string().optional(), // e.g., "3-vessel disease"

  // Prior Revascularization
  priorRevascularization: binarySchema.default('0'),
  revascularizationType: z.enum(['cabg', 'pci', 'both']).optional(),
  revascularizationYear: z.number().min(1950).max(2030).optional(),

  // History of MI
  historyMI: binarySchema.default('0'),
  miType: z.enum(['stemi', 'nstemi', 'unknown']).optional(),
  miYear: z.number().min(1950).max(2030).optional(),

  // Chronic Heart Failure
  chronicHeartFailure: z.enum(['0', '1', '2', '3', '4']).default('0'),
  // 0-No / 1-DCM / 2-ICM / 3-Valvular / 4-Other
  heartFailureEF: z.number().min(5).max(80).optional(), // Last known LVEF
  heartFailureNYHA: z.enum(['I', 'II', 'III', 'IV']).optional(),

  // Severe Valvular Disease
  severeValvularDisease: binarySchema.default('0'),
  valvularDiseaseType: z.string().optional(), // e.g., "Severe AS, Moderate MR"

  // Atrial Fibrillation/Flutter
  atrialFibFlutter: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-Paroxysmal / 2-Persistent / 3-Permanent
  afAnticoagulated: binarySchema.optional(),
  chadsVascScore: z.number().min(0).max(9).optional(),

  // Implanted Devices
  implantedPacemaker: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-Pacemaker / 2-ICD / 3-CRT/CRT-D
  deviceImplantYear: z.number().min(1980).max(2030).optional(),
  deviceIndication: z.string().optional(),
});

// Neurological History Schema
export const neurologicalHistorySchema = z.object({
  // Cerebrovascular Disease
  cerebrovascularDisease: binarySchema.default('0'),
  cvdType: z.string().optional(), // e.g., "Ischemic stroke 2020"

  // Prior TIA/Stroke
  priorTIAInsult: binarySchema.default('0'),
  strokeYear: z.number().min(1950).max(2030).optional(),
  strokeType: z.enum(['ischemic', 'hemorrhagic', 'tia']).optional(),

  // Hemiplegia/Motor Deficit
  hemiplegiaMotorDeficit: binarySchema.default('0'),
  motorDeficitSide: z.enum(['left', 'right', 'bilateral']).optional(),
  motorDeficitSeverity: z.enum(['mild', 'moderate', 'severe']).optional(),

  // Dementia
  dementia: binarySchema.default('0'),
  dementiaType: z.enum(['alzheimers', 'vascular', 'mixed', 'other']).optional(),
  dementiaSeverity: z.enum(['mild', 'moderate', 'severe']).optional(),

  // Psychiatric Disease
  psychiatricDisease: z.enum(['0', '1', '2']).default('0'),
  // 0-No / 1-Compensated / 2-Decompensated
  psychiatricDiagnosis: z.string().optional(), // e.g., "Bipolar disorder, Depression"
});

// Metabolic History Schema
export const metabolicHistorySchema = z.object({
  // Diabetes
  diabetes: z.enum(['0', '1', '2']).default('0'),
  // 0-No / 1-Uncomplicated / 2-End-organ Damage
  diabetesType: z.enum(['type1', 'type2']).optional(),
  diabetesYearDiagnosed: z.number().min(1950).max(2030).optional(),
  lastHbA1c: z.number().min(4).max(20).optional(),
  diabeticComplications: z.object({
    retinopathy: z.boolean().default(false),
    nephropathy: z.boolean().default(false),
    neuropathy: z.boolean().default(false),
    footUlcers: z.boolean().default(false),
  }).optional(),

  // Hypertension
  hypertension: z.enum(['0', '1', '2']).default('0'),
  // 0-No / 1-Controlled / 2-Uncontrolled
  hypertensionYears: z.number().min(0).max(80).optional(),
  knownSecondaryHTN: binarySchema.optional(),

  // Dyslipidemia
  dyslipidemia: binarySchema.default('0'),
  dyslipidemiaOnStatin: binarySchema.optional(),
  lastLDL: z.number().min(0).max(500).optional(), // mg/dL or mmol/L

  // Adiposity
  adiposity: z.enum(['0', '1', '2']).default('0'),
  // 0-No / 1-Overweight (BMI 25-30) / 2-Obese (BMI >30)
  currentBMI: z.number().min(10).max(80).optional(),
});

// Organ Systems History Schema
export const organSystemsHistorySchema = z.object({
  // Liver Disease
  liverDisease: severityLevel4Schema.default('0'),
  // 0-No / 1-Mild / 2-Moderate / 3-Severe (Cirrhosis)
  liverDiseaseEtiology: z.enum(['viral', 'alcoholic', 'nafld', 'autoimmune', 'other']).optional(),
  childPughScore: z.enum(['A', 'B', 'C']).optional(),
  meldScore: z.number().min(6).max(40).optional(),

  // Peripheral Artery Disease
  peripheralArteryDisease: binarySchema.default('0'),
  padFontaineClass: z.enum(['I', 'IIa', 'IIb', 'III', 'IV']).optional(),
  priorPADIntervention: binarySchema.optional(),

  // Chronic Kidney Disease
  chronicKidneyDisease: severityLevel4Schema.default('0'),
  // 0-No / 1-Mild (G2) / 2-Moderate (G3) / 3-End-stage (G4-5)
  baselineCreatinine: z.number().min(30).max(1500).optional(), // µmol/L
  baselineEGFR: z.number().min(0).max(150).optional(),
  onDialysis: binarySchema.optional(),
  dialysisType: z.enum(['hemodialysis', 'peritoneal']).optional(),

  // Chronic Pulmonary Disease
  chronicPulmonaryDisease: severityLevel4Schema.default('0'),
  // 0-No / 1-Mild / 2-Moderate / 3-Severe
  pulmonaryDiseaseType: z.enum(['copd', 'asthma', 'ild', 'bronchiectasis', 'other']).optional(),
  goldStage: z.enum(['1', '2', '3', '4']).optional(), // For COPD
  onHomeO2: binarySchema.optional(),
  baselineFEV1: z.number().min(10).max(150).optional(), // % predicted

  // Pulmonary Hypertension
  pulmonaryHypertension: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-Mild / 2-Severe / 3-Unknown
  phGroup: z.enum(['1', '2', '3', '4', '5']).optional(), // WHO Group
  lastRVSP: z.number().min(15).max(120).optional(), // mmHg

  // Chronic Gastric Disorder
  chronicGastricDisorder: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-GERD / 2-Gastritis / 3-PUD
  giBleedingHistory: binarySchema.optional(),
  onPPI: binarySchema.optional(),
});

// Autoimmune/Connective Tissue Schema
export const autoimmuneHistorySchema = z.object({
  // Connective Tissue Disorder
  connectiveTissueDisorder: binarySchema.default('0'),
  ctdType: z.string().optional(), // e.g., "Rheumatoid Arthritis, Lupus"

  // Autoimmune Disorder
  autoimmuneDisorder: binarySchema.default('0'),
  autoimmuneType: z.string().optional(), // e.g., "Hashimoto's, Crohn's"
  onImmunosuppression: binarySchema.optional(),
  immunosuppressionDrugs: z.string().optional(),
});

// Oncology History Schema
export const oncologyHistorySchema = z.object({
  // Leukemia
  leukemia: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-Acute / 2-Chronic / 3-Prior (in remission)
  leukemiaType: z.string().optional(), // e.g., "AML, CLL"
  leukemiaYearDiagnosed: z.number().min(1950).max(2030).optional(),

  // Lymphoma
  lymphoma: z.enum(['0', '1', '2', '3']).default('0'),
  // 0-No / 1-Acute / 2-Chronic / 3-Prior (in remission)
  lymphomaType: z.string().optional(), // e.g., "Hodgkin's, DLBCL"
  lymphomaYearDiagnosed: z.number().min(1950).max(2030).optional(),

  // Solid Organ Tumor
  solidOrganTumor: z.enum(['0', '1', '2']).default('0'),
  // 0-No / 1-Localized / 2-Metastatic
  tumorType: z.string().optional(), // e.g., "Lung adenocarcinoma"
  tumorSite: z.string().optional(),
  tumorYearDiagnosed: z.number().min(1950).max(2030).optional(),
  onActiveChemo: binarySchema.optional(),
  onActiveRadiation: binarySchema.optional(),
});

// Infectious Disease History Schema
export const infectiousHistorySchema = z.object({
  // HIV/AIDS
  hivAids: binarySchema.default('0'),
  hivOnART: binarySchema.optional(), // On antiretroviral therapy
  lastCD4Count: z.number().min(0).max(2000).optional(),
  lastViralLoad: z.string().optional(), // "Undetectable" or number

  // Other chronic infections
  chronicHepB: binarySchema.default('0'),
  chronicHepC: binarySchema.default('0'),
  latentTB: binarySchema.default('0'),
});

// Complete Medical History Schema
export const medicalHistorySchema = z.object({
  // Timestamp
  recordedAt: z.string().optional(),

  // All categories
  cardiovascular: cardiovascularHistorySchema.optional(),
  neurological: neurologicalHistorySchema.optional(),
  metabolic: metabolicHistorySchema.optional(),
  organSystems: organSystemsHistorySchema.optional(),
  autoimmune: autoimmuneHistorySchema.optional(),
  oncology: oncologyHistorySchema.optional(),
  infectious: infectiousHistorySchema.optional(),

  // Calculated Scores
  charlsonComorbidityIndex: z.number().min(0).max(37).optional(),
  ageAdjustedCCI: z.number().min(0).max(50).optional(),

  // Surgical History
  priorSurgeries: z.string().optional(),
  priorAnesthesiaComplications: z.string().optional(),

  // Family History
  familyHistoryCAD: binarySchema.optional(),
  familyHistorySuddenDeath: binarySchema.optional(),
  familyHistoryCardiomyopathy: binarySchema.optional(),
  familyHistoryOther: z.string().optional(),

  // Social History (brief)
  smokingStatus: z.enum(['never', 'former', 'current']).optional(),
  packYears: z.number().min(0).max(200).optional(),
  alcoholUse: z.enum(['none', 'social', 'moderate', 'heavy']).optional(),

  // Notes
  additionalHistory: z.string().optional(),
});

export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;
export type CardiovascularHistory = z.infer<typeof cardiovascularHistorySchema>;
export type NeurologicalHistory = z.infer<typeof neurologicalHistorySchema>;
export type MetabolicHistory = z.infer<typeof metabolicHistorySchema>;
export type OrganSystemsHistory = z.infer<typeof organSystemsHistorySchema>;
export type OncologyHistory = z.infer<typeof oncologyHistorySchema>;

// Heart Failure Type Options
export const HEART_FAILURE_TYPE_OPTIONS = [
  { value: '0', label: 'No Heart Failure' },
  { value: '1', label: 'DCM (Dilated Cardiomyopathy)' },
  { value: '2', label: 'ICM (Ischemic Cardiomyopathy)' },
  { value: '3', label: 'Valvular Heart Disease' },
  { value: '4', label: 'Other Etiology' },
];

// AF Type Options
export const AF_TYPE_OPTIONS = [
  { value: '0', label: 'No AF/Flutter' },
  { value: '1', label: 'Paroxysmal' },
  { value: '2', label: 'Persistent' },
  { value: '3', label: 'Permanent' },
];

// Pacemaker/Device Options
export const DEVICE_TYPE_OPTIONS = [
  { value: '0', label: 'No Device' },
  { value: '1', label: 'Pacemaker' },
  { value: '2', label: 'ICD' },
  { value: '3', label: 'CRT/CRT-D' },
];

// Psychiatric Status Options
export const PSYCHIATRIC_STATUS_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Compensated (stable)' },
  { value: '2', label: 'Decompensated (active)' },
];

// Diabetes Status Options
export const DIABETES_STATUS_OPTIONS = [
  { value: '0', label: 'No Diabetes' },
  { value: '1', label: 'Uncomplicated' },
  { value: '2', label: 'With End-Organ Damage' },
];

// Hypertension Status Options
export const HYPERTENSION_STATUS_OPTIONS = [
  { value: '0', label: 'No Hypertension' },
  { value: '1', label: 'Controlled' },
  { value: '2', label: 'Uncontrolled' },
];

// Adiposity Options
export const ADIPOSITY_OPTIONS = [
  { value: '0', label: 'Normal Weight' },
  { value: '1', label: 'Overweight (BMI 25-30)' },
  { value: '2', label: 'Obese (BMI >30)' },
];

// Severity Level Options (4-level)
export const SEVERITY_4_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Mild' },
  { value: '2', label: 'Moderate' },
  { value: '3', label: 'Severe' },
];

// CKD Stage Options
export const CKD_STAGE_OPTIONS = [
  { value: '0', label: 'No CKD' },
  { value: '1', label: 'Mild (G2, eGFR 60-89)' },
  { value: '2', label: 'Moderate (G3, eGFR 30-59)' },
  { value: '3', label: 'Severe/End-Stage (G4-5, eGFR <30)' },
];

// Pulmonary Hypertension Options
export const PH_STATUS_OPTIONS = [
  { value: '0', label: 'No PH' },
  { value: '1', label: 'Mild (RVSP 35-50)' },
  { value: '2', label: 'Severe (RVSP >50)' },
  { value: '3', label: 'Unknown/Not Assessed' },
];

// GI Disorder Options
export const GI_DISORDER_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: 'GERD' },
  { value: '2', label: 'Gastritis' },
  { value: '3', label: 'Peptic Ulcer Disease' },
];

// Cancer Status Options
export const CANCER_STATUS_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Acute/Active' },
  { value: '2', label: 'Chronic/Indolent' },
  { value: '3', label: 'Prior (in remission)' },
];

// Solid Tumor Options
export const SOLID_TUMOR_OPTIONS = [
  { value: '0', label: 'No Tumor' },
  { value: '1', label: 'Localized' },
  { value: '2', label: 'Metastatic' },
];

// Smoking Status Options
export const SMOKING_STATUS_OPTIONS = [
  { value: 'never', label: 'Never Smoker' },
  { value: 'former', label: 'Former Smoker' },
  { value: 'current', label: 'Current Smoker' },
];

// Alcohol Use Options
export const ALCOHOL_USE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'social', label: 'Social (<7 drinks/week)' },
  { value: 'moderate', label: 'Moderate (7-14 drinks/week)' },
  { value: 'heavy', label: 'Heavy (>14 drinks/week)' },
];

// NYHA Class Options
export const NYHA_CLASS_OPTIONS = [
  { value: 'I', label: 'Class I - No limitation' },
  { value: 'II', label: 'Class II - Slight limitation' },
  { value: 'III', label: 'Class III - Marked limitation' },
  { value: 'IV', label: 'Class IV - Symptoms at rest' },
];

// Liver Disease Etiology Options
export const LIVER_ETIOLOGY_OPTIONS = [
  { value: 'viral', label: 'Viral Hepatitis' },
  { value: 'alcoholic', label: 'Alcoholic' },
  { value: 'nafld', label: 'NAFLD/NASH' },
  { value: 'autoimmune', label: 'Autoimmune' },
  { value: 'other', label: 'Other' },
];

// COPD Type Options
export const PULMONARY_TYPE_OPTIONS = [
  { value: 'copd', label: 'COPD' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'ild', label: 'Interstitial Lung Disease' },
  { value: 'bronchiectasis', label: 'Bronchiectasis' },
  { value: 'other', label: 'Other' },
];
