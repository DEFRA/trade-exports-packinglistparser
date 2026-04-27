---
description: Generate PDF test data with true in-place content stream mutations for integration testing
---

# PDF Test Data Generation Skill

> **Use this skill when**: Generating PDF test data files where the app's PDF parser must see mutated content (not just visual overlays), particularly for scenarios requiring authentic field mutations for parsing validation.

## Two Approaches: In-Place Stream Mutation vs. Overlay

### Approach 1: True In-Place Content Stream Mutation (Recommended for Test Data)

**When to use**: When you need authentic PDF mutations that the app will actually parse (not visual overlays).

Use `muhammara` library with low-level content stream replacement for true in-place edits:

> **Install**: `npm install --save-dev muhammara`

```javascript
import muhammara from 'muhammara'
import zlib from 'node:zlib'
import { readFileSync } from 'node:fs'

const templatePath = 'src/packing-lists/{exporter}/HappyPath.pdf'
const outputPath =
  'src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.pdf'

// --- Helper: decode a FlateDecode content stream by object ID ---
function decodeStream(pdfBytes, reader, objId) {
  const stream = reader.parseNewObject(objId).toPDFStream()
  const dict = stream.getDictionary()
  const len = dict.queryObject('Length').toNumber()
  const start = stream.getStreamContentStart()
  const compressed = pdfBytes.subarray(start, start + len)
  // CRITICAL: use 'latin1', not 'utf8' — bytes above 0x7F in font/rendering
  // instructions will be silently corrupted by a utf8 decode/re-encode round-trip.
  return zlib.inflateSync(compressed).toString('latin1')
}

// --- Find data stream object IDs ---
// Multi-page PDFs split content across many objects. Page 0 contains headers
// + first page data rows. Additional pages each have their own object IDs
// (data rows only, no headers). Enumerate all before bulk mutations.
const pdfBytes = readFileSync(templatePath)
const reader = muhammara.createReader(templatePath)

const pageDict = reader.parsePageDictionary(0)
const contents = pageDict.queryObject('Contents').toPDFArray()
let page0ObjectId, decoded

for (let i = 0; i < contents.getLength(); i++) {
  const id = contents
    .queryObject(i)
    .toPDFIndirectObjectReference()
    .getObjectID()
  try {
    const candidate = decodeStream(pdfBytes, reader, id)
    // Verify this is the data stream — not a font table or certification page
    if (candidate.includes('(Description of Goods)Tj')) {
      page0ObjectId = id
      decoded = candidate
      break
    }
  } catch (_) {
    /* not a decompressible FlateDecode stream — skip */
  }
}

// For multi-page PDFs, collect all data stream object IDs (one per page)
// and store them for bulk "All" mutations:
// const allDataObjectIds = [page0ObjectId, ...otherPageObjectIds]

// --- Mutation helpers ---
const escapePdfLiteral = (v) =>
  v.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

// Replace data tokens in a decoded stream by x-coordinate band.
//
// KEY POINTS:
// 1. Use a REGEX RANGE for right-justified fields — their x varies per row
//    with text width (e.g., country_of_origin spans 223.91–225.97 across rows).
//    Use '22[3-6]\\.[0-9]+' not a single literal like '223\\.91'.
//
// 2. Use a NEGATIVE LOOKAHEAD (?!\/F2 ) to avoid matching header tokens
//    (font F2) when your x-coordinate overlaps with a header position.
//
// 3. The font declaration (?:\/F1 6\.75 Tf\n)? is OPTIONAL — wrapped/continuation
//    tokens (a value too long for one line) omit the repeated Tf. Without the
//    optional group, those continuation tokens are silently skipped.
function replaceData(decoded, xPattern, replacer, max = Infinity) {
  const re = new RegExp(
    `(1 0 0 1 ${xPattern} [\\d.]+ Tm\\n)(?!\\/F2 )(?:\\/F1 6\\.75 Tf\\n)?\\((.*?)\\)Tj`,
    'g'
  )
  let n = 0
  return decoded.replace(re, (match, tmLine, value) => {
    if (n >= max) return match
    n++
    const newValue =
      typeof replacer === 'function' ? replacer(value, n) : replacer
    return match.replace(`(${value})Tj`, `(${newValue})Tj`)
  })
}

// Blank all F1-6.75 data tokens across a stream while preserving the
// establishment number. If the establishment number uses a DIFFERENT font size
// (e.g., F1 7.5 Tf vs F1 6.75 Tf for data rows), targeting only 6.75 will
// leave it intact — which is what you need for NoData_ExceptSingleRMS.
function blankAllF1Data(decoded) {
  return decoded.replace(
    /(1 0 0 1 [\d.]+ [\d.]+ Tm\n)(?!\/F2 )(?:\/F1 6\.75 Tf\n)?\((.*?)\)Tj/g,
    (match, tmLine, value) => match.replace(`(${value})Tj`, '()Tj')
  )
}

// --- Example: single field mutation on page 0 ---
let updated = replaceData(
  decoded,
  '75\\.26',
  escapePdfLiteral('INVALID TEXT'),
  1
)

if (updated === decoded) {
  throw new Error('Mutation failed: pattern not found in decoded stream')
}

// --- Write back using muhammara ---
// CRITICAL: getWriteStream().write() requires a plain JS array of byte integers,
// NOT a Buffer. Passing a Buffer directly silently writes nothing.
const writer = muhammara.createWriterToModify(templatePath, {
  modifiedFilePath: outputPath
})
const oc = writer.getObjectsContext()
oc.startModifiedIndirectObject(page0ObjectId)
const s = oc.startUnfilteredPDFStream()
s.getWriteStream().write(Array.from(Buffer.from(updated, 'latin1')))
oc.endPDFStream(s)
oc.endIndirectObject()
writer.end()
```

