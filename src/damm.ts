/**
 * Damm algorithm — detects all single-digit errors and all adjacent transpositions.
 * Uses a quasigroup operation table (Damm 2004).
 */

// Damm's quasigroup table (10×10)
const TABLE = [
  [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
  [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
  [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
  [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
  [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
  [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
  [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
  [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
  [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
  [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
];

function dammProcess(digits: string): number {
  let interim = 0;
  for (const ch of digits) {
    const d = parseInt(ch);
    if (isNaN(d)) throw new Error(`Invalid digit: ${ch}`);
    interim = TABLE[interim][d];
  }
  return interim;
}

/** Check if a digit string (including check digit) passes the Damm check. */
export function dammIsValid(value: string): boolean {
  const s = value.replace(/\s+/g, "");
  if (s.length < 2) return false;
  return dammProcess(s) === 0;
}

/**
 * Compute the Damm check digit for a partial number (without check digit).
 * The check digit is the value that produces 0 when processed.
 */
export function dammCheckDigit(partial: string): number {
  return dammProcess(partial.replace(/\s+/g, ""));
}

/** Append the Damm check digit to a partial number. */
export function dammComplete(partial: string): string {
  return partial.replace(/\s+/g, "") + dammCheckDigit(partial);
}
