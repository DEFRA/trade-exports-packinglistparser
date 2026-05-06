---
name: excel-test-data-generation
description: Generate Excel test data with style-safe workbook mutations, merged-cell handling, and mapping verification for scenario-based test suites
---

# Excel Test Data Generation Skill

> **Scope**: This skill covers the _how_ for Excel file operations — mutation tooling, merged-cell handling, column mapping inspection, and manifest.json reference format. It is designed to be loaded alongside the `generate-test-data-from-sample` prompt, which defines the _what_ (business rules, scenario selection, and validation requirements).

> **Use this skill when**: Creating or mutating `.xlsx/.xls` scenario files from a happy-path template where merged cells, formatting preservation, and accurate column mapping are required.

## Core Principles

- **Always binary-copy the template first** using `fs.copyFileSync` — this is the only way to guarantee all formatting, styles, images, and merged cells are fully preserved.
- **Use `exceljs` for targeted mutations only** — open the copied file, apply only the required cell changes, then save back to the same path.
- **Never use `xlsx` (SheetJS) to write scenario files** — it strips cell styles and reformats number cells, producing files that differ visually from the template even when data is unchanged.
- **Never use `exceljs` to re-read and re-write unchanged files** — even a round-trip with no mutations will alter compression and may lose some style fidelity. Only process files that actually need mutations.
- Validate mapping from both headers and multiple data rows before bulk changes.
- Preserve formatting, merged ranges, and non-target cells.
- Apply one trial mutation before applying scenario-wide changes.

## Workflow

1. **Binary-copy** the template to the scenario output path — this preserves all bytes:
   ```javascript
   fs.copyFileSync(TEMPLATE, outPath) // exact binary copy — preserves all styles
   ```
   > On Linux/macOS you can also use `cp`. PowerShell `Copy-Item` is equivalent on Windows.
2. **For the baseline `Happypath` file**: stop here. Do not open it with exceljs at all. A pure binary copy is the correct output.
3. **For all other scenarios**: open the copy with exceljs and apply only the targeted mutations:
   ```javascript
   const wb = new ExcelJS.Workbook()
   await wb.xlsx.readFile(outPath) // open the copy, not the template
   const ws = wb.getWorksheet('SheetName')
   // ... apply mutations ...
   await wb.xlsx.writeFile(outPath) // save back to same path
   ```
4. Inspect structure before mutating (can be done once using `xlsx` for read-only inspection):
   - Header row candidates
   - Data row candidates
   - Merged ranges
   - Styles/number formats in target columns
5. Confirm field mapping (mandatory/optional/other) against exporter config.
6. Apply one targeted trial mutation.
7. Re-read and verify the trial mutation landed in the intended column/cell(s).
8. Apply remaining scenario mutations.
9. Re-read and verify final values and merged-cell consistency.

## ExcelJS Pattern

### Correct two-step pattern (binary copy + targeted mutation)

```javascript
const ExcelJS = require('exceljs')
const fs = require('fs')

// Step 1: binary-exact copy — preserves ALL formatting, styles, images, merges
fs.copyFileSync(TEMPLATE, outPath)

// Step 2: open the copy and apply only the required mutations
const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(outPath) // read from the copy
const ws = wb.getWorksheet('SheetName') // by name, not index

// exceljs uses 1-based row and column numbers
const headerRow = 45
const dataRow = 46

// Read a header cell
const headerCell = ws.getRow(headerRow).getCell(6) // column F
console.log('Header text:', headerCell.value)

// Clear a cell
ws.getRow(dataRow).getCell(6).value = null

// Set a cell value
ws.getRow(dataRow).getCell(3).value = '@123456' // column C

await wb.xlsx.writeFile(outPath) // save back to same path
```

### Column number reference

exceljs uses **1-based column numbers**: A=1, B=2, C=3, … Z=26. You can also pass the column letter as a string: `getCell('K')` or `getCell(11)` are equivalent.

### Baseline Happypath — no exceljs needed

```javascript
// Happypath must be a bit-for-bit copy of the template — skip exceljs entirely
fs.copyFileSync(TEMPLATE, path.join(OUT_DIR, 'Happypath.xlsx'))
```

### Why NOT xlsx (SheetJS) for writes

```javascript
// ❌ DO NOT DO THIS — strips cell styles, inflates file size
const wb = XLSX.readFile(template, { cellStyles: true })
XLSX.writeFile(wb, outPath) // formatting lost even if nothing changed
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

## FOWLERWELCH2 Lessons (Excel)

### Per-row establishment number

- FOWLERWELCH2 has the establishment number (`RMS-GB-000216-xxx`) in every data row (Column P, `NIRMS Despatch No.`), not once in a header region.
- Detect the pattern from the template before mutating: check whether the RMS value appears in a dedicated header cell or repeats in each item row.

### Verified FOWLERWELCH2 mapping pattern (sheet: NWAY)

- Header row: 45 (1-based)
- Data rows: 46 onward
- Description: Column F (6)
- Commodity Code: Column C (3)
- No. of Pkgs: Column H (8)
- Item Net Weight: Column K (11)
- Nature of Product: Column M (13)
- Type of Treatment: Column N (14)
- Country of Origin: Column G (7) — optional
- NIRMS / Non NIRMS: Column O (15) — optional
- Establishment number (per-row): Column P (16)

### No merged cells in data area

- Merged cells in the NWAY sheet are confined to rows 1–44 (info/header region) and do not affect the data rows.

## Fallback Guidance

`xlsx` (SheetJS) is acceptable for **read-only inspection** (mapping discovery, row counting, structure analysis) but must **never** be used to write scenario files. If `exceljs` cannot be installed, fall back to PowerShell/CLI binary copy for file creation and accept that targeted cell mutations cannot be applied without `exceljs`.
