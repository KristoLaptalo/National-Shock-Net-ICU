/**
 * Base Badge component
 */

import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';

export type BadgeVariant = 'default' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variant === 'outline' && 'border',
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
