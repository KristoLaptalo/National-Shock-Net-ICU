/**
 * Patient Detail Page (Index Route)
 * Redirects to the default tab based on patient status
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../../features/patient';
import { getDefaultTab } from '../../../config/patientTabs';
import { Spinner } from '../../../components/ui/Spinner';

export function PatientDetailPage() {
  const navigate = useNavigate();
  const { tt, status, isLoading } = usePatient();

  useEffect(() => {
    if (!isLoading && tt) {
      const defaultTab = getDefaultTab(status);
      navigate(`/hospital/patient/${tt}/${defaultTab}`, { replace: true });
    }
  }, [tt, status, isLoading, navigate]);

  // Show loading spinner while determining redirect
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  );
}

export default PatientDetailPage;
