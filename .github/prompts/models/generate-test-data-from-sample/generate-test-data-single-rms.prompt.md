---
description: 'Generate test data scenarios for establishment number validation in the single-rms folder. Strictly follow the scenario list and mutation instructions below.'
agent: agent
---

# Single RMS Test Scenarios

_Follow the generic instructions in `generate-test-data-from-sample.prompt.md` for folder creation, copying, and mutation steps._

**Important**: When corrupting RMS establishment numbers in these scenarios, use specific patterns to test validation. The scenarios below include examples with special characters, alphanumeric values, and invalid numeric patterns.

## Scenarios

- **Happypath**: No mutation; copy the original happy path file.
- **RMSHasWrongFinal3DigitsShould_Pass**: Change the last 3 digits of the RMS number (e.g. RMS-GB-000015-666)
- **LowercaseAndMalformedPrefixInEstablishmentNumber_Pass**: Use lowercase and malformed prefix (e.g. rms-gb-000015-010)
- **MixedCaseEstablishmentNumberFormat_Pass**: Use mixed case (e.g. Rms-Gb-000015-010)
- **MultipleGBEstablishmentNumbersWithValid_InvalidLength_Pass**: Use two RMS numbers, one valid, one with invalid length (e.g. RMS-GB-000015-7865432,RMS-GB-000015-010)
- **DifferentCountryEstablishmentNumbersIncludingGB_Pass**: Use two RMS numbers, one with a different country code, one GB (e.g. RMS-US-000015-010,RMS-GB-000015-010)
- **DifferentCountryEstablishmentNumbersexcludesGB_Pass**: Use only a non-GB RMS number (e.g. RMS-US-000015-010)
- **MixedValidAndInvalidEstablishmentFormats_Pass**: Use one valid and one invalid format (e.g. RMSGB000015010,RMS-GB-000015-010)
- **RMSHasWrongMiddle6DigitsShouldBe_Unparse**: Change the middle 6 digits (e.g. RMS-GB-234515-010)
- **InvalidFormat_RmsGb_000000_000_Unparse**: Use all zeros (e.g. RMS-GB-000000-000)
- **RMSHasWrongRegexWithAdditionalHyphenShouldBe_Fail**: Double the hyphens (e.g. RMS--GB--000015--010)
- **InvalidEstablishmentFormats_Fail**: Remove all hyphens (e.g. RMSGB000015010)
- **Malformed_RMS_Number_Fail**: Add -extra to the end (e.g. RMS-GB-000015-010-extra)
- **Multipledifferent_Establishment_Numbers_Fail**: Use two different valid RMS numbers (e.g. RMS-GB-000015-010,RMS-GB-000015-211)
- **RMSWithExtraDashBeforeEstablishmentNumberShould_Fail**: Add an extra dash at the start (e.g. -RMS-GB-000015-010)
- **RMSWith7DigitsShould_Fail**: Use 7 digits at the end (e.g. RMS-GB-000015-7865432)
- **InvalidPrefixInEstablishmentNumber_Fail**: Use an invalid prefix (e.g. ARMS-GB-000015-010)
- **MalformedCountryCodeInEstablishmentNumber_Fail**: Use malformed country code (e.g. RMS-AGB-000015-010)
- **NonNumericAttheEndOfRMS_Fail**: Use non-numeric characters at the end including special characters and alphanumeric patterns (e.g. `RMS-GB-000015-aaa`, `RMS-GB-000015-@@@`, `RMS-GB-000015-ABC`, `RMS-GB-000015-A1B`, `RMS-GB-000015-#!@`, `RMS-GB-000015-1A2`)
- **TC_InvalidFormat_WithSpacesAndHyphens_Fail**: Add spaces, special characters, and alphanumeric corruption (e.g. `RMS - G B - 00 0014-010`, `RMS - G B - 00 @014-010`, `R#S - G1 - 00 B014-0A0`, `RMS ! GB @ 00 #014-01$`)
- **Test_ValidInput_RmsGb_WithoutHyphens_Fail**: Remove all hyphens and spaces (e.g. RMSGB000014010)
- **Empty_RMS_Fail**: Remove the RMS number entirely (all data rows blank)
- **TC_InvalidFormat_RmsGb_15_10_Fail**: Use short format (e.g. RMS-GB-15-10)
- **RMSWithExtraDashEstablishmentNumberAtStartandEnd_Fail**: Add extra dash at start and end (e.g. -RMS-GB-000015-010-)

**You must generate and mutate all scenarios above.**

## Mutation Scope Guidelines

- **Standard scenarios**: Modify exactly **2-3 data rows** unless scenario specifies otherwise
- **Establishment number patterns**:
  - **Single per sheet**: Modify the single establishment number location (e.g., header/company area)
  - **Per row**: Modify exactly **2-3 data rows** with establishment number columns
- **"Multiple" scenarios**: Modify exactly **3 data rows** (minimum for "multiple")
- **Preserve remaining rows**: All other data rows should remain unchanged from the template
- **Do not modify all rows**: Only change the specified number of rows per scenario, not entire columns
- **Baseline scenario**: `Happypath` should remain completely unmodified
