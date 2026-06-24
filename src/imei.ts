/**
 * IMEI (International Mobile Equipment Identity) validation.
 * A 15-digit number validated using the Luhn algorithm.
 */
import { luhnIsValid } from "./luhn.js";

/** Check if a 15-digit IMEI is valid (Luhn check). */
export function imeiIsValid(value: string): boolean {
  const s = value.replace(/[\s-]/g, "");
  if (s.length !== 15 || !/^\d{15}$/.test(s)) return false;
  return luhnIsValid(s);
}
