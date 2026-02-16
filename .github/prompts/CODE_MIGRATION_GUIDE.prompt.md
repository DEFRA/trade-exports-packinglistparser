# Code Migration Guide

This guide documents the process for migrating code from the legacy trade-exportscore-plp repository into this project while maintaining consistency with existing code standards.

## Migration Checklist

### 1. Module System Conversion

#### Convert CommonJS to ES6 Modules

**Imports:**

- Replace `const foo = require('path')` with `import foo from 'path'`
- Replace `const { bar } = require('path')` with `import { bar } from 'path'`
- Replace `const foo = require('node:path')` with `import foo from 'node:path'`
- Always add `.js` extension to relative imports: `'./file'` → `'./file.js'`

**Exports:**

- Replace `module.exports = { foo, bar }` with `export { foo, bar }`
- Replace `module.exports = foo` with `export default foo`

**File path handling:**

```javascript
// Old (CommonJS)
const path = require('path')
const filename = path.join('app', __filename.split('app')[1])

// New (ES6)
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])
```

#### Update Commented Code

Don't forget to update commented-out require statements to use import syntax:

```javascript
// Old
// const parser = require('./parser')

// New
// import parser from './parser.js'
```

### 2. Logger Integration

Replace any migrated logger with the project's existing logger:

```javascript
// ✓ CORRECT - Use project logger with full path
import { createLogger } from '../common/helpers/logging/logger.js' // Note: /logger.js at end
const logger = createLogger()

// ✗ WRONG - Missing /logger.js or wrong path
import { createLogger } from '../common/helpers/logging.js' // Missing /logger.js
import logger from '../utilities/logger.js' // Wrong file entirely
```

**Critical Path Note:** The logger is at `logging/logger.js`, not just `logging.js`. This is a common source of import errors.

**Update logging calls:**

```javascript
// Old style (legacy)
logger.logInfo(filename, 'functionName', 'message')
logger.logError(filename, 'functionName', error)

// New style (pino) - Simple version
logger.info('message')
logger.error('Error occurred')

// New style (pino) - With metadata
logger.info({ filename, function: 'functionName' }, 'message')

// New style (pino) - Errors using formatError helper
import { formatError } from '../common/helpers/logging/error-logger.js'

logger.error(formatError(error), 'Error message')

// With additional context
logger.error(
  {
    ...formatError(error),
    filename,
    function: 'functionName'
  },
  'Error message'
)
```

**Error Logging Pattern:**

- Use `formatError()` helper for ECS-compliant error formatting
- `formatError()` automatically includes:
  - `error.message`
  - `error.stack_trace` (from error.stack)
  - `error.type` (from error.name)
- Spread `...formatError(error)` to add additional context fields
- Never manually construct error objects

### 3. Naming Conventions

#### Variable Names

- Remove double underscores: `__filename` → `currentFilename`
- Use camelCase for all variables
- Avoid single-letter names except in short loops

#### Path References

- Replace `'app'` references with `'src'` for this project:

```javascript
// Old
const filename = path.join('app', __filename.split('app')[1])

// New
const filename = path.join('src', currentFilename.split('src')[1])
```

### 4. Documentation Standards

#### Remove Step Numbers

Remove references to "Step X" from comments:

```javascript
// Old
/**
 * Step 5: Find parser for packing list
 * Step 6: Extract data
 */

// New
/**
 * Find parser for packing list and extract data
 */
```

#### Comment Style

- Keep comments concise and descriptive
- Focus on "what" and "why", not "how" (code shows how)
- Update JSDoc to match actual implementation

### 5. Test Constants

When migrating parser-service integration tests, use shared test constants instead of creating local variables:

**Import Test Constants:**

```javascript
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'
```

**Use in Tests:**

```javascript
test("returns 'No Match' for incorrect file extension", async () => {
  // Use both INVALID_FILENAME and NO_MATCH_RESULT constants
  const result = await parserService.findParser(
    model.validModel,
    INVALID_FILENAME
  )
  expect(result).toMatchObject(NO_MATCH_RESULT)
})
```

**❌ AVOID - Local variables and duplication:**

