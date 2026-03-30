---
description: 'Generate test data scenarios for core functionality and data validation in the basic-tests folder. Strictly follow the scenario list and mutation instructions below.'
agent: agent
---

# Basic Tests Scenario Generation and Seeding

Generate and seed a suite of test data and Excel/CSV files for core functionality and data validation scenarios. Each scenario must be based on the provided happy path sample file, with targeted mutations as described below. All files must be placed in `src/packing-lists/{exporter}/test-scenarios/basic-tests/`.

**Important**: When corrupting numeric data in these scenarios, refer to the **Numeric Field Corruption Guidelines** section in the main `generate-test-data-from-sample.prompt.md` for specific examples of special characters, alphanumeric values, negative numbers, and mixed patterns to use.

# Basic Test Scenarios

_Follow the generic instructions in `generate-test-data-from-sample.prompt.md` for folder creation, copying, and mutation steps._

**IMPORTANT: Only generate scenarios if the required data/columns are present in the template.**

- If a scenario relies on a field (e.g., optional data, optional header, or a specific mandatory field) that is not present in the template, that scenario should be skipped and not generated.
- For example, if there are no optional columns in the template, do not generate any OptionalData or OptionalHeader scenarios.
- If there is no `type_of_treatment` field present, do not generate the `MandatoryHeader_TreatmentType` scenario.
- If a mandatory field is missing from both the template and the configuration, skip all scenarios that require it.

Document in the scenario folder's README which scenarios were skipped due to missing fields.

## Scenarios (CONDITIONAL GENERATION)

**Only generate a scenario if the required field/column is present in the template.**

- Happypath.xlsx: Exact copy of the input file for baseline validation.
- Missing_OptionalHeader_All_Pass.xlsx: Only generate if optional columns are present. **Remove (clear/empty)** all optional column headers completely so they are blank cells.
- Missing_OptionalData_All_Pass.xlsx: Only generate if optional columns are present. Clear all data in optional columns while preserving headers.
- Incorrect_OptionalData_All_Pass.xlsx: Only generate if optional columns are present. Insert invalid/incorrect data in all optional columns. For numeric optional fields (if any), use the **Numeric Field Corruption Guidelines** with special characters, alphanumeric values, and negative numbers. For text optional fields, use invalid formats or unexpected values.
- Incorrect_OptionalHeader_All_Pass.xlsx: Only generate if optional columns are present. **Modify** optional column headers to incorrect text that doesn't match the original regex patterns (e.g., change "Country of Origin" to "Country Origin").
- OnlyMandatoryDataIsFilled_Pass.xlsx: Only generate if optional columns are present. Clear all optional data while keeping mandatory data intact.
- DescriptionHasDoubleQuotesShould_Pass.xlsx: **Add actual double quotes** to description field data to test special character handling:
  - **For Excel files**: Change "Product Name" to "\"Product Name\""
  - **For CSV files**: Change "Product Name" to "\"\"Product Name\"\"" (properly escaped for CSV format)
- MandatoryHeaders_CaseInSensitive_Pass.xlsx: Change the case of mandatory headers to test case/formatting variations.
- Incorrect_Mandatatypes_Excl_netandNopkgs_ProductCode_Pass.xlsx: Insert non-standard data types in non-critical mandatory fields excluding net weight and number of packages. Use the **Numeric Field Corruption Guidelines** from the main prompt - apply special characters, alphanumeric values, and negative numbers to fields like commodity_code, nature_of_products, type_of_treatment. Examples:
  - **Commodity codes**: `@123456`, `ABC123`, `-123456`, `-A123!`
  - **Nature of products**: `@Frozen`, `A5Food`, `-Products`, `-B!Food`
  - **Type of treatment**: `@Chilled`, `F5resh`, `-Frozen`, `-C!old`
