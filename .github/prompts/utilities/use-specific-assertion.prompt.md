---
description: Upgrade generic Vitest assertions to the most specific semantically correct matcher without changing test behavior
agent: agent
tools: ['search/codebase', 'edit/editFiles', 'search', 'runCommands']
---

# Use Specific Vitest Assertions

You are improving Vitest unit tests in a Node.js repository.

## Goal

Replace generic assertions with the most specific, semantically correct Vitest matcher, without changing behavior.

## Constraints

1. Only edit test files (`*.test.js`, `*.spec.js`).
2. Keep changes minimal and safe; do not refactor unrelated code.
3. Preserve test intent, names, and comments.
4. Prefer matcher specificity for SonarCloud compliance.
5. If a replacement could change semantics, skip it and report it.
6. After edits, run tests and report:
   - files changed
   - total assertions upgraded
   - conversion counts by matcher type
   - test results

## Matcher Upgrade Rules

Apply these only when semantics are equivalent.

1. Length checks:

   - `expect(x.length).toBe(n)`
   - `expect(x.length).toEqual(n)`
   - `expect(x.length).toStrictEqual(n)`
   - Convert to: `expect(x).toHaveLength(n)`

2. Null and undefined checks:

   - `expect(x).toBe(null)` => `expect(x).toBeNull()`
   - `expect(x).toEqual(null)` => `expect(x).toBeNull()`
   - `expect(x).toBe(undefined)` => `expect(x).toBeUndefined()`
   - `expect(x).toEqual(undefined)` => `expect(x).toBeUndefined()`
   - `expect(x).not.toBe(undefined)` => `expect(x).toBeDefined()`

3. Boolean and truthy/falsy checks:

   - `expect(x).toBe(true)` where `x` is clearly boolean => keep as-is
   - `expect(x).toEqual(true)` where `x` is clearly boolean => `expect(x).toBe(true)`
   - `expect(x).toBe(false)` where `x` is clearly boolean => keep as-is
   - `expect(x).toEqual(false)` where `x` is clearly boolean => `expect(x).toBe(false)`
   - `expect(x).toBe(true/false)` where `x` is not clearly boolean => consider `toBeTruthy()` or `toBeFalsy()` only when intent is truthiness/falsiness; otherwise skip and report

4. Presence and containment:

   - `expect(arr.includes(v)).toBe(true)` => `expect(arr).toContain(v)`
   - `expect(str.includes(substr)).toBe(true)` => `expect(str).toContain(substr)`
   - `expect(obj.hasOwnProperty(k)).toBe(true)` => `expect(obj).toHaveProperty(k)`
   - `expect(map.has(k)).toBe(true)` => keep as-is (`toContain` is not equivalent for `Map` keys)

5. Numeric comparisons:

   - `expect(a > b).toBe(true)` => `expect(a).toBeGreaterThan(b)`
   - `expect(a >= b).toBe(true)` => `expect(a).toBeGreaterThanOrEqual(b)`
   - `expect(a < b).toBe(true)` => `expect(a).toBeLessThan(b)`
   - `expect(a <= b).toBe(true)` => `expect(a).toBeLessThanOrEqual(b)`

6. Type checks:

   - `expect(typeof x).toBe('string')` => convert only if an equally clear and safe matcher is available; otherwise keep and report
   - `expect(Array.isArray(x)).toBe(true)` => convert only when safe; otherwise keep and report

7. Equality strictness:
   - Prefer `toStrictEqual` over `toEqual` only when strict structural equality is clearly intended and currently tested loosely.
   - Do not globally replace `toEqual` with `toStrictEqual`.

## Execution Process

1. Scan tests for generic assertion patterns.
2. Apply only safe, semantics-preserving upgrades.
3. Run the full test suite.
4. Produce a concise migration report with examples of before and after, and list skipped ambiguous cases.

## Output Requirements

- Updated test files with matcher-specific assertions.
- No unrelated refactors.
- Tests remain green.
- A summary report including:
  - files changed
  - total assertions upgraded
  - matcher conversion breakdown
  - skipped patterns with rationale
