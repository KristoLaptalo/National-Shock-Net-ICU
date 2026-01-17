/**
 * Subscription Tier Badge
 */

import { cn } from '../../../lib/utils/cn';
import type { SubscriptionTier } from '../../../types';

export interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierConfig: Record<SubscriptionTier, { className: string }> = {
  Basic: {
    className: 'bg-gray-200 text-gray-600',
  },
  Standard: {
    className: 'bg-admin-blue-light text-shock-blue',
  },
  Premium: {
    className: 'bg-shock-green-light text-shock-green',
  },
  Unlimited: {
    className: 'bg-shock-purple-light text-shock-purple',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.className,
        sizeStyles[size],
        className
      )}
    >
      {tier}
    </span>
  );
}

export default TierBadge;
