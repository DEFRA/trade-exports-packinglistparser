---
description: 'Generate a suite of test data and Excel/CSV files for various test scenarios based on a user-provided happy path sample file.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'read/problems']
---

# Generate Test Data from Sample File

> **Required Inputs:**
>
> - `happyPathFile`: Path to the user-provided happy path sample file (Excel/CSV)
> - `exporterProperty`: The exporter property name from `src/services/model-headers.js` or `src/services/model-headers-csv.js` (e.g., 'BOOKER2', 'ASDA1', 'ASDA3')
> - `modelConfigSource`: (Optional) Explicitly specify configuration source: 'excel' (uses `src/services/model-headers.js`) or 'csv' (uses `src/services/model-headers-csv.js`). If not specified, auto-detects based on file extension.
> - `scenarioFolders`: List of scenario folders to generate (e.g., ['basic-tests', 'single-rms'])

> **Note:** The list of tools available for this prompt is fixed in the header section above and does not need to be specified as an input.

You are a senior QA automation engineer with 8+ years of experience in test data design and Excel/CSV automation for Node.js/TypeScript projects. You are proficient in using tools for both Excel and CSV file manipulation to efficiently generate and manipulate test data.

## Column Mapping Manifest (Pre-Scenario Step)

Before creating any test scenario folders or files, generate a single `manifest.json` file in the test-scenarios folder (e.g., `src/packing-lists/{exporter}/test-scenarios/manifest.json`) containing:

- **Configuration source**: Which configuration file was used (`src/services/model-headers.js` or `src/services/model-headers-csv.js`) and the exporter property
- **File format**: The input/output file format (CSV or Excel) - **all output files MUST match the input format**
- **Column references**: CSV files use 1-based column indices (1, 2, 3...), Excel files use column letters (A, B, C...)
- The detected column mappings (mandatory, optional, other) for the exporter and sample file
- Header row and data row locations
- Merged cell/column details (Excel only)
- Establishment number pattern (per sheet or per row)

This manifest must be confirmed and can be reused for all scenario generation and seeding. Do not regenerate the manifest for each scenario folder.

Scenario folder creation and seeding should always reference this manifest for column structure and mapping details. The manifest in the test-scenarios folder is the single source of truth for all scenario generation.

## Numeric Field Corruption Guidelines

### Making Numeric Columns Invalid

When corrupting numeric fields (commodity_code, number_of_packages, total_net_weight_kg, etc.), use these specific patterns to create invalid data:

#### Special Characters in Numeric Fields

- **Commodity codes**: `@123456`, `123!56`, `12#456`, `123$56`, `12%456`, `123&56`
- **Number of packages**: `@5`, `5!`, `#10`, `$15`, `%20`, `&25`
- **Net weight**: `@12.5`, `15!.2`, `#20.8`, `$25.0`, `%30.5`, `&35.7`

#### Alphanumeric Values in Numeric Fields

- **Commodity codes**: `ABC123`, `12DEF6`, `123A56`, `12B456`, `C12345`, `1D2E3F`
- **Number of packages**: `A5`, `5B`, `C10`, `15D`, `E20`, `2F5`
- **Net weight**: `A12.5`, `15B.2`, `C20.8`, `25D.0`, `E30.5`, `3F5.7`

#### Negative Numbers in Numeric Fields

- **Commodity codes**: `-123456`, `-000123`, `-999999`
- **Number of packages**: `-5`, `-10`, `-15`, `-20`, `-25`
- **Net weight**: `-12.5`, `-15.2`, `-20.8`, `-25.0`, `-30.5`

#### Mixed Invalid Patterns

- **Commodity codes**: `-A123!`, `@BC456`, `-12#D56`, `$-789AB`
- **Number of packages**: `-A5!`, `@-10`, `#-C15`, `$D-20`
- **Net weight**: `-A12.5!`, `@-15.B`, `#-C20.8`, `$D-25.E`

