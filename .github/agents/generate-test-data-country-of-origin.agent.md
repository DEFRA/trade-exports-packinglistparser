---
description: 'Generate test-data scenarios for country of origin, NIRMS, and Ineligible items validation in the country-of-origin folder. Use when orchestrating parallel packing list test data generation.'
tools: ['search/codebase', 'edit/editFiles', 'read/problems']
user-invocable: false
---

# Country of Origin Test Scenarios

> **Context received from orchestrator:**
>
> - `manifestPath`: Path to the confirmed `manifest.json` (e.g., `src/packing-lists/{exporter}/test-scenarios/manifest.json`)
> - `happyPathFile`: Path to the happy path sample file
> - `exporterProperty`: The exporter property name (e.g., 'BOOKER2', 'ASDA1')
>
> Read `manifest.json` at the provided path before starting — it contains the confirmed field/column mappings, establishment number pattern, header row locations, and file format details needed for all mutations.

> **Shared guidelines**: Load [generate-test-data-shared-guidelines.md](../prompts/models/generate-test-data-from-sample/generate-test-data-shared-guidelines.md) before applying any mutations. It contains:
>
> - Numeric Field Corruption Guidelines (special chars, alphanumeric, negative, mixed patterns for commodity_code etc.)
> - Allowed KG unit forms
> - Column Classification Rules
> - Generic Seeding Instructions (folder creation, file copy, mutation scope rules)
> - Format-Specific Skills references (Excel/CSV/PDF tools)

**File naming rule**: Keep the scenario base names below, but always use the same extension as the input happy path file (`.xlsx/.xls`, `.csv`, or `.pdf`).

## Scenarios

**IMPORTANT: Conditional Scenario Generation**

- Identify the NIRMS source from the confirmed manifest and workbook: a mapped row-level `nirms` column, a `blanketNirms`/`blanketNirmsValue` statement, or a parser-recognized `NON-NIRMS` sheet name.
- Generate row-level NIRMS scenarios **ac1-ac5** only when the workbook has a mapped NIRMS column and no blanket NIRMS fallback. Never add a NIRMS column to create a scenario.
- Generate blanket NIRMS scenarios only when the exporter supports a blanket statement and the workbook can be mutated to exercise the stated source and fallback. A configured `blanketNirms` property alone does not imply a row-level field.
- Generate CoO validation scenarios **ac6-ac9** only with `country_of_origin` and `validateCountryOfOrigin: true`; generate ineligible-item scenarios **ac11-ac15** only with `country_of_origin`, `commodity_code`, and a usable `type_of_treatment` source. Skip cases whose required cells, statements, or eligible rows cannot be reached, and record the reason in the scenario folder documentation.

### NIRMS Scenarios (Generate only for a mapped row-level `nirms` column without a blanket fallback)

For missing-value scenarios, use a sheet without a `NON-NIRMS` name fallback; otherwise clearing a cell may still produce a valid NIRMS value.
Use values recognized by the validator (e.g. "Yes", "No", "Green", "Red", "NIRMS", "NON-NIRMS"); do not assume other NIRMS-like text is valid.

- **ac1_NotNirms_Pass**: Set the NIRMS column to a valid non-NIRMS value (e.g. "NON-NIRMS" or "No") on one data row; NIRMS validation should pass.
- **ac2_NullNirms_Fail**: Clear the NIRMS column on one data row; NIRMS validation should fail.
- **ac3_InvalidNirms_Fail**: Set the NIRMS column to one invalid value (e.g. "Maybe") on one data row; NIRMS validation should fail.
- **ac4_NullNirmsMultiple_Fail**: Clear the NIRMS column on at least 3 data rows; each should fail NIRMS validation.
- **ac5_InvalidNirmsMultiple_Fail**: Set the NIRMS column to different invalid values (e.g. "INVALID", "123", "Maybe") on 3 data rows; each should fail NIRMS validation.

### Blanket NIRMS Scenarios (Generate only for a supported blanket statement)

