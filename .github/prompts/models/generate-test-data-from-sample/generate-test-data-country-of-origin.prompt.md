---
description: 'Generate test data scenarios for country of origin, NIRMS, and Ineligible items validation in the country-of-origin folder. Strictly follow the scenario list and mutation instructions below.'
agent: agent
---

# Country of Origin Test Scenarios

_Follow the generic instructions in `generate-test-data-from-sample.prompt.md` for folder creation, copying, and mutation steps._

**Important**: When corrupting numeric data (like commodity_code values) in these scenarios, refer to the **Numeric Field Corruption Guidelines** section in the main `generate-test-data-from-sample.prompt.md` for specific examples of special characters, alphanumeric values, negative numbers, and mixed patterns to use.

## Scenarios

**IMPORTANT: Conditional Scenario Generation**

- Scenarios **ac1-ac5** (NIRMS-related) are **NOT required** if the exporter configuration has a `blanketNirms` optional property
- If `blanketNirms` property exists, skip scenarios ac1-ac5 and only generate ac6+ scenarios
- If no `blanketNirms` property exists, generate all scenarios including ac1-ac5

### NIRMS Scenarios (Generate only if NO `blanketNirms` property exists)

- **ac1_NotNirms_Pass**: Set NIRMS column to a valid non-NIRMS value (e.g. "NON-NIRMS" or "No") for 2-3 data rows.
- **ac2_NullNirms_Fail**: Set NIRMS column to blank/empty for 2-3 data rows.
- **ac3_InvalidNirms_Fail**: Set NIRMS column to invalid values (e.g. "INVALID", "123", "Maybe") for 2-3 data rows.
- **ac4_NullNirmsMultiple_Fail**: Set NIRMS column to blank/empty for multiple data rows (at least 3).
- **ac5_InvalidNirmsMultiple_Fail**: Set NIRMS column to different invalid values for multiple data rows (3 rows).

### Country of Origin Scenarios (Generate if `country_of_origin` property exists)

- **ac6_NullCoO_Fail**: Set country_of_origin column to blank/empty for 2-3 data rows.
- **ac7_InvalidCoO_Fail**: Set country_of_origin column to invalid values including numeric codes and special characters: `"123"`, `"@GB"`, `"G#B"`, `"GBR"`, `"INVALID"`, `"-GB"`, `"G1B"` for 2-3 data rows.
- **ac8_NullCoOMultiple_Fail**: Set country_of_origin column to blank/empty for multiple data rows (at least 3).
- **ac9_InvalidCoOMultiple_Fail**: Set country_of_origin column to different invalid values including special characters, alphanumeric, and numeric patterns for multiple data rows (3 rows): `"@GB"`, `"G1B"`, `"123"`, `"#FR"`, `"F2R"`, `"456"`, `"-DE"`, `"D3E"`, `"789"`.
- **ac10_xCoO_Pass**: Set country_of_origin column to "X" for 2-3 data rows.

### High-Risk/Ineligible Items Scenarios (Generate if `country_of_origin`, `commodity_code`, and `type_of_treatment` properties exist)

- **ac11_HighRiskCoOTreatmentTypeSpecified_Fail**: Set country_of_origin to a high-risk value and type_of_treatment to a specified value that should fail validation for 2-3 data rows.
- **ac12_HighRiskCoOTreatmentTypeSpecifiedMultiple_Fail**: Set multiple rows (3 rows) with high-risk country_of_origin and specified type_of_treatment values that should fail validation.
- **ac13_HighRiskCoOTreatmentTypeNotSpecified_Fail**: Set country_of_origin to a high-risk value and leave type_of_treatment blank or not specified for 2-3 data rows.
- **ac14_HighRiskCoOTreatmentTypeNotSpecified_COO_InvalidMultiple_Fail**: Set multiple rows (3 rows) with high-risk country_of_origin, missing type_of_treatment, and invalid country_of_origin values.
- **ac15_HighRiskCoOTreatmentTypeNotSpecifiedMultiple_Fail**: Set multiple rows (3 rows) with high-risk country_of_origin and missing type_of_treatment.

