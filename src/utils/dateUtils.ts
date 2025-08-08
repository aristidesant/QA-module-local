import dayjs from "dayjs";

/**
 * Formats an expiration date string to a human-readable format (e.g., "Jan 1, 2025")
 * Handles different date formats including ISO strings and YYYY-MM-DD
 *
 * @param dateString - The date string to format
 * @returns Formatted date string in "MMM D, YYYY" format or empty string if invalid
 */
export function formatExpirationDate(dateString?: string | null): string {
  if (!dateString) return "";

  try {
    // Handle ISO format strings by splitting at T
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

    // Use dayjs for all parsing and formatting
    const parsed = dayjs(datePart);
    if (parsed.isValid()) {
      return parsed.format("MMM D, YYYY");
    }
    return "";
  } catch (e) {
    console.error("Error formatting expiration date:", e, dateString);
    return "";
  }
}

/**
 * Checks if a date string represents a valid date
 *
 * @param dateString - The date string to validate
 * @returns Boolean indicating if the date is valid
 */
export function isValidDate(dateString?: string | null): boolean {
  if (!dateString) return false;

  try {
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;
    return dayjs(datePart).isValid();
  } catch (e) {
    return false;
  }
}
