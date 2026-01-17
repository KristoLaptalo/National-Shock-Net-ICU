/**
 * Hospital Portal Tab Navigation
 * Horizontal tab bar for the 7 workflow tabs
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils/cn';
import { HOSPITAL_TABS } from '../../../config/routes';

export interface TabNavigationProps {
  className?: string;
}

export function TabNavigation({ className }: TabNavigationProps) {
  const location = useLocation();

  // Check if a tab is active (handles both exact match and nested routes)
  const isTabActive = (tabPath: string): boolean => {
    // Exact match
    if (location.pathname === tabPath) return true;

    // Handle new-patient under patients
    if (tabPath.includes('/patients') && !tabPath.includes('/new')) {
      return location.pathname === tabPath;
    }

    // For other tabs, check if pathname starts with tab path
    return location.pathname.startsWith(tabPath) && tabPath !== '/hospital/dashboard';
  };

  return (
    <div className={cn('bg-gray-50 border-b', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1 py-2 overflow-x-auto">
          {HOSPITAL_TABS.map((tab) => {
            const isActive = isTabActive(tab.path);

            return (
              <Link
                key={tab.id}
                to={tab.path}
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

export default TabNavigation;
