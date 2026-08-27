---
description: 'Generate a suite of test data and Excel/CSV/PDF files for various test scenarios based on a user-provided happy path sample file.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'read/problems', 'agent']
agents:
  [
    'generate-test-data-basic-tests',
    'generate-test-data-single-rms',
    'generate-test-data-net-weight',
    'generate-test-data-country-of-origin'
  ]
---

# Generate Test Data from Sample File

> **Required Inputs:**
>
> - `happyPathFile`: Path to the user-provided happy path sample file (Excel/CSV/PDF)
> - `exporterProperty`: The exporter property name from `src/services/model-headers-pdf.js`, `src/services/model-headers.js`, or `src/services/model-headers-csv.js` (e.g., 'BOOKER2', 'ASDA1', 'ASDA3')
> - `modelConfigSource`: (Optional) Explicitly specify configuration source: 'pdf' (uses `src/services/model-headers-pdf.js`), 'excel' (uses `src/services/model-headers.js`), or 'csv' (uses `src/services/model-headers-csv.js`). If not specified, auto-detects based on file extension.
> - `scenarioFolders`: List of scenario folders to generate (e.g., ['basic-tests', 'single-rms'])

> **Note:** The list of tools available for this prompt is fixed in the header section above and does not need to be specified as an input.

You are a senior QA automation engineer with 8+ years of experience in test data design and Excel/CSV/PDF automation for Node.js/TypeScript projects. You are proficient in using tools for Excel, CSV, and PDF file manipulation to efficiently generate and mutate test data.

> **Design intent**: This prompt defines _what_ to do — business rules, scenario selection, validation, and documentation requirements. The _how_ for file operations (mutation tool, copy commands, column/coordinate mapping, encoding, fallback guidance) lives in the format-specific generation skills. When working on any file format, load the relevant skill alongside this prompt.
>
> Shared content (Numeric Field Corruption Guidelines, Column Classification Rules, Generic Seeding Instructions, and Format-Specific Skills references) is maintained in [generate-test-data-shared-guidelines.md](generate-test-data-from-sample/generate-test-data-shared-guidelines.md) and is loaded by each scenario sub-agent.

## Column Mapping Manifest (Pre-Scenario Step)

Before creating any test scenario folders or files, generate a single `manifest.json` file in the test-scenarios folder (e.g., `src/packing-lists/{exporter}/test-scenarios/manifest.json`) containing:

- **Configuration source**: Which configuration file was used (`src/services/model-headers-pdf.js`, `src/services/model-headers.js`, or `src/services/model-headers-csv.js`) and the exporter property
- **File format**: The input/output file format (CSV, Excel, or PDF) - **all output files MUST match the input format**
- **Field references**: Format-specific reference style (column indices, letters, or coordinates) — see the relevant format skill
- The detected column mappings (mandatory, optional, other) for the exporter and sample file
- Header row and data row locations
- Merged cell/column details (Excel only)
- Text block/header region details (PDF only)
- Establishment number pattern (per sheet or per row)

This manifest must be confirmed and can be reused for all scenario generation and seeding. Do not regenerate the manifest for each scenario folder.

Scenario folder creation and seeding should always reference this manifest for column structure and mapping details. The manifest in the test-scenarios folder is the single source of truth for all scenario generation.

## Task

- Generate a suite of test data and Excel/CSV/PDF files for various test scenarios based on a user-provided “happy path” sample file.
- Scenarios must include both valid (happy path) and failure cases, such as missing or incorrect data in columns and column names.
- Use the appropriate configuration file based on the input file format:
  - **For PDF files (.pdf)**: Use `src/services/model-headers-pdf.js` and access the exporter configuration at `model-headers-pdf.js[${exporterProperty}]`.
  - **For Excel files (.xls, .xlsx)**: Use `src/services/model-headers.js` and access the exporter configuration at `model-headers.js[${exporterProperty}]`
  - **For CSV files (.csv)**: Use `src/services/model-headers-csv.js` and access the exporter configuration at `model-headers-csv.js[${exporterProperty}]`
  - Determine mandatory columns from the `regex` property for that exporter (ALL fields in the regex object are mandatory).
  - Identify optional columns from other root-level properties like `country_of_origin`, `nirms`, `type_of_treatment` (excluding `validateCountryOfOrigin`, `findUnitInHeader`, and `invalidSheets`).
  - For Excel files: Ignore any sheets listed in the `invalidSheets` property for that exporter.
- Output files must be in `.xls`, `.xlsx`, `.csv`, or `.pdf` format, matching the format of the input file.
- All generated files should be written to `src/packing-lists/{exporter}/test-scenarios/` (where `{exporter}` is determined from the `${exporterProperty}` value).
- The original template file should remain in `src/packing-lists/` as the authoritative source.
- Create a `manifest.json` file with structured test scenario definitions and a comprehensive `README.md` for documentation.
- **VERIFICATION**: Use PowerShell commands to track mutation progress and verify all scenario files have been properly modified.

## Field Mapping Confirmation (MANDATORY)

**Before any test data is created or mutated, you MUST display the detected field/column mappings (from the appropriate configuration file - `src/services/model-headers-pdf.js` for PDF files, `src/services/model-headers.js` for Excel files, or `src/services/model-headers-csv.js` for CSV files - and the sample file) to the user and require explicit confirmation.**

- Present a summary of the detected mappings, including which columns in the sample file correspond to which fields in the exporter configuration.
- Allow the user to confirm, adjust, or reject the mappings interactively (e.g., via CLI prompt, UI, or other means).
- **Block all test data file creation and mutation until the user has confirmed the field mappings.**
- If the user rejects or adjusts the mappings, repeat the mapping detection and confirmation process until the user explicitly confirms.
- Only after confirmation, proceed to generate or mutate any test scenario files.