```javascript
// DON'T create local variables that duplicate test constants
const filename = 'packinglist-model1.xlsx' // Higher scope
test('...', async () => {
  const filename = 'packinglist.wrong' // Shadowing - confusing!
  const invalidTestResult_NoMatch = {
    // Duplicates NO_MATCH_RESULT
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NOMATCH
  }
  const result = await findParser(model.validModel, filename)
  expect(result).toMatchObject(invalidTestResult_NoMatch)
})
```

**✓ CORRECT - Use shared constants:**

```javascript
// Import and use shared constants
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'

const filename = 'packinglist-model1.xlsx' // Higher scope - no shadowing
test('...', async () => {
  // Use constants - clear, maintainable, no duplication
  const result = await findParser(model.validModel, INVALID_FILENAME)
  expect(result).toMatchObject(NO_MATCH_RESULT)
})

test('validation errors with summary', async () => {
  const result = await findParser(model.invalidModel, filename)
  // Use template literals instead of string concatenation
  expect(result.business_checks.failure_reasons).toBe(
    `${failureReasons.COO_MISSING} in sheet "Sheet1" row 2, sheet "Sheet1" row 3 ${ERROR_SUMMARY_TEXT} 1 other locations.\n`
  )
})
```

**Available Test Constants:**

- `INVALID_FILENAME` - `'packinglist.wrong'` - For testing parser matching failures
- `NO_MATCH_RESULT` - Expected result structure when no parser matches (includes `parserModel: parserModel.NOMATCH`)
- `ERROR_SUMMARY_TEXT` - `'in addition to'` - Text fragment used in validation error summaries when more than 3 errors occur

**String Formatting Best Practices:**

- **Always use template literals** (backticks) instead of string concatenation with `+`
- Template literals improve readability and avoid ESLint warnings
- Example: `` `${variable} text` `` instead of `variable + ' text'`

### 6. Post-Migration Cleanup

After migrating code, check for:

1. **Duplicate files** - Search for files with same name in different locations
2. **Unused imports** - Remove imports that aren't used
3. **Console statements** - Remove or replace with proper logging
4. **Hardcoded values** - Move to config where appropriate
5. **Error handling** - Ensure proper error handling with project logger
6. **Test constants** - Replace local test variables with shared constants from `test/test-constants.js`

### 6. Migration Command Reference

```bash
# Find files using old CommonJS syntax
grep -r "require(" src/

# Find files with module.exports
grep -r "module.exports" src/

# Find references to old logger
grep -r "logInfo\|logError\|logWarn" src/

# Find step references in comments
grep -r "Step [0-9]" src/

# Find __filename usage (should be currentFilename)
grep -r "__filename" src/

# Find 'app' path references (should be 'src')
grep -r "join('app'" src/
```

## Example Migration

### Before (CommonJS, old project)

```javascript
const path = require('path')
const logger = require('../utilities/logger')
const { parseData } = require('./parser')

const filename = path.join('app', __filename.split('app')[1])

/**
 * Step 4: Process the data
 */
function processData(data) {
  logger.logInfo(filename, 'processData', 'Processing started')
  return parseData(data)
}

module.exports = { processData }
```

### After (ES6, this project)

```javascript
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createLogger } from '../common/helpers/logging/logger.js'
import { parseData } from './parser.js'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Process the data
 */
function processData(data) {
  logger.info({ filename, function: 'processData' }, 'Processing started')
  return parseData(data)
}

export { processData }
```

## Verification Steps

After migration:

1. **Syntax Check**: Run linter to catch any syntax issues

   ```bash
   npm run lint
   ```

2. **Search for Issues**: Use the command reference above to search for common issues

3. **Test Imports**: Ensure all imports resolve correctly

4. **Check Duplicates**: Verify no duplicate files exist

   ```bash
   find src -name "*.js" | sort | uniq -d
   ```

5. **Review Documentation**: Update any related documentation

## Common Pitfalls

1. **Missing .js extensions** - ES6 modules require explicit extensions
2. **Mixed export styles** - Don't mix `export default` and `export {}` inappropriately
3. **Forgot to update import paths** - Check both working code and commented examples
4. **Logger calls** - Remember to update the call signature for pino
5. **File path construction** - Use `src` not `app` for this project

## Migrating Data Files

