---
description: 'Generate all code and support files required to add a new coordinate-based PDF parser model for a trader/exporter, including matcher, parser, model header, registration, and tests, following DEFRA PLP conventions. Use Giovanni3 (src/services/parsers/giovanni/model3.js) as the canonical example.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# Create New PDF Parser

> **Shared guidelines** (persona, field mapping structure, registration rules, tool requirements, and quality criteria) are maintained in [create-new-parser/shared-guidelines.md](create-new-parser/shared-guidelines.md) — load and apply them alongside these PDF-specific instructions.

## Task Specification

The primary task is to generate a new set of files that will allow a **PDF** packing list to be parsed into a standard format and processed for a new trader/exporter. PDF parsers in this codebase are **coordinate-based** (non-AI): they locate text items by their `x`/`y` pixel positions rather than reading raw text streams. Giovanni3 (`src/services/parsers/giovanni/model3.js`) is the canonical reference for all structural and implementation patterns.

**User must provide:**

- The establishment number regex and its bounding box coordinates (`x1`, `x2`, `y1`, `y2`)
- For each mandatory column header: the matching regex, approximate `x1`/`x2` pixel bounds, and a stable header-text regex for boundary discovery
- For each optional column header (e.g. `country_of_origin`, `nirms`): the matching regex and `x1`/`x2` pixel bounds
- The header row Y-range (`minHeadersY`, `maxHeadersY`) that separates the header region from the data rows
- Whether the model uses anchor columns (columns whose detected position constrains adjacent columns but are not themselves extracted — like `country_of_origin` and `gross_weight` in Giovanni3)
- Whether blanket NIRMS, blanket `type_of_treatment`, or any other blanket values need to be resolved from the page (outside the row-level data table)

**Constraints:**

- A matcher must be created to determine if a PDF file matches the model (see `src/services/matchers/giovanni/model3.js` for example)
- A parser must be created to extract structured row data from the PDF (see `src/services/parsers/giovanni/model3.js` for example)
- Both matcher and parser must use `pdfHelper.extractPdf` from `src/utilities/pdf-helper.js` to obtain the page content array; each item has `str`, `x`, `y`, `width`, and `height` properties
- The matcher must validate the establishment number using coordinate filtering (`item.x >= x1 && item.x <= x2 && item.y >= y1 && item.y <= y2`) before testing the regex, following the Giovanni3 matcher pattern
- The parser must use `mapPdfDynamicHeaderParser` and `discoverHeaderBoundaries` from `src/services/parser-map-pdf.js` for column boundary discovery, following the Giovanni3 parser pattern
- `CORE_HEADERS` must list only the columns that are directly extracted row-by-row; anchor or constraint columns go into `ANCHOR_HEADERS`
- `EDGE_PADDING` must be applied to widen the leftmost and rightmost discovered column bounds
- If optional columns (`country_of_origin`, `nirms`) may be absent from some PDFs, the parser must silently skip them rather than fail
- If a blanket value needs to be resolved from page content (e.g. `blanketNirmsValue`, `blanketTreatmentTypeValue`), add the configuration to the model header and resolve it in the parser using coordinate filtering before row extraction
- Model header entry must be added as a `pdf{Trader}Headers` named export in `src/services/model-headers/{trader}.js` and spread into `src/services/model-headers-pdf.js`
- Register the new matcher/parser under the `parsersPdfNonAi` section of `src/services/model-parsers.js`

## Instructions

1. Prompt the user for:
   - Establishment number regex and bounding box coordinates
   - Column headers with their regexes and approximate pixel bounds
   - Header row Y-range (`minHeadersY`, `maxHeadersY`)
   - Optional columns and their bounds (if any)
   - Blanket value configurations (if any)
   - Whether anchor columns are needed to prevent adjacent-column bleed
2. Search the codebase for the Giovanni3 examples before generating any files:
   - `src/services/matchers/giovanni/model3.js`
   - `src/services/parsers/giovanni/model3.js`
   - `src/services/model-headers/giovanni.js` (the `pdfGiovanniHeaders` export)
   - `src/services/model-headers-pdf.js`
3. Generate the following files:

   **Source files:**

   - Matcher: `src/services/matchers/{trader}/modelN.js`
   - Parser: `src/services/parsers/{trader}/modelN.js`
   - Model header file: `src/services/model-headers/{trader}.js` — add a `pdf{Trader}Headers` named export; if the file already exists for an Excel/CSV model, add the PDF export alongside the existing export without altering it
   - Model header registry: update `src/services/model-headers-pdf.js` — import `pdf{Trader}Headers` and spread it into the registry (same pattern as `pdfGiovanniHeaders`)
   - Registration: update `src/services/model-parsers.js` (under `parsersPdfNonAi`) and `src/services/parser-model.js`

   **Test files:**

   - Matcher unit test: `src/services/matchers/{trader}/modelN.test.js`
   - Parser unit test: `src/services/parsers/{trader}/modelN.test.js`
   - Parser-service integration test: `test/parser-service/{trader}/modelN.test.js` (following `test/parser-service/giovanni/model3.test.js`)
   - Test model data: `test/test-data-and-results/models-pdf/{trader}/modelN.js`
   - Test results data: `test/test-data-and-results/results-pdf/{trader}/modelN.js` (including valid, missing-header, wrong-establishment, and empty-file cases)

## Model Header Structure (PDF-specific)

PDF model headers differ from Excel/CSV: instead of column-name regexes, each field carries pixel coordinate bounds used for boundary discovery. Use the `GIOVANNI3` entry in `src/services/model-headers/giovanni.js` as the reference shape:

