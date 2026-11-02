# Packing List Validation Stages

This document describes the checks applied after a packing list has been read
and its product lines extracted. It describes the service's current acceptance
rules, not additional requirements such as checking commodity codes against a
commodity catalogue.

## Before Validation: Choose a Parser

For Excel and CSV, the service looks for a GB RMS number before trying
retailer-specific matches based on the document's structure and headers. The
standard form is `RMS-GB-######-###` (six digits followed by three digits),
with special matching rules for some supported formats. Without a recognised
RMS number, the result is a missing-RMS outcome; without a supported format,
there is no retailer parser match. Missing _values in individual product lines_
are identified after extraction, not used as a universal parser-matching rule.

## What Counts as Empty?

For required fields, `null`, `undefined` and `''` (the empty string) are empty.
A string containing spaces is not empty for this purpose. Other checks can
still find its value invalid.

## Stage 1: Remove Empty Product Lines

A line is removed if every field except its row location is `null` or
`undefined`. A line containing `''` in a data field remains at this stage, but
that field is treated as empty when required fields are checked.

## Stage 2: Validate Each Product Line

Each remaining line is checked and receives its own failure messages. These
checks apply to every product line:

| Information         | Acceptance rule                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Product identifier  | Supply a commodity code, **or** supply both nature of products and type of treatment.                                                |
| Commodity code      | If supplied, it must contain only digits after all whitespace is removed. No length or catalogue check is performed.                 |
| Product description | Must not be empty.                                                                                                                   |
| Number of packages  | Must not be empty. When converted to a number, it must not be non-numeric or negative.                                               |
| Total net weight    | Must not be empty. When converted to a number, it must not be non-numeric or negative.                                               |
| Net-weight unit     | Must contain `kg`, `kgs`, `kilo`, `kilos`, `kilogram` or `kilograms`, regardless of case. A match within a longer value is accepted. |

### Commodity Code Examples

| Supplied value            | Result            | Reason                                                                        |
| ------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `'0123'`                  | Accepted          | Digits only; leading zeroes are permitted.                                    |
| `' 12 3 '`                | Accepted          | Whitespace is removed before the format check.                                |
| `123`                     | Accepted          | A numeric value is checked as digits.                                         |
| `'12-34'`                 | Rejected          | The hyphen is not a digit.                                                    |
| `'1d1'`                   | Rejected          | The letter is not a digit.                                                    |
| `null`, `undefined`, `''` | No format failure | Whether the identifier is missing depends on the nature and treatment fields. |

An invalid supplied commodity code fails its format check even if nature of
products and type of treatment are both supplied. This check establishes
format only: it does not establish that a commodity code exists or that a
product is eligible.

For packages and net weight, `0` and numeric strings such as `'1'` pass;
negative numbers and non-numeric text fail. Because the numeric check converts
values to numbers, a string containing only spaces is treated as zero, not as
missing or invalid. Missing and invalid values produce different failures.

In some supported formats, a net-weight unit found in a header is assigned to
each product line. This depends on the parser: a unit present in the header
alone does not override the later line-level unit validation described below.

### NIRMS and Country of Origin

The following checks apply only when country-of-origin validation is enabled
for the packing list:

1. **NIRMS designation:** A value must be provided. Recognised NIRMS values
   include `yes`, `nirms`, `green`, `y`, `g`, values beginning with
   `green lane`, and cafe-exempt variants. Recognised non-NIRMS values include
   `no`, `red`, `n`, `r`, values beginning with `red lane`, and non-NIRMS
   variants. Matching ignores case and surrounding spaces; other supplied
   values fail.
2. **Country presence:** A country of origin is required for a NIRMS line,
   but not for a non-NIRMS line.
3. **Country validity:** Each supplied country on a NIRMS line must be in the
   available ISO country-code list. Matching ignores case and surrounding
   spaces. A comma or ampersand can separate multiple codes, but every part
   must be valid. `GB, FR` is checked as two codes; `GB FR` is treated as a
   single invalid code, and `GB,` fails because the second part is empty.

The ISO country-code list comes from available cached data when provided; the
service otherwise uses its static list. A non-text country value on a NIRMS
line fails validity.

### Ineligible Goods

A line is assessed for ineligible goods only when country-of-origin validation
is enabled, it is marked as NIRMS, its country of origin is present and valid,
and it has a commodity code. A non-NIRMS line or a line with an invalid
country is not assessed by this check.

For each listed country, the line's commodity code is compared with that
country's ineligibility rules. A rule matches if the code **starts with** the
rule's commodity-code value, ignoring case. A rule for `0207`, for example,
also matches `02071234`. This is a prefix comparison, not an additional
commodity-code format or catalogue check. Rules matching any of the listed
countries are considered together.

| Matching rules                                                | Decision                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No matching country and commodity-code prefix                 | The line is not marked ineligible.                                                                                                                                                                                             |
| At least one matching rule has a treatment beginning with `!` | The line is allowed if its treatment matches the text after `!` in **any** matching exception, ignoring case. Otherwise it is ineligible, including when treatment is missing. Exceptions take precedence over standard rules. |
| Only standard rules match                                     | The line is ineligible if any rule has no treatment, the line has no treatment, or a rule's treatment matches the line's treatment, ignoring case. Otherwise it is not marked ineligible.                                      |

For example, a matching `!processed` rule allows a line treated as
`processed`, but marks the same line treated as `raw` ineligible. A matching
rule with no treatment restriction marks the line ineligible regardless of
its treatment, provided there is no matching exception rule. The line's
treatment is trimmed before comparisons.

Ineligibility rules come from the service's static data by default. When MDM
integration is enabled and cached rules are available, the cached rules are
used instead.

## Stage 3: Validate the Packing List as a Whole

The packing list fails if any applicable product-line check fails. It must
also have a registration approval number, contain at least one product line
after empty lines are removed, and list no more than one establishment number.
A parser outcome indicating a missing registration number also fails this
check.

A net-weight unit found in a header does not excuse a missing unit on a line:
the line's own failure message omits it, but the packing list still fails and
receives a general unit failure. Similarly, a blanket NIRMS statement changes
a missing-NIRMS failure to a general message but does not make that check
pass.

## Stage 4: Report Results and Clean Invalid Numbers

A passing packing list is marked as having all required fields. A failing
list is marked as missing required fields and receives failure reasons.
Individual lines retain semicolon-separated failure messages. List-wide
reasons can include missing registration, no product lines, multiple
establishment numbers, and the locations of failed product lines.

Locations are described by row, sheet and row, or page and row, depending on
the document. For more than three affected locations with the same failure,
the first three are shown with a count of the remaining locations.

The overall result uses these descriptions for common failures:

| Condition                      | Description                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Missing RMS number             | `Check GB Establishment RMS Number.`                                           |
| No product lines               | `No product line data found.`                                                  |
| Multiple establishment numbers | `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.` |
| Missing weight unit            | `Net Weight Unit of Measure (kg) not found`                                    |
| Missing NIRMS designation      | `NIRMS/Non-NIRMS goods not specified`                                          |
| Prohibited goods               | `Prohibited item identified on the packing list`                               |

Where a failure names affected product lines, the location is added to the
description. Examples are `Product description is missing in row 3.` for CSV,
`No of packages is invalid in sheet "Sheet1" row 3.` for Excel, and
`Prohibited item identified on the packing list in page 1 row 3.` for PDF.
When more than three locations fail the same check, the message ends with
`in addition to N other locations.`

Finally, invalid package counts and net weights are replaced with `null`.
Their product lines are **not** removed, and their failures were recorded
before the values were replaced.