### JSON Data Files (ISO Codes, Ineligible Items)

When migrating static JSON data files from the legacy repository:

#### 1. **Locate Source Files**

In legacy repository (`trade-exportscore-plp`):

- ISO Codes: `app/services/data/data-iso-codes.json`
- Prohibited Items: `app/services/data/data-prohibited-items.json`
- Versioned Files: `app/services/data/data-prohibited-items/` (8 versioned files)

#### 2. **Destination in New Project**

Copy to (with renaming):

- ISO Codes: `src/services/data/data-iso-codes.json`
- Prohibited Items → Ineligible Items: `src/services/data/data-ineligible-items.json`
- Versioned Files: `src/services/data/data-ineligible-items/` (rename from prohibited to ineligible)

**Note:** The legacy repository uses "prohibited-items" but this project uses "ineligible-items" for consistency. Rename during migration:

```bash
# Copy and rename main file
cp app/services/data/data-prohibited-items.json src/services/data/data-ineligible-items.json

# Copy and rename versioned folder
cp -r app/services/data/data-prohibited-items src/services/data/data-ineligible-items

# Rename versioned files
cd src/services/data/data-ineligible-items
for file in data-prohibited-items.*.json; do
  mv "$file" "$(echo $file | sed 's/prohibited/ineligible/')";
done
```

#### 3. **Update Import Statements**

**Old (CommonJS):**

```javascript
const isoCodesData = require('../data/data-iso-codes.json')
const ineligibleItemsData = require('../data/data-ineligible-items.json')
```

**New (ES6):**

```javascript
import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }
import ineligibleItemsData from '../data/data-ineligible-items.json' with { type: 'json' }
```

#### 4. **Data File Formats**

**ISO Codes** - Simple array of ISO 2-letter country codes:

```json
["GB", "US", "FR", "DE", "X"]
```

- Note: `"X"` is a special placeholder for unknown/unspecified origin

**Ineligible Items** - Array of objects with matching criteria:

```json
[
  {
    "country_of_origin": "RU",
    "commodity_code": "0201",
    "type_of_treatment": null
  },
  {
    "country_of_origin": "BY",
    "commodity_code": "0203",
    "type_of_treatment": "Processed"
  }
]
```

**Field Meanings:**

- `country_of_origin`: ISO 2-letter country code
- `commodity_code`: Prefix match (items starting with this code match)
- `type_of_treatment`:
  - `null` = matches any treatment or no treatment
  - `"Processed"` = matches specific treatment
  - `"!Processed"` = exception rule (NOT ineligible if treatment matches)

#### 5. **Usage Pattern**

When using these data files in validators:

```javascript
import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }
import ineligibleItemsData from '../data/data-ineligible-items.json' with { type: 'json' }

// Validate ISO code
function isValidIsoCode(code) {
  if (!code || typeof code !== 'string') {
    return false
  }
  const normalizedCode = code.toLowerCase().trim()
  return isoCodesData.some(
    (isoCode) => isoCode.toLowerCase() === normalizedCode
  )
}

// Check ineligible items
function isIneligibleItem(countryOfOrigin, commodityCode, typeOfTreatment) {
  const matchingEntries = ineligibleItemsData.filter(
    (item) =>
      isCountryMatching(countryOfOrigin, item.country_of_origin) &&
      commodityCode
        .toString()
        .toLowerCase()
        .startsWith(item.commodity_code?.toLowerCase())
  )
  // ... additional logic for treatment matching
}
```

#### 6. **Versioned Files**

The legacy repository contains versioned prohibited items files in a subdirectory:

- `data-prohibited-items/data-prohibited-items.v1.3.json`
- `data-prohibited-items/data-prohibited-items.v1.4.json`
- ... through v2.0

These represent historic snapshots for audit/compliance purposes. When migrating:

1. Copy entire folder with recursive flag
2. Rename folder from `data-prohibited-items` to `data-ineligible-items`
3. Rename all versioned files to use "ineligible" instead of "prohibited"
4. Document version history in README.md

**Current Usage:** These versioned files are not currently used in validation logic but should be preserved for future historic/audit functionality.

#### 7. **Migration Checklist for Data Files**

