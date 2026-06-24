/**
 * Luhn algorithm (ISO/IEC 7812-1).
 * Used to validate: credit card numbers, IMEI numbers, NPI numbers.
 */

function digits(s: string): number[] {
  return s.replace(/\s+/g, "").split("").map(Number);
}

/**
 * Check if a number string passes the Luhn check.
 * Accepts digits and spaces; spaces are stripped.
 */
export function luhnIsValid(value: string): boolean {
  const d = digits(value);
  if (d.length < 2 || d.some(isNaN)) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let v = d[i];
    if (alt) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/**
 * Compute the Luhn check digit for a partial number (without the check digit).
 * Returns the single digit to append so that the full number passes luhnIsValid.
 */
export function luhnCheckDigit(partial: string): number {
  const d = digits(partial);
  if (d.some(isNaN)) throw new Error(`Invalid characters in: ${partial}`);
  // Append 0 and compute; check digit = (10 - (sum % 10)) % 10
  d.push(0);
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let v = d[i];
    if (alt) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Append the Luhn check digit to a partial number string.
 */
export function luhnComplete(partial: string): string {
  return partial.replace(/\s+/g, "") + luhnCheckDigit(partial);
}
