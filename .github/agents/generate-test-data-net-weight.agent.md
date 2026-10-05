---
description: 'Generate test-data scenarios for net weight validation in the net-weight folder. Use when orchestrating parallel packing list test data generation.'
tools: [read, search, edit, execute]
user-invocable: false
---

# Net Weight Test Scenarios

> **Context received from orchestrator:**
>
> - `manifestPath`: Path to the confirmed `manifest.json` (e.g., `src/packing-lists/{exporter}/test-scenarios/manifest.json`)
> - `happyPathFile`: Path to the happy path sample file
> - `exporterProperty`: The exporter property name (e.g., 'BOOKER2', 'ASDA1')
>
> Read `manifest.json` at the provided path before starting — it contains the confirmed field/column mappings, establishment number pattern, header row locations, and file format details needed for all mutations. Use `exporterProperty` to select the exporter configuration; check its header regexes and unit source against the manifest before choosing mutations.

> **Shared guidelines**: Load [generate-test-data-shared-guidelines.md](../prompts/models/generate-test-data-from-sample/generate-test-data-shared-guidelines.md) before applying mutations. It is the source of truth for field classification, blanket-field handling, common mutation scope, file format, outcome verification, and integrity requirements.

**Net-weight-specific outcomes**: `Pass` means the intended parser matches and all business validation passes. `Fail` means the intended parser matches but net-weight validation fails for the stated reason. `Unparse` means no parser matches; retain valid establishment data and all unrelated required fields so the named mutation alone causes the outcome.

**Net-weight-specific constraint**: Listed values are examples to choose from, not a requirement to use every value. If the sample has fewer than two data items, report the limitation instead of editing unrelated content. Follow the shared guidelines for mutation scope and preserving unrelated content.

## Scenarios

### Core Net Weight Scenarios (Attempt for Every Exporter)

- **Happypath**: Copy the original happy path file without mutation.
- **Alpha_Numeric_TotalNetWeight_Fail**: Set total net weight on 2-3 rows to different alphanumeric values (e.g. `A12.5`, `15B.2`, `C20.8`). Expect invalid net-weight data, not an unmatched parser.
- **Data_empty_Netweight_Fail**: Clear total net weight cells on 2-3 rows. Expect missing net-weight data.
- **Incorrect_NetweightData_All_Fail**: Set the net weight in **all data rows/items** to a rotating mix of invalid special-character, alphanumeric, negative, mixed, and text values from the shared numeric corruption guidelines. Expect invalid net-weight data; do not edit other columns.
- **Zero_Data_TotalNetWeight_Pass**: Set total net weight to `0` on 2-3 rows; leave other rows unchanged.
- **Missing_Header_Netweight_Unparse**: **[HEADER ONLY]** Clear the required net weight header label entirely (empty CSV/Excel cell or blanked PDF header text region).
- **Header_Typos_Unparse**: **[HEADER ONLY]** Change the required net weight header so its configured regex no longer matches (e.g. replace `Total Net Weight` with `Tot@l Net We!ght` only if this defeats the selected model's regex). Preserve the rest of the header row.
- **Accepted_Header_Variant_Pass**: **[HEADER ONLY]** Apply one visible change to the net weight header that the configured matcher still accepts (e.g. mixed case when its regex is case-insensitive, or extra parentheses when its regex permits them). Do not change or remove any required KG token. Choose a variant that differs from the template and confirm it still matches.

### UOM-Specific Scenarios (Only Generated if `header_net_weight_unit` property exists)

**Applicability**: Generate this group only if the selected exporter configuration has a `header_net_weight_unit` property. Keep this gate even when the parser derives the unit from a header rather than row data. Locate the actual source used for `total_net_weight_unit`: a mapped row-level UOM column if present, otherwise the header containing the extracted KG token. A `header_net_weight_unit` header is not automatically a row-level UOM column. For each case, verify the mutation affects the parsed unit; if the selected model cannot produce the stated outcome, report that case to the orchestrator instead of generating a misleading file.

- **Missing_Header_NetweightUOM_Unparse**: **[HEADER ONLY]** Clear the `header_net_weight_unit` label completely when it is a required regex header. If that header is optional in the selected model, report that this Unparse case is inapplicable.
- **Invalid_Unit_Type_Fail**: Set the parsed unit source to a unit with no valid KG token, e.g. `LBS`, `LB`, or `K9G`. For a row-level source, change 2-3 unit cells; for a header-derived source, change only that header while preserving the required header match. Ensure another KG-bearing header or blanket value cannot supply a valid unit.
- **Missing_UOM_Weight_Fail**: Clear the parsed unit source while retaining net weight values. For a row-level source, clear 2-3 unit cells; for a header-derived source, remove the KG token from that header without clearing its required label or changing any data cells. Ensure no KG fallback remains.
- **MixedUnits_And_Casing_Pass**: Use accepted KG variants such as `Kg`, `kG`, or `KGS` in 2-3 mapped row-level unit cells; for a header-derived source, change only the casing/form of its KG token while preserving the required header match. Check that the change differs from the original.

**Total scenarios generated:**

- **With `header_net_weight_unit` property**: Up to 12 files (8 core + 4 UOM-specific).
- **Without `header_net_weight_unit` property**: Up to 8 files (core scenarios only).
- Report any case that cannot produce its stated outcome for the selected model rather than counting it as generated.

## Output

- Place all generated files in `src/packing-lists/{exporter}/test-scenarios/net-weight/`.
- Return the generated filenames and any inapplicable cases with a brief explanation to the orchestrator.
