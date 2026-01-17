/**
 * Patient domain types
 */

import type { Gender, ScaiStage, ShockType, PointOfReferral, ShockClassification } from './medical.types';

// Patient status in the workflow
export type PatientStatus =
  | 'pending'        // Submitted, awaiting admin review
  | 'under_review'   // Admin requested additional info
  | 'approved'       // Approved, ready for admission
  | 'rejected'       // Rejected by admin
  | 'admitted'       // Currently in ICU care
  | 'discharged'     // Discharged from ICU
  | 'archived';      // Case archived to registry

// Outcome status (matches discharge schema)
export type OutcomeStatus =
  | 'survived_icu'
  | 'survived_hospital'
  | 'died_icu'
  | 'died_hospital'
  | 'transferred'
  | 'unknown';

// Discharge destination
export type DischargeDestination = 'home' | 'ward' | 'other_facility' | 'palliative';

// Transfer from ICU destination
export type TransferDestination = 'ward' | 'other_icu' | 'palliative' | 'higher_center' | 'smaller_center';

// Anonymized patient data (what's displayed in the UI)
export interface PatientSummary {
  patientId: number;
  patientCode: string;      // e.g., "ALPHA-7K2M9X"
  qrCode: string;           // e.g., "NSN-202601-0001234"
  age: number;
  gender: Gender;
  shockType: ShockType;
  scaiStage: ScaiStage;
  status: PatientStatus;
  dayInIcu?: number;        // For admitted patients
  admissionDate?: string;
  hospitalName?: string;    // For admin view
}

// Full patient record for detail view
export interface Patient {
  patientId: number;
  patientCode: string;
  qrCode: string;

  // Demographics
  dateOfBirth: string;
  age: number;
  gender: Gender;
  weightKg?: number;
  heightCm?: number;
  bsa?: number;
  bmi?: number;

  createdAt: string;
}

// Admission record
export interface Admission {
  admissionId: number;
  patientId: number;
  subscriptionId: number;
  icuId: number;
  physicianId: number;
  approvedBy?: number;

  caseNumber: string;
  dateOfAdmission: string;
  dateOfShockOnset?: string;

  pointOfReferral?: PointOfReferral;
  referralHospital?: string;

  status: PatientStatus;
  bedNumber?: string;

  submissionDate: string;
  admissionDate?: string;

  // Related data
  shockClassification?: ShockClassification;
}

// Patient with admission for list views
export interface PatientWithAdmission extends Patient {
  admission: Admission;
}

// Criteria check result (for admission evaluation)
export interface CriteriaCheckResult {
  mapBelow65: boolean;      // MAP < 65 mmHg
  sbpBelow90: boolean;      // SBP < 90 mmHg
  lactateAbove2: boolean;   // Lactate > 2.0 mmol/L
  hasScaiStage: boolean;    // SCAI stage provided
  hasShockType: boolean;    // Shock type identified
  score: number;            // 0-5 score
  meetsMinimum: boolean;    // At least 3/5 criteria met
}

// Registry ID format: NSN-XXXX-XXXX-XXXX
export interface RegistryRecord {
  registryId: string;       // e.g., "NSN-A7B2-C9D4-E1F8"
  archiveId: string;        // Internal AID
  archivedAt: string;

  // Anonymized aggregated data
  ageDecode: number;
  sex: Gender;
  shockType: ShockType;
  scaiStageAdmission: ScaiStage;
  scaiStageWorst: ScaiStage;

  outcome: OutcomeStatus;
  lengthOfStayDays: number;
  icuDays: number;
}
