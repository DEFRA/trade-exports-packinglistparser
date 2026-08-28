# Packing List Parser — Model Prompts

This directory contains GitHub Copilot agent prompts for creating new parser models and generating test data. Run them from VS Code using the `@workspace /` chat interface or by attaching the `.prompt.md` file directly in a Copilot Agent chat.

---

## `create-parser-complete.prompt.md` — Full new-parser workflow

Use this prompt when adding a **brand new parser model** (CSV, Excel, or PDF) from scratch. It orchestrates three sequential phases in a single session:

| Phase                    | What happens                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| 1 — Input collection     | Copilot asks you for all required information before doing anything |
| 2 — Parser creation      | Source files, registrations, and unit/integration tests are created |
| 3 — Test data generation | Scenario test files are generated from your sample packing list     |

### How to invoke

Open a Copilot Agent chat and attach the prompt file, or reference it directly:

```
@workspace use .github/prompts/models/create-parser-complete.prompt.md
```

### Inputs you will be asked to provide (Phase 1)

**Required for all formats:**

| Input                      | Description                                                | Example                                         |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| File format                | `csv`, `excel`, or `pdf`                                   | `excel`                                         |
| Trader name                | Lowercase, used in file paths                              | `iceland`                                       |
| Establishment number regex | Pattern that identifies this exporter                      | `/^GB\d{7}$/`                                   |
| Mandatory fields           | Field name → column header mapping for each required field | `net_weight` → `"Net Weight (kg)"`              |
| Optional fields            | Field name → column header mapping for optional fields     | `country_of_origin` → `"Country"`               |
| Happy path sample file     | Path to a real passing packing list (Excel or CSV)         | `src/packing-lists/Iceland/iceland-sample.xlsx` |

**Additional required for Excel only:**

| Input                       | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| Footer/totals row filtering | Text or regex pattern identifying a totals row to exclude |
| Invalid sheets              | Sheet names to skip entirely                              |

**Additional required for PDF only:**

| Input                             | Description                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------ |
| Establishment number bounding box | Pixel coordinates (`x1`, `x2`, `y1`, `y2`) of the establishment number region  |
| Column pixel bounds               | Approximate `x1`/`x2` and header-text regex for each mandatory/optional column |
| Header row Y-range                | `minHeadersY` and `maxHeadersY` that enclose the column header row             |
| Anchor columns (optional)         | Columns used only to constrain adjacent boundaries, not extracted themselves   |
| Blanket values (optional)         | NIRMS or treatment-type resolved from page-level content rather than per row   |

**Optional:**

| Input            | Description                          | Default                                                            |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Scenario folders | Test scenario categories to generate | `['basic-tests', 'single-rms', 'net-weight', 'country-of-origin']` |

### What gets created

**Phase 2 — Parser files:**

- `src/services/matchers/` — matcher source file
- `src/services/parsers/` — parser source file
- `src/services/model-headers/` — header definition entry
- `src/services/model-parsers.js` — registration update
- `src/services/parser-model.js` — enum entry update
- `test/test-data-and-results/` — unit test fixtures
- Matcher/parser unit tests and parser-service integration tests

**Phase 3 — Scenario test data** (under `src/packing-lists/{trader}/test-scenarios/`):

- `manifest.json` — field mapping manifest and scenario definitions
- `README.md` — scenario documentation
- Scenario subdirectories (`basic-tests/`, `single-rms/`, `net-weight/`, `country-of-origin/`) each containing mutated copies of your sample file

---

## `create-new-pdf-parser.prompt.md` — PDF parser only

Use this prompt when you want to create **only** the source code and tests for a new PDF parser model, without generating scenario test data. It is also invoked automatically by `create-parser-complete.prompt.md` when the chosen format is `pdf`.

### How to invoke

```
@workspace use .github/prompts/models/create-new-pdf-parser.prompt.md
```

### How PDF parsers differ from Excel/CSV

PDF parsers in this codebase are **coordinate-based** (non-AI). Instead of column-name regexes, each field is located by its pixel position on the page. The canonical example is Giovanni3 (`src/services/parsers/giovanni/model3.js`).

Key differences:

| Aspect                 | Excel/CSV                                                | PDF                                        |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------ |
| Header config location | `src/services/model-headers.js` / `model-headers-csv.js` | `src/services/model-headers-pdf.js`        |
| Named export prefix    | `{trader}Headers` / `csv{Trader}Headers`                 | `pdf{Trader}Headers`                       |
| Parser registration    | `parsersExcel` / `parsersCsv`                            | `parsersPdfNonAi`                          |
| Test data folder       | `models/` / `models-csv/`                                | `models-pdf/`                              |
| Test results folder    | `results/` / `results-csv/`                              | `results-pdf/`                             |
| Column identification  | Header-text regex                                        | Pixel `x1`/`x2` bounds + header-text regex |
| Iteration              | Sheets (Excel) / none (CSV)                              | Pages (`pdfJson.pages`)                    |

