---
description: 'Generate documentation for what each parser model does, grouped by exporter, with clear mapping and filtering details. The output must be easy to read and understand for both technical and non-technical people.'
agent: agent
tools: ['codebase', 'search']
---

# Parser Model Description Prompt

## Prompt Identity & Purpose

Generate clear, accessible documentation for each parser model, grouped by exporter, with mapping and filtering details. The output should be easy to read for both technical and non-technical audiences and suitable for Confluence.

## Persona Definition

You are a senior Node.js backend developer and documentation specialist with 8+ years of experience in parsing, code analysis, and technical writing. You excel at explaining technical concepts in plain language for all audiences.

## Task Specification

- Analyze matcher files in `src/services/matchers` to determine model matching (establishment number, etc.).
- Analyze parser files in `src/services/parsers` for data extraction and row filtering/cleaning logic.
- Use `model-headers.js`, `model-headers-csv.js`, and `model-headers-pdf.js` to document column mappings for each model.
- Clearly separate documentation for Excel models, CSV models, and coded PDF models.
- For coded PDF models where only establishment ID matching is available, document the establishment ID used.
- For all other models, document any logic that filters out totals, footers, or bad data rows.
- Group documentation by exporter (folder name in the parsers folder).
- If a model cannot be analyzed, note it in the output and continue with the rest.

## Context & Variable Requirements

- Reference files in `src/services/matchers`, `src/services/parsers`, `src/services/model-headers.js`, `src/services/model-headers-csv.js`, and `src/services/model-headers-pdf.js`.
- Use `${file}` and `${workspaceFolder}` as needed to resolve paths.
- No need for `${selection}` or custom input variables.

## Detailed Instructions & Standards

1. For each exporter, list all models (by model name and type: Excel, CSV, or PDF).
2. For each model, provide:

- Model name and type in the heading (e.g., Model: giovani1 (PDF), ASDA4 (CSV))
- A plain-language description of what the model does (what kind of files it processes and what data it extracts)
- Matching criteria, including:
  - Establishment number (RMS number) logic, explained in plain language
  - Any other criteria used to select this model (e.g., header patterns, file type)
- Field mapping table (with mandatory/optional status, regex matching type, and notes, using simple terms)
- Model-specific notes, including row filtering and any special logic, described simply

3. For Excel and CSV models:

- **Header file sources:**
  - Excel models: Use `model-headers.js`
  - CSV models: Use `model-headers-csv.js`
- **Mandatory fields:** All properties under the `regex` attribute in the model header.
- **Optional fields:** Any other properties at the root level of the model header, except:
  - `establishmentNumber` (used for matching)
  - `findUnitInHeader` (used to determine net weight unit)
  - `validateCountryOfOrigin` (used to indicate country of origin validation)
- **Regex Matching Types:** For each field that uses regular expressions, determine and document the matching pattern:
  - **Exact Match**: Regex has both `^` at start and `$` at end (e.g., `/^exact text$/i`)
  - **Starts With**: Regex has `^` at start but no `$` at end (e.g., `/^starts with/i`)
  - **Ends With**: Regex has `$` at end but no `^` at start (e.g., `/ends with$/i`)
  - **Contains**: Regex has neither `^` nor `$` anchors (e.g., `/contains/i`)
- Clearly document which fields are mandatory and which are optional, noting the special roles of the exceptions above.

4. Use clear section headers, bullet points, and tables. Avoid jargon and explain any technical terms in simple language.
5. If a model cannot be analyzed, note it in the output and continue with the rest.

## Field Mapping Table Format

For each model, create a table with the following columns:

- **Field Name**: The business field name (description, commodity_code, etc.)
- **Status**: Mandatory or Optional
- **Pattern**: The text pattern being matched (without regex syntax)
- **Match Type**: Exact Match, Starts With, Ends With, or Contains
- **Notes**: Any additional context in plain language

Example table format:
| Field Name | Status | Source Column Pattern | Match Type | Notes |
| Description | Mandatory |Description Of All Retail Goods | Contains | Looks for this text anywhere in the header |
| Commodity Code | Optional |Commodity Code | Exact Match | Must match this text exactly |

## Output Requirements

- Output should be in Confluence wiki markup or a format that is easy to copy into Confluence.
- Group documentation by exporter (folder name in the parsers folder).
- For each model, provide:
  - Model name and type in the heading (including CSV as a distinct type)
  - Establishment number (RMS number) logic at the top, explained simply
  - Field mapping table with the enhanced format including regex matching types
  - Model-specific notes, including row filtering and any special logic, described simply
- No new files need to be created; output is for display/copy-paste only.
- No strict formatting requirements, but clarity and grouping are essential.

## Quality & Validation Criteria

- Success is measured by the generation of documentation that is easy to read and understand for both technical and non-technical people, grouped by exporter, and suitable for Confluence.
- Output should be reviewed for clarity, completeness, and accessibility.
- Ensure all relevant models are documented and grouped correctly, including CSV models from `model-headers-csv.js`.
- Confirm that row filtering and mapping logic are described in plain language where applicable.
- Verify that regex matching types (Exact Match, Starts With, Ends With, Contains) are correctly identified and documented for each field.
- If a model cannot be analyzed, note it in the output and continue with the rest.
