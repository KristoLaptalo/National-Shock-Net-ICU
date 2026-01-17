/**
 * AppShell - Main application wrapper
 * Provides consistent layout structure for both portals
 */

import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';

export type PortalType = 'hospital' | 'admin';

export interface AppShellProps {
  children: ReactNode;
  portal: PortalType;
  header?: ReactNode;
  sidebar?: ReactNode;
  navigation?: ReactNode;
  className?: string;
}

export function AppShell({
  children,
  portal,
  header,
  sidebar,
  navigation,
  className,
}: AppShellProps) {
  // Admin portal uses sidebar layout
  if (portal === 'admin') {
    return (
      <div className={cn('flex min-h-screen', className)}>
        {/* Sidebar */}
        {sidebar}

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {header}

          {/* Page content */}
          <main className="flex-1 p-6 bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Hospital portal uses header + tabs layout
  return (
    <div className={cn('min-h-screen bg-gray-100', className)}>
      {/* Header */}
      {header}

      {/* Tab Navigation */}
      {navigation}

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
