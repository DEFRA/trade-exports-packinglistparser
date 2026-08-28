---
description: 'Generate all code and support files required to add a new CSV parser model for a trader/exporter, including matcher, parser, model header, registration, and tests, following DEFRA PLP conventions.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# Create New CSV Parser

> **Shared guidelines** (persona, field mapping structure, registration rules, tool requirements, and quality criteria) are maintained in [create-new-parser/shared-guidelines.md](create-new-parser/shared-guidelines.md) — load and apply them alongside these CSV-specific instructions.

## Task Specification

The primary task is to generate a new set of files that will allow a **CSV** packing list to be parsed into a standard format and processed for a new trader/exporter.

**User must provide:**

- The establishment number regex to match the exporter
- The list of mandatory and optional fields, and the columns they map to

**Constraints:**

- A matcher must be created to determine if a file matches the model (see `src/services/matchers/asda/model4.js` for example)
- A parser must be created to convert the CSV data into a standard data structure (see `src/services/parsers/asda/model4.js` or `src/services/parsers/iceland/model2.js` for examples)
- **No sheet processing**: The parser receives a flat `Array<Array>` (rows of cell values), not a sheet-keyed object. There is no sheet iteration. Pass `null` as the sheet name argument to `mapParser`.
- `invalidSheets` does not apply to CSV parsers and must not be added.
- Model header entry must be added to `src/services/model-headers/{trader}.js`, exported under a new `csv{Trader}Headers` named export (alongside any existing Excel export from the same file), and spread into `src/services/model-headers-csv.js`
- Register the new matcher/parser under the `parsersCsv` section of `src/services/model-parsers.js`
- In expected test results, `row_location.sheetName` must be `null` (not absent, not a string)

## Instructions

1. Prompt the user for:
   - Establishment number regex
   - List of mandatory and optional fields, and their mapping to column headers
2. Search the codebase for examples (especially `src/services/parsers/asda/model4.js` and `src/services/matchers/asda/model4.js`) to ensure consistency
3. Generate the following files:
   - Matcher: `src/services/matchers/{trader}/modelN.js`
   - Parser: `src/services/parsers/{trader}/modelN.js`
   - Model header file: `src/services/model-headers/{trader}.js` — add a `csv{Trader}Headers` named export in alphabetical order; if the file already exists for an Excel model, add the CSV export alongside it without altering the existing Excel export
   - Model header registry: update `src/services/model-headers-csv.js` — import `csv{Trader}Headers` and spread it into the registry (same pattern as `csvAsdaHeaders`)
   - Registration: update `src/services/model-parsers.js` (under `parsersCsv`) and `src/services/parser-model.js`
   - Matcher/parser unit tests: `src/services/matchers/{trader}/modelN.test.js` and `src/services/parsers/{trader}/modelN.test.js`
   - Parser-service integration tests: `test/parser-service/{trader}/modelN.test.js` (following the ASDA model4 example)
   - Test data: `test/test-data-and-results/models-csv/{trader}/modelN.js` and `test/test-data-and-results/results-csv/{trader}/modelN.js` (including valid, invalid, empty, missing-column, and wrong-establishment cases — no multi-sheet cases)

## Output Requirements

- Output should be code files in the same pattern as the existing codebase (see `src/services/matchers/asda/model4.js` and `src/services/parsers/asda/model4.js`)
- Create new files in the appropriate folders with the correct naming convention
- Modify `src/services/model-headers-csv.js`, `src/services/model-parsers.js`, and `src/services/parser-model.js` as needed
- Use code examples for few-shot learning and to ensure output matches expectations
- All output should be formatted as code blocks, grouped by file path
- **On completion, state the resolved `exporterProperty`** — the uppercase model key added to `src/services/parser-model.js` and the header registry (e.g. `ICELAND2`, `TESCO3`). This is required by the calling orchestrator to proceed.

---
