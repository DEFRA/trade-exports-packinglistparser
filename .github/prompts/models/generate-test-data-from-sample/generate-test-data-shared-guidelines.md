# Shared Test Data Generation Guidelines

These guidelines apply to all scenario sub-agents for packing list test data generation. Load this file before applying any mutations.

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

   - `'pdf'` → Use `src/services/model-headers-pdf.js` regardless of input file format
   - `'excel'` → Use `src/services/model-headers.js` regardless of input file format
   - `'csv'` → Use `src/services/model-headers-csv.js` regardless of input file format

2. **If `modelConfigSource` is NOT provided (auto-detection):**
   - Input file is `.pdf` → Use `src/services/model-headers-pdf.js` (if exporter exists there, else fallback to `src/services/model-headers.js`, then `src/services/model-headers-csv.js`)
   - Input file is `.csv` → Use `src/services/model-headers-csv.js` (if exporter exists there, else fallback to `src/services/model-headers.js`)
   - Input file is `.xls` or `.xlsx` → Use `src/services/model-headers.js` (if exporter exists there, else fallback to `src/services/model-headers-csv.js`)

**CRITICAL**: The input file format determines the output file format. All generated scenario files MUST match the input format:

- **CSV input → CSV output** (all .csv files)
- **Excel input → Excel output** (all .xlsx/.xls files)
- **PDF input → PDF output** (all .pdf files)

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

# Generic Test Data Scenario Generation and Seeding Instructions

These steps apply to all scenario-based test data generation:

1. **Create the scenario folder** (if it does not exist):
   ```powershell
   New-Item -ItemType Directory -Path "src/packing-lists/{exporter}/test-scenarios/{scenario-folder}" -Force
   ```
2. **Copy the happy path sample file** to each scenario filename. Do not create blank files from scratch. **Preserve the file extension (.csv, .xlsx/.xls, or .pdf)**. See the relevant skill for the exact copy command.

3. **For each scenario,** apply the described mutations to the copied file using the format-appropriate method — see the relevant skill for commands and tooling. Never modify the original template file.
4. **Unless otherwise stated,** modify only the relevant rows/fields as specified by the scenario.
5. **Mutation Scope Rules**: Follow these guidelines for all scenarios:
   - **Missing vs Incorrect Scenarios**:
     - **"Missing"**: **Remove/clear** headers or data completely (empty cells)
     - **"Incorrect"**: **Modify** headers or data to wrong text that doesn't match expected patterns
   - **Standard scenarios**: Modify exactly **2-3 data rows/items** unless scenario specifies otherwise
   - **"Multiple" scenarios**: Modify exactly **3 data rows/items** (minimum for "multiple")
   - **"All" scenarios**: Modify **all data rows/items** when explicitly stated (e.g., "All_Fail")
   - **Header scenarios**: Modify header labels only, leave data rows/items unchanged
   - **Preserve remaining rows/items**: All other data should remain unchanged from the template
   - **Do not modify all rows/items**: Only change the specified number of rows/items per scenario, not entire columns/regions
   - **Baseline scenario**: `Happypath` should remain completely unmodified
6. **After mutation,** verify that the file is no longer identical to the template.
7. **Track mutation progress** using PowerShell or CLI commands to ensure all files have been modified.

## Format-Specific Skills

Load the relevant skill based on the input file format before applying any mutations:

### Excel Generation Skill

Load the `excel-test-data-generation` skill for the full workflow, mutation patterns, merged-cell handling, and troubleshooting.

### PDF Generation Skill

Load the `pdf-test-data-generation` skill for the full workflow, coordinate mapping, mutation patterns, and troubleshooting.

### CSV Generation Skill

Load the `csv-test-data-generation` skill for the full workflow, PowerShell mutation patterns, quote escaping, and troubleshooting.