This confirmation step is required to prevent accidental data corruption and ensure that all test scenarios are based on correct and user-verified field mappings.

## Instructions

1. **File Organization**: The user must provide a valid sample file (happy path) in Excel, CSV, or PDF format. This file will be used as the template for all scenario files and should remain in the main exporter directory as the source. **All output files MUST match the input file format.**
2. **Template Preservation**: All scenario files must be created by copying the entire original happy path file to each scenario file, preserving formatting (Excel), structure (CSV), or page layout/font rendering (PDF). Never create blank files from scratch, and never update the template in-place.
3. **File Manipulation Tools**: See the relevant format skill for the required library, mutation commands, and fallback guidance.
4. **Directory Structure**: Each scenario's instructions file is responsible for creating its own subdirectory (e.g., `src/packing-lists/{exporter}/test-scenarios/basic-tests/`, `src/packing-lists/{exporter}/test-scenarios/single-rms/`, etc.) only if its scenarios are being generated. The main instructions do not create subdirectories globally. All generated test files go in their respective subdirectories, while the original template remains in `src/packing-lists/` as the parent directory.
5. **Column References**: See the relevant format skill for how to document field references in manifest.json (column indices for CSV, column letters for Excel, coordinate references for PDF).
6. **Column Analysis**: See the relevant format skill for the required inspection approach, column/coordinate mapping steps, and trial mutation requirements.

   **Establishment Number Patterns**: RMS establishment numbers can appear in two different patterns depending on the exporter — determine which applies before mutating:

   - **Single per sheet** (e.g., Booker2): One establishment number for the entire sheet, typically in a header area or company information section
   - **Per row** (e.g., COOP): Establishment number appears in each data row, usually in a dedicated column

7. **Invoke scenario sub-agents in parallel.**

   After field mapping confirmation and `manifest.json` creation, invoke one sub-agent for each folder listed in `scenarioFolders`, **simultaneously** — do not wait for one sub-agent to complete before starting the next.

   | `scenarioFolders` value | Sub-agent to invoke                    |
   | ----------------------- | -------------------------------------- |
   | `basic-tests`           | `generate-test-data-basic-tests`       |
   | `single-rms`            | `generate-test-data-single-rms`        |
   | `net-weight`            | `generate-test-data-net-weight`        |
   | `country-of-origin`     | `generate-test-data-country-of-origin` |

   Pass the following context to each sub-agent:

   - `manifestPath`: `src/packing-lists/{exporter}/test-scenarios/manifest.json`
   - `happyPathFile`: the original input file path
   - `exporterProperty`: the exporter key

   > **Important:** Do not pre-create scenario subdirectories — each sub-agent is responsible for creating its own folder.

8. Each sub-agent creates its own scenario folder and copies the template before applying mutations. Do not duplicate this work in the orchestrator.
9. **Documentation Requirements**:
   - Create `manifest.json` with structured scenario definitions including expected results
   - Create comprehensive `README.md` documenting all scenarios, mutations, and testing instructions
   - Include exporter configuration details (establishment number regex, column mappings)
   - Document column classification (mandatory vs optional) based on `regex` property vs root-level properties
10. **Do not modify the original input file** - it should remain in the main exporter directory as the authoritative template.
11. **Line Break Handling**: For multi-line values, use `\n` for line breaks (never `<br>`). Excel's "Wrap Text" feature and PDF text rendering should preserve line breaks when applicable.
12. **Error Handling**: See the relevant format skill for fallback guidance. If file operations fail, fall back to PowerShell/CLI copy operations only for file creation.

## Implementation Steps

1. **Determine Configuration Source**:

   - Check `modelConfigSource` parameter
   - If not provided, auto-detect from file extension
   - Validate exporter exists in selected configuration

2. **Analyze Template**:

   - Read the happy path file using appropriate tools (Excel tools for .xlsx/.xls, CSV reading for .csv, PDF inspection tools for .pdf)
   - Identify establishment number, headers, and data structure
   - Determine the appropriate field reference format — see the relevant format skill

3. **Match Exporter**:

   - Use the determined configuration source to load exporter configuration
   - Document which configuration file is being used in manifest.json

4. **Create Directory**: Each scenario's instructions file is responsible for creating its own subdirectory only if its scenarios are being generated.

5. **Copy Files**:

   - Use PowerShell to copy the entire template file to all scenario filenames
   - **CRITICAL**: Preserve file extension - CSV to CSV, Excel to Excel, PDF to PDF

6. **Apply Mutations**: See the relevant format skill for the required tool and mutation approach. Reference fields using the appropriate format (indices for CSV, letters for Excel, coordinates for PDF).

7. **Generate Documentation**: Create manifest.json and README.md with:
   - Configuration source used
   - File format and column reference format
   - Comprehensive scenario descriptions

## MANDATORY - Systematic Mutation Completion Tracking

**CRITICAL REQUIREMENT**: All scenario files must have appropriate mutations applied. No files should remain as unchanged copies of the template (except the baseline `Happypath` file for the selected format).

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
4. **Verify Completion**: Ensure all files except the baseline `Happypath` file (for the selected format) have been modified
5. **Final Validation**: Check that all scenarios have proper mutations applied

### Excel Generation Skill

Load the `excel-test-data-generation` skill for the full workflow, mutation patterns, merged-cell handling, and troubleshooting.

### PDF Generation Skill

Load the `pdf-test-data-generation` skill for the full workflow, coordinate mapping, mutation patterns, and troubleshooting.

### CSV Generation Skill

Load the `csv-test-data-generation` skill for the full workflow, PowerShell mutation patterns, quote escaping, and troubleshooting.
