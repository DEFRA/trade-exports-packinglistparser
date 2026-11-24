# Packing List Validation Stages

This document describes the checks applied after a packing list has been read
and its product lines extracted. It describes the service's current acceptance
rules, not additional requirements such as checking commodity codes against a
commodity catalogue.

## How to Read the Validation Results

The following labels distinguish a successful check from information that
was never checked:

| Label             | Meaning                                                                                | Example                                                                     |
| ----------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Passed**        | The check ran and its condition was satisfied.                                         | `0123` passes the commodity-code format check.                              |
| **Failed**        | The check ran and found a problem.                                                     | `12-34` fails the commodity-code format check.                              |
| **Not assessed**  | A check exists, but its prerequisites or the parser setting prevented it from running. | Ineligibility is not assessed for a non-NIRMS line.                         |
| **Not validated** | No check exists for that aspect of the data.                                           | Whether a commodity code accurately describes the product is not validated. |

These are explanatory labels, **not additional statuses returned by the
service**. The result records failures and an overall required-fields flag,
not a separate passed/skipped result for each check. An absent failure
message alone does not show whether a conditional check ran.

## Before Validation: Choose a Parser

For Excel and CSV, the service looks for a GB RMS number before trying
retailer-specific matches based on the document's structure and headers. The
standard form is `RMS-GB-######-###` (six digits followed by three digits),
with special matching rules for some supported formats. Without a recognised
RMS number, the result is a missing-RMS outcome; without a supported format,
there is no retailer parser match. Missing _values in individual product lines_
are identified after extraction, not used as a universal parser-matching rule.

### Recognising Columns Is Not Validating Values

The process is: **recognise the template -> extract values -> check
completeness -> check format -> apply conditional business rules**.

For example, TURNERS1 recognises a column titled "Type of Treatment".
That identifies where to read the data; it does not check that the cells
contain recognised treatment names. Parser-specific extraction may also
copy a header unit or blanket statement into product-line fields. Validation
checks the resulting extracted values, not whether those declarations are
factually correct.

### Model-Specific Check Coverage

The selected parser supplies the country-validation setting; it is not
enabled simply because a country or NIRMS column exists. The current header
configurations for supported models are:

| File type | Models                                                                                                                                                                                                                                                  | NIRMS designation check | Country checks   | Ineligibility assessment       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------- | ------------------------------ |
| Excel     | ASDA3, BANDM1, BARTONREDMAN1, BOOKER2, BUFFALOAD1, BURBANK1, CDS2, CDS3, COOP1, FOWLERWELCH2, GIOVANNI1, GOUSTO1, KEPAK1, MANFREIGHT1, MANFREIGHT2, MARS1, NISA1, NISA2, NUTRICIA3, SAINSBURYS1, SAVERS1, TESCO2, TESCO3, TJMORRIS2, TURNERS1, WARRENS2 | Enabled                 | NIRMS lines only | Subject to prerequisites below |
| Excel     | BOOTS1, FOWLERWELCH1, GIOVANNI2                                                                                                                                                                                                                         | Not assessed            | Not assessed     | Not assessed                   |
| CSV       | ASDA4, ICELAND2, SAVERS2                                                                                                                                                                                                                                | Enabled                 | NIRMS lines only | Subject to prerequisites below |
| PDF       | GIOVANNI3, GREGGS1, MANDS1                                                                                                                                                                                                                              | Enabled                 | NIRMS lines only | Subject to prerequisites below |

All retained product lines still receive the core field checks below.
Ineligibility additionally requires a recognised NIRMS designation, present
and valid country codes, and a supplied commodity code. Missing or invalid
prerequisite data can cause its own failure even though ineligibility is
not assessed. A missing country-validation setting defaults to disabled.
No-match outcomes do not establish product-line validation coverage.

