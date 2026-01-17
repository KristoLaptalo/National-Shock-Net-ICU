/**
 * Admin Portal Header
 * Shows page title, notification bell, and date
 */

import { cn } from '../../../lib/utils/cn';

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  notificationCount?: number;
  className?: string;
}

export function AdminHeader({
  title,
  subtitle,
  notificationCount = 0,
  className,
}: AdminHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header
      className={cn(
        'bg-white border-b border-gray-200 px-6 py-4',
        className
      )}
    >
      <div className="flex justify-between items-center">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Right side: Notifications and Date */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-shock-red text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Date Display */}
          <span className="text-gray-500 text-sm">{today}</span>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
