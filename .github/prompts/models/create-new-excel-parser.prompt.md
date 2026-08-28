---
description: 'Generate all code and support files required to add a new Excel parser model for a trader/exporter, including matcher, parser, model header, registration, and tests, following DEFRA PLP conventions.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# Create New Excel Parser

> **Shared guidelines** (persona, field mapping structure, registration rules, tool requirements, and quality criteria) are maintained in [create-new-parser/shared-guidelines.md](create-new-parser/shared-guidelines.md) — load and apply them alongside these Excel-specific instructions.

## Task Specification

The primary task is to generate a new set of files that will allow an **Excel** packing list to be parsed into a standard format and processed for a new trader/exporter.

**User must provide:**

- The establishment number regex to match the exporter
- The list of mandatory and optional fields, and the columns they map to
- Whether totals/footer rows need to be filtered out, and if so, what regex patterns or text to look for to identify them
- Whether any specific sheet names should be excluded from processing (`invalidSheets`), and if so, which sheet names to ignore

**Constraints:**

- A matcher must be created to determine if a file matches the model (see `src/services/matchers/asda/model3.js` for example)
- A parser must be created to convert the workbook into a standard data structure (see `src/services/parsers/asda/model2.js` for example)
- **Multi-sheet processing**: The parser receives a workbook JSON object keyed by sheet name. Iterate over `Object.keys(packingListJson)` and pass the sheet name string as the last argument to `mapParser`.
- If specific sheets need to be excluded from processing:
  - Add `invalidSheets` array property to the model in `src/services/model-headers/{trader}.js` (like DAVENPORT2, FOWLERWELCH1)
  - Guard with `!headers.MODEL.invalidSheets.includes(sheet)` before processing each sheet
  - If no sheets need excluding, omit `invalidSheets` and process all sheets (like ASDA1)
- If totals/footer rows need filtering, implement the appropriate pattern:
  - **Footer row filtering** (like ASDA model2): Use `footerValues` array with regex patterns, `rowFinder`, and slice data before the footer row
  - **Content-based filtering** (like BANDM model1): Filter parsed data by checking row characteristics
  - **String-based filtering** (like BOOTS model1): Filter parsed data using specific string matches
  - **No filtering** (like ASDA model1): Omit totals filtering code entirely if not needed
- Model header entry must be added to `src/services/model-headers/{trader}.js`, exported under the `{trader}Headers` named export, and spread into `src/services/model-headers.js`
- Register the new matcher/parser under the `parsersExcel` section of `src/services/model-parsers.js`

## Instructions

1. Prompt the user for:
   - Establishment number regex
   - List of mandatory and optional fields, and their mapping to column headers
   - Whether totals/footer rows need to be filtered out, and if so, what regex patterns or text to look for to identify them
   - Whether any specific sheet names should be excluded from processing (`invalidSheets`), and if so, which sheet names to ignore
2. Search the codebase for examples (especially `src/services/parsers/asda/model2.js` and `src/services/matchers/asda/model3.js`) to ensure consistency
3. Generate the following files:
   - Matcher: `src/services/matchers/{trader}/modelN.js`
   - Parser: `src/services/parsers/{trader}/modelN.js`
   - Model header file: `src/services/model-headers/{trader}.js` — add model entry to the `{trader}Headers` export in correct alphabetical order
   - Model header registry: update `src/services/model-headers.js` — import `{trader}Headers` and spread it into the registry, in alphabetical order (same pattern as ASDA3)
   - Registration: update `src/services/model-parsers.js` (under `parsersExcel`) and `src/services/parser-model.js`
   - Matcher/parser unit tests: `src/services/matchers/{trader}/modelN.test.js` and `src/services/parsers/{trader}/modelN.test.js`
   - Parser-service integration tests: `test/parser-service/{trader}/modelN.test.js` (following the ASDA model3 example)
   - Test data: `test/test-data-and-results/models/{trader}/modelN.js` and `test/test-data-and-results/results/{trader}/modelN.js` (including valid, invalid, empty, and multi-sheet cases)

## Output Requirements

- Output should be code files in the same pattern as the existing codebase (see `src/services/matchers/asda/model3.js` and `src/services/parsers/asda/model3.js`)
- Create new files in the appropriate folders with the correct naming convention
- Modify `src/services/model-headers.js`, `src/services/model-parsers.js`, and `src/services/parser-model.js` as needed
- Use code examples for few-shot learning and to ensure output matches expectations
- All output should be formatted as code blocks, grouped by file path
- **On completion, state the resolved `exporterProperty`** — the uppercase model key added to `src/services/parser-model.js` and the header registry (e.g. `ICELAND2`, `TESCO3`). This is required by the calling orchestrator to proceed.

---
