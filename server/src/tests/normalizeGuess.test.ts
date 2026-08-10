import { describe, it, expect } from 'vitest'
import { normalizeTitle, isCorrectGuess, validateGuess } from '../utils/normalizeGuess'

describe('normalizeTitle()', () => {
  it('lowercases input', () => {
    expect(normalizeTitle('INCEPTION')).toBe('inception')
  })

  it('trims whitespace', () => {
    expect(normalizeTitle('  inception  ')).toBe('inception')
  })

  it('collapses repeated spaces', () => {
    expect(normalizeTitle('The  Dark   Knight')).toBe('the dark knight')
  })

  it('removes apostrophes', () => {
    expect(normalizeTitle("It's a Wonderful Life")).toBe('its a wonderful life')
  })

  it('removes hyphens', () => {
    expect(normalizeTitle('Spider-Man')).toBe('spiderman')
  })

  it('removes periods', () => {
    expect(normalizeTitle('Dr. No')).toBe('dr no')
  })

  it('removes colons', () => {
    expect(normalizeTitle('Avengers: Endgame')).toBe('avengers endgame')
  })

  it('handles already-clean input', () => {
    expect(normalizeTitle('inception')).toBe('inception')
  })
})

describe('isCorrectGuess()', () => {
  it('matches exact title', () => {
    expect(isCorrectGuess('Inception', 'Inception')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isCorrectGuess('INCEPTION', 'Inception')).toBe(true)
  })

  it('trims whitespace before comparing', () => {
    expect(isCorrectGuess(' inception ', 'Inception')).toBe(true)
  })

  it('returns false for wrong title', () => {
    expect(isCorrectGuess('Interstellar', 'Inception')).toBe(false)
  })

  it('matches originalTitle for non-English films', () => {
    expect(isCorrectGuess('기생충', 'Parasite', '기생충')).toBe(true)
  })

  it('matches normalised variation (hyphens)', () => {
    expect(isCorrectGuess('spiderman into the spiderverse', 'Spider-Man: Into the Spider-Verse')).toBe(true)
  })

  it('returns false for empty guess after normalisation', () => {
    expect(isCorrectGuess('', 'Inception')).toBe(false)
  })
})

describe('validateGuess()', () => {
  it('returns null for a valid guess', () => {
    expect(validateGuess('Inception')).toBeNull()
  })

  it('returns error for empty string', () => {
    expect(validateGuess('')).toBeTruthy()
  })

  it('returns error for whitespace-only string', () => {
    expect(validateGuess('   ')).toBeTruthy()
  })

  it('returns error for guess over 200 chars', () => {
    expect(validateGuess('a'.repeat(201))).toBeTruthy()
  })

  it('returns error for null', () => {
    expect(validateGuess(null)).toBeTruthy()
  })

  it('returns error for undefined', () => {
    expect(validateGuess(undefined)).toBeTruthy()
  })

  it('returns error for non-string type', () => {
    expect(validateGuess(42)).toBeTruthy()
  })

  it('accepts exactly 200 chars', () => {
    expect(validateGuess('a'.repeat(200))).toBeNull()
  })
})
