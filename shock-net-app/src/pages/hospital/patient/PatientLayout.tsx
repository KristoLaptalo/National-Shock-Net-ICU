/**
 * Patient Detail Layout
 * Wraps all patient detail pages with patient-specific header and tab navigation
 */

import { Outlet, useParams } from 'react-router-dom';
import { PatientProvider, usePatient } from '../../../features/patient';
import { PatientHeader } from '../../../components/layout/Header';
import { PatientTabNavigation } from '../../../components/layout/Navigation';
import { Card, CardContent } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';

function PatientLayoutContent() {
  const { patient, tt, status, isLoading, error } = usePatient();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-red-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || `No patient found with tracking token: ${tt}`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Patient-specific header with back button */}
      <PatientHeader tt={tt} status={status} />

      {/* Patient-specific tab navigation */}
      <PatientTabNavigation tt={tt} status={status} />

      {/* Page content */}
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function PatientLayout() {
  const { tt } = useParams<{ tt: string }>();

  // If no TT is provided, show error
  if (!tt) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Request</h2>
            <p className="text-gray-600">No tracking token provided.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PatientProvider tt={tt}>
      <PatientLayoutContent />
    </PatientProvider>
  );
}

export default PatientLayout;
