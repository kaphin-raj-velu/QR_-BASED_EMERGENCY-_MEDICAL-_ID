/**
 * Normalizes an ID or search term by:
 * 1. Trimming leading and trailing whitespace.
 * 2. Removing all internal white spaces to ignore accidental spaces (e.g. "MED - 2026 - 0001" -> "med-2026-0001").
 * 3. Converting to lowercase for case-insensitive matching.
 */
export function normalizeSearchId(val: string): string {
  if (!val) return "";
  return val.trim().replace(/\s+/g, "").toLowerCase();
}

/**
 * Validates whether the search term is empty or too short.
 * Returns null if valid, or a descriptive error message if invalid.
 */
export function validateSearchId(val: string): string | null {
  const normalized = normalizeSearchId(val);
  if (!normalized) {
    return "Search ID cannot be empty. Please enter a valid Patient ID, Name, or Email.";
  }
  if (normalized.length < 3) {
    return "Search term is too short. Please enter at least 3 characters.";
  }
  return null;
}