- [ ] Copy JSON files from `app/services/data/` to `src/services/data/`
- [ ] Copy versioned folder recursively
- [ ] Rename "prohibited-items" to "ineligible-items" in all files/folders
- [ ] Update all `require()` statements to `import` with JSON assertion
- [ ] Update relative paths from `../data/` as needed
- [ ] Preserve exact data format and structure
- [ ] Do not modify data content unless updating business rules
- [ ] Create README.md in data folder documenting file purposes
- [ ] Document all versioned files with line counts
- [ ] Update any related tests to use new import syntax

## Migrating Test Files

### Test File Location Strategy

Tests should be co-located with the code they test:

**Legacy Location:**

```
trade-exportscore-plp/test/unit/utilities/regex.test.js
```

**New Location:**

```
trade-exports-packinglistparser/src/utilities/regex.test.js
```

**Placement Rules:**

- Place test files in the same directory as the code they test
- Name test files: `{filename}.test.js` (matches the source file name)
- For utilities: `src/utilities/*.test.js`
- For services: `src/services/{service-name}/*.test.js`
- For validators: `src/services/validators/*.test.js`

### Test Framework Conversion (Jest → Vitest)

#### 1. **Import Changes**

**Old (Jest):**

```javascript
// No imports needed - Jest globals
describe('test suite', () => {
  test('should work', () => {
    expect(foo).toBe(bar)
  })
})
```

**New (Vitest):**

```javascript
import { describe, it, expect } from 'vitest'

describe('test suite', () => {
  it('should work', () => {
    expect(foo).toBe(bar)
  })
})
```

**Additional Vitest imports when needed:**

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
```

#### 2. **Test Function Naming**

Replace `test()` with `it()`:

```javascript
// Old (Jest)
test('should return true', () => {
  expect(foo()).toBe(true)
})

test.each([...])('parameterized test', (input, expected) => {
  expect(foo(input)).toBe(expected)
})

// New (Vitest)
it('should return true', () => {
  expect(foo()).toBe(true)
})

it.each([...])('parameterized test', (input, expected) => {
  expect(foo(input)).toBe(expected)
})
```

#### 3. **Mocking Syntax**

**Module Mocks:**

```javascript
// Old (Jest)
jest.mock('../data/data-iso-codes.json', () => ({
  default: ['GB', 'US', 'FR']
}))

// New (Vitest)
vi.mock('../data/data-iso-codes.json', () => ({
  default: ['GB', 'US', 'FR']
}))
```

**Important for JSON files:**

- Mock JSON imports when using test fixtures
- Use `default` key for default exports
- Keep mock data structure identical to real data

**Function Spies:**

```javascript
// Old (Jest)
const mockFn = jest.fn()
jest.spyOn(object, 'method')

// New (Vitest)
const mockFn = vi.fn()
vi.spyOn(object, 'method')
```

#### 4. **Update Source Code Imports**

**Old (CommonJS):**

```javascript
const fileExtension = require('../../../app/utilities/file-extension')
const { rowFinder } = require('../../../app/utilities/row-finder')
```

**New (ES6 Modules):**

```javascript
import { matches, isExcel } from './file-extension.js'
import { rowFinder } from './row-finder.js'
```

**Key Changes:**

- Use relative path to file in same directory (`./` not `../../../app/`)
- Use named imports `{ foo }` instead of entire module
- Always include `.js` extension
- Tests are co-located, so paths are simpler

#### 5. **Assertion API Compatibility**

Most Jest assertions work in Vitest:

```javascript
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(fn).toThrow()
expect(array).toStrictEqual([...])
```

**Note:** `toStrictEqual` preferred over `toEqual` for arrays/objects

#### 6. **Legacy Implementation Preservation**

**Critical:** The legacy tests document proven, working behavior. When tests fail after migration:

1. **First check the implementation**, not the test
2. Compare implementation against legacy code
3. Legacy behavior is correct unless explicitly changing business logic
4. Fix implementation to match legacy, not test to match new implementation

**Example Issue:**

```javascript
// Test expects: null for invalid JSON
// Current implementation returns: original string

