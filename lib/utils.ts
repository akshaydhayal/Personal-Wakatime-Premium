/**
 * Format seconds into a human-readable string
 * @param totalSeconds - Total seconds to format
 * @returns Formatted string like "7 hours 40 minutes 12 seconds"
 */
export function formatTimeDetailed(totalSeconds: number): string {
  if (totalSeconds === 0) {
    return '0 seconds';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  }

  return parts.join(' ');
}

/**
 * Format seconds into hours and minutes only (no seconds)
 * @param totalSeconds - Total seconds to format
 * @returns Formatted string like "7 hours 40 minutes"
 */
export function formatTimeHoursMinutes(totalSeconds: number): string {
  if (totalSeconds === 0) {
    return '0 minutes';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}

/**
 * Format seconds into a compact string
 * @param totalSeconds - Total seconds to format
 * @returns Formatted string like "7h 40m 12s"
 */
export function formatTimeCompact(totalSeconds: number): string {
  if (totalSeconds === 0) {
    return '0s';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}
