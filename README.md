# checkdigitkit

Zero-dependency TypeScript check digit algorithms: Luhn (credit cards, IMEI), IBAN/BBAN validation & formatting, ISBN-10/13, Damm, credit card type detection. Fills the gaps left by abandoned `luhn` (72k/week) and `iban` (207k/week) npm packages.

[![npm](https://img.shields.io/npm/v/checkdigitkit)](https://www.npmjs.com/package/checkdigitkit)
[![license](https://img.shields.io/npm/l/checkdigitkit)](LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

## Install

```bash
npm install checkdigitkit
```

## Why?

- `luhn` npm package — 72k downloads/week — abandoned since 2022, no TypeScript types
- `iban` npm package — 207k downloads/week — abandoned since 2022, no TypeScript types
- `checkdigitkit` covers both plus ISBN-10/13, Damm, IMEI, and credit card type detection — all in one zero-dep package

## Quick start

```typescript
import { luhnIsValid, ibanIsValid, creditCardValidate } from "checkdigitkit";

// Credit card validation
luhnIsValid("4532015112830366"); // true (valid Visa)
luhnIsValid("4532015112830367"); // false (bad check digit)

// Bank account validation
ibanIsValid("GB29NWBK60161331926819"); // true
ibanIsValid("GB29 NWBK 6016 1331 9268 19"); // true (spaces OK)

// Full card info
const info = creditCardValidate("5425233430109903");
// { type: "mastercard", isValid: true, digits: "5425233430109903" }
```

## API

### Luhn algorithm

Used to validate credit card numbers, IMEI numbers, NPI numbers.

```typescript
import { luhnIsValid, luhnCheckDigit, luhnComplete } from "checkdigitkit";

// Validate
luhnIsValid("4532015112830366"); // true
luhnIsValid("4532 0151 1283 0366"); // true (spaces stripped)

// Generate check digit for a partial number
luhnCheckDigit("453201511283036"); // 6

// Append check digit
luhnComplete("453201511283036"); // "4532015112830366"
```

### IBAN validation

International Bank Account Number (ISO 13616-1). Supports 70+ countries.

```typescript
import {
  ibanIsValid, ibanFormat, ibanNormalize,
  ibanCountry, ibanBban, ibanCountrySupported, ibanExpectedLength
} from "checkdigitkit";

// Validate (case-insensitive, spaces stripped automatically)
ibanIsValid("DE89370400440532013000"); // true
ibanIsValid("gb29 nwbk 6016 1331 9268 19"); // true

// Format for display
ibanFormat("GB29NWBK60161331926819");
// → "GB29 NWBK 6016 1331 9268 19"

// Extract parts
ibanCountry("GB29NWBK60161331926819"); // "GB"
ibanBban("GB29NWBK60161331926819");    // "NWBK60161331926819"

// Country info
ibanCountrySupported("DE"); // true
ibanExpectedLength("DE");   // 22
ibanExpectedLength("NO");   // 15  (shortest: Norway)
ibanExpectedLength("MT");   // 31  (longest: Malta)
```

### ISBN validation

```typescript
import { isbn10IsValid, isbn13IsValid, isbnIsValid, isbn10To13 } from "checkdigitkit";

// ISBN-10 (dashes and spaces stripped automatically)
isbn10IsValid("0-306-40615-2"); // true
isbn10IsValid("080442957X");    // true (X = 10)

// ISBN-13
isbn13IsValid("978-0-306-40615-7"); // true
isbn13IsValid("9783161484100");     // true

// Auto-detect by length
isbnIsValid("0306406152");   // true (ISBN-10, 10 chars)
isbnIsValid("9780306406157"); // true (ISBN-13, 13 chars)

// Convert ISBN-10 to ISBN-13
isbn10To13("0306406152"); // "9780306406157"
isbn10To13("080442957X"); // "9780804429573"
```

### Damm algorithm

Detects all single-digit errors and adjacent transpositions.

```typescript
import { dammIsValid, dammCheckDigit, dammComplete } from "checkdigitkit";

dammCheckDigit("572"); // 4
dammComplete("572");   // "5724"
dammIsValid("5724");   // true
dammIsValid("5714");   // false (single digit error detected)
dammIsValid("7524");   // false (adjacent transposition detected)
```

### IMEI validation

15-digit mobile device identifier (Luhn check).

```typescript
import { imeiIsValid } from "checkdigitkit";

imeiIsValid("490154203237518"); // true
imeiIsValid("490154203237519"); // false (bad check digit)
imeiIsValid("49015420323751");  // false (too short)
```

### Credit card validation and type detection

```typescript
import { creditCardIsValid, creditCardType, creditCardValidate } from "checkdigitkit";

// Quick boolean check
creditCardIsValid("4532015112830366");  // true (Visa)
creditCardIsValid("4532015112830366".replace("6", "7")); // false

// Type detection (by BIN prefix)
creditCardType("4532015112830366");   // "visa"
creditCardType("5425233430109903");   // "mastercard"
creditCardType("378282246310005");    // "amex"
creditCardType("6011111111111117");   // "discover"

// Full info
creditCardValidate("5425233430109903");
// { type: "mastercard", isValid: true, digits: "5425233430109903" }

// Accepts spaces and dashes
creditCardIsValid("4532 0151 1283 0366"); // true
creditCardIsValid("4532-0151-1283-0366"); // true
```

## Use cases

### Payment form validation

```typescript
import { creditCardValidate, luhnIsValid } from "checkdigitkit";

function validatePaymentForm(card: string, cvv: string) {
  const { type, isValid } = creditCardValidate(card);
  if (!isValid) return { error: "Invalid card number" };

  const cvvLength = type === "amex" ? 4 : 3;
  if (!/^\d+$/.test(cvv) || cvv.length !== cvvLength) {
    return { error: `CVV must be ${cvvLength} digits for ${type}` };
  }

  return { type, ok: true };
}

validatePaymentForm("4532015112830366", "123"); // { type: "visa", ok: true }
```

### SEPA transfer validation

```typescript
import { ibanIsValid, ibanFormat } from "checkdigitkit";

function processSEPATransfer(rawIban: string, amount: number) {
  if (!ibanIsValid(rawIban)) {
    throw new Error(`Invalid IBAN: ${rawIban}`);
  }
  const displayIban = ibanFormat(rawIban);
  return { iban: displayIban, amount, status: "queued" };
}

processSEPATransfer("DE89370400440532013000", 1000);
// { iban: "DE89 3704 0044 0532 0130 00", amount: 1000, status: "queued" }
```

### Book catalog import with ISBN validation

```typescript
import { isbnIsValid, isbn10To13 } from "checkdigitkit";

function normalizeBook(isbn: string, title: string) {
  if (!isbnIsValid(isbn)) throw new Error(`Invalid ISBN: ${isbn}`);
  const clean = isbn.replace(/[-\s]/g, "").toUpperCase();
  const isbn13 = clean.length === 10 ? isbn10To13(clean) : clean;
  return { isbn13, title };
}
```

### Device inventory IMEI validation

```typescript
import { imeiIsValid } from "checkdigitkit";

function registerDevice(imei: string, model: string) {
  if (!imeiIsValid(imei)) throw new Error(`Invalid IMEI: ${imei}`);
  return { imei, model, registeredAt: new Date() };
}
```

## Supported algorithms

| Algorithm | Standard | Use case |
|---|---|---|
| Luhn | ISO/IEC 7812-1 | Credit cards, IMEI, NPI, Canadian SIN |
| IBAN mod-97 | ISO 13616-1 | Bank account numbers (70+ countries) |
| ISBN-10 | ISO 2108 | 10-digit book identifiers (pre-2007) |
| ISBN-13 / EAN-13 | ISO 2108 | 13-digit book and product identifiers |
| Damm | Damm 2004 | Catches all single-digit errors and adjacent transpositions |

## Supported IBAN countries (70+)

AD, AE, AL, AT, AZ, BA, BE, BF, BG, BH, BI, BJ, BR, BY, CF, CG, CH, CI, CM, CR, CV, CY, CZ, DE, DJ, DK, DO, DZ, EE, EG, ES, FI, FK, FO, FR, GA, GB, GE, GI, GL, GQ, GR, GT, GW, HN, HR, HU, IE, IL, IQ, IR, IS, IT, JO, KM, KW, KZ, LB, LC, LI, LT, LU, LV, LY, MA, MC, MD, ME, MG, MK, ML, MN, MR, MT, MU, MZ, NE, NI, NL, NO, PK, PL, PS, PT, QA, RO, RS, RU, SA, SC, SD, SE, SI, SK, SM, SN, SO, ST, SV, TD, TG, TL, TN, TR, UA, VA, VG, XK

## License

MIT