### Inputs

**Required:**

| Input                             | Description                                          | Example                                                    |
| --------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Trader name                       | Lowercase                                            | `giovanni`                                                 |
| Establishment number regex        | Pattern identifying this exporter                    | `/RMS-GB-000149(-\d{3})?/i`                                |
| Establishment number bounding box | Pixel region containing the establishment number     | `x1: 455, x2: 545, y1: 130, y2: 165`                       |
| Mandatory column bounds           | `x1`, `x2`, and header regex for each required field | `description: { x1: 125, x2: 235, regex: /DESCRIPTION/i }` |
| Header row Y-range                | Top and bottom pixel bounds of the header row        | `minHeadersY: 280, maxHeadersY: 300`                       |

**Optional:**

| Input                  | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| Optional column bounds | `x1`, `x2`, and regex for `country_of_origin`, `nirms`, etc. |
| Anchor columns         | Columns that constrain boundaries but are not extracted      |
| Blanket values         | Page-level NIRMS or treatment-type configuration             |

### What gets created

- `src/services/matchers/{trader}/modelN.js`
- `src/services/parsers/{trader}/modelN.js`
- `src/services/model-headers/{trader}.js` — `pdf{Trader}Headers` export added (or appended if file exists)
- `src/services/model-headers-pdf.js` — registry updated
- `src/services/model-parsers.js` — `parsersPdfNonAi` entry added
- `src/services/parser-model.js` — enum entry added
- `src/services/matchers/{trader}/modelN.test.js`
- `src/services/parsers/{trader}/modelN.test.js`
- `test/parser-service/{trader}/modelN.test.js`
- `test/test-data-and-results/models-pdf/{trader}/modelN.js`
- `test/test-data-and-results/results-pdf/{trader}/modelN.js`

---

Use this prompt when a parser model **already exists** and you need to generate (or regenerate) scenario test data files. It is also invoked automatically by `create-parser-complete.prompt.md` in Phase 3.

### How to invoke

```
@workspace use .github/prompts/models/generate-test-data-from-sample.prompt.md
```

### Inputs

| Input               | Required | Description                                                             | Example                                         |
| ------------------- | -------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `happyPathFile`     | Yes      | Path to the sample passing packing list                                 | `src/packing-lists/Iceland/iceland-sample.xlsx` |
| `exporterProperty`  | Yes      | The key used in the model-headers configuration file                    | `ICELAND2`                                      |
| `modelConfigSource` | No       | `pdf`, `excel`, or `csv` — auto-detected from file extension if omitted | `excel`                                         |
| `scenarioFolders`   | No       | List of scenario categories to generate                                 | `['basic-tests', 'country-of-origin']`          |

The `exporterProperty` must match an existing key in one of:

- `src/services/model-headers.js` (Excel)
- `src/services/model-headers-csv.js` (CSV)
- `src/services/model-headers-pdf.js` (PDF)

### Field mapping confirmation

Before creating any files, Copilot will display the detected column-to-field mappings and **require your explicit confirmation**. No files are written until you confirm. If the mappings are wrong, correct them and Copilot will re-detect before proceeding.

### Output structure

All files are written to `src/packing-lists/{exporter}/test-scenarios/`:

```
src/packing-lists/{exporter}/test-scenarios/
├── manifest.json
├── README.md
├── basic-tests/
│   ├── Happypath.xlsx
│   ├── MissingNetWeight.xlsx
│   └── ...
├── single-rms/
│   └── ...
├── net-weight/
│   └── ...
└── country-of-origin/
    └── ...
```

The original sample file in `src/packing-lists/{exporter}/` is never modified.

### Available scenario folders

| Folder              | Scenarios covered                                            |
| ------------------- | ------------------------------------------------------------ |
| `basic-tests`       | Happy path, missing mandatory fields, invalid column headers |
| `single-rms`        | Single establishment number variations                       |
| `net-weight`        | Net weight field edge cases                                  |
| `country-of-origin` | Country of origin, NIRMS, and ineligible item validation     |

---

## Choosing the right prompt

```
Need a brand new parser model (any format)?
  └─► use create-parser-complete.prompt.md
         (handles CSV, Excel, and PDF in one workflow)

Need only the parser source + tests, no test data?
  ├─ CSV    ─► create-new-csv-parser.prompt.md
  ├─ Excel  ─► create-new-excel-parser.prompt.md
  └─ PDF    ─► create-new-pdf-parser.prompt.md

Parser already exists, just need scenario test data?
  └─► use generate-test-data-from-sample.prompt.md
```
