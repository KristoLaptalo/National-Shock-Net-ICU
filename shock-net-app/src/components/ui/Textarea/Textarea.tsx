/**
 * Textarea Component
 * Multi-line text input with label and error states
 */

import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-shock-red ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'px-3 py-2 border border-gray-300 rounded-lg',
            'bg-white text-gray-900 resize-vertical min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-shock-blue focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-shock-red focus:ring-shock-red',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-shock-red">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
