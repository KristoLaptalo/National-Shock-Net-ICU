/**
 * SCAI Stage Badge
 * Shows severity stage A-E with color coding
 */

import { cn } from '../../../lib/utils/cn';
import type { ScaiStage } from '../../../types';
import { SCAI_STAGES } from '../../../types';

export interface ScaiBadgeProps {
  stage: ScaiStage;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const stageStyles: Record<ScaiStage, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-yellow-100 text-yellow-700',
  C: 'bg-orange-100 text-orange-700',
  D: 'bg-red-100 text-red-700',
  E: 'bg-red-200 text-red-800',
};

const sizeStyles = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function ScaiBadge({
  stage,
  showLabel = false,
  size = 'md',
  className,
}: ScaiBadgeProps) {
  const stageInfo = SCAI_STAGES[stage];

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-2 font-medium rounded px-2 py-1',
          stageStyles[stage],
          className
        )}
      >
        <span className="font-bold">{stage}</span>
        <span className="text-xs opacity-80">{stageInfo.label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded',
        stageStyles[stage],
        sizeStyles[size],
        className
      )}
      title={`SCAI Stage ${stage}: ${stageInfo.description}`}
    >
      {stage}
    </span>
  );
}

export default ScaiBadge;
