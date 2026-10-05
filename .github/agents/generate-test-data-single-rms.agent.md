---
description: 'Generate test-data scenarios for establishment number validation in the single-rms folder. Use when orchestrating parallel packing list test data generation.'
tools: ['search/codebase', 'edit/editFiles', 'read/problems']
user-invocable: false
---

# Single RMS Test Scenarios

> **Context received from orchestrator:**
>
> - `manifestPath`: Path to the confirmed `manifest.json` (e.g., `src/packing-lists/{exporter}/test-scenarios/manifest.json`)
> - `happyPathFile`: Path to the happy path sample file
> - `exporterProperty`: The exporter property name (e.g., 'BOOKER2', 'ASDA1')
>
> Read `manifest.json` at the provided path before starting — it contains the confirmed field/column mappings, establishment number pattern, header row locations, and file format details needed for all mutations.

> **Shared guidelines**: Load [generate-test-data-shared-guidelines.md](../prompts/models/generate-test-data-from-sample/generate-test-data-shared-guidelines.md) before applying mutations. It is the source of truth for field classification, blanket-field handling, common mutation scope, file format, outcome verification, and integrity requirements.

**Important**: These scenarios cover representative RMS outcomes: valid variations, a non-GB number, malformed formats, missing RMS, and multiple distinct GB RMS numbers. Use the full parser-discovery and validation flow to determine outcomes; direct parser invocation can produce a different result.

## Scenarios

- **RMSHasWrongFinal3DigitsShould_Pass**: Change the last 3 digits of the RMS number (e.g. RMS-GB-000015-666)
- **LowercaseEstablishmentNumber_Pass**: Use lowercase (e.g. rms-gb-000015-010)
- **MultipleGBEstablishmentNumbersWithValid_InvalidLength_Pass**: Use two RMS numbers, one valid, one with invalid length (e.g. RMS-GB-000015-7865432,RMS-GB-000015-010)
- **DifferentCountryEstablishmentNumbersIncludingGB_Pass**: Use two RMS numbers, one with a different country code, one GB (e.g. RMS-US-000015-010,RMS-GB-000015-010)
- **DifferentCountryEstablishmentNumbersExcludesGB_Fail**: Use only a non-GB RMS number (e.g. RMS-US-000015-010); this does not satisfy the GB RMS requirement
- **RMSHasWrongMiddle6DigitsShouldBe_Unparse**: Change the middle 6 digits (e.g. RMS-GB-234515-010)
- **InvalidEstablishmentFormats_Fail**: Remove all hyphens (e.g. RMSGB000015010)
- **Multipledifferent_Establishment_Numbers_Fail**: Use two different valid RMS numbers (e.g. RMS-GB-000015-010,RMS-GB-000015-211)
- **RMSWith7DigitsShould_Fail**: Use 7 digits at the end (e.g. RMS-GB-000015-7865432)
- **Empty_RMS_Fail**: Remove the RMS number entirely (all data rows blank)

Generate each scenario above. Scenario suffixes describe the expected outcome when the generated file is processed through parser discovery and validation; verify the result for the supplied exporter before naming the file.

## Mutation Scope Guidelines

- Modify only establishment-number locations needed for the scenario; leave unrelated data unchanged.
- **One RMS value per sheet/document**: Modify the mapped RMS location once.
- **RMS repeated per row/item**: For a scenario representing one RMS value, apply the same mutation to every mapped RMS occurrence, including any header/company occurrence identified in the manifest. Do not leave a mixture of original and mutated values.
- **Mixed valid/invalid-length or mixed-country scenarios**: Keep a valid GB RMS in all mapped locations, then change only the scenario's named location to the invalid-length or non-GB value.
- **Multiple RMS scenario**: Use the minimum mapped locations needed to create exactly two distinct valid GB RMS values. Preserve other occurrences unless they would introduce another distinct value or invalidate the intended case.
- **PDF-specific targeting**: Use a supported PDF mutation tool and mutate the RMS text in mapped coordinate regions. If RMS appears in multiple page locations, mutate only the scenario-required locations and leave other regions unchanged.
