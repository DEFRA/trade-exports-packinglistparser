---
name: excel-test-data-generation
description: Generate Excel test data with style-safe workbook mutations, merged-cell handling, and mapping verification for scenario-based test suites
---

# Excel Test Data Generation Skill

> **Scope**: This skill covers the _how_ for Excel file operations — mutation tooling, merged-cell handling, column mapping inspection, and manifest.json reference format. It is designed to be loaded alongside the `generate-test-data-from-sample` prompt, which defines the _what_ (business rules, scenario selection, and validation requirements).

> **Use this skill when**: Creating or mutating `.xlsx/.xls` scenario files from a happy-path template where merged cells, formatting preservation, and accurate column mapping are required.

## Core Principles

- Always copy the template file first; never mutate the authoritative source in place.
- Use `exceljs` for workbook read/write when mutating Excel files.
- Validate mapping from both headers and multiple data rows before bulk changes.
- Preserve formatting, merged ranges, and non-target cells.
- Apply one trial mutation before applying scenario-wide changes.

## Workflow

1. Copy the template to scenario output path:
   ```powershell
   Copy-Item "src/packing-lists/{exporter}/HappyPath.xlsx" "src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.xlsx"
   ```
2. Load workbook and inspect structure:
   - Header row candidates
   - Data row candidates
   - Merged ranges
   - Styles/number formats in target columns
3. Confirm field mapping (mandatory/optional/other) against exporter config.
4. Apply one targeted trial mutation.
5. Re-read and verify the trial mutation landed in the intended column/cell(s).
6. Apply remaining scenario mutations.
7. Re-read and verify final values and merged-cell consistency.

## ExcelJS Pattern

```javascript
import ExcelJS from 'exceljs'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(inputFile)
const sheet = workbook.worksheets[0]

const headerRow = 18
const dataRow = headerRow + 1

const headerCell = sheet.getRow(headerRow).getCell('K')
console.log('Header text:', headerCell.text || headerCell.value)

const targetCell = sheet.getRow(dataRow).getCell('K')
targetCell.value = 'INVALID'

await workbook.xlsx.writeFile(outputFile)
```

## Merged Cell Mapping

### Common issue

Visual column layout can differ from actual data columns when templates use merged cells.

### Practical checks

- Inspect merged ranges directly.
- Compare values across adjacent columns in multiple data rows.
- Confirm target fields with both header text and row-level data.
- For merged business fields, mutate all participating columns consistently.

### Verification checklist

- Header is in expected column(s).
- Data values align with expected column(s).
- Merged field values are consistent across all merged columns.
- Non-target rows and columns remain unchanged.

### manifest.json column reference format

Document all field-to-column mappings in manifest.json using Excel column letters (A, B, C...), not numeric indices. For merged fields, list all participating columns (e.g. `"commodity_code": ["L", "M"]`).

## Mutation Safety Rules

- Standard scenarios: mutate exactly 2-3 rows/items unless scenario says otherwise.
- Multiple scenarios: mutate exactly 3 rows/items.
- All scenarios: mutate all applicable rows/items only when explicitly required.
- Header-only scenarios: mutate header labels only.
- Preserve all other rows/items and workbook structure.

## BOOKER2 Lessons (Excel)

### Establishment pattern recognition

- Single-per-sheet pattern: one establishment number in company/header region.
- Per-row pattern: establishment number in each item row.
- Detect pattern from template before mutation.

### Verified BOOKER2 mapping pattern

- Establishment Number: Column B (multi-line; single per sheet)
- Description: Column D
- Commodity Code: Columns L,M (merged-consistency required)
- Number of Packages: Column H
- Net Weight: Column K
- Nature of Products: Column I
- Type of Treatment: Column J
- Country of Origin: Column N
- NIRMS: Column Q

### Frequent pitfalls

- Visual layout assumed as data mapping.
- Header row assumed equal to data placement.
- Updating only one side of a merged business field.
- Losing multi-line establishment formatting.

## Fallback Guidance

If `exceljs` cannot be used, use `xlsx` as a constrained fallback and explicitly validate:

- merged ranges
- styles and number formats
- column widths and structural integrity
- post-mutation values at target cells

Prefer `exceljs` whenever available.