#### Text Replacements for Numeric Fields

- **Commodity codes**: `"Invalid"`, `"Not Available"`, `"TBD"`, `"N/A"`, `"Unknown"`
- **Number of packages**: `"Many"`, `"Several"`, `"Unknown"`, `"TBD"`, `"N/A"`
- **Net weight**: `"Heavy"`, `"Light"`, `"Unknown"`, `"TBD"`, `"Variable"`

#### Edge Case Patterns for Thorough Testing

- **Empty strings with spaces**: `" "`, `"  "`, `"   "`
- **Zero variations**: `0`, `00`, `000`, `0.0`, `0.00`
- **Boundary values**: `999999999`, `-999999999`, `0.000001`, `-0.000001`
- **Unicode/Special formatting**: `１２３` (full-width numbers), `①②③` (circled numbers)
- **Scientific notation**: `1E5`, `1.2e-3`, `-2.5E+4`

**Usage Instructions:**

- When scenarios specify "invalid" numeric data, use a mix of these patterns across different rows
- For "alphanumeric" scenarios, use the alphanumeric examples above
- For "special characters" scenarios, use the special character examples above
- For "negative numbers" scenarios, use the negative number examples above
- Vary the corruption patterns across rows to test different edge cases
- **Critical**: Don't use the same corruption pattern for all scenarios - rotate through different types (special chars, alphanumeric, negative, mixed) to ensure comprehensive testing
- **Multi-row scenarios**: When corrupting multiple rows, use different corruption patterns per row (e.g., Row 1: special chars, Row 2: alphanumeric, Row 3: negative numbers)

### Allowed KG unit forms

