/**
 * Hospital Portal Header
 * Shows logo, hospital name, subscription tier, user info, and logout
 */

import { cn } from '../../../lib/utils/cn';
import { TierBadge } from '../../ui/Badge';
import type { SubscriptionTier } from '../../../types';

export interface HospitalHeaderProps {
  hospitalName: string;
  tier: SubscriptionTier;
  userName: string;
  onLogout: () => void;
  className?: string;
}

export function HospitalHeader({
  hospitalName,
  tier,
  userName,
  onLogout,
  className,
}: HospitalHeaderProps) {
  return (
    <nav className={cn('bg-white shadow-md', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Hospital Name */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-shock-blue rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Shock Net ICU</h1>
              <p className="text-xs text-gray-500">{hospitalName}</p>
            </div>
          </div>

          {/* Right side: Tier badge, User info, Logout */}
          <div className="flex items-center space-x-4">
            <TierBadge tier={tier} />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700">{userName}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Logout"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HospitalHeader;
