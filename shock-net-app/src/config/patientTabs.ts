/**
 * Patient tab configuration with status-based visibility rules
 */

import type { PatientStatus } from '../types';

export interface PatientTab {
  id: string;
  label: string;
  path: string;
  allowedStatuses: PatientStatus[];
}

export const PATIENT_TABS: PatientTab[] = [
  {
    id: 'history',
    label: 'History',
    path: 'history',
    allowedStatuses: ['pending', 'approved', 'admitted'],
  },
  {
    id: 'medications',
    label: 'Medications',
    path: 'medications',
    allowedStatuses: ['pending', 'approved', 'admitted'],
  },
  {
    id: 'admission',
    label: 'ICU Admission',
    path: 'admission',
    allowedStatuses: ['approved', 'admitted'],
  },
  {
    id: 'daily-entry',
    label: 'Daily Entry',
    path: 'daily-entry',
    allowedStatuses: ['admitted'],
  },
  {
    id: 'discharge',
    label: 'Discharge',
    path: 'discharge',
    allowedStatuses: ['discharged'],
  },
];

/**
 * Get visible tabs for a given patient status
 */
export function getVisibleTabs(status: PatientStatus): PatientTab[] {
  return PATIENT_TABS.filter((tab) => tab.allowedStatuses.includes(status));
}

/**
 * Get the default tab for a given patient status
 * - pending → history
 * - approved → admission
 * - admitted → daily-entry
 * - discharged → discharge
 */
export function getDefaultTab(status: PatientStatus): string {
  switch (status) {
    case 'pending':
    case 'under_review':
      return 'history';
    case 'approved':
      return 'admission';
    case 'admitted':
      return 'daily-entry';
    case 'discharged':
    case 'archived':
      return 'discharge';
    case 'rejected':
      return 'history';
    default:
      return 'history';
  }
}