```js
const pdf{Trader}Headers = {
  {MODEL_KEY}: {
    establishmentNumber: {
      regex: /…/,
      x1: <number>,  // left bound of establishment number region
      x2: <number>,  // right bound
      y1: <number>,  // top bound
      y2: <number>   // bottom bound
    },
    headers: {
      description:           { x: /…/, x1: <n>, x2: <n>, regex: /…/ },
      commodity_code:        { x: /…/, x1: <n>, x2: <n>, regex: /…/ },
      number_of_packages:    { x: /…/, x1: <n>, x2: <n>, regex: /…/ },
      total_net_weight_kg:   { x: /…/, x1: <n>, x2: <n>, regex: /…/ },
      // Include type_of_treatment if present in the PDF, with minHeadersY/maxHeadersY
    },
    country_of_origin: { x1: <n>, x2: <n>, regex: /…/ },   // optional
    nirms:             { x1: <n>, x2: <n>, regex: /…/ },   // optional
    blanketNirmsValue: { x1: <n>, x2: <n>, maxHeadersY: <n>, regex: /…/ },  // if blanket NIRMS
    blanketTreatmentTypeValue: { x1: <n>, x2: <n>, maxHeadersY: <n>, regex: /…/ }, // if blanket treatment
    minHeadersY: <number>,  // top of header row band
    maxHeadersY: <number>,  // bottom of header row band
    findUnitInHeader: true,            // usually true for PDF; omit if not needed
    strictUnitMatch: true,             // omit if not needed
    validateCountryOfOrigin: true      // include when country_of_origin and nirms are present
  }
}
```

**Field mapping rules (PDF):**

- Mandatory fields (`description`, `commodity_code`, `number_of_packages`, `total_net_weight_kg`, and optionally `type_of_treatment`) go into the `headers` object
- Optional fields (`country_of_origin`, `nirms`) are root-level properties on the model, each with `x1`, `x2`, and `regex`
- Blanket values (NIRMS resolved from page header, treatment type resolved from a fixed cell) go in their own named root-level properties (`blanketNirmsValue`, `blanketTreatmentTypeValue`)
- `validateCountryOfOrigin: true` must be set when both `country_of_origin` and `nirms` are present
- `findUnitInHeader: true` must be set when the net weight unit is read from the header row rather than from each data row

## Key PDF Parser Implementation Patterns

### Coordinate-based establishment number matching (matcher)

```js
const itemsInRegion = page.content.filter(
  (item) =>
    item.x >= estNoConfig.x1 &&
    item.x <= estNoConfig.x2 &&
    item.y >= estNoConfig.y1 &&
    item.y <= estNoConfig.y2
)
if (!regex.test(estNoConfig.regex, itemsInRegion)) {
  return matcherResult.WRONG_ESTABLISHMENT_NUMBER
}
```

### Dynamic header boundary discovery (parser)

```js
const boundaries = discoverHeaderBoundaries(pageContent, CORE_HEADERS, {
  minY: headers.MODEL_KEY.minHeadersY,
  maxY: headers.MODEL_KEY.maxHeadersY
})
const withAnchors = mergeAnchorBoundaries(headerRowContent, boundaries)
const expanded = expandBoundariesToMidpoints(withAnchors, EDGE_PADDING)
// Remove anchor keys before extraction
const extractionBoundaries = Object.fromEntries(
  Object.entries(expanded).filter(([k]) => !(k in ANCHOR_HEADERS))
)
```

### Anchor columns

Anchor columns (e.g. `gross_weight`, `country_of_origin`) establish midpoints that prevent adjacent columns from bleeding into each other. Add them to `ANCHOR_HEADERS` with only a `regex`; merge them before `expandBoundariesToMidpoints`; then strip them before passing to `mapPdfDynamicHeaderParser`.

### Blanket value resolution

Blanket values are resolved from page content using coordinate filtering before row extraction, then passed to the combine-parser step. See `discoverOptionalBoundaries` in `src/services/parsers/giovanni/model3.js` for the pattern.

## Registration Differences vs Excel/CSV

| Aspect                      | Excel/CSV                                                 | PDF                                       |
| --------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| Header registry file        | `src/services/model-headers.js` or `model-headers-csv.js` | `src/services/model-headers-pdf.js`       |
| Named export prefix         | `{trader}Headers` / `csv{Trader}Headers`                  | `pdf{Trader}Headers`                      |
| Parser registration section | `parsersExcel` / `parsersCsv`                             | `parsersPdfNonAi`                         |
| Test data folder            | `models/` / `models-csv/`                                 | `models-pdf/`                             |
| Test results folder         | `results/` / `results-csv/`                               | `results-pdf/`                            |
| Sheet iteration             | Yes (Excel) / No (CSV)                                    | No — iterate over `pdfJson.pages` instead |
| `sheetName` in results      | String / `null`                                           | `null`                                    |

## Output Requirements

- Output should be code files in the same pattern as the existing codebase — `src/services/matchers/giovanni/model3.js` and `src/services/parsers/giovanni/model3.js` are the canonical references
- Create new files in the appropriate folders with the correct naming convention
- Modify `src/services/model-headers-pdf.js`, `src/services/model-parsers.js`, and `src/services/parser-model.js` as needed
- Use code examples for few-shot learning and to ensure output matches expectations
- All output should be formatted as code blocks, grouped by file path
- **On completion, state the resolved `exporterProperty`** — the uppercase model key added to `src/services/parser-model.js` and the PDF header registry (e.g. `GIOVANNI3`, `GREGGS2`). This is required by the calling orchestrator to proceed.

---
