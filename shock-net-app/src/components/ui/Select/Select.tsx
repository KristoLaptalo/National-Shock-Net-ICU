/**
 * Select Component
 * Styled dropdown select with label and error states
 */

import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, fullWidth, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-shock-red ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'px-3 py-2 border border-gray-300 rounded-lg',
            'bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-shock-blue focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-shock-red focus:ring-shock-red',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-shock-red">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
