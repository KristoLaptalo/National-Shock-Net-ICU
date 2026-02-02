/**
 * Patient Detail Header
 * Minimal header with back navigation, breadcrumb, TT badge, and status badge
 */

import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils/cn';
import { StatusBadge, AnonymizationBadge } from '../../ui/Badge';
import { ROUTES } from '../../../config/routes';
import type { PatientStatus } from '../../../types';

export interface PatientHeaderProps {
  tt: string;
  status: PatientStatus;
  className?: string;
}

export function PatientHeader({ tt, status, className }: PatientHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.HOSPITAL.PATIENTS);
  };

  // Truncate TT for breadcrumb display
  const truncatedTT = tt.length > 12 ? `${tt.substring(0, 12)}...` : tt;

  return (
    <div className={cn('bg-white border-b px-4 py-3', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Back button + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to Patients"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center text-sm">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-shock-blue transition-colors"
            >
              Patients
            </button>
            <svg
              className="w-4 h-4 mx-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-700 font-medium">{truncatedTT}</span>
          </nav>
        </div>

        {/* Right: TT Badge + Status Badge */}
        <div className="flex items-center gap-3">
          <AnonymizationBadge code={tt} />
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

export default PatientHeader;
