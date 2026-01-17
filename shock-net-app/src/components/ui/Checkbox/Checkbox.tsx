/**
 * Checkbox Component
 * Styled checkbox with label
 */

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'mt-0.5 w-5 h-5 rounded border-gray-300',
            'text-shock-blue focus:ring-shock-blue focus:ring-2',
            'cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          {...props}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            {label}
          </span>
          {description && (
            <span className="text-xs text-gray-500">{description}</span>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
