/**
 * Utility for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS class deduplication
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 * cn('px-2', { 'px-4': isLarge }) // tailwind-merge handles the conflict
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
