/**
 * East Africa Time (EAT - Uganda / Africa/Kampala / UTC+3) Centralized Utilities
 *
 * Ensures all POS clocks, order registrations, receipt prints, and reporting
 * boundaries operate strictly according to Uganda local time regardless of client location.
 */

export const KAMPALA_TIMEZONE = 'Africa/Kampala';

/**
 * Formats any Date, ISO string, or timestamp into an East Africa Time (EAT) string.
 */
export function formatKampalaDateTime(
  date: string | number | Date = new Date(),
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);

  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: KAMPALA_TIMEZONE,
  }).format(d);
}

/**
 * Returns YYYY-MM-DD in East Africa Time (EAT).
 */
export function formatKampalaDate(date: string | number | Date = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KAMPALA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Returns 12-hour formatted time (e.g. 02:45 PM) in East Africa Time (EAT).
 */
export function formatKampalaTime(date: string | number | Date = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: KAMPALA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Returns current Date formatted for live terminal clocks (e.g. "Thu, 03 Sep 2026, 03:20:00 AM").
 */
export function getLiveTerminalClockString(): string {
  return formatKampalaDateTime(new Date(), {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Returns today's YYYY-MM-DD string in East Africa Time.
 */
export function getKampalaTodayString(): string {
  return formatKampalaDate(new Date());
}

/**
 * Returns yesterday's YYYY-MM-DD string in East Africa Time.
 */
export function getKampalaYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatKampalaDate(d);
}

/**
 * Computes exact start & end date strings (YYYY-MM-DD) for analytics filter presets in EAT.
 */
export function getKampalaPresetDateRange(preset: 'today' | 'yesterday' | '7days' | 'month' | 'all'): {
  startDate: string;
  endDate: string;
} {
  const todayStr = getKampalaTodayString();

  if (preset === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (preset === 'yesterday') {
    const yestStr = getKampalaYesterdayString();
    return { startDate: yestStr, endDate: yestStr };
  }

  if (preset === '7days') {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { startDate: formatKampalaDate(d), endDate: todayStr };
  }

  if (preset === 'month') {
    // Current month first day to today in EAT
    const [year, month] = todayStr.split('-');
    return { startDate: `${year}-${month}-01`, endDate: todayStr };
  }

  // 'all'
  return { startDate: '', endDate: '' };
}
