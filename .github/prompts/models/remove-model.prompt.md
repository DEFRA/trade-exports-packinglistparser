---
description: 'Remove a deprecated parser model from PLP by deleting registry entries, source files, tests, test data, and documentation references.'
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# Remove Parser Model

You are a senior Node.js backend developer working in this PLP repository. Remove a deprecated parser model safely and consistently.

## Task Specification

Primary task: remove one model key (for example `DAVENPORT1`, `TESCO2`) and all related references.

Secondary tasks:

- Keep registries and exports valid after removal.
- Remove orphaned tests and test-data imports.
- Validate by running the repository test command.

## Input Variables

- `MODEL_KEY`: Model enum key used in `src/services/model-parsers.js` and `src/services/parser-model.js`.

Derive internally:

- `RETAILER_DIR`: `MODEL_KEY` without trailing digits, lowercased.
- `MODEL_NUMBER`: trailing digits from `MODEL_KEY`.

## Instructions

1. Update parser model constants and registries.

   - Edit `src/services/parser-model.js`: remove the `MODEL_KEY` constant entry.
   - Edit `src/services/model-parsers.js`:
     - Remove `import` lines for matcher and parser for the model.
     - Remove the model entry from the correct parser group (`parsersExcel`, `parsersCsv`, `parsersPdf`, or `parsersPdfNonAi`).

2. Update model headers.

   - Edit `src/services/model-headers/<RETAILER_DIR>.js` and remove the `MODEL_KEY` block.
   - Keep the file syntactically valid and preserve remaining export structure.

3. Delete matcher and parser source files.

   - Delete `src/services/matchers/<RETAILER_DIR>/model<MODEL_NUMBER>.js`.
   - Delete `src/services/parsers/<RETAILER_DIR>/model<MODEL_NUMBER>.js`.

4. Delete tests and test data/results.

   - Delete parser-service test: `test/parser-service/<RETAILER_DIR>/model<MODEL_NUMBER>.test.js`.
   - Delete test data: `test/test-data-and-results/models/<RETAILER_DIR>/model<MODEL_NUMBER>.js`.
   - Delete expected results: `test/test-data-and-results/results/<RETAILER_DIR>/model<MODEL_NUMBER>.js`.
   - For CSV/PDF models, also check and remove corresponding files in `test/test-data-and-results/models-csv`, `test/test-data-and-results/results-csv`, `test/test-data-and-results/models-pdf`, and `test/test-data-and-results/results-pdf`.
   - Remove cross-file imports that still reference deleted fixtures.

5. Validate changes.

   - Run `npm run test`.
   - If there are reference/import failures, search for `MODEL_KEY` and `model<MODEL_NUMBER>` and remove remaining stale references.

6. Documentation cleanup.
   - Search docs and prompts for stale model references (for example `README.md`, `.github/prompts/**`, `.github/copilot-instructions.md`, and `docs/**`).
   - Update or remove deprecated model mentions where they are no longer accurate.

## Context & Variable Requirements

- Use codebase search to identify all direct and indirect references.
- Respect existing naming and ordering conventions used by parser registries and model headers.

## Output Requirements

- Apply edits directly to source files.
- Provide a concise summary of files removed/updated.
- Report validation results from `npm run test`.

## Tool & Capability Requirements

- Use only the tools declared in frontmatter.
- Prefer targeted search before deleting files.

## Quality & Validation Criteria

- No remaining references to the removed `MODEL_KEY`.
- Registries and headers remain syntactically correct.
- Tests pass without import errors.
