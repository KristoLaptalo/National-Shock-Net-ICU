/**
 * Anonymization Badge for patient codes
 * Displays anonymized patient identifiers in monospace font
 */

import { cn } from '../../../lib/utils/cn';

export interface AnonymizationBadgeProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function AnonymizationBadge({
  code,
  size = 'md',
  className,
}: AnonymizationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded',
        'bg-shock-purple-light text-shock-purple',
        sizeStyles[size],
        className
      )}
    >
      {code}
    </span>
  );
}

export default AnonymizationBadge;
