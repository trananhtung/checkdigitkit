/**
 * Credit card number validation and type detection.
 * Validates with Luhn algorithm, detects card type by BIN ranges.
 */
import { luhnIsValid } from "./luhn.js";

export type CardType =
  | "visa" | "mastercard" | "amex" | "discover"
  | "dinersclub" | "jcb" | "unionpay" | "maestro"
  | "unknown";

export interface CardInfo {
  type: CardType;
  isValid: boolean;
  digits: string; // stripped of spaces/dashes
}

const TYPE_PATTERNS: [CardType, RegExp][] = [
  ["amex",       /^3[47]/],
  ["dinersclub", /^3(?:0[0-5]|[68])/],
  ["discover",   /^6(?:011|5\d{2})/],
  ["jcb",        /^(?:2131|1800|35\d{3})/],
  ["unionpay",   /^62/],
  ["maestro",    /^(?:5018|5020|5038|6304|6759|676[123])/],
  ["mastercard", /^5[1-5]|^2(?:2[2-9]\d|[3-6]\d{2}|7[01]\d|720)/],
  ["visa",       /^4/],
];

/**
 * Detect the card type from a card number.
 */
export function creditCardType(value: string): CardType {
  const s = value.replace(/[\s-]/g, "");
  for (const [type, pattern] of TYPE_PATTERNS) {
    if (pattern.test(s)) return type;
  }
  return "unknown";
}

/**
 * Validate a credit card number using Luhn and return full card info.
 */
export function creditCardValidate(value: string): CardInfo {
  const digits = value.replace(/[\s-]/g, "");
  const isValid = /^\d{13,19}$/.test(digits) && luhnIsValid(digits);
  return {
    type: creditCardType(digits),
    isValid,
    digits,
  };
}

/**
 * Quick boolean check: is this a valid credit card number?
 */
export function creditCardIsValid(value: string): boolean {
  return creditCardValidate(value).isValid;
}
