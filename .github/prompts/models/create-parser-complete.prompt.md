---
description: 'Create a complete new CSV, Excel, or PDF parser model in a single workflow: parser code, registrations, unit tests, and scenario test data files.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search', 'read/problems', 'agent']
agents:
  [
    'create-new-csv-parser',
    'create-new-excel-parser',
    'create-new-pdf-parser',
    'generate-test-data-from-sample'
  ]
---

# Create New Parser (Complete Workflow)

This prompt orchestrates the full new-model workflow in three sequential phases:

1. **Input collection** — gather all required information upfront
2. **Parser creation** — create all code files and unit test fixtures
3. **Test data generation** — generate scenario files from the provided sample file

> Phase 2 must complete before Phase 3 starts. The `exporterProperty` resolved during registration (e.g. `ICELAND2`) is required as input to Phase 3.

---

## Phase 1 — Input Collection

Collect all of the following before doing anything else. Do not begin Phase 2 until all required inputs are confirmed.

### Required for all formats

- **File format**: `csv`, `excel`, or `pdf`
- **Trader name**: lowercase, used in file paths (e.g. `iceland`, `tesco`, `giovanni`)
- **Establishment number regex**: pattern to match the exporter in the packing list (e.g. `/^GB\d{7}$/`)
- **Mandatory fields**: field name and the column header it maps to for each required field
- **Optional fields**: field name and the column header it maps to for each optional field (if any)
- **Happy path sample file path**: path to a real packing list file that represents a passing case (Excel, CSV, or PDF matching the chosen format)

### Additional required for Excel only

- **Footer/totals row filtering**: is there a totals or footer row that must be excluded? If yes, what text or regex pattern identifies it?
- **Invalid sheets**: are there any sheet names that should be skipped entirely? If yes, list them.

### Additional required for PDF only

- **Establishment number bounding box**: pixel coordinates (`x1`, `x2`, `y1`, `y2`) of the region containing the establishment number
- **Column pixel bounds**: approximate `x1`/`x2` bounds and header-text regex for each mandatory and optional column
- **Header row Y-range**: `minHeadersY` and `maxHeadersY` that enclose the header text row
- **Anchor columns** (optional): any columns used only to constrain adjacent column boundaries (not extracted themselves)
- **Blanket values** (optional): NIRMS or treatment-type values resolved from page-level content rather than per row

### Optional

- **Scenario folders**: which test scenario categories to generate. Defaults to all available: `['basic-tests', 'single-rms', 'net-weight', 'country-of-origin']`. Omit or leave blank to generate all.

---

## Phase 2 — Parser Creation

> **This phase must complete fully before Phase 3 begins.**

Based on the format selected in Phase 1:

- If `csv`: invoke the `create-new-csv-parser` sub-agent, passing all Phase 1 inputs as context.
- If `excel`: invoke the `create-new-excel-parser` sub-agent, passing all Phase 1 inputs as context.
- If `pdf`: invoke the `create-new-pdf-parser` sub-agent, passing all Phase 1 inputs as context.

The sub-agent will create:

- Matcher and parser source files
- Model header entry and registry update
- Registration in `src/services/model-parsers.js` and `src/services/parser-model.js`
- Unit test fixtures in `test/test-data-and-results/`
- Matcher/parser unit tests and parser-service integration tests

The sub-agent will state the resolved `exporterProperty` in its completion summary (e.g. `ICELAND2`, `TESCO3`). **Capture this value — it is required as input to Phase 3.** Do not proceed to Phase 3 until it is confirmed.

---

## Phase 3 — Test Data Generation

> **Run automatically immediately after Phase 2 completes. Do not wait for user instruction to start this phase.**

Without pausing, invoke the `generate-test-data-from-sample` sub-agent now, passing the following context:

- `happyPathFile`: the sample file path provided in Phase 1
- `exporterProperty`: the model key resolved in Phase 2 (e.g. `ICELAND2`)
- `modelConfigSource`: `excel`, `csv`, or `pdf` to match the format selected in Phase 1
- `scenarioFolders`: from Phase 1, or `['basic-tests', 'single-rms', 'net-weight', 'country-of-origin']` if not specified

This sub-agent runs within the current session. Do not ask the user to start a new chat or run a separate prompt — invoke it directly as the next step in this workflow. The sub-agent owns manifest creation, field mapping confirmation, and all scenario file generation.

---

## Completion Summary

Once all three phases are done, confirm to the user:

1. The `exporterProperty` registered (e.g. `ICELAND2`)
2. Files created in Phase 2 (matcher, parser, headers, registrations, tests)
3. Scenario folders generated in Phase 3 under `src/packing-lists/{trader}/test-scenarios/`
4. Any lint or test failures to resolve