**Key advantages**:

- True in-place mutations (not visual overlays)
- App's PDF parser will see the mutated text
- Preserves all PDF structure and formatting
- No visual discrepancies between original and mutated versions

**Coordinate mapping process**:

1. Load the template PDF and extract the main content stream
2. Decompress the FlateDecode stream to inspect text tokens
3. Search for text tokens using pattern: `1 0 0 1 X Y Tm\n/Font Size Tf\n(text)Tj`
4. Record X,Y coordinates and exact font/size for each field
5. Document coordinates in manifest.json for future reference
6. Create mutations by replacing the entire token at those coordinates

**Validation**:

```javascript
// After mutation, verify using pdf.js-extract (the same extractor the parser uses)
import pkg from 'pdf.js-extract'
const { PDFExtract } = pkg
const extractor = new PDFExtract()
const data = await extractor.extract(outputPath, {})

// IMPORTANT: pdf.js-extract merges adjacent tokens at the same Y position into
// one string. E.g., 'Treatment Type' + 'NIRMS' become 'TREATMENT TYPE NIRMS'.
// Always use .includes() or a substring check, NOT strict === equality.
const page0Tokens = data.pages[0].content
const descValues = page0Tokens
  .filter((t) => t.x > 74 && t.x < 77)
  .map((t) => t.str)

// IMPORTANT: Empty ()Tj tokens are NOT returned by pdf.js-extract at all.
// For 'blank' mutations, verify absence of the original value, not presence of ''.
const hasMutatedValue = descValues.some((v) => v.includes('INVALID TEXT'))
if (!hasMutatedValue) throw new Error('Mutation not visible to extractor')
```

---

### Approach 2: Visual Overlay with `overlay-pdf-tool` (Quick Prototyping Only)

**When to use**: When you only need visual test screenshots and the app won't actually parse the PDF content.

```javascript
import { PDFDocument } from 'overlay-pdf-tool'
import { readFileSync, writeFileSync } from 'node:fs'

const inputBytes = readFileSync(inputFile)
const pdfDoc = await PDFDocument.load(inputBytes)
const page = pdfDoc.getPage(0)

// Overlay text at known coordinates (NOT true mutation)
page.drawText('INVALID', { x: 420, y: 510, size: 10 })

const outBytes = await pdfDoc.save()
writeFileSync(outputFile, outBytes)
```

**Limitations**:

- Creates visual overlays only; original text remains in PDF stream
- App's PDF parser will still extract original text (not overlay)
- Not suitable for integration testing or mutation validation
- Useful only for visual regression testing or screenshots

---

## Implementation Workflow (In-Place Mutation — Recommended)

1. **Copy template** via PowerShell/CLI:

   ```powershell
   Copy-Item "src/packing-lists/{exporter}/HappyPath.pdf" "src/packing-lists/{exporter}/test-scenarios/{scenario}/{filename}.pdf"
   ```

2. **Map coordinates** from template:

   - Use `muhammara` to enumerate page content stream object IDs
   - Decompress each FlateDecode stream with `zlib.inflateSync` (decode as `latin1`)
   - Identify data stream objects vs non-data objects (font tables, certification pages) by searching for known tokens
   - For multi-page PDFs, collect all data object IDs — header tokens exist only on page 0
   - Record X,Y stream coordinates for all fields; note that right-justified fields need a regex range, not a literal x
   - Store coordinate mappings in manifest.json

3. **Test one mutation**:

   - Apply a single mutation to verify coordinate targeting
   - Re-open mutated PDF and confirm change in extracted text
   - Adjust coordinates if needed

4. **Apply remaining mutations**:

   - Use verified coordinate mappings for bulk mutations
   - Vary mutation patterns (special chars, alphanumeric, negative) across rows

5. **Validate**:
   - Re-open each mutated PDF
   - Verify extracted text contains mutations (not just visual overlays)
   - Confirm only targeted regions changed

---

## Lessons Learned: MandS1 PDF Generation (Success Case)

The MandS1 PDF test data generation successfully created 32 mutated PDFs using the in-place stream approach. Key insights:

### Why In-Place Mutation Works Better Than Overlays

- PDFs store text in a compressed content stream with position tokens
- Overlay approach (`overlay-pdf-tool` drawText) adds visual text but leaves original stream unchanged
- App's PDF parser extracts from the original stream, not overlays
- For integration/parsing tests, mutations MUST be in the content stream, not visual overlays

### Coordinate Mapping Discovery Process

