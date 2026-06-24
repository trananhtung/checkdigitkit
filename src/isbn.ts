/**
 * ISBN (International Standard Book Number) validation.
 * Supports both ISBN-10 (9 data + 1 check) and ISBN-13 (12 data + 1 check).
 */

function cleanIsbn(s: string): string {
  return s.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Validate an ISBN-10.
 * Check digit can be 0-9 or X (= 10).
 */
export function isbn10IsValid(value: string): boolean {
  const s = cleanIsbn(value);
  if (s.length !== 10) return false;
  if (!/^\d{9}[0-9X]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * parseInt(s[i]);
  sum += s[9] === "X" ? 10 : parseInt(s[9]);
  return sum % 11 === 0;
}

/**
 * Validate an ISBN-13 (also valid EAN-13).
 */
export function isbn13IsValid(value: string): boolean {
  const s = cleanIsbn(value);
  if (s.length !== 13) return false;
  if (!/^\d{13}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += (i % 2 === 0 ? 1 : 3) * parseInt(s[i]);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(s[12]);
}

/**
 * Validate either ISBN-10 or ISBN-13 (auto-detect by length).
 */
export function isbnIsValid(value: string): boolean {
  const s = cleanIsbn(value);
  if (s.length === 10) return isbn10IsValid(value);
  if (s.length === 13) return isbn13IsValid(value);
  return false;
}

/**
 * Convert ISBN-10 to ISBN-13 (prefix with "978", compute new check digit).
 */
export function isbn10To13(value: string): string {
  if (!isbn10IsValid(value)) throw new Error(`Invalid ISBN-10: ${value}`);
  const s = cleanIsbn(value).slice(0, 9);
  const body = "978" + s;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += (i % 2 === 0 ? 1 : 3) * parseInt(body[i]);
  }
  const check = (10 - (sum % 10)) % 10;
  return body + check;
}
