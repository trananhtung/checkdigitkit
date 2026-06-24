import { describe, test, expect } from "@jest/globals";
import {
  luhnIsValid, luhnCheckDigit, luhnComplete,
  ibanIsValid, ibanFormat, ibanNormalize, ibanCountry, ibanBban,
  ibanCountrySupported, ibanExpectedLength,
  isbn10IsValid, isbn13IsValid, isbnIsValid, isbn10To13,
  dammIsValid, dammCheckDigit, dammComplete,
  imeiIsValid,
  creditCardType, creditCardValidate, creditCardIsValid,
} from "../src/index.js";

describe("Luhn algorithm", () => {
  // Known valid credit card test numbers
  test("valid Visa test number", () => {
    expect(luhnIsValid("4532015112830366")).toBe(true);
  });
  test("valid Mastercard test number", () => {
    expect(luhnIsValid("5425233430109903")).toBe(true);
  });
  test("valid Amex test number", () => {
    expect(luhnIsValid("378282246310005")).toBe(true);
  });
  test("valid Discover test number", () => {
    expect(luhnIsValid("6011111111111117")).toBe(true);
  });

  test("invalid: altered last digit", () => {
    expect(luhnIsValid("4532015112830367")).toBe(false);
  });
  test("invalid: single digit changed", () => {
    expect(luhnIsValid("4532015112830360")).toBe(false);
  });
  test("invalid: too short", () => {
    expect(luhnIsValid("4")).toBe(false);
  });
  test("invalid: non-digit characters (ignored spaces OK)", () => {
    expect(luhnIsValid("4532 0151 1283 0366")).toBe(true);
  });

  test("luhnCheckDigit: generates correct digit", () => {
    // 453201511283036 + ? = valid
    expect(luhnCheckDigit("453201511283036")).toBe(6);
  });

  test("luhnComplete: appends correct check digit", () => {
    const partial = "453201511283036";
    const full = luhnComplete(partial);
    expect(full).toBe("4532015112830366");
    expect(luhnIsValid(full)).toBe(true);
  });

  test("luhnComplete: completeness check", () => {
    // Any partial number — complete should pass validation
    const partials = ["1234567890123", "98765432101234", "000000000000"];
    for (const p of partials) {
      expect(luhnIsValid(luhnComplete(p))).toBe(true);
    }
  });
});

describe("IBAN validation", () => {
  // Test vectors from Wikipedia and SWIFT IBAN Examples
  test("valid German IBAN", () => {
    expect(ibanIsValid("DE89370400440532013000")).toBe(true);
  });
  test("valid UK IBAN", () => {
    expect(ibanIsValid("GB29NWBK60161331926819")).toBe(true);
  });
  test("valid French IBAN", () => {
    expect(ibanIsValid("FR7630006000011234567890189")).toBe(true);
  });
  test("valid Belgian IBAN", () => {
    expect(ibanIsValid("BE68539007547034")).toBe(true);
  });
  test("valid Swiss IBAN", () => {
    expect(ibanIsValid("CH9300762011623852957")).toBe(true);
  });
  test("valid Netherlands IBAN", () => {
    expect(ibanIsValid("NL91ABNA0417164300")).toBe(true);
  });
  test("valid Spanish IBAN", () => {
    expect(ibanIsValid("ES9121000418450200051332")).toBe(true);
  });
  test("valid Norwegian IBAN (shortest, 15 chars)", () => {
    expect(ibanIsValid("NO9386011117947")).toBe(true);
  });

  test("accepts spaces in input", () => {
    expect(ibanIsValid("GB29 NWBK 6016 1331 9268 19")).toBe(true);
  });
  test("case insensitive", () => {
    expect(ibanIsValid("gb29nwbk60161331926819")).toBe(true);
  });

  test("invalid: wrong check digit", () => {
    expect(ibanIsValid("DE89370400440532013001")).toBe(false);
  });
  test("invalid: wrong length for country", () => {
    expect(ibanIsValid("DE89370400440532013")).toBe(false);
  });
  test("invalid: unknown country", () => {
    expect(ibanIsValid("XX12345678901234")).toBe(false);
  });
  test("invalid: too short", () => {
    expect(ibanIsValid("GB29")).toBe(false);
  });
  test("invalid: empty", () => {
    expect(ibanIsValid("")).toBe(false);
  });

  test("ibanFormat: groups of 4", () => {
    expect(ibanFormat("GB29NWBK60161331926819")).toBe("GB29 NWBK 6016 1331 9268 19");
  });
  test("ibanNormalize: strips spaces and uppercases", () => {
    expect(ibanNormalize("gb29 nwbk 6016 1331 9268 19")).toBe("GB29NWBK60161331926819");
  });
  test("ibanCountry: extracts country code", () => {
    expect(ibanCountry("GB29NWBK60161331926819")).toBe("GB");
    expect(ibanCountry("DE89370400440532013000")).toBe("DE");
  });
  test("ibanBban: extracts BBAN", () => {
    expect(ibanBban("GB29NWBK60161331926819")).toBe("NWBK60161331926819");
  });
  test("ibanCountrySupported: known countries", () => {
    expect(ibanCountrySupported("GB")).toBe(true);
    expect(ibanCountrySupported("DE")).toBe(true);
    expect(ibanCountrySupported("XX")).toBe(false);
  });
  test("ibanExpectedLength: correct for known countries", () => {
    expect(ibanExpectedLength("GB")).toBe(22);
    expect(ibanExpectedLength("DE")).toBe(22);
    expect(ibanExpectedLength("NO")).toBe(15);
    expect(ibanExpectedLength("XX")).toBeUndefined();
  });
});

