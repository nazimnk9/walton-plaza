/**
 * @file src/utils/cn.ts
 * @description Global CSS class-combining utility.
 * Merges class conditions safely using a lightweight combine scheme.
 * 
 * Strategy:
 * - clsx: Resolves conditional class allocations (e.g. `isActive && 'bg-blue-500'`).
 * - tailwind-merge (twMerge): Resolves overrides, ensuring that downstream custom parameters
 *   override base presets without conflicts.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Utility to combine CSS styles conditonally and merge Tailwind classes safely.
 * 
 * @param inputs - Array of class lists or conditional allocations.
 * @returns Combined and sanitized string of CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