// ❌ Wrong: Change test to expect string
// ✓ Correct: Change implementation to return null (match legacy)
```

### Complete Migration Example

**Legacy Test File:** `test/unit/utilities/regex.test.js`

```javascript
const regex = require('../../../app/utilities/regex')

describe('test function', () => {
  test('should return true when regex matches', () => {
    const array = [{ name: 'John Doe' }]
    expect(regex.test('John', array)).toBe(true)
  })

  test.each([
    ['John', true],
    ['Jane', false]
  ])('test(%s) should return %s', (input, expected) => {
    const array = [{ name: 'John Doe' }]
    expect(regex.test(input, array)).toBe(expected)
  })
})
```

**Migrated Test File:** `src/utilities/regex.test.js`

```javascript
import { describe, it, expect } from 'vitest'
import { test } from './regex.js'

describe('test function', () => {
  it('should return true when regex matches', () => {
    const array = [{ name: 'John Doe' }]
    expect(test('John', array)).toBe(true)
  })

  it.each([
    ['John', true],
    ['Jane', false]
  ])('test(%s) should return %s', (input, expected) => {
    const array = [{ name: 'John Doe' }]
    expect(test(input, array)).toBe(expected)
  })
})
```

### Test Migration Workflow

1. **Locate Test File**

   ```bash
   find /path/to/legacy/repo/test/unit -name "*.test.js"
   ```

2. **Read Legacy Test**

   ```bash
   cat /path/to/legacy/repo/test/unit/utilities/regex.test.js
   ```

3. **Create New Test File** (co-located with source)

   ```bash
   touch src/utilities/regex.test.js
   ```

4. **Convert Test Content:**

   - Add Vitest imports
   - Change `test()` to `it()`
   - Update module imports (CommonJS → ES6)
   - Fix import paths (relative to same directory)
   - Change `jest` to `vi` in mocks
   - Add `.js` extensions to all imports

5. **Run Tests**

   ```bash
   npm test -- src/utilities/regex.test.js
   ```

6. **Fix Failures:**

   - If tests fail, check implementation against legacy
   - Update implementation to match legacy behavior
   - Only update tests if legacy test was incorrect
   - Document any intentional behavior changes

7. **Verify All Tests Pass**
   ```bash
   npm test
   ```

### Test Migration Checklist

- [ ] Locate test file in legacy `test/unit/` structure
- [ ] Identify corresponding source file in new project
- [ ] Create test file in same directory as source file
- [ ] Add Vitest imports: `import { describe, it, expect } from 'vitest'`
- [ ] Convert all `test()` to `it()`
- [ ] Convert all `require()` to `import` with `.js` extensions
- [ ] Update import paths to be relative to same directory
- [ ] Replace `jest.fn()` with `vi.fn()` if used
- [ ] Replace `jest.mock()` with `vi.mock()` if used
- [ ] Run tests and verify they pass
- [ ] If tests fail, compare implementation against legacy
- [ ] Update implementation (not tests) to match legacy behavior
- [ ] Document any missing functions/exports that need to be added
- [ ] Verify test coverage matches or exceeds legacy

### Common Test Migration Issues

1. **Missing Exports**

   - Error: `(0, foo) is not a function`
   - Solution: Add missing function to export statement

2. **Wrong Import Path**

   - Error: `Cannot find module './foo'`
   - Solution: Add `.js` extension or fix relative path

3. **Mock Not Working**

   - Error: Mock data not being used
   - Solution: Check mock structure matches expected format (e.g., `default` key)

4. **Test Expects Different Behavior**

   - Error: `expected X to be Y`
   - Solution: Check legacy implementation, update current code to match

5. **Implementation Missing Features**
   - Error: Function behavior doesn't match test expectations
   - Solution: Add missing helper functions or logic from legacy

### Testing Best Practices

1. **Keep Tests With Code** - Co-location makes maintenance easier
2. **Preserve Legacy Behavior** - Tests document working implementation
3. **Match Legacy Test Structure** - Same describe/it hierarchy
4. **Use Descriptive Test Names** - Copy from legacy when clear
5. **Test Edge Cases** - Legacy tests often have valuable edge case coverage
6. **Run Tests Frequently** - Run after each change to catch issues early

## Questions or Issues?

If you encounter patterns not covered in this guide, document them here for future reference.