### Baseline Scenario (Always generate)

- **Happypath**: No mutation; copy the original happy path file.

**You must generate and mutate all applicable scenarios based on the exporter configuration conditional logic above.**

## Mutation Scope Guidelines

- **Standard scenarios**: Modify exactly **2-3 data rows** as specified per scenario
- **"Multiple" scenarios**: Modify exactly **3 data rows** (minimum for "multiple")
- **Preserve remaining rows**: All other data rows should remain unchanged from the template
- **Do not modify all rows**: Only change the specified number of rows per scenario, not entire columns
- **Baseline scenario**: `Happypath` should remain completely unmodified

## Documentation: Country of Origin, NIRMS, and High-Risk/Ineligible Items Scenario Types

- **ac1_NotNirms_Pass**: NIRMS column set to a valid non-NIRMS value (e.g. "NON-NIRMS" or "No"). Should pass validation.
- **ac2_NullNirms_Fail**: NIRMS column set to blank/empty. Should fail validation.
- **ac3_InvalidNirms_Fail**: NIRMS column set to invalid values (e.g. "INVALID", "123", "Maybe"). Should fail validation.
- **ac4_NullNirmsMultiple_Fail**: NIRMS column set to blank/empty for multiple rows. Should fail validation for all.
- **ac5_InvalidNirmsMultiple_Fail**: NIRMS column set to different invalid values for multiple rows (3 rows). Should fail validation for all.
- **ac6_NullCoO_Fail**: country_of_origin column set to blank/empty. Should fail validation.
- **ac7_InvalidCoO_Fail**: country_of_origin column set to invalid values (e.g. "123", "GBR", "INVALID"). Should fail validation.
- **ac8_NullCoOMultiple_Fail**: country_of_origin column set to blank/empty for multiple rows. Should fail validation for all.
- **ac9_InvalidCoOMultiple_Fail**: country_of_origin column set to different invalid values for multiple rows (3 rows). Should fail validation for all.
- **ac10_xCoO_Pass**: country_of_origin column set to "X". Should pass validation.
- **ac11_HighRiskCoOTreatmentTypeSpecified_Fail**: country_of_origin set to a high-risk value and type_of_treatment to a specified value that should fail validation (e.g. Ineligible combination) for 2-3 data rows.
- **ac12_HighRiskCoOTreatmentTypeSpecifiedMultiple_Fail**: Multiple rows (3 rows) with high-risk country_of_origin and specified type_of_treatment values that should fail validation.
- **ac13_HighRiskCoOTreatmentTypeNotSpecified_Fail**: country_of_origin set to a high-risk value and type_of_treatment left blank or not specified. Should fail validation.
- **ac14_HighRiskCoOTreatmentTypeNotSpecified_COO_InvalidMultiple_Fail**: Multiple rows (3 rows) with high-risk country_of_origin, missing type_of_treatment, and invalid country_of_origin values. Should fail validation for all.
- **ac15_HighRiskCoOTreatmentTypeNotSpecifiedMultiple_Fail**: Multiple rows (3 rows) with high-risk country_of_origin and missing type_of_treatment. Should fail validation for all.
- **Happypath**: No mutation; copy the original happy path file. Should pass validation.

## NIRMS and Country of Origin Validation Patterns

### NIRMS Validation (for exporters with `nirms` property)

- **Valid NIRMS Values**: "Yes", "No", "Green", "Red", "NIRMS", "NON-NIRMS", "NIRMS Eligible", "Non-NIRMS", etc.
- **Invalid NIRMS Values**: "INVALID", "Maybe", "Unknown", "123", blank/empty values
- **Test Patterns**:
  - Blank/empty cells in NIRMS column should trigger validation failure
  - Unrecognized text values should trigger validation failure

### Country of Origin Validation (for exporters with `validateCountryOfOrigin: true`)