- **BlanketNirms_MissingStatement_Fail**: Remove the blanket NIRMS statement from a sheet with data and no other NIRMS source; keep that sheet's name non-`NON-NIRMS`. Its items should fail for missing NIRMS.
- **BlanketNirms_NonNirmsSheetFallback_Pass**: On a parser-recognized `NON-NIRMS` sheet, remove the blanket statement and verify that its items are classified as `NON-NIRMS` and pass NIRMS validation.
- **BlanketNirms_StatementPrecedence_Pass**: On a parser-recognized `NON-NIRMS` sheet with the blanket NIRMS statement intact, verify that its items are classified as `NIRMS` rather than using the sheet-name fallback.

### Country of Origin Scenarios (Generate with `country_of_origin` and `validateCountryOfOrigin: true`)

> **NIRMS prerequisite (ac6-ac9 and ac11-ac15)**: CoO and ineligible item checks only run for NIRMS-eligible rows. Use rows on a sheet where the blanket statement already makes them NIRMS-eligible; if there is a mapped row-level NIRMS column, set its values to the valid NIRMS value from the happy path file. Do not create a NIRMS field or mutate a `NON-NIRMS` sheet to simulate eligible rows. Skip these scenarios if no eligible rows can be used.

Use the active ISO code dataset for valid control values (e.g. "GB", "FR", "DE"). "X" is invalid.

- **ac6_NullCoO_Fail**: Clear `country_of_origin` on one NIRMS-eligible data row; CoO validation should fail.
- **ac7_InvalidCoO_Fail**: Set `country_of_origin` to one invalid value (e.g. `"X"`, `"123"`, `"@GB"`, `"GBR"`) on one NIRMS-eligible data row; CoO validation should fail.
- **ac8_NullCoOMultiple_Fail**: Clear `country_of_origin` on at least 3 NIRMS-eligible data rows; each should fail CoO validation.
- **ac9_InvalidCoOMultiple_Fail**: Set `country_of_origin` to different invalid values (e.g. `"X"`, `"G1B"`, `"123"`) on 3 NIRMS-eligible data rows; each should fail CoO validation.

### High-Risk/Ineligible Items Scenarios (Generate with `country_of_origin`, `commodity_code`, and a usable treatment source)

Select a rule from `src/services/data/data-ineligible-items.json` (or the active MDM data). Use a valid ISO country, a commodity code matching the rule's prefix, and a treatment value that actually triggers the rule; `!treatment` entries are exceptions, not literal treatment values. For specified-treatment cases, use a mapped row field or a mutable blanket treatment statement. For missing-treatment cases, verify the parsed value is null after mutation; clearing a row field alone may leave a blanket fallback. Skip cases that cannot be represented in the source file.

- **ac11_HighRiskCoOTreatmentTypeSpecified_Fail**: On one NIRMS-eligible row, set a matching country, commodity code, and specified treatment; ineligible-item validation should fail.
- **ac12_HighRiskCoOTreatmentTypeSpecifiedMultiple_Fail**: Set matching country, commodity code, and specified treatment on 3 NIRMS-eligible rows; each should fail ineligible-item validation.
- **ac13_HighRiskCoOTreatmentTypeNotSpecified_Fail**: On one NIRMS-eligible row, set a matching country and commodity code, and leave the parsed treatment null; use a rule that fails without treatment.
- **ac14_HighRiskCoOTreatmentTypeNotSpecified_COO_InvalidMultiple_Fail**: On 3 separate NIRMS-eligible rows, create at least one ineligible item with missing parsed treatment and two invalid CoO values; verify both failure types. An invalid CoO on the same row prevents the ineligible-item check.
- **ac15_HighRiskCoOTreatmentTypeNotSpecifiedMultiple_Fail**: On 3 NIRMS-eligible rows, set matching countries and commodity codes with null parsed treatment; each should fail ineligible-item validation.

### Baseline Scenario (Always generate)

**Happypath**: Copy the input file unchanged with the input extension. Generate and mutate all other applicable scenarios above.

## Output

- Place all generated files in `src/packing-lists/{exporter}/test-scenarios/country-of-origin/`.
- Ensure all files have appropriate mutations applied.