1. Load PDF and enumerate page-0 Contents array object IDs using `muhammara.createReader`
2. Decompress each FlateDecode stream with `zlib.inflateSync()` decoded as `latin1` (not utf8)
3. Identify data stream objects by searching for known tokens (e.g., `'(Description of Goods)Tj'`); skip font tables and non-data streams
4. For multi-page PDFs, repeat for every page to collect all data stream object IDs — header tokens exist only in the page-0 stream
5. Text tokens follow two forms:
   - **Standard**: `1 0 0 1 X Y Tm\n/F1 6.75 Tf\n(text)Tj`
   - **Continuation** (wrapped lines): `1 0 0 1 X Y Tm\n(text)Tj` ← no repeated Tf
6. X,Y values in tokens are the stream coordinates (NOT the same as extracted page coordinates)
7. For right-justified fields, sample multiple rows — the x-coordinate varies per row with text width; use a regex range in manifest.json (e.g., `22[3-6]\\.[0-9]+`)
8. Document these stream coordinates in manifest.json for future mutations

### Example Token Structure

```
1 0 0 1 408.40 361.08 Tm         # Position: X=408.40, Y=361.08
/F2 7.5 Tf                        # Font F2, size 7.5
(NIRMS)Tj                         # Text: "NIRMS"
```

### Common Pitfalls

- **Wrong library name**: The approved library is `muhammara` (installed as a dev dep). Do not use placeholder names.
- **`write()` requires an array, not a Buffer**: `ws.write(Buffer.from(...))` silently writes nothing — use `ws.write(Array.from(Buffer.from(content, 'latin1')))`.
- **`latin1` encoding is mandatory**: Use `.toString('latin1')` when decompressing and `Buffer.from(content, 'latin1')` when re-encoding. UTF-8 corrupts bytes above 0x7F found in font and rendering instructions.
- **Continuation tokens omit the `Tf` line**: Long values that wrap onto a second line emit `1 0 0 1 X Y Tm\n(value)Tj` with no repeated font declaration. A regex requiring `/F1 6\.75 Tf\n` will silently skip them. Use `(?:\/F1 6\.75 Tf\n)?` to make it optional.
- **Negative lookahead needed when header x overlaps data x**: When a data field's x-coordinate is at or near a header token (font F2), add `(?!\/F2 )` after the `Tm\n` to avoid corrupting header tokens.
- **Right-justified fields have variable x per row**: Fields like `country_of_origin` shift x with text width across rows. Use a regex range (e.g., `22[3-6]\.[0-9]+`) not a single literal x value.
- **Multi-page PDFs have many data stream objects**: Enumerate all page object IDs. Non-data objects (font tables, certification pages) must be identified by content inspection and excluded.
- **Header tokens exist only in the page-0 stream object**: Header mutations must target the page-0 object only; other page objects contain data rows only.
- **Confusing extracted page coordinates with stream token coordinates**: They differ — always use stream token X,Y for mutation pattern matching.
- **Not escaping PDF special characters**: `\`, `(`, and `)` must be escaped in PDF string literals.
- **Numeric formatting mismatch**: `408.40` vs `408.4` are different strings in the stream — match exactly.
- **`pdf.js-extract` merges adjacent tokens**: Tokens at the same Y are concatenated into one string (e.g., `'Treatment Type'` + `'NIRMS'` → `'TREATMENT TYPE NIRMS'`). Use `.includes()` not `===` when verifying header mutations.
- **`pdf.js-extract` does not return empty tokens**: An empty `()Tj` mutation is correct but the extractor simply omits it. Verify blank mutations by checking for the **absence** of the original value, not the **presence** of an empty string.
- **Establishment number may use a different font size**: If the establishment number uses `F1 7.5 Tf` while data rows use `F1 6.75 Tf`, a regex targeting only `6.75` blanks all data without touching the establishment number — use this for the `NoData_ExceptSingleRMS` scenario.

### Validation Strategy

- After mutation, re-open PDF and extract text using the same extraction utility
- Verify extracted text contains your mutations (presence/absence in coordinate bands)
- Don't rely solely on visual inspection—parse the mutated PDF to confirm changes

### Automation Approach

1. Create a generator script that parameterizes the mutation logic
2. Define scenario mutations as a data structure (scenario name → list of token replacements)
3. Apply replacements in order, checking each against decoded stream
4. Write back entire modified stream as one operation
5. Generate companion verification script that parses all PDFs and validates mutations

---

## Coordinate System Clarification

**Critical Understanding**: PDF content streams use different coordinates than visual page extraction.

- **Stream Token Coordinates** (what you mutate): X,Y values in `1 0 0 1 X Y Tm` patterns

  - Example: `1 0 0 1 408.40 361.08 Tm` places text at stream position (408.40, 361.08)
  - These are the coordinates you need for regex pattern matching

- **Extracted Page Coordinates** (what extraction tools report): Normalized to visual page layout
  - Example: Same text might extract at y=233.92 when using pdf-helper
  - These differ significantly from stream coordinates
  - **Do not** use extraction coordinates for mutation pattern matching

**Implementation guidance**: Always use stream token coordinates for mutations, verify with re-extraction after mutation.
