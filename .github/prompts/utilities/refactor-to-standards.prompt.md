---
description: Audit selected code against Defra standards and produce a prioritised refactor plan
---

# Refactor to Standards

Audit the selected file or directory against Defra software development standards. Produce a prioritised findings report with remediation steps.

Do not make any code changes yet — produce the audit report first, so the team can review and prioritise before work begins.

## What to check

### Security (always check these first)

- Secrets, API keys, or tokens hard-coded in the file
- User input used without validation
- SQL queries built with string concatenation
- PII appearing in log statements (names, emails, addresses, NI numbers, bank details)
- `eval()` or `new Function()` with dynamic input
- File paths constructed from user input without sanitisation

### Defra coding standards

- `var` used instead of `const` or `let`
- Callbacks used instead of `async/await`
- Raw `.then()` chains instead of `await`
- `process.env` accessed directly outside the config module
- `console.log` used instead of the project logger
- Magic numbers or strings — values not assigned to named constants
- Functions longer than 30 lines without a clear reason
- Commented-out code blocks

### Dependencies

- Discouraged libraries in use: `express`, `mongoose`, `moment`, `lodash`, `request`, `axios`, `@hapi/joi`
- Dependencies without a declared purpose
- Dependencies with known vulnerabilities (check `npm audit` output)

### Architecture

- Business logic inside a route handler (should be in a service module)
- Database queries in a route handler or controller
- Shared utility code duplicated across files
- Circular dependencies between modules

### Test coverage

- No corresponding test file for this module
- Exported functions without test coverage
- Tests that only test the happy path (missing error cases)

### Documentation

- Exported functions without JSDoc (JavaScript) or XML doc comments (C#)
- README not updated after setup or configuration changes
- No ADR for significant architectural decisions

## Output format

Produce a report in this structure:

```markdown
# Standards Audit — [filename or directory]

## Summary

[One paragraph describing what this file does and its overall standards compliance.
State clearly whether it is broadly compliant or needs significant work.]

## Findings

### Critical — fix before next release

| #   | Finding            | Location | Remediation                                  |
| --- | ------------------ | -------- | -------------------------------------------- |
| 1   | Hard-coded API key | Line 12  | Move to environment variable; rotate the key |

### High — fix in next sprint

| #   | Finding | Location | Remediation |
| --- | ------- | -------- | ----------- |

### Medium — schedule for backlog

| #   | Finding | Location | Remediation |
| --- | ------- | -------- | ----------- |

### Low — nice to have

| #   | Finding | Location | Remediation |
| --- | ------- | -------- | ----------- |

## Recommended fix order

1. [Most impactful fix — usually any Critical security findings]
2. [Next most impactful]
3. ...

## Estimated effort

[Brief assessment of whether this is a quick tidy-up or needs a dedicated sprint]
```

## After the report

Once the team has reviewed and agreed the priorities, use `@defra-app-developer` to implement the fixes in order of severity, starting with Critical findings.