- **Valid Country Codes**: 2-digit ISO codes ("GB", "FR", "DE", "IE", "NL", etc.) or "X"
- **Invalid Country Codes**: 3+ digit codes ("GBR", "FRA"), numeric values ("123"), text ("INVALID"), blank/empty values
- **Test Patterns**:
  - Missing/blank country of origin should trigger validation failure
  - Non-ISO format codes should trigger validation failure
  - Valid 2-digit ISO codes should pass validation
  - "X" value should pass validation (used for mixed/unknown origins)

### Ineligible Items Validation (for exporters with country_of_origin, commodity_code, and type_of_treatment fields)

- **Ineligible Combinations**: Items that match entries in services/data/data-Ineligible-items.json based on exact combination of country_of_origin + commodity_code + type_of_treatment
- **Common Examples**:
  - CN + 07061000 + Chilled (Chinese carrots, chilled)
  - BR + 0207 + Fresh (Brazilian poultry, fresh)
  - ZA + 08054000 + Raw (South African grapefruit, raw)
  - IN + 100610 + Fresh (Indian rice, fresh)
- **Test Patterns**:
  - Select any entry from the Ineligible items JSON file
  - Set the corresponding values in the data rows (not headers)
  - Should trigger FAILUREREASON due to Ineligible item detection
  - Use realistic descriptions for the Ineligible items (e.g., "Chinese Fresh Carrots", "Brazilian Raw Chicken", etc.)

## Conditional Scenario Planning

Based on the exporter configuration, determine which country-of-origin-related scenarios to generate:

- **NIRMS Scenarios (ac1-ac5)**: Generate only if the exporter has a `nirms` property **AND** does **NOT** have a `blanketNirms` property. If `blanketNirms` exists, skip scenarios ac1-ac5.
- **Country of Origin Success Scenarios**: If the exporter has a `country_of_origin` property, generate Country of Origin success scenarios (ac10).
- **Country of Origin Validation Scenarios**: If the exporter has both `country_of_origin` and `validateCountryOfOrigin: true`, generate Country of Origin validation scenarios (ac6-ac9).
- **Ineligible Items Scenarios**: If the exporter has `country_of_origin`, `commodity_code` (from regex), and `type_of_treatment` properties, generate Ineligible items scenarios (ac11-ac14).
- **Baseline Scenario**: Always generate the Happypath scenario regardless of configuration.

### Configuration Property Checks:

1. Check for `blanketNirms` property first - if present, skip NIRMS scenarios (ac1-ac5)
2. Check for `nirms` property - if present and no `blanketNirms`, generate NIRMS scenarios (ac1-ac5)
3. Check for `country_of_origin` property - if present, generate country of origin scenarios (ac6-ac10)
4. Check for `validateCountryOfOrigin: true` - if present with `country_of_origin`, generate validation scenarios (ac6-ac9)
5. Check for all three properties (`country_of_origin`, `commodity_code`, `type_of_treatment`) - if all present, generate Ineligible items scenarios (ac11-ac15)

## Apply Mutations

Use `exceljs` (see `generate-test-data-from-sample.prompt.md` for guidance) to modify specific cells for each scenario. Typical mutation targets:

- **NIRMS Validation**: For exporters with `nirms` property, test blank values and invalid patterns (should be recognizable values like "Yes", "No", "Green", "Red", "NIRMS", "NON-NIRMS", etc.)
- **Country of Origin Validation**: For exporters with `validateCountryOfOrigin: true`, test blank values and invalid formats (should be 2-digit ISO codes like "GB", "FR", "DE" or "X")
- **Ineligible Items**: For exporters with all required fields, select an Ineligible item from `services/data/data-Ineligible-items.json` and set the appropriate `country_of_origin`, `commodity_code`, and `type_of_treatment` values in the data rows

## Output

- Place all generated files in `src/packing-lists/{exporter}/test-scenarios/country-of-origin/`.
- Ensure all files have appropriate mutations applied.
