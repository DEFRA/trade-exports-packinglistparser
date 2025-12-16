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
// Remove any imported logger utility
// import logger from '../utilities/logger.js'  ❌

// Use project logger instead
import { createLogger } from '../common/helpers/logging/logger.js'  ✓
const logger = createLogger()
```

**Update logging calls:**

```javascript
// Old style
logger.logInfo(filename, 'functionName', 'message')
logger.logError(filename, 'functionName', error)

// New style (pino)
logger.info({ filename, function: 'functionName' }, 'message')
logger.error({ filename, function: 'functionName', err: error }, 'message')
```

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

### 5. Post-Migration Cleanup

After migrating code, check for:

1. **Duplicate files** - Search for files with same name in different locations
2. **Unused imports** - Remove imports that aren't used
3. **Console statements** - Remove or replace with proper logging
4. **Hardcoded values** - Move to config where appropriate
5. **Error handling** - Ensure proper error handling with project logger

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

## Questions or Issues?

If you encounter patterns not covered in this guide, document them here for future reference.