describe("ISBN validation", () => {
  test("valid ISBN-10: 0-306-40615-2", () => {
    expect(isbn10IsValid("0306406152")).toBe(true);
    expect(isbn10IsValid("0-306-40615-2")).toBe(true);
  });
  test("valid ISBN-10 with X check digit", () => {
    expect(isbn10IsValid("0-19-853453-1")).toBe(true);
  });
  test("valid ISBN-10: 0-8044-2957-X", () => {
    expect(isbn10IsValid("080442957X")).toBe(true);
  });

  test("invalid ISBN-10: wrong check digit", () => {
    expect(isbn10IsValid("0306406153")).toBe(false);
  });
  test("invalid ISBN-10: wrong length", () => {
    expect(isbn10IsValid("030640615")).toBe(false);
  });

  test("valid ISBN-13: 978-0-306-40615-7", () => {
    expect(isbn13IsValid("9780306406157")).toBe(true);
    expect(isbn13IsValid("978-0-306-40615-7")).toBe(true);
  });
  test("valid ISBN-13: 978-3-16-148410-0", () => {
    expect(isbn13IsValid("9783161484100")).toBe(true);
  });

  test("invalid ISBN-13: wrong check digit", () => {
    expect(isbn13IsValid("9780306406158")).toBe(false);
  });
  test("invalid ISBN-13: wrong length", () => {
    expect(isbn13IsValid("978030640615")).toBe(false);
  });

  test("isbnIsValid: auto-detects by length", () => {
    expect(isbnIsValid("0306406152")).toBe(true);   // ISBN-10
    expect(isbnIsValid("9780306406157")).toBe(true); // ISBN-13
    expect(isbnIsValid("030640615")).toBe(false);     // too short
  });

  test("isbn10To13: converts correctly", () => {
    expect(isbn10To13("0306406152")).toBe("9780306406157");
    expect(isbn10To13("080442957X")).toBe("9780804429573");
  });

  test("isbn10To13: rejects invalid ISBN-10", () => {
    expect(() => isbn10To13("0306406153")).toThrow();
  });
});

describe("Damm algorithm", () => {
  test("valid number passes check", () => {
    // 572 + check digit 4 = 5724
    expect(dammIsValid("5724")).toBe(true);
  });
  test("check digit for 572 is 4", () => {
    expect(dammCheckDigit("572")).toBe(4);
  });
  test("complete appends check digit", () => {
    const full = dammComplete("572");
    expect(full).toBe("5724");
    expect(dammIsValid(full)).toBe(true);
  });

  test("single digit error detected", () => {
    // Change any digit
    expect(dammIsValid("5714")).toBe(false);
    expect(dammIsValid("5726")).toBe(false);
  });
  test("transposition detected", () => {
    // Adjacent swap in valid number "5724"
    expect(dammIsValid("7524")).toBe(false);
  });

  test("arbitrary partials: complete validates", () => {
    for (const p of ["123", "456789", "000", "987654321"]) {
      expect(dammIsValid(dammComplete(p))).toBe(true);
    }
  });
});

