---
description: Refactor duplicated Vitest tests into clear table-driven parameterized tests while preserving behavior
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search', 'runCommands']
---

Act as a senior JavaScript test refactoring engineer working in a Node.js + Vitest codebase.

Goal:
Fix Sonar and maintainability issues where multiple tests can be replaced by a parameterized test.

Scope:
TARGET_PATH = <file or folder path>

Problem definition:
Identify clusters of duplicated tests where the test body, setup pattern, and assertion logic are equivalent, but inputs and expected outputs vary.

What to do:

1. Scan TARGET_PATH for repeated test clusters with at least 3 tests.
2. Convert suitable clusters into table-driven tests using test.each or it.each.
3. Preserve behavior exactly:

- Keep all original scenarios and expected outcomes.
- Keep error-path and special-case tests standalone if parameterization would reduce clarity.

4. Keep changes minimal and focused on duplication reduction.
5. Do not modify production code unless required for test correctness.
6. Keep readable failure output:

- Include descriptive case labels in each parameter row.
- Ensure failing rows are easy to identify from test output.

7. Avoid over-parameterization:

- Only parameterize when structure and assertion intent are consistent.
- Do not merge logically different behaviors into one table.

8. Maintain existing project style and naming conventions.

Refactoring decision rules:

- Parameterize only when a duplicated cluster has at least 3 tests and differs mainly by data values.
- Do not parameterize when tests require different setup/teardown/mocks that would make the table hard to understand.
- Prefer several small parameterized blocks over one large unreadable block.

Validation steps:

1. Run targeted tests for all changed files.
2. Run lint checks.
3. Run full test suite when feasible.

Output format:

1. Files changed.
2. For each file:

- Clusters parameterized (with count of tests merged).
- Reason it was safe to parameterize.
- Any clusters intentionally left as standalone tests and why.

3. Validation results:

- Targeted tests.
- Lint.
- Full suite (or reason not run).

4. Residual duplication candidates, if any.

Success criteria:

- No behavior regressions.
- Lower duplication.
- Improved readability and maintainability.
- Clear, debuggable test output.
