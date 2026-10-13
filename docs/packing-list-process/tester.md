# Packing List Process — Tester / Product Guide

This is a product/test-focused summary of how packing lists are processed and
accepted or rejected. It's derived from [source.md](./source.md) — if
something here seems out of date, check that file first. There are no code
or file references in this document by design; see
[developer.md](./developer.md) for implementation detail.

## What the Service Does

A trading partner uploads a packing list (Excel, CSV, or PDF). The service
works out which retailer's template it is, extracts each product line, checks
it against a fixed set of business rules, and reports whether the packing
list is acceptable.

## Outcomes You'll See

Every successful call returns `result: "success"` with a `data.approvalStatus`
value; failures return `result: "failure"` with an `error` message.

| Outcome                        | HTTP status | `approvalStatus`                                          | When it happens                                                                                                |
| ------------------------------ | ----------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Matched, all checks pass       | 200         | `approved`                                                | A retailer template was recognised and every product line passes validation.                                   |
| Matched, validation failed     | 200         | `rejected_ineligible` / `rejected_coo` / `rejected_other` | A retailer template was recognised but one or more rules below failed; the response lists the failure reasons. |
| No match / unrecognised format | 200         | `rejected_other`                                          | No GB RMS establishment number was found, or the file doesn't match any known retailer template.               |
| Invalid request                | 400         | n/a (`result: "failure"`)                                 | The request itself is malformed (for example, missing `application_id`).                                       |
| Internal error                 | 500         | n/a (`result: "failure"`)                                 | Something unexpected failed while downloading, parsing, or saving the file.                                    |

## Parser Discovery Scenarios

| Scenario                                                        | Expected result                                  |
| --------------------------------------------------------------- | ------------------------------------------------ |
| File has no valid `RMS-GB-######-###` number anywhere in it     | Missing-RMS / no-match outcome                   |
| File type isn't Excel, CSV, or PDF                              | Not handled by any parser                        |
| RMS number present, but headers don't match any known retailer  | Unrecognised-format outcome                      |
| RMS number present, and headers match a known retailer template | Specific parser matched (e.g. `ASDA3`, `TESCO3`) |

## Field-Level Acceptance Rules

Empty means `null`, `undefined`, or `''` (empty string). A value containing
only spaces is **not** empty for this purpose, but may still fail other
checks.

| Field               | Accepted if                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| Product identifier  | A commodity code is supplied, **or** both nature of products and type of treatment are supplied.          |
| Commodity code      | If supplied, contains only digits once whitespace is removed (no length or catalogue check).              |
| Product description | Not empty.                                                                                                |
| Number of packages  | Not empty, and a non-negative number when converted.                                                      |
| Total net weight    | Not empty, and a non-negative number when converted.                                                      |
| Net-weight unit     | Contains `kg`, `kgs`, `kilo`, `kilos`, `kilogram`, or `kilograms` (case-insensitive, substring match OK). |

### Commodity Code Examples

| Supplied value            | Result            | Reason                                                                        |
| ------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `'0123'`                  | Accepted          | Digits only; leading zeroes are permitted.                                    |
| `' 12 3 '`                | Accepted          | Whitespace is removed before the format check.                                |
| `123`                     | Accepted          | A numeric value is checked as digits.                                         |
| `'12-34'`                 | Rejected          | The hyphen is not a digit.                                                    |
| `'1d1'`                   | Rejected          | The letter is not a digit.                                                    |
| `null`, `undefined`, `''` | No format failure | Whether the identifier is missing depends on the nature and treatment fields. |

## NIRMS and Country of Origin

These checks only apply when country-of-origin validation is enabled for the
packing list:

- **NIRMS designation** must be supplied. Accepted NIRMS values include
  `yes`, `nirms`, `green`, `y`, `g`, and anything starting `green lane`.
  Accepted non-NIRMS values include `no`, `red`, `n`, `r`, and anything
  starting `red lane`. Matching ignores case and surrounding spaces.
- **Country of origin** is required for a NIRMS line, but not for a
  non-NIRMS line.
- **Country validity** — every code on a NIRMS line must be a recognised ISO
  country code. Multiple codes can be separated by a comma or ampersand, but
  every part must be valid (`GB, FR` is two valid codes; `GB FR` is one
  invalid code; `GB,` is invalid because the second part is empty).

## Ineligible Goods — Example Scenarios

A product line is only assessed for ineligible goods when it's a NIRMS item
with a valid country of origin and a commodity code.

**1. Blanket ban (no treatment restriction)**
Brazil (BR) cannot export commodity code `0207` (poultry meat) under any
circumstances — a rule with no treatment restriction applies regardless of
how the item was treated.

**2. Conditional ban (specific treatment restricted)**
China (CN) can export commodity code `0706` (vegetables), but **not** if it
is chilled. The same code treated as `Raw` is allowed.

**3. Exception rule (restricted unless treatment matches)**
China (CN) normally cannot export commodity code `0706`, **except** when it
is marked `Raw`. Any other treatment (e.g. `Chilled`) remains prohibited.

If more than one rule matches a line, exception rules take precedence:
the line is allowed only if its treatment matches an exception; otherwise
it's prohibited.

## Failure Messages You Might See

| Condition                      | Message                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Missing RMS number             | `Check GB Establishment RMS Number.`                                           |
| No product lines               | `No product line data found.`                                                  |
| Multiple establishment numbers | `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.` |
| Missing weight unit            | `Net Weight Unit of Measure (kg) not found`                                    |
| Missing NIRMS designation      | `NIRMS/Non-NIRMS goods not specified`                                          |
| Prohibited goods               | `Prohibited item identified on the packing list`                               |

Where a failure relates to a specific product line, the location is added,
e.g. `Product description is missing in row 3.` (CSV), `No of packages is
invalid in sheet "Sheet1" row 3.` (Excel), or `Prohibited item identified on
the packing list in page 1 row 3.` (PDF). If more than three locations share
the same failure, the message is truncated with `in addition to N other
locations.`

## Further Detail

For the complete, exact rule set (including edge cases and stage-by-stage
behaviour), see [validation-rules.md](./validation-rules.md). For the overall
process, see [source.md](./source.md).