describe("IMEI validation", () => {
  // Known valid IMEI numbers
  test("valid IMEI: Apple iPhone test", () => {
    expect(imeiIsValid("490154203237518")).toBe(true);
  });
  test("valid IMEI with spaces/dashes stripped", () => {
    expect(imeiIsValid("490154 203237518")).toBe(true);
  });
  test("invalid: too short (14 digits)", () => {
    expect(imeiIsValid("49015420323751")).toBe(false);
  });
  test("invalid: too long (16 digits)", () => {
    expect(imeiIsValid("4901542032375180")).toBe(false);
  });
  test("invalid: wrong check digit", () => {
    expect(imeiIsValid("490154203237519")).toBe(false);
  });
  test("invalid: non-digit characters", () => {
    expect(imeiIsValid("49015420323751X")).toBe(false);
  });
});

describe("Credit card validation", () => {
  test("valid Visa: 4532015112830366", () => {
    expect(creditCardIsValid("4532015112830366")).toBe(true);
    expect(creditCardType("4532015112830366")).toBe("visa");
  });
  test("valid Mastercard: 5425233430109903", () => {
    expect(creditCardIsValid("5425233430109903")).toBe(true);
    expect(creditCardType("5425233430109903")).toBe("mastercard");
  });
  test("valid Amex: 378282246310005", () => {
    expect(creditCardIsValid("378282246310005")).toBe(true);
    expect(creditCardType("378282246310005")).toBe("amex");
  });
  test("valid Discover: 6011111111111117", () => {
    expect(creditCardIsValid("6011111111111117")).toBe(true);
    expect(creditCardType("6011111111111117")).toBe("discover");
  });

  test("invalid: wrong check digit", () => {
    expect(creditCardIsValid("4532015112830367")).toBe(false);
  });
  test("accepts spaces and dashes", () => {
    expect(creditCardIsValid("4532 0151 1283 0366")).toBe(true);
    expect(creditCardIsValid("4532-0151-1283-0366")).toBe(true);
  });

  test("creditCardValidate returns full info", () => {
    const info = creditCardValidate("4532015112830366");
    expect(info.isValid).toBe(true);
    expect(info.type).toBe("visa");
    expect(info.digits).toBe("4532015112830366");
  });

  test("unknown card type", () => {
    // Use a Luhn-valid number with no known prefix
    // Start with "9" (no card starts with 9)
    const luhnValid = "9" + "0".repeat(12) + "4"; // won't match known types
    expect(creditCardType(luhnValid)).toBe("unknown");
  });
});

describe("Real-world: payment form validation", () => {
  test("form validation pipeline", () => {
    const formInputs = [
      { card: "4532015112830366", expiry: "12/2027", cvv: "123" },  // valid Visa
      { card: "5425233430109903", expiry: "06/2026", cvv: "456" },  // valid MC
      { card: "1234567890123456", expiry: "01/2025", cvv: "999" },  // invalid
    ];

    const results = formInputs.map(({ card }) => creditCardValidate(card));
    expect(results[0].isValid).toBe(true);
    expect(results[0].type).toBe("visa");
    expect(results[1].isValid).toBe(true);
    expect(results[1].type).toBe("mastercard");
    expect(results[2].isValid).toBe(false);
  });

  test("IBAN validation for SEPA transfer", () => {
    const ibans = [
      "DE89370400440532013000",  // valid DE
      "FR7630006000011234567890189", // valid FR
      "GB99MIDL07009312345678",  // invalid (wrong check)
    ];
    expect(ibanIsValid(ibans[0])).toBe(true);
    expect(ibanIsValid(ibans[1])).toBe(true);
    expect(ibanIsValid(ibans[2])).toBe(false);
  });
});
