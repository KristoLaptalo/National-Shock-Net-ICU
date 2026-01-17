/**
 * Form Row Component
 * Layouts form fields in a responsive row
 */

import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';

interface FormRowProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

export default FormRow;
