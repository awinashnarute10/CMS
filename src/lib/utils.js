import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats duration in minutes into a two-digit padded human-readable string:
 * e.g., 8.3833 minutes -> "08 min 23 secs"
 * @param {number|null|undefined} minutes
 * @returns {string|null}
 */
export function formatDwellDuration(minutes) {
  if (minutes == null || typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return null
  }
  const totalSeconds = Math.round(minutes * 60)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')} min ${String(secs).padStart(2, '0')} secs`
}
