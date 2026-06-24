/**
 * IBAN (International Bank Account Number) validation and formatting.
 * ISO 13616-1:2007.
 *
 * Validation: move first 4 chars to end, replace letters A→10..Z→35,
 * then check that the numeric string mod 97 === 1.
 */

// Country → [length, bban_format]
// Lengths sourced from SWIFT IBAN Registry 2023
const COUNTRY_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BF: 28,
  BG: 22, BH: 22, BI: 27, BJ: 28, BR: 29, BY: 28, CF: 27, CG: 27,
  CH: 21, CI: 28, CM: 27, CR: 22, CV: 25, CY: 28, CZ: 24, DE: 22,
  DJ: 27, DK: 18, DO: 28, DZ: 26, EE: 20, EG: 29, ES: 24, FI: 18,
  FK: 18, FO: 18, FR: 27, GA: 27, GB: 22, GE: 22, GI: 23, GL: 18,
  GQ: 27, GR: 27, GT: 28, GW: 25, HN: 28, HR: 21, HU: 28, IE: 22,
  IL: 23, IQ: 23, IR: 26, IS: 26, IT: 27, JO: 30, KM: 27, KW: 30,
  KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, LY: 25,
  MA: 28, MC: 27, MD: 24, ME: 22, MG: 27, MK: 19, ML: 28, MN: 20,
  MR: 27, MT: 31, MU: 30, MZ: 25, NE: 28, NI: 32, NL: 18, NO: 15,
  PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, RU: 33,
  SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SN: 28,
  SO: 23, ST: 25, SV: 28, TD: 27, TG: 28, TL: 23, TN: 24, TR: 26,
  UA: 29, VA: 22, VG: 24, XK: 20,
};

function normalize(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

function mod97(numStr: string): number {
  // Process in chunks of 9 digits to avoid BigInt
  let remainder = 0;
  for (let i = 0; i < numStr.length; i += 7) {
    const chunk = String(remainder) + numStr.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  return remainder;
}

function ibanToNumeric(iban: string): string {
  // Move first 4 chars to end, replace A→10..Z→35
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  return rearranged.replace(/[A-Z]/g, ch => String(ch.charCodeAt(0) - 55));
}

/** Check if an IBAN string is valid (structure + checksum). */
export function ibanIsValid(value: string): boolean {
  const iban = normalize(value);
  if (iban.length < 5) return false;
  const country = iban.slice(0, 2);
  const expectedLen = COUNTRY_LENGTHS[country];
  if (!expectedLen) return false;
  if (iban.length !== expectedLen) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return false;
  return mod97(ibanToNumeric(iban)) === 1;
}

/**
 * Format an IBAN in groups of 4 (display format).
 * e.g. "GB29NWBK60161331926819" → "GB29 NWBK 6016 1331 9268 19"
 */
export function ibanFormat(value: string): string {
  return normalize(value).replace(/(.{4})(?=.)/g, "$1 ");
}

/** Remove spaces and uppercase — minimal canonicalization. */
export function ibanNormalize(value: string): string {
  return normalize(value);
}

/**
 * Extract the country code from an IBAN (first 2 chars).
 * Returns undefined if the value is too short.
 */
export function ibanCountry(value: string): string | undefined {
  const iban = normalize(value);
  if (iban.length < 2) return undefined;
  return iban.slice(0, 2);
}

/**
 * Extract the BBAN (Basic Bank Account Number) — everything after the 4-char header.
 */
export function ibanBban(value: string): string {
  return normalize(value).slice(4);
}

/** Check if a country code is supported by this library. */
export function ibanCountrySupported(country: string): boolean {
  return country.toUpperCase() in COUNTRY_LENGTHS;
}

/** Return the expected IBAN length for a country code, or undefined. */
export function ibanExpectedLength(country: string): number | undefined {
  return COUNTRY_LENGTHS[country.toUpperCase()];
}
