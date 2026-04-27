---
name: csv-test-data-generation
description: Generate CSV test data with correct quoting, encoding, and PowerShell-based mutation patterns for scenario-based test suites
---

# CSV Test Data Generation Skill

> **Scope**: This skill covers the _how_ for CSV file operations — mutation tooling, PowerShell patterns, quote escaping, encoding, and manifest.json reference format. It is designed to be loaded alongside the `generate-test-data-from-sample` prompt, which defines the _what_ (business rules, scenario selection, and validation requirements).

> **Use this skill when**: Creating or mutating `.csv` scenario files from a happy-path template where quote escaping, encoding, and column-index targeting are required.

## Core Principles

- Always copy the template file first; never mutate the authoritative source in place.
- Use PowerShell `Import-Csv`/`Export-Csv` for structured mutations; use text manipulation only for header-row changes or when `Import-Csv` would re-encode values unexpectedly.
- Validate column indices from the manifest before applying mutations.
- Apply one trial mutation before bulk scenario changes.
- Preserve all non-target rows and columns.

## Workflow

1. Copy the template to scenario output path:
   ```powershell
   Copy-Item "src/packing-lists/{exporter}/HappyPath.csv" "src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.csv"
   ```
2. Confirm column indices from manifest.json (1-based: column 1 = first column).
3. Apply one trial mutation to a single row/field.
4. Re-read the file and verify the change is correct and only the target field changed.
5. Apply remaining scenario mutations.
6. Verify the output file is no longer identical to the template.

## PowerShell Mutation Pattern

```powershell
# Read
$rows = Import-Csv "src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.csv"

# Mutate (e.g. corrupt commodity_code in rows 1 and 2, 0-indexed in array)
$rows[0].commodity_code = '@123456'
$rows[1].commodity_code = 'ABC123'

# Write back
$rows | Export-Csv "src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.csv" -NoTypeInformation
```

> **Warning**: `Export-Csv` always writes a UTF-8 file with a type-information header row unless `-NoTypeInformation` is specified. Always include `-NoTypeInformation`.

## Header Row Mutation (Text Manipulation)

`Import-Csv`/`Export-Csv` cannot reliably mutate header names alone. Use text replacement for header-only scenarios:

```powershell
$content = Get-Content "path/to/file.csv" -Raw
$content = $content -replace 'Commodity Code', ''   # clear header
Set-Content "path/to/file.csv" $content -NoNewline
```

Always verify the header row after mutation with:

```powershell
(Get-Content "path/to/file.csv" -First 1)
```

## Quote Escaping Rules

CSV quote handling is the most common source of errors:

| Intended value                    | In CSV file           | PowerShell Export-Csv result |
| --------------------------------- | --------------------- | ---------------------------- |
| `Product Name`                    | `Product Name`        | `Product Name`               |
| `"Product Name"` (literal quotes) | `"""Product Name"""`  | `"""Product Name"""`         |
| Value containing comma            | `"value,with,commas"` | auto-wrapped                 |

**Key rule**: To represent a literal double-quote character inside a CSV field, use two double-quotes (`""`).

When generating the `DescriptionHasDoubleQuotesShould_Pass` scenario for CSV files:

- The cell value should be: `"Product Name"` (with actual quote characters)
- Written in the CSV as: `"""Product Name"""`
- In PowerShell: set `$rows[0].description = '"Product Name"'` and let `Export-Csv` handle the escaping

## Encoding

- Always use UTF-8 encoding. Avoid UTF-8 BOM unless the template contains one.
- Check the template encoding before mutation:
  ```powershell
  $bytes = [System.IO.File]::ReadAllBytes("path/to/HappyPath.csv")
  if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { "UTF-8 BOM" } else { "UTF-8 no BOM" }
  ```
- Match the output encoding to the template to avoid parser misreads.

## Column Index Reference

CSV columns are documented in manifest.json using 1-based indices:

- Column 1 = first column
- When using `Import-Csv`, columns are accessed by their header name as properties (e.g., `$row.commodity_code`)
- When using text manipulation, count comma-delimited positions starting at 1

## Mutation Safety Rules

- Standard scenarios: mutate exactly 2-3 rows unless scenario says otherwise.
- Multiple scenarios: mutate exactly 3 rows.
- All scenarios: mutate all applicable rows only when explicitly required.
- Header-only scenarios: mutate header row only using text manipulation, not `Import-Csv`/`Export-Csv`.
- Preserve all other rows and columns.
- Never modify the original template file.
