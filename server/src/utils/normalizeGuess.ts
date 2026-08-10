/**
 * Guess normalization utilities.
 *
 * The comparison logic must be centralised here — the backend is the sole
 * authority on whether a guess is correct. The frontend never determines this.
 */

/**
 * Normalize a movie title or user guess for comparison.
 *
 * Applies the following transformations:
 *   1. Trim leading/trailing whitespace
 *   2. Collapse repeated internal whitespace → single space
 *   3. Lowercase everything
 *   4. Remove common punctuation that doesn't affect recognition
 *      (apostrophes, hyphens in some positions, colons, periods, commas)
 *
 * Examples:
 *   "Inception"       → "inception"
 *   " INCEPTION "     → "inception"
 *   "Spider-Man"      → "spiderman"  (hyphen removed)
 *   "Dr. No"          → "dr no"
 *   "It's a Wonderful Life" → "its a wonderful life"
 */
export function normalizeTitle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // Collapse repeated whitespace
    .replace(/\s+/g, ' ')
    // Remove apostrophes and possessives  e.g. "it's" → "its"
    .replace(/'/g, '')
    .replace(/'/g, '')
    // Remove hyphens (Spider-Man → spiderman)
    .replace(/-/g, '')
    // Remove periods (Dr. → Dr)
    .replace(/\./g, '')
    // Remove colons and commas
    .replace(/[,:]/g, '')
    // Remove any remaining non-alphanumeric, non-space chars
    .replace(/[^a-z0-9 ]/g, '')
    // Final trim after transforms
    .trim()
}

/**
 * Compare a user's guess against the official movie title.
 * Returns true if they match after normalization.
 *
 * Also checks against originalTitle if provided (handles non-English films).
 */
export function isCorrectGuess(
  guess: string,
  title: string,
  originalTitle?: string | null
): boolean {
  const normalizedGuess = normalizeTitle(guess)
  if (!normalizedGuess) return false

  if (normalizedGuess === normalizeTitle(title)) return true
  if (originalTitle && normalizedGuess === normalizeTitle(originalTitle)) return true

  return false
}

// ─── Input validation ─────────────────────────────────────────────────────────

export const GUESS_MIN_LENGTH = 1
export const GUESS_MAX_LENGTH = 200

/**
 * Validate a raw guess string.
 * Returns a validation error message or null if valid.
 */
export function validateGuess(raw: unknown): string | null {
  if (raw === undefined || raw === null) return 'Guess is required'
  if (typeof raw !== 'string') return 'Guess must be a string'
  if (raw.trim().length < GUESS_MIN_LENGTH) return 'Guess cannot be empty'
  if (raw.length > GUESS_MAX_LENGTH)
    return `Guess must be ${GUESS_MAX_LENGTH} characters or fewer`
  return null
}
