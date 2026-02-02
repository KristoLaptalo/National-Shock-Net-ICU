/**
 * Patient Detail Tab Navigation
 * Shows patient-specific tabs based on patient status
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils/cn';
import { getVisibleTabs } from '../../../config/patientTabs';
import type { PatientStatus } from '../../../types';

export interface PatientTabNavigationProps {
  tt: string;
  status: PatientStatus;
  className?: string;
}

export function PatientTabNavigation({ tt, status, className }: PatientTabNavigationProps) {
  const location = useLocation();
  const visibleTabs = getVisibleTabs(status);

  // Check if a tab is active
  const isTabActive = (tabPath: string): boolean => {
    const fullPath = `/hospital/patient/${tt}/${tabPath}`;
    return location.pathname === fullPath;
  };

  return (
    <div className={cn('bg-gray-50 border-b', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1 py-2 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const isActive = isTabActive(tab.path);
            const tabPath = `/hospital/patient/${tt}/${tab.path}`;

            return (
              <Link
                key={tab.id}
                to={tabPath}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
                  isActive
                    ? 'bg-shock-blue text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PatientTabNavigation;