This table reflects the Excel, CSV and PDF header registries. Recheck it
when models or their settings change; implementation pointers are in the
[developer guide](./developer.md#parser-factory).

## What Counts as Empty?

For required fields, `null`, `undefined` and `''` (the empty string) are empty.
A string containing spaces is not empty for this purpose. Other checks can
still find its value invalid.

## Stage 1: Remove Empty Product Lines

A line is removed if every field except its row location is `null` or
`undefined`. A line containing `''` in a data field remains at this stage, but
that field is treated as empty when required fields are checked.

## Stage 2: Validate Each Product Line

Each remaining line is checked and receives its own failure messages. A
failed applicable check contributes to failure of the whole packing list.
The examples below describe individual checks, not the overall outcome.

| Information         | When checked                                                                                     | Acceptance rule                                                                                                      | What is not validated by this check                                                   | Example and failure consequence                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Product identifier  | Every retained line                                                                              | Supply a commodity code, **or** both nature and treatment.                                                           | Whether the supplied identifier accurately identifies the goods.                      | No code and missing treatment: `Identifier is missing`, even when nature is supplied.                                                        |
| Commodity code      | Whenever supplied                                                                                | Digits only after all whitespace is removed.                                                                         | Required length, catalogue existence or consistency with the product description.     | `0123` passes format; `12-34` produces `Product code is invalid`.                                                                            |
| Nature of products  | Presence matters when no commodity code is supplied                                              | Must not be empty, alongside treatment.                                                                              | Recognised product categories or accuracy for the goods.                              | `unknown-nature` with treatment satisfies this part of the identifier check. Missing nature without a code produces `Identifier is missing`. |
| Treatment type      | Presence matters when no commodity code is supplied; also used in applicable ineligibility rules | Must not be empty for the alternative identifier; rule comparisons are described below.                              | A general list of recognised treatments, spelling, synonyms or evidence of treatment. | No code and missing treatment produces `Identifier is missing`; an unmatched treatment is not independently rejected as invalid.             |
| Product description | Every retained line                                                                              | Must not be empty.                                                                                                   | Meaningfulness, accuracy or consistency with the commodity code.                      | `''` produces `Product description is missing`; spaces alone pass this presence check.                                                       |
| Number of packages  | Every retained line                                                                              | Must not be empty; numeric conversion must not produce a non-numeric or negative value.                              | A whole-number requirement or reconciliation against document totals.                 | `1.5` passes; `-1` produces `No of packages is invalid`; empty produces `No of packages is missing`.                                         |
| Total net weight    | Every retained line                                                                              | Must not be empty; numeric conversion must not produce a non-numeric or negative value.                              | Plausibility or reconciliation against document totals.                               | `0` passes; `heavy` produces `Total net weight is invalid`; empty produces `Total net weight is missing`.                                    |
| Net-weight unit     | Every retained line                                                                              | Must contain `kg`, `kgs`, `kilo`, `kilos`, `kilogram` or `kilograms`, ignoring case; substring matches are accepted. | Exact unit-name matching or whether the declared unit is factually correct.           | `kg` and `kg extra` pass; `lb` produces `Net Weight Unit of Measure (kg) not found`.                                                         |

### Allowed Values by Field

These are the values or constraints the service actually checks. A field
without a listed-value check does not have a service-defined vocabulary.

| Field               | Accepted values or constraint                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commodity code      | Any supplied value that contains only digits after whitespace is removed. There is no length or catalogue check.                                                                                                                                                                                                                                                                                                                                                                               |
| Nature of products  | No controlled list. If there is no commodity code, the value must be non-empty as part of the alternative identifier.                                                                                                                                                                                                                                                                                                                                                                          |
| Type of treatment   | No general controlled list. It must be non-empty for the alternative identifier; ineligibility checks compare it with treatment values in matching country and commodity-code rules.                                                                                                                                                                                                                                                                                                           |
| Product description | No controlled list; must be non-empty.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Number of packages  | A value whose numeric conversion is not `NaN` and is not negative. Zero and decimals are accepted.                                                                                                                                                                                                                                                                                                                                                                                             |
| Total net weight    | A value whose numeric conversion is not `NaN` and is not negative. Zero and decimals are accepted.                                                                                                                                                                                                                                                                                                                                                                                             |
| Net-weight unit     | Must contain `kg`, `kgs`, `kilo`, `kilos`, `kilogram` or `kilograms`, case-insensitively. Substring matches are accepted.                                                                                                                                                                                                                                                                                                                                                                      |
| NIRMS designation   | NIRMS: `yes`, `nirms`, `green`, `y` or `g`; any value beginning `green lane`; or a value containing `cafe-exempt`, `café-exempt`, `cafe exempt` or `café exempt` (additional text is allowed). Non-NIRMS: `no`, `red`, `n` or `r`; any value beginning `red lane`; or a value beginning `non`/`not`, optionally followed by no separator, a hyphen, a space, or space-hyphen/en dash-space, then `nirms` (additional text is allowed). Matching ignores case and trims surrounding whitespace. |
| Country of origin   | Each code must be present in the current ISO country-code list. Codes are case-insensitive and trimmed; multiple codes may be separated by commas or ampersands.                                                                                                                                                                                                                                                                                                                               |

For NIRMS and country of origin, these values are validated only when country
validation is enabled for the selected parser. Country codes come from
available cached data when provided, otherwise from the service's static ISO
list. Ineligibility treatment values come from the applicable static or
cached rules; they are not a general allowed-value list.

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

### Treatment Type: What Is and Is Not Validated

**There is no general recognised-treatment check.** Treatment has two
different roles:

1. **Identifier completeness:** if there is no commodity code, both nature
   and treatment must be present. Any value other than `null`, `undefined`
   or `''` satisfies treatment presence, including spaces. If a commodity
   code is supplied, this check does not require nature or treatment.
2. **Conditional ineligibility comparison:** when that assessment applies,
   treatment is compared with rules matching the country and commodity-code
   prefix. The line value is trimmed and compared ignoring case, but
   spelling and synonyms are not corrected. Spaces alone and non-text
   treatment values are treated as missing for this comparison.

The following rules are **illustrative**, not statements of current country
restrictions. Assume all assessment prerequisites are satisfied where a
matching rule is shown:

| Situation                                                                        | Treatment supplied  | Outcome of this check                                                                                                       |
| -------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Commodity code supplied; ineligibility assessment skipped                        | Missing             | Identifier completeness passes. Treatment is not otherwise assessed.                                                        |
| No commodity code; nature supplied                                               | `unknown-treatment` | Identifier completeness passes; recognised treatment names are not validated. Ineligibility is not assessed without a code. |
| No commodity code; nature supplied                                               | `''`                | Identifier completeness fails: `Identifier is missing`.                                                                     |
| Matching standard rule prohibits `Chilled`; no matching exception                | `Chilled`           | Prohibited finding.                                                                                                         |
| Same standard rule                                                               | `Chiled`            | No prohibited finding from that rule. The spelling is not separately rejected.                                              |
| Matching exception permits `!Raw`                                                | `' RAW '`           | Matches the exception; no prohibited finding.                                                                               |
| Same exception                                                                   | Missing or `Chiled` | Does not match the exception; prohibited finding.                                                                           |
| Matching blanket prohibition has no treatment restriction; no matching exception | Any value           | Prohibited finding.                                                                                                         |
| No matching country and commodity-code rule                                      | Any value           | Assessment runs, but finds no prohibition; treatment validity is not established.                                           |

Matching exceptions take precedence over standard rules across all listed
countries: matching any exception avoids a prohibited finding from this
assessment. Otherwise, when exceptions exist, the line is prohibited.
Other field failures still apply, even if treatment matches an exception.
There is no separate "invalid treatment" failure category.

### NIRMS and Country of Origin

The following checks apply only when country-of-origin validation is enabled
for the packing list:

| Information       | When checked                                                                      | What is checked                                                                              | What is not validated                                                                         | Example and failure consequence                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NIRMS designation | Every retained line when enabled                                                  | Present and matches a recognised NIRMS or non-NIRMS designation.                             | Whether the goods actually qualify for the declared designation.                              | `yes` passes; `maybe` produces `Invalid entry for NIRMS/Non-NIRMS goods`; empty produces `NIRMS/Non-NIRMS goods not specified`.                                     |
| Country of origin | Recognised NIRMS lines when enabled                                               | Present; every supplied code is in the available ISO list.                                   | Actual origin, or country validity for non-NIRMS lines.                                       | `GB, FR` passes; `GB,` produces `Invalid Country of Origin ISO Code`; empty produces `Missing Country of Origin`.                                                   |
| Ineligible goods  | Enabled, recognised NIRMS line, present valid country and supplied commodity code | Matching country/commodity-prefix rules, with treatment conditions and exception precedence. | Eligibility beyond those rules, or accuracy of the declared commodity, country and treatment. | Matching an unconditional prohibition produces `Prohibited item identified on the packing list`; missing prerequisites mean this assessment is skipped, not passed. |

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

The assessment is also **not assessed** when validation is disabled, the
NIRMS designation is missing or unrecognised, or the commodity code is
missing. These branches are distinct from an assessment that runs but finds
no matching rule. Neither establishes eligibility beyond this rule set.

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

For example, a matching `!processed` rule produces no prohibited finding for
a line treated as `processed`, but marks the same line treated as `raw`
ineligible. A matching
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

| Check                        | When checked                     | Acceptance rule                                                                              | What is not validated by this stage                                                 | Example and failure consequence                                                                           |
| ---------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Registration approval number | After line validation            | Extracted registration must be present and the parser must not report a missing-RMS outcome. | This stage does not itself verify registration against an authoritative register.   | Missing registration produces `Check GB Establishment RMS Number.`                                        |
| Remaining product lines      | After empty-line removal         | At least one product line remains.                                                           | Whether every product in the original document was successfully extracted.          | No remaining lines produces `No product line data found.`                                                 |
| Establishment numbers        | After extraction                 | No more than one establishment number is listed.                                             | This count check does not itself confirm the declared dispatch location is correct. | Two listed numbers produce `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.` |
| Combined line results        | After all applicable line checks | No applicable line check has failed.                                                         | Aspects labelled "not validated" and assessments skipped by their prerequisites.    | One invalid package count fails the list even when the other fields pass.                                 |

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

The validator uses the following base descriptions. Row-level failures are
added to the packing-list failure reasons with their locations; they also
appear in each item's failure message, separated by semicolons.

| Row-level condition                                               | Failure description                              |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| Missing commodity code and incomplete nature/treatment identifier | `Identifier is missing`                          |
| Invalid commodity code format                                     | `Product code is invalid`                        |
| Missing product description                                       | `Product description is missing`                 |
| Missing number of packages                                        | `No of packages is missing`                      |
| Invalid number of packages                                        | `No of packages is invalid`                      |
| Missing total net weight                                          | `Total net weight is missing`                    |
| Invalid total net weight                                          | `Total net weight is invalid`                    |
| Missing or unrecognised net-weight unit                           | `Net Weight Unit of Measure (kg) not found`      |
| Missing NIRMS designation                                         | `NIRMS/Non-NIRMS goods not specified`            |
| Invalid NIRMS designation                                         | `Invalid entry for NIRMS/Non-NIRMS goods`        |
| Missing country of origin for a NIRMS line                        | `Missing Country of Origin`                      |
| Invalid country-of-origin code for a NIRMS line                   | `Invalid Country of Origin ISO Code`             |
| Ineligible goods identified                                       | `Prohibited item identified on the packing list` |

These packing-list-level failures do not identify a product-line location:

| Condition                                                  | Failure description                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Missing RMS number or parser reports a missing-RMS outcome | `Check GB Establishment RMS Number.`                                           |
| No product lines remain after empty lines are removed      | `No product line data found.`                                                  |
| More than one establishment number is listed               | `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.` |

Some descriptions are formatted differently depending on parser context: a
row location is appended to row-level failures, while a missing unit found in
the header or a blanket NIRMS statement is reported as a general failure
without a product-line location. The base descriptions above are the same in
either case.

Where a failure names affected product lines, the location is added to the
description. Examples are `Product description is missing in row 3.` for CSV,
`No of packages is invalid in sheet "Sheet1" row 3.` for Excel, and
`Prohibited item identified on the packing list in page 1 row 3.` for PDF.
When more than three locations fail the same check, the message ends with
`in addition to N other locations.`

Finally, invalid package counts and net weights are replaced with `null`.
Their product lines are **not** removed, and their failures were recorded
before the values were replaced.
