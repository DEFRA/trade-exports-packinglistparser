---
description: 'Generate all code and support files required to add a new Excel parser model for a trader/exporter, including matcher, parser, model header, registration, and tests, following DEFRA PLP conventions.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# Create New Excel Parser

You are a senior Node.js backend developer with 8+ years of experience in data parsing, Excel/PDF processing, and robust code/documentation standards.

## Task Specification

The primary task is to generate a new set of files that will allow an Excel import to be parsed into a standard format and processed for a new trader/exporter.  
Secondary tasks include generating a standard set of unit tests and integrating the new model into the system.

**User must provide:**

- The establishment number regex to match the exporter
- The list of mandatory and optional fields, and the columns they map to

**Field Mapping Structure in model-headers.js:**

- **Mandatory fields** go inside the `regex` object (e.g., `description`, `number_of_packages`, `total_net_weight_kg` and either `commodity_code` or `nature_of_products` and `type_of_treatment`).
- **Optional fields** are defined as separate properties outside the `regex` object (e.g., `country_of_origin`, `nirms`, `total_net_weight_unit`). if `country_of_origin` and `nirms` are specified then we would look to set `validateCountryOfOrigin`. if `total_net_weight_unit` is not set we would look to set `findUnitInHeader`.

**Constraints:**

- A matcher must be created to determine if a file matches the model (see `src/services/matchers/asda/model3.js` for example)
- A parser must be created to convert the spreadsheet into a standard data structure (see `src/services/parsers/asda/model2.js` for example)
- If specific sheets need to be excluded from processing:
  - Add `invalidSheets` array property to the model in `model-headers.js` (like DAVENPORT2, FOWLERWELCH1)
  - Use `!headers.MODEL.invalidSheets.includes(sheet)` check before processing each sheet in the parser
  - If no sheets need excluding, omit the invalidSheets property and process all sheets (like ASDA1)
- If totals/footer rows need filtering, implement the appropriate pattern:
  - **Footer row filtering** (like ASDA model2): Use `footerValues` array with regex patterns, `rowFinder`, and slice data before the footer row
  - **Content-based filtering** (like BANDM model1): Filter parsed data by checking row characteristics
  - **String-based filtering** (like BOOTS model1): Filter parsed data using specific string matches
  - **No filtering** (like ASDA model1): Omit totals filtering code entirely if not needed
- Model mappings must be added to `model-headers.js` in the correct alphabetical order by model name (e.g., ASDA1, ASDA2, ASDA3, BANDM1, BOOKER2, BOOTS1, etc.)
- The new model must be registered in `model-parsers.js` and `parser-model.js` in the correct alphabetical order
- File and code structure must closely follow the examples for other exporters

## Instructions

1. Prompt the user for:
   - Establishment number regex
   - List of mandatory and optional fields, and their mapping to column headers
   - Whether totals/footer rows need to be filtered out, and if so, what regex patterns or text to look for to identify them
   - Whether any specific sheet names should be excluded from processing (invalidSheets), and if so, which sheet names to ignore
2. Search the codebase for examples (especially `asda/model2.js`) to ensure consistency
3. Generate the following files:
   - Matcher: `src/services/matchers/{trader}/modelN.js`
   - Parser: `src/services/parsers/{trader}/modelN.js`
   - Model header file: `src/services/model-headers/{trader}.js` (add/update model entry in correct order)
   - Model header registry: update `src/services/model-headers.js` (in the same style/order as `ASDA3`)
   - Registration: update `src/services/model-parsers.js` and `src/services/parser-model.js`
   - Matcher/parser unit tests: co-locate as `src/services/matchers/{trader}/modelN.test.js` and `src/services/parsers/{trader}/modelN.test.js`
   - Parser-service tests: `test/parser-service/{trader}/modelN.test.js` (following the ASDA example)
   - Test data stubs: add required model/expected exports in `test/parser-service/test-data-and-results/models/{trader}.js` and `test/parser-service/test-data-and-results/results/{trader}.js` (including valid, invalid, empty, and multi-sheet cases)
4. Use the same code patterns, error handling, and structure as the examples
5. Validate that all generated files and test data match the style and conventions of the codebase

## Context & Variable Requirements

- Use input variables for establishment number regex, mandatory fields, and optional fields with their column mappings
- Reference example files in the codebase for structure and naming
- No need for `${selection}` or `${file}`; all context is from user input and codebase search

## Output Requirements

- Output should be code files in the same pattern as the existing codebase (see `src/services/matchers/asda/model3.js` and `src/services/parsers/asda/model3.js`)
- Create new files in the appropriate folders with the correct naming convention
- Modify `src/services/model-headers.js`, `src/services/model-parsers.js`, and `src/services/parser-model.js` as needed
- Use code examples for few-shot learning and to ensure output matches expectations
- All output should be formatted as code blocks, grouped by file path

## Tool & Capability Requirements

- Use only the tools declared in frontmatter.
- Use search and codebase tools to find examples and repository patterns before generating files.
- Interact with the user to gather missing inputs and clarify assumptions.
- Ensure generated outputs are testable and aligned with repository conventions.

## Technical Configuration

- No specific mode or model required beyond `agent`
- No special execution constraints

## Quality & Validation Criteria

- Success is measured by all code files being generated in the correct format and structure
- Validate that generated files are consistent with examples for other exporters (especially `asda/model3.js`)
- Check that all required files are created and all mappings are correct
- Address common failure modes such as missing fields, incorrect mappings, or invalid regex
- Include error handling and follow all existing coding standards and best practices

---
