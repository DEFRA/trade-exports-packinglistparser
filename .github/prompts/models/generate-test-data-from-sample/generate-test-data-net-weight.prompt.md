---
description: 'Generate test data scenarios for net weight validation in the net-weight folder. Strictly follow the scenario list and mutation instructions below.'
agent: agent
---

# Net Weight Test Scenarios

_Follow the generic instructions in `generate-test-data-from-sample.prompt.md` for folder creation, copying, and mutation steps._

**File naming rule**: Keep the scenario base names below, but always use the same extension as the input happy path file (`.xlsx/.xls`, `.csv`, or `.pdf`).

**Important**: When corrupting numeric data in these scenarios, refer to the **Numeric Field Corruption Guidelines** section in the main `generate-test-data-from-sample.prompt.md` for specific examples of special characters, alphanumeric values, negative numbers, and mixed patterns to use.

## Scenarios

### Core Net Weight Scenarios (Always Generated)

- **Alpha_Numeric_TotalNetWeight_Unparse**: Set total net weight to alphanumeric values using the **Numeric Field Corruption Guidelines**: `A12.5`, `15B.2`, `C20.8`, `25D.0`, `E30.5`, `3F5.7`.
- **Ambiguous_Units_in_Header_Pass**: Use ambiguous units in the header (e.g. 'Total Net Weight (Lbs/KG Lbs)'). Note: the parser recognises the following as valid kilogram tokens: `KG`, `KGS`, `KILOGRAM`, `KILOGRAMS`, `KILO`, `KILOS`. Use tokens like `LBS` or `LB` to force an invalid-unit behaviour.
- **sData_empty_Netweight_Fail**: Leave total net weight cells empty.
- **Extra_Spaces_In_Header_Unparse**: Add extra spaces in the net weight header (e.g. 'Total Net Weight').
- **Happypath**: No mutation; copy the original happy path file.
- **Header_Typos_or_SpecialCharacters_Unparse**: Introduce typos or special characters in the net weight header (e.g. 'Tot@l Net We!ght').
- **Header_With_Extra_Parentheses_Pass**: Add extra parentheses in the net weight header (e.g. 'Total Net Weight (KG) ()').
- **Header_With_Multiple_Units**: Add multiple units in the header (e.g. 'Total Net Weight (KG/LB)').
- **Header_With_Unit_And_Symbols_Pass**: Add symbols to the unit in the header (e.g. 'Total Net Weight (KG\*)').
- **Incorrect_NetweightData_All_Fail**: Set all net weight data to invalid values using the **Numeric Field Corruption Guidelines** with a mix of patterns:
  - **Special characters**: `@12.5`, `15!.2`, `#20.8`, `$25.0`, `%30.5`, `&35.7`
  - **Alphanumeric values**: `A12.5`, `15B.2`, `C20.8`, `25D.0`, `E30.5`, `3F5.7`
  - **Negative numbers**: `-12.5`, `-15.2`, `-20.8`, `-25.0`, `-30.5`
  - **Mixed patterns**: `-A12.5!`, `@-15.B`, `#-C20.8`, `$D-25.E`
  - **Text values**: `"Heavy"`, `"Light"`, `"Unknown"`, `"TBD"`, `"Variable"`
- **Malformed_Header_Unit_Pass**: Malform the unit in the header (e.g. 'Total Net Weight (K-G)').
- **Missing_Header_Netweight_Unparse**: **Remove (clear/empty)** the net weight header label completely (empty cell for CSV/Excel, blanked header text region for PDF).
- **Missing_Paranthesis_in_Uom_Pass**: Remove parentheses from the unit in the header (e.g. 'Total Net Weight KG').
- **MixedCase_Header_Pass**: Change the net weight header to mixed case (e.g. 'ToTal nEt WeIGHt').
- **Netweight_HasEmpty_Parentheses_Fail**: Use empty parentheses in the header (e.g. 'Total Net Weight ()').
- **Splcharacters_Header_Netweight_Unparse**: Add special characters to the net weight header (e.g. 'Total Net Weight #$%').
- **TotalNetWeight_Without_UOMWeight**: Remove the unit of measure from the header (e.g. 'Total Net Weight').
- **Valid_Unit_KG_Parentheses**: Use any allowed kilogram token in parentheses in the header (e.g. 'Total Net Weight (KG)' or 'Total Net Weight (KILOGRAMS)').
- **Zero_Data_TotalNetWeight_Pass**: Set total net weight data to zero.

### UOM-Specific Scenarios (Only Generated if `header_net_weight_unit` property exists)

**Note**: These scenarios are only generated if the exporter configuration contains a `header_net_weight_unit` property (e.g., COOP1, NISA1, NISA2, SAINSBURYS1). For exporters without this property (like ASDA4), these scenarios are skipped.

- **Alpha_Numeric_UOM_Weight**: Set the unit of measure to alphanumeric values that do NOT match the allowed kilogram tokens (see main prompt). Examples: `K9G`, `L2B`, `G3M`, `K5G`, `M7L`.
- **Data_empty_NetweightUOM**: Leave unit of measure cells empty.
- **Invalid_Unit_Type_Fail**: Set unit of measure to an invalid type (e.g. `LBS`, `LB`, `GRAM`, `G`) — do NOT use `KGS` or other allowed kg variants, as those will be treated as valid.
- **Missing_Header_NetweightUOM**: **Remove (clear/empty)** the unit of measure header label completely (empty cell for CSV/Excel, blanked header text region for PDF).
- **Missing_UOM_Weight_Fail**: Remove all unit of measure data.
- **MissingNetweightUOM_excludeKG**: Remove the unit of measure column if it only contains an allowed kilogram token (e.g., `KG`, `KGS`, `KILOGRAM`, `KILOGRAMS`, `KILO`, `KILOS`).
- **MixedUnits_And_Casing_Pass**: Use mixed units and casing in the unit of measure data (e.g. 'Kg', 'kG', 'KG').
- **Unit_Missing_Weight_Present_Fail**: Remove unit of measure data but keep net weight data.
- **UOMWeight_Without_TotalNetWeight_Unparse**: Remove the net weight column but keep the unit of measure column.
- **Zero_Data_UOM**: Set unit of measure data to zero or special characters/alphanumeric values: `0`, `@`, `#`, `A`, `B1`, `C@`.

**Total scenarios generated:**

- **With `header_net_weight_unit` property**: 29 scenarios (19 core + 10 UOM-specific)
- **Without `header_net_weight_unit` property**: 19 scenarios (core scenarios only)

## Mutation Scope Guidelines

- **Missing vs Modification Scenarios**:
  - **"Missing_Header"**: **Remove/clear** headers completely (empty cells for CSV/Excel, blanked header text regions for PDF)
  - **Other header scenarios**: **Modify** headers with typos, extra characters, etc.
- **Standard scenarios**: Modify exactly **2-3 data rows/items** unless scenario specifies otherwise
- **Header scenarios**: Modify header row/label only, leave data rows/items unchanged
- **Data scenarios**: Modify exactly **2-3 data rows/items**, preserve header and remaining rows/items
- **"All" scenarios**: Modify **all data rows/items** when explicitly stated (e.g., "All_Fail")
- **Preserve remaining rows/items**: All other data rows/items should remain unchanged from the template
- **Do not modify all rows/items**: Only change the specified number of rows/items per scenario, not entire columns/regions
- **Baseline scenario**: `Happypath` should remain completely unmodified

## Output

- Place all generated files in `src/packing-lists/{exporter}/test-scenarios/net-weight/`.
- Ensure all files have appropriate mutations applied.
