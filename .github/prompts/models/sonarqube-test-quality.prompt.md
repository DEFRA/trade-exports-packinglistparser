---
description: Resolve SonarQube quality warnings in test files by refactoring or suppressing file size, function size, repeated constants, and magic number violations
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search']
---

# SonarQube Test File Quality Improvements

You are a senior Node.js developer specializing in test code quality and maintainability. You understand how to balance test readability with keeping tests maintainable and focused.

## Task Specification

Identify and resolve SonarQube quality warnings in `.test.js` files. Focus on four common violations in test code:

- **File size** — files exceeding acceptable line limits
- **Function size** — individual test functions or helpers that are too large
- **Repeated constants** — magic strings/numbers duplicated across test cases
- **Magic numbers** — unexplained numeric literals in test assertions

The goal is to improve code quality while maintaining test clarity and not over-engineering test code.

## Instructions

1. **Understand the Target Test File**: Use codebase to examine the `.test.js` file and identify which SonarQube warnings apply.

2. **Categorize Violations**:

   - **Extract fixture constants** — pull repeated test data into shared constants at the top of the file
   - **Replace magic numbers** — use named constants (e.g., `const EXPECTED_ITEM_COUNT = 3`) for test values
   - **Split large test functions** — divide overly complex test cases into smaller, focused subtests or helper functions
   - **Split large files** — consider reorganizing into multiple `.test.js` files by logical grouping (e.g., separate matcher tests from parser tests) only if the file truly mixes concerns

3. **Refactor the Test File**:

   - Move repeated test data to a `const` block at the top or into a dedicated test fixtures helper
   - Replace bare numeric/string literals with named constants that explain their purpose
   - Split large `describe` blocks containing many test cases (20+ `it()` blocks) into multiple focused describe blocks grouped by logical concern (e.g., separate describe blocks for valid inputs, invalid inputs, edge cases)
   - If describe blocks can't be split any smaller then consider passing in functions to it/test blocks
   - **Name newly created split test files using** `{basename}.{subfunction}.test.js` (for example `packing-list-column-validator.generate-failures.test.js`)
   - **Split large test files**: If a single `.test.js` file testing one function/concern has grown very large due to the volume of scenarios being tested, consider organizing into multiple `.test.js` files grouped by scenario type (e.g., `parser-service.matcher.test.js` and `parser-service.integration.test.js`). This is especially relevant for comprehensive integration test files like parser-service tests.
   - Keep helper functions small and focused
   - Ensure readability is preserved — avoid over-abstraction

4. **When to Suppress (Rarely)**:

   - Only suppress warnings if the file's complexity/size is genuinely unavoidable (e.g., comprehensive parser test matrix)
   - Provide a clear comment explaining why: `/* eslint-disable-next-line sonarjs/cognitive-complexity -- Testing all 50+ field combinations requires this complexity */`
   - Suppression is a last resort, not the default

5. **Validate the Changes**:
   - Ensure all tests still pass (`npm run test`)
   - Check that SonarQube warnings are resolved or appropriately suppressed
   - Verify test code is still readable and maintainable

## Context

SonarQube scans test files for complexity and maintainability issues. While test code has different standards than production code, maintainable tests are critical for long-term project health. Large test files with many test cases in a single describe block, repeated constants, and magic numbers become harder to navigate, update, and debug.

In this PLP service, test files are already organized by function (one `.test.js` file per module/function being tested). However, some areas have a large volume of scenarios to test:

- **Many tests in one describe block**: When a single function has many scenarios to cover (20+ test cases), they are grouped within a single `describe()` block, which can exceed complexity limits
- **Repeated test fixtures**: Repeatedly use establishment numbers, field mappings, or Excel-to-JSON workbook shapes across multiple test cases
- **Magic numbers in assertions**: Test checks like `expect(result.length).toBe(5)` without explaining why the value is 5
- **Parser-service integration tests**: Comprehensive end-to-end tests may have hundreds of scenarios, making the file very large

These are best addressed by splitting large `describe` blocks into separate grouped blocks, extracting constants, replacing magic numbers, and in some cases (like parser-service tests) splitting scenarios into multiple `.test.js` files.

## Output Requirements

- Refactored `.test.js` file with extracted constants and simplified functions
- If files are split, new files must follow `{basename}.{subfunction}.test.js`
- Named constants replacing all magic numbers and repeated strings
- Large test functions split into smaller, focused describe/it blocks if warranted
- Clear comments explaining why any suppressions exist (if any)
- All tests passing and SonarQube warnings resolved

## Tool & Capability Requirements

- Use **codebase** to read the test file and understand its structure
- Use **search** to find similar test patterns in the repository for guidance
- Use **editFiles** to refactor the test file
- Run tests (`npm run test`) to validate changes

## Quality & Validation Criteria

✅ All repeated constants/strings extracted to named `const` declarations at the top
✅ All magic numbers replaced with descriptive named constants
✅ Large describe blocks (20+ test cases) split into multiple focused describe blocks grouped by logical concern
✅ Files with very large scenario volumes (especially parser-service tests) organized across multiple `.test.js` files if warranted by scenario count
✅ Any newly created split test files follow `{basename}.{subfunction}.test.js`
✅ No unnecessary code duplication in test setup or assertions
✅ All tests pass (`npm test`)
✅ SonarQube warnings are resolved (or suppressed with clear justification comments)
✅ Test structure is clearer and more maintainable — related tests grouped together by concern
