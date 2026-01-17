/**
 * Patient Status Badge
 */

import { cn } from '../../../lib/utils/cn';
import type { PatientStatus } from '../../../types';

export interface StatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<PatientStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-shock-blue-light text-shock-blue',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-admin-blue-light text-shock-blue',
  },
  approved: {
    label: 'Approved',
    className: 'bg-shock-green-light text-shock-green',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-shock-red-light text-shock-red',
  },
  admitted: {
    label: 'In ICU',
    className: 'bg-shock-teal-light text-shock-teal',
  },
  discharged: {
    label: 'Discharged',
    className: 'bg-gray-200 text-gray-600',
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-300 text-gray-700',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.className,
        sizeStyles[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