The project recognises these unit tokens as valid 'kilogram' forms (per the code's unit-detection regex `/(KGS?|KILOGRAMS?|KILOS?)/i`):

- KG
- KGS
- KILOGRAM
- KILOGRAMS
- KILO
- KILOS

When creating scenarios that are meant to produce an invalid unit-of-measure, do NOT use any of the forms above. Instead use clearly invalid units such as `LB`, `LBS`, `GRAM`, `G`, or made-up tokens (e.g. `K-G`, `K9G`). This ensures the mutated header/value will not be matched by the allowed-kg regex.

## Column Classification Rules

### Three-Category Field Classification

When analyzing the exporter configuration, determine which configuration file to use:

1. **If `modelConfigSource` parameter is explicitly provided:**

   - `'excel'` → Use `src/services/model-headers.js` regardless of input file format
   - `'csv'` → Use `src/services/model-headers-csv.js` regardless of input file format

2. **If `modelConfigSource` is NOT provided (auto-detection):**
   - Input file is `.csv` → Use `src/services/model-headers-csv.js` (if exporter exists there, else fallback to `src/services/model-headers.js`)
   - Input file is `.xls` or `.xlsx` → Use `src/services/model-headers.js` (if exporter exists there, else fallback to `src/services/model-headers-csv.js`)

**CRITICAL**: The input file format determines the output file format. All generated scenario files MUST match the input format:

- **CSV input → CSV output** (all .csv files)
- **Excel input → Excel output** (all .xlsx/.xls files)

Columns are classified into three categories:

- **Mandatory Columns**: ALL fields defined within the `regex` property of the exporter configuration
- **Optional Columns**: Fields defined as separate root-level properties (excluding configuration flags)
- **Other Columns**: Fields present in the template but not defined in either mandatory or optional categories

### Example: BOOKER2 Classification

```javascript
BOOKER2: {
  establishmentNumber: { regex: /RMS-GB-000077-\d{3}/i },
  regex: {
    description: /Description of Goods/i,           // MANDATORY
    commodity_code: /Commodity Code/i,              // MANDATORY
    number_of_packages: /No\. of Pkgs/i,           // MANDATORY
    total_net_weight_kg: /Net Weight/i,            // MANDATORY
    nature_of_products: /Nature of product/i,      // MANDATORY
    type_of_treatment: /Treatment Type/i,          // MANDATORY
  },
  country_of_origin: /Country of Origin/i,         // OPTIONAL
  nirms: /Lane/i,                                  // OPTIONAL
  validateCountryOfOrigin: true,                   // Configuration flag (ignore)
  findUnitInHeader: true                           // Configuration flag (ignore)
}
```

**Field Classification:**

- **Mandatory**: `description`, `commodity_code`, `number_of_packages`, `total_net_weight_kg`, `nature_of_products`, `type_of_treatment`
- **Optional**: `country_of_origin`, `nirms`
- **Other**: `row_number` (#), `product_code`, `type_of_pkgs`, `gross_weight` (present in template but not in configuration)

**Important**: Optional data scenarios must handle ALL non-mandatory fields (both optional and other categories).

### Three States of Header Columns

Header columns in the template are classified into three states based on the exporter configuration:

1. **Mandatory**: Fields defined within the `regex` property of the exporter configuration

   - Required for successful parsing
   - Missing or incorrect mandatory headers cause parsing failure
   - Example: `description`, `commodity_code`, `number_of_packages`, `total_net_weight_kg`

2. **Optional**: Fields defined as separate root-level properties (excluding configuration flags)

   - Not required for parsing, but used if present and correctly identified
   - Missing or incorrect optional headers still allow parsing to succeed
   - Example: `country_of_origin`, `nirms`

3. **Not Used**: Fields present in the template but not defined in either mandatory or optional categories
   - Ignored by the parser - not processed regardless of content
   - Can be modified without affecting parsing outcome
   - Example: `row_number`, `product_code`, `type_of_pkgs`, `gross_weight`

**Critical Rule for Optional Data Scenarios**: When clearing optional data (state 2), also clear "not used" data (state 3). This ensures that scenarios testing optional data behavior are comprehensive and test all non-mandatory fields together.

## Task

- Generate a suite of test data and Excel/CSV files for various test scenarios based on a user-provided “happy path” sample file.
- Scenarios must include both valid (happy path) and failure cases, such as missing or incorrect data in columns and column names.
- Use the appropriate configuration file based on the input file format:
  - **For Excel files (.xls, .xlsx)**: Use `src/services/model-headers.js` and access the exporter configuration at `model-headers.js[${exporterProperty}]`
  - **For CSV files (.csv)**: Use `src/services/model-headers-csv.js` and access the exporter configuration at `model-headers-csv.js[${exporterProperty}]`
  - Determine mandatory columns from the `regex` property for that exporter (ALL fields in the regex object are mandatory).
  - Identify optional columns from other root-level properties like `country_of_origin`, `nirms`, `type_of_treatment` (excluding `validateCountryOfOrigin`, `findUnitInHeader`, and `invalidSheets`).
  - For Excel files: Ignore any sheets listed in the `invalidSheets` property for that exporter.
- Output files must be in `.xls`, `.xlsx`, or `.csv` format, matching the format of the input file.
- All generated files should be written to `src/packing-lists/{exporter}/test-scenarios/` (where `{exporter}` is determined from the `${exporterProperty}` value).
- The original template file should remain in `src/packing-lists/` as the authoritative source.
- Create a `manifest.json` file with structured test scenario definitions and a comprehensive `README.md` for documentation.
- **VERIFICATION**: Use PowerShell commands to track mutation progress and verify all scenario files have been properly modified.

## Field Mapping Confirmation (MANDATORY)

**Before any test data is created or mutated, you MUST display the detected field/column mappings (from both the appropriate configuration file - `src/services/model-headers.js` for Excel files or `src/services/model-headers-csv.js` for CSV files - and the sample file) to the user and require explicit confirmation.**

- Present a summary of the detected mappings, including which columns in the sample file correspond to which fields in the exporter configuration.
- Allow the user to confirm, adjust, or reject the mappings interactively (e.g., via CLI prompt, UI, or other means).
- **Block all test data file creation and mutation until the user has confirmed the field mappings.**
- If the user rejects or adjusts the mappings, repeat the mapping detection and confirmation process until the user explicitly confirms.
- Only after confirmation, proceed to generate or mutate any test scenario files.

This confirmation step is required to prevent accidental data corruption and ensure that all test scenarios are based on correct and user-verified field mappings.

## Instructions

1. **File Organization**: The user must provide a valid sample file (happy path) in Excel or CSV format. This file will be used as the template for all scenario files and should remain in the main exporter directory as the source. **All output files MUST match the input file format.**
2. **Template Preservation**: All scenario files must be created by copying the entire original happy path file to each scenario file, preserving formatting (Excel) or structure (CSV). Never create blank files from scratch, and never update the template in-place.
3. **File Manipulation Tools**:
   - **Excel files**: MUST use the `exceljs` library to read, mutate, and write workbooks so styles, merged ranges, number formats and column widths are preserved. Copy the template file to each scenario filename (PowerShell/CLI) and then use `exceljs` (for example `workbook.xlsx.readFile()` / `workbook.xlsx.writeFile()`) to apply mutations. If `exceljs` is not available in the environment, explicitly document the limitation and only then fall back to `xlsx` as a last resort; validate merged ranges and formatting manually after any fallback write.
   - **CSV files**: Use PowerShell for copying files. Use PowerShell Import-Csv/Export-Csv or text manipulation for applying mutations.
4. **Directory Structure**: Each scenario's instructions file is responsible for creating its own subdirectory (e.g., `src/packing-lists/{exporter}/test-scenarios/basic-tests/`, `src/packing-lists/{exporter}/test-scenarios/single-rms/`, etc.) only if its scenarios are being generated. The main instructions do not create subdirectories globally. All generated test files go in their respective subdirectories, while the original template remains in `src/packing-lists/` as the parent directory.
5. **Column References**:
   - **CSV files**: Use 1-based column indices (1, 2, 3, 4...) when documenting columns in manifest.json
   - **Excel files**: Use Excel column letters (A, B, C, D...) when documenting columns in manifest.json
6. **Column Analysis**:

   - **For Excel files**: Excel templates often use merged cells and visual formatting that can create confusion about actual data column locations. To identify correct columns:
   - **MANDATORY**: Use `exceljs` to read the workbook and inspect styles/merged ranges before any mutations. Example: read the workbook with `workbook.xlsx.readFile()`, inspect `sheet.getMergeCells()` and `cell.style`/`cell.numFmt`, and sample multiple data rows to locate headers and data.
   - **MANDATORY**: Read the header row AND multiple data rows to see where actual data resides (header row position varies by exporter)
   - **MANDATORY**: Identify merged cells by looking for duplicate/identical values in adjacent columns
   - **MANDATORY**: Test one small mutation first to verify correct column targeting before bulk mutations
   - Pay attention to empty cells and merged cell patterns that may shift column positions
   - Verify column mappings by checking both header text and data placement across multiple rows
   - Document actual column letters (A, B, C, etc.) rather than assuming sequential placement
   - **Critical**: For merged fields (like commodity codes), update ALL columns containing the merged data to maintain consistency
   - **Establishment Number Patterns**: RMS establishment numbers can appear in two different patterns depending on the exporter:
     - **Single per sheet** (e.g., Booker2): One establishment number for the entire sheet, typically in a header area or company information section
     - **Per row** (e.g., COOP): Establishment number appears in each data row, usually in a dedicated column
     - Always analyze the template to determine which pattern is used before applying establishment number mutations

7. **REQUIRED: Select which test-scenarios folders to generate.**

   When you run this prompt, you will be shown a list of all available scenario folders that can be created for the current exporter. You must select one or more from the following options:

   - `basic-tests` — Core functionality and data validation tests
   - `single-rms` — Establishment number validation tests
   - `net-weight` — Weight unit and formatting tests
   - `country-of-origin` — Country, NIRMS, and Ineligible items tests

   **Only the selected folders will be created and seeded.**

   > **Important:** Scenario folders (e.g., `basic-tests/`, `single-rms/`, etc.) must only be created when their specific scenario instructions are executed. If a required folder does not exist, it must be created as part of the scenario generation process. Do not pre-create all folders for every exporter. This ensures that only relevant test data and structure are present for the scenarios being generated.

For each selected folder, see the corresponding prompt file for detailed instructions (now located in the `generate-test-data-from-sample` subfolder):

- `generate-test-data-from-sample/generate-test-data-basic-tests.prompt.md` for `basic-tests/`
- `generate-test-data-from-sample/generate-test-data-single-rms.prompt.md` for `single-rms/`
- `generate-test-data-from-sample/generate-test-data-net-weight.prompt.md` for `net-weight/`
- `generate-test-data-from-sample/generate-test-data-country-of-origin.prompt.md` for `country-of-origin/`

Each scenario's specific requirements and mutations are described in their own prompt file within the subfolder.

8. For instructions to create scenario folders and copy template files, see the specific prompt file for each scenario folder. Each scenario prompt contains the required steps for folder creation and file copying before mutation.
9. **Documentation Requirements**:
   - Create `manifest.json` with structured scenario definitions including expected results
   - Create comprehensive `README.md` documenting all scenarios, mutations, and testing instructions
   - Include exporter configuration details (establishment number regex, column mappings)
   - Document column classification (mandatory vs optional) based on `regex` property vs root-level properties
10. **Do not modify the original input file** - it should remain in the main exporter directory as the authoritative template.
11. **Line Break Handling**: For multi-line cell values, use `\n` for line breaks (never `<br>`). Excel's "Wrap Text" feature should display these correctly. If you see `<br>` in a cell, replace it with `\n`.
12. **Error Handling**: Use `exceljs` for Excel mutations. If file operations fail, fall back to PowerShell/CLI copy operations and provide clear guidance.

## Implementation Steps

1. **Determine Configuration Source**:

   - Check `modelConfigSource` parameter
   - If not provided, auto-detect from file extension
   - Validate exporter exists in selected configuration

2. **Analyze Template**:

   - Read the happy path file using appropriate tools (Excel tools for .xlsx/.xls, CSV reading for .csv)
   - Identify establishment number, headers, and data structure
   - Determine column reference format (1-based indices for CSV, letters for Excel)

3. **Match Exporter**:

   - Use the determined configuration source to load exporter configuration
   - Document which configuration file is being used in manifest.json

4. **Create Directory**: Each scenario's instructions file is responsible for creating its own subdirectory only if its scenarios are being generated.

5. **Copy Files**:

   - Use PowerShell to copy the entire template file to all scenario filenames
   - **CRITICAL**: Preserve file extension - CSV to CSV, Excel to Excel

6. **Apply Mutations**:

   - **For CSV files**: Use PowerShell Import-Csv/Export-Csv or text manipulation for mutations
   - **For Excel files**: Use the `exceljs` library (see guidance below) to read, inspect, and write workbooks while preserving formatting
   - Reference columns using the appropriate format (indices for CSV, letters for Excel)

7. **Generate Documentation**: Create manifest.json and README.md with:
   - Configuration source used
   - File format and column reference format
   - Comprehensive scenario descriptions

## MANDATORY - Systematic Mutation Completion Tracking

**CRITICAL REQUIREMENT**: All scenario files must have appropriate mutations applied. No files should remain as unchanged copies of the template (except the baseline happypath.xlsx).

### Mutation Progress Tracking Commands

Use these PowerShell commands to track mutation progress:

```powershell
# Check total files created
Get-ChildItem -Path "src/packing-lists/{exporter}/test-scenarios" -Recurse -File | Measure-Object

# Check files modified today (after mutations)
Get-ChildItem -Path "src/packing-lists/{exporter}/test-scenarios" -Recurse -File | Where-Object {$_.LastWriteTime -gt (Get-Date).Date} | Measure-Object

# List files that still need mutations (unchanged since template copy)
Get-ChildItem -Path "src/packing-lists/{exporter}/test-scenarios" -Recurse -File | Where-Object {$_.LastWriteTime -lt (Get-Date).Date} | Select-Object Name, LastWriteTime
```

### Systematic Mutation Process

1. **Initial File Copy**: Copy template to all scenario filenames
2. **Track Progress**: Use commands above to identify which files need mutations
3. **Apply Mutations Systematically**: Go through each file and apply appropriate mutations
4. **Verify Completion**: Ensure all files except happypath.xlsx have been modified
5. **Final Validation**: Check that all scenarios have proper mutations applied

### Common Issues & Troubleshooting

### Merged Cells and Column Mapping

- **Issue**: Excel templates with merged cells can cause confusion about actual data column locations
- **Root Cause**: Visual layout doesn't match actual data positions, especially with merged cells
- **Solution**: ALWAYS use `exceljs` to read the workbook with styles and merged ranges and analyze multiple data rows before making assumptions. Use `workbook.xlsx.readFile(file)` then inspect `sheet.getMergeCells()`, `cell.style`, `cell.numFmt`, and `cell.text`/`cell.value` across header and several data rows.
- **Example**: A template might show headers visually in columns C-F but actual data resides in columns D,E with merged content
- **Critical**: For merged fields, update ALL columns containing the merged data with identical values

### Column Position Verification

- **Best Practice**: Always read both header row and multiple data rows to confirm actual column placement patterns
- **Documentation**: Record exact column letters with merge status (e.g., "commodity_code: L,M (merged)" or "country_of_origin: N (single)")
- **Validation**: Cross-reference column mappings in manifest.json with actual Excel file structure after mutations
- **Testing**: Apply one small test mutation first to verify correct column targeting before bulk operations

### Data Consistency in Merged Cells

- **Issue**: Updating only one column of a merged cell field causes data inconsistency
- **Example**: BOOKER2 commodity codes in columns L,M must both be updated with identical values
- **Solution**: Identify all columns containing merged data and update all with same value
- **Verification**: Read back all merged columns after mutation to ensure consistency

### Excel files (.xlsx) — `exceljs` Usage

Use the `exceljs` library to preserve formatting and handle merged cells when mutating Excel templates. `exceljs` reads and writes `.xlsx` files while keeping styles, fills, borders, number formats, merged ranges and column widths intact.

Basic pattern:

```javascript
import ExcelJS from 'exceljs'

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(inputFile)
const sheet = wb.worksheets[0]

// Inspect header/data rows
const headerRow = 18 // detect programmatically where possible
const headerCell = sheet.getRow(headerRow).getCell('K')
console.log('Header text:', headerCell.text || headerCell.value)

// Modify first data row in column K (NetMassKG)
const dataRow = headerRow + 1
const cell = sheet.getRow(dataRow).getCell('K')
cell.value = 'INVALID'

await wb.xlsx.writeFile(outputFile)
```

Recommended workflow:

- Copy the template file into the scenario filename using CLI/PowerShell to ensure a fresh file
- Use `exceljs` to read the copied file, detect headers/merged cells, apply targeted mutations, and write back
- Verify by re-reading the workbook and checking `sheet.getMergeCells()` and sample cell styles

Fallback: if `exceljs` cannot be used in your environment, use `xlsx` with `cellStyles: true` and related read/write options, but validate formatting preservation carefully.

### BOOKER2 Implementation Lessons Learned

#### Establishment Number Pattern Recognition

- **BOOKER2 Pattern**: Single establishment number per sheet in header/company information area (Column B, multi-line with company details)
- **COOP Pattern**: Establishment number appears in each data row (Column E, repeated per row)
- **Pattern Detection**: Always analyze template structure to determine which pattern is used:
  - Check header/company information areas for single establishment number
  - Check data rows for establishment number columns
  - Apply mutations accordingly - single location vs. multiple rows

#### Actual Column Structure (Based on Template Analysis)

- **Establishment Number**: Column B (multi-line with company details) - SINGLE PER SHEET PATTERN
- **Description**: Column D (single column, not merged)
- **Commodity Code**: Columns L,M (merged - both must be updated identically)
- **Number of Packages**: Column H (single column)
- **Net Weight**: Column K (single column)
- **Nature of Products**: Column I (single column)
- **Type of Treatment**: Column J (single column)
- **Country of Origin**: Column N (single column)
- **NIRMS**: Column Q (single column)

#### Common Misconceptions

- **Visual ≠ Actual**: Column positions in Excel display don't match data positions
- **Header ≠ Data**: Header row layout may differ from actual data column usage
- **Merged Cell Handling**: Failing to update all merged columns causes inconsistent data
- **Multi-line Preservation**: Establishment numbers often contain line breaks that must be preserved

#### Verification Strategy

1. **Structure Analysis**: Read template with showStyle to understand layout
2. **Data Sampling**: Read multiple data rows to confirm patterns
3. **Test Mutation**: Apply one small change to verify column targeting
4. **Bulk Application**: Apply remaining mutations using verified column positions
5. **Final Verification**: Read back sample cells to confirm correct mutations

This systematic approach prevents the column mapping errors encountered during initial BOOKER2 implementation.

# Generic Test Data Scenario Generation and Seeding Instructions

These steps apply to all scenario-based test data generation:

1. **Create the scenario folder** (if it does not exist):
   ```powershell
   New-Item -ItemType Directory -Path "src/packing-lists/{exporter}/test-scenarios/{scenario-folder}" -Force
   ```
2. **Copy the happy path sample file** to each scenario filename in the relevant test-scenarios folder using PowerShell or CLI. Do not create blank files from scratch. **Preserve the file extension (.csv or .xlsx)**. Example:

   ```powershell
   # For CSV files
   Copy-Item "src/packing-lists/{exporter}/HappyPath.csv" "src/packing-lists/{exporter}/test-scenarios/{scenario-folder}/<scenario-file>.csv"

   # For Excel files
   Copy-Item "src/packing-lists/{exporter}/HappyPath.xlsx" "src/packing-lists/{exporter}/test-scenarios/{scenario-folder}/<scenario-file>.xlsx"
   ```

3. **For each scenario,** apply the described mutations to the copied file:
   - **CSV files**: Use PowerShell Import-Csv/Export-Csv for data mutations, text manipulation for header mutations
   - **Excel files**: Use `exceljs` for mutations
   - Never modify the original template file.
4. **Unless otherwise stated,** modify only the relevant rows/fields as specified by the scenario.
5. **Mutation Scope Rules**: Follow these guidelines for all scenarios:
   - **Missing vs Incorrect Scenarios**:
     - **"Missing"**: **Remove/clear** headers or data completely (empty cells)
     - **"Incorrect"**: **Modify** headers or data to wrong text that doesn't match expected patterns
   - **Standard scenarios**: Modify exactly **2-3 data rows** unless scenario specifies otherwise
   - **"Multiple" scenarios**: Modify exactly **3 data rows** (minimum for "multiple")
   - **"All" scenarios**: Modify **all data rows** when explicitly stated (e.g., "All_Fail")
   - **Header scenarios**: Modify header row only, leave data rows unchanged
   - **Preserve remaining rows**: All other data rows should remain unchanged from the template
   - **Do not modify all rows**: Only change the specified number of rows per scenario, not entire columns
   - **Baseline scenario**: `Happypath` should remain completely unmodified
6. **After mutation,** verify that the file is no longer identical to the template.
7. **Track mutation progress** using PowerShell or CLI commands to ensure all files have been modified.

Refer to the field-specific prompt for the scenario list and mutation details.

---
