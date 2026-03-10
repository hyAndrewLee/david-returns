/**
 * Timezone Utility for EZReturns
 *
 * IMPORTANT: This service operates in NY, so ALL dates must be in Eastern Time (America/New_York).
 * This utility ensures consistent timezone handling throughout the application.
 */

// Eastern Time timezone
export const TIMEZONE = "America/New_York"

/**
 * Get current date in Eastern Time as YYYY-MM-DD string
 * This is the canonical way to get "today" for the entire app
 */
export function getTodayET(): string {
  const now = new Date()
  // Convert to ET and format as YYYY-MM-DD
  const etDate = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }))
  const year = etDate.getFullYear()
  const month = String(etDate.getMonth() + 1).padStart(2, "0")
  const day = String(etDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Get date N days from now in Eastern Time as YYYY-MM-DD string
 */
export function getDateOffsetET(daysFromNow: number): string {
  const now = new Date()
  const etDate = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }))
  etDate.setDate(etDate.getDate() + daysFromNow)
  const year = etDate.getFullYear()
  const month = String(etDate.getMonth() + 1).padStart(2, "0")
  const day = String(etDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD date string and return a Date object in ET
 */
export function parseDateET(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  // Create date at noon ET to avoid timezone edge cases
  const date = new Date(year, month - 1, day, 12, 0, 0)
  return date
}

/**
 * Format a YYYY-MM-DD date string for display
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = parseDateET(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: TIMEZONE,
  })
}

/**
 * Format a YYYY-MM-DD date string for display WITHOUT timezone conversion
 * This is the safest way to display dates - no Date object creation
 */
export function formatDateSimple(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "Date not set"
  }
  const [year, month, day] = dateStr.split("-")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthIndex = Number.parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} ${Number.parseInt(day, 10)}, ${year}`
}

/**
 * Format a YYYY-MM-DD date string for short display (MMM d) WITHOUT timezone conversion
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "Date TBD"
  }
  const [year, month, day] = dateStr.split("-")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthIndex = Number.parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} ${Number.parseInt(day, 10)}`
}

/**
 * Check if two YYYY-MM-DD date strings are the same day
 */
export function isSameDateET(date1: string, date2: string): boolean {
  return date1 === date2
}

/**
 * Check if a YYYY-MM-DD date string is today in ET
 */
export function isTodayET(dateStr: string): boolean {
  return dateStr === getTodayET()
}

/**
 * Get current time in ET as 24-hour format
 */
export function getCurrentTimeET(): { hour: number; minute: number } {
  const now = new Date()
  const etTime = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }))
  return {
    hour: etTime.getHours(),
    minute: etTime.getMinutes(),
  }
}
