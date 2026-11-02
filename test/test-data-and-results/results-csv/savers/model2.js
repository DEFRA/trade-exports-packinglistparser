/**
 * SAVERS Model 2 CSV Expected Results
 *
 * Expected parser output for SAVERS2 CSV packing list test data.
 */
import parserModel from '../../../../src/services/parser-model.js'

const validTestResult = {
  business_checks: {
    all_required_fields_present: true,
    failure_reasons: null
  },
  items: [
    {
      description: 'HARMONY HAIRSPRAY FIRM 225ML',
      commodity_code: '3305900000',
      number_of_packages: '1',
      total_net_weight_kg: '2.680',
      nature_of_products: 'Ambient',
      type_of_treatment: 'Unprocessed',
      country_of_origin: 'GB',
      nirms: 'No',
      row_location: {
        rowNumber: 7,
        sheetName: null
      }
    },
    {
      description: "HERMESETAS ORIG. 300'S",
      commodity_code: '2106909849',
      number_of_packages: '1',
      total_net_weight_kg: '0.340',
      nature_of_products: 'Ambient',
      type_of_treatment: 'Processed',
      country_of_origin: 'GB',
      nirms: 'Yes',
      row_location: {
        rowNumber: 8,
        sheetName: null
      }
    }
  ],
  registration_approval_number: 'RMS-GB-000247-002',
  parserModel: parserModel.SAVERS2
}

const invalidTestResult_MissingCells = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: expect.stringContaining('Product description is missing')
  },
  items: expect.any(Array),
  registration_approval_number: 'RMS-GB-000247-002',
  parserModel: parserModel.SAVERS2
}

export default {
  validTestResult,
  invalidTestResult_MissingCells
}
