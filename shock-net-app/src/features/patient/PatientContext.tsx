/**
 * Patient Context
 * Provides patient data to all tabs within the patient detail view
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PatientStatus, ScaiStage, ShockType } from '../../types';

// Patient data structure for the detail view
export interface PatientData {
  id: string;
  tt: string;
  status: PatientStatus;
  shockType: ShockType;
  scaiStage: ScaiStage;
  ageBracket: string;
  sex: 'M' | 'F';
  icuDay: number;
  admittedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  dischargedAt?: string;
}

export interface PatientContextValue {
  patient: PatientData | null;
  tt: string;
  status: PatientStatus;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined);

// Mock patient data (matches PatientsPage.tsx)
const MOCK_PATIENTS: PatientData[] = [
  {
    id: '1',
    tt: 'TT-M5X7K9P2',
    status: 'admitted',
    shockType: 'cardiogenic',
    scaiStage: 'C',
    ageBracket: '60-69',
    sex: 'M',
    icuDay: 3,
    admittedAt: '2024-01-15',
  },
  {
    id: '2',
    tt: 'TT-R2D9F4J8',
    status: 'admitted',
    shockType: 'septic',
    scaiStage: 'D',
    ageBracket: '70-79',
    sex: 'F',
    icuDay: 5,
    admittedAt: '2024-01-13',
  },
  {
    id: '3',
    tt: 'TT-K7L3N6Q1',
    status: 'pending',
    shockType: 'cardiogenic',
    scaiStage: 'B',
    ageBracket: '50-59',
    sex: 'M',
    icuDay: 0,
    submittedAt: '2024-01-17',
  },
  {
    id: '4',
    tt: 'TT-P4S8W2Y5',
    status: 'approved',
    shockType: 'mixed',
    scaiStage: 'C',
    ageBracket: '40-49',
    sex: 'F',
    icuDay: 0,
    approvedAt: '2024-01-16',
  },
  {
    id: '5',
    tt: 'TT-A1B3C5D7',
    status: 'discharged',
    shockType: 'hypovolemic',
    scaiStage: 'A',
    ageBracket: '30-39',
    sex: 'M',
    icuDay: 0,
    dischargedAt: '2024-01-14',
  },
];

interface PatientProviderProps {
  children: ReactNode;
  tt: string;
}

export function PatientProvider({ children, tt }: PatientProviderProps) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Supabase RPC call
      // const result = await getTracking(tt);

      // Mock fetch - find patient by TT
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

      const foundPatient = MOCK_PATIENTS.find((p) => p.tt === tt);

      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        setError('Patient not found');
        setPatient(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patient');
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, [tt]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const value: PatientContextValue = {
    patient,
    tt,
    status: patient?.status ?? 'pending',
    isLoading,
    error,
    refetch: fetchPatient,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePatient(): PatientContextValue {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}

export default PatientContext;
