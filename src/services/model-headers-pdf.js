/**
 * PDF Model Headers Registry
 *
 * Aggregates all PDF-specific model headers for coordinate-based PDF parsers.
 * Individual retailer headers are imported from model-headers/[retailer].js
 */

import { pdfGiovanniHeaders } from './model-headers/giovanni.js'
import { pdfMandsHeaders } from './model-headers/mands.js'

const modelHeadersPdf = {
  ...pdfGiovanniHeaders,
  ...pdfMandsHeaders
}

export default modelHeadersPdf