- Incorrect_MandatoryHeader_CommodityCode_Unparse.xlsx: Only generate if commodity_code field is present. **Remove (clear/empty)** the header name for the commodity_code column.
- Incorrect_MandatoryHeader_All_Unparse.xlsx: **Remove (clear/empty)** ALL mandatory header names.
- Incorrect_MandatoryHeader_Desc_Unparse.xlsx: Only generate if description field is present. **Remove (clear/empty)** the header name for the description column.
- Incorrect_MandatoryHeader_TotNetweight_Unparse.xlsx: Only generate if total_net_weight_kg field is present. **Remove (clear/empty)** the header name for the total_net_weight_kg column.
- Incorrect_MandatoryHeader_NoofPakgs_Unparse.xlsx: Only generate if number_of_packages field is present. **Remove (clear/empty)** the header name for the number_of_packages column.
- Incorrect_MandatoryHeader_TreatmentType_Unparse.xlsx: Only generate if type_of_treatment field is present. **Remove (clear/empty)** the header name for the type_of_treatment column.
- Incorrect_MandatoryHeader_TotNetweightKGS_Fail.xlsx: Only generate if total_net_weight_kg field is present. **Modify** the net weight header to use different unit terminology that does NOT match the allowed-kg regex (e.g., change "Total Net Weight (KG)" to "Total Net Weight (LBS)" or "Total Net Weight (LB)"). Do NOT use `KGS` or other allowed kg variants, as those will be treated as valid.
- Empty_MultipleRowsColumns_Pass.xlsx: Include empty rows in the data section while maintaining valid structure.
- Missing_MandatoryHeader_All_Unparse.xlsx: **Remove (clear/empty)** ALL mandatory header names completely.
- Missing_MandatoryHeader_Description_unparse.xlsx: Only generate if description field is present. **Remove (clear/empty)** only the description header.
- Missing_MandatoryHeader_CommodityCode_Unparse.xlsx: Only generate if commodity_code field is present. **Remove (clear/empty)** only the commodity code header.
- Missing_MandatoryHeader_NoofPacakges_Unparse.xlsx: Only generate if number_of_packages field is present. **Remove (clear/empty)** only the number of packages header.
- Missing_MandatoryHeader_TotNetWeight_Unparse.xlsx: Only generate if total_net_weight_kg field is present. **Remove (clear/empty)** only the total net weight header.
- Incorrect_MandatoryData_MultipleRowsWithMultipleLocations_All_Fail.xlsx: Insert invalid data types in mandatory fields across multiple rows and locations. Use the **Numeric Field Corruption Guidelines** from the main prompt with a mix of special characters, alphanumeric values, and negative numbers:
  - **Row 1**: Special characters (`@123456`, `@5`, `@12.5`)
  - **Row 2**: Alphanumeric values (`ABC123`, `A5`, `A12.5`)
  - **Row 3**: Negative numbers (`-123456`, `-5`, `-12.5`)
  - **Additional rows**: Mixed patterns (`-A123!`, `-A5!`, `-A12.5!`)
- Missing_MandatoryData_MultipleRowsWithMultipleLocations_All_Fail.xlsx: Clear mandatory data across multiple rows and locations.
- Missing_MandatoryData_CommodityCode_Fail.xlsx: Only generate if commodity_code field is present. Clear commodity code data in multiple rows. If the template also contains both `nature_of_products` and `type_of_treatment`, you MUST also clear one of those two fields in the same rows (clear either `nature_of_products` OR `type_of_treatment` for each affected row). Alternate which related field is cleared across rows when mutating multiple rows so tests exercise both combinations (commodity code + nature missing, commodity code + treatment missing).
- Missing_MandatoryData_CommodityCode_Nature_Fail.xlsx: Only generate if commodity_code and nature_of_products fields are present. Clear both commodity code and nature of products data.
- Missing_MandatoryData_Desc_Fail.xlsx: Only generate if description field is present. Clear description data in multiple rows.
- Missing_MandatoryData_Noofpkgs_Fail.xlsx: Only generate if number_of_packages field is present. Clear number of packages data in multiple rows.
- Invalid_NoofPackages_MultipleRows_Fail.xlsx: Only generate if number_of_packages field is present. Insert invalid number of packages values using the **Numeric Field Corruption Guidelines**:
  - **Row 1**: Special characters (`@5`, `5!`, `#10`)
  - **Row 2**: Alphanumeric values (`A5`, `5B`, `C10`)
  - **Row 3**: Negative numbers (`-5`, `-10`, `-15`)
  - **Additional rows**: Mixed patterns (`-A5!`, `@-10`, `#-C15`)
- Missing_MandatoryData_Totnetweight_Fail.xlsx: Only generate if total_net_weight_kg field is present. Clear total net weight data in multiple rows.
- AllMandatoryDataIsMissing_Fail.xlsx: Clear ALL mandatory data while keeping headers.
- NoData_ExceptSingleRMS_Fail.xlsx: Remove all data rows except establishment number information.
- InvalidCommodityCode_MultipleRows_Fail.xlsx: Only generate if commodity_code field is present. Insert invalid commodity code formats across multiple rows using the **Numeric Field Corruption Guidelines**:
  - **Row 1**: Special characters (`@123456`, `123!56`, `12#456`)
  - **Row 2**: Alphanumeric values (`ABC123`, `12DEF6`, `123A56`)
  - **Row 3**: Negative numbers (`-123456`, `-000123`, `-999999`)
  - **Additional rows**: Mixed patterns (`-A123!`, `@BC456`, `-12#D56`)

**You must generate and mutate all scenarios above, if the required fields are present.**

## Mutation Scope Guidelines

- **CSV vs Excel Format Considerations**:
  - **CSV files**: Special characters like quotes need proper escaping (`""` for literal `"`)
  - **Excel files**: Special characters are treated as literal text in cells
- **Missing vs Incorrect Header Scenarios**:
  - **"Missing"**: **Remove/clear** headers completely (empty cells)
  - **"Incorrect"**: **Modify** headers to wrong text that doesn't match regex patterns
- **Standard scenarios**: Modify exactly **2-3 data rows** unless scenario specifies otherwise
- **"Multiple" scenarios**: Modify exactly **3 data rows** (minimum for "multiple")
- **"All" scenarios**: Modify **all data rows** when explicitly stated (e.g., "All_Fail")
- **Preserve remaining rows**: All other data rows should remain unchanged from the template
- **Do not modify all rows**: Only change the specified number of rows per scenario, not entire columns
- **Baseline scenario**: `Happypath` should remain completely unmodified
