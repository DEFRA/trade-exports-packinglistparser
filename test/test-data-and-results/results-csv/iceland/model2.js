import { expect } from 'vitest'
import parserModel from '../../../../src/services/parser-model.js'

const validTestResult = {
  business_checks: {
    all_required_fields_present: true,
    failure_reasons: null
  },
  items: [
    {
      commodity_code: '1234567890',
      description: 'Test Product 1',
      nature_of_products: 'Fresh',
      type_of_treatment: 'Chilled',
      number_of_packages: '10',
      total_net_weight_kg: '5.5',
      country_of_origin: 'GB',
      nirms: 'Non-NIRMS',
      row_location: {
        rowNumber: 2,
        sheetName: null
      }
    },
    {
      commodity_code: '9876543210',
      description: 'Test Product 2',
      nature_of_products: 'Ambient',
      type_of_treatment: 'Processed',
      number_of_packages: '20',
      total_net_weight_kg: '12.3',
      country_of_origin: 'FR',
      nirms: 'Non-NIRMS',
      row_location: {
        rowNumber: 3,
        sheetName: null
      }
    }
  ],
  registration_approval_number: 'RMS-GB-000040-001',
  parserModel: parserModel.ICELAND2
}

const invalidTestResult_MissingCells = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: expect.stringContaining('Identifier is missing')
  },
  items: expect.any(Array),
  registration_approval_number: 'RMS-GB-000040-001',
  parserModel: parserModel.ICELAND2
}

const invalidTestResult_MultipleRms = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: expect.stringContaining(
      'Multiple GB Place of Dispatch (Establishment) numbers found on packing list.'
    )
  },
  items: expect.any(Array),
  registration_approval_number: 'RMS-GB-000040-001',
  parserModel: parserModel.ICELAND2
}

const invalidTestResult_MissingKgUnit = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: expect.stringContaining(
      'Net Weight Unit of Measure (kg) not found'
    )
  },
  items: expect.any(Array),
  registration_approval_number: 'RMS-GB-000040-001',
  parserModel: parserModel.ICELAND2
}

const validCooTestResult = {
  business_checks: {
    all_required_fields_present: true,
    failure_reasons: null
  },
  items: [
    {
      commodity_code: '1234567890',
      description: 'Test Product 1',
      nature_of_products: 'Fresh',
      type_of_treatment: 'Chilled',
      number_of_packages: '10',
      total_net_weight_kg: '5.5',
      country_of_origin: 'GB',
      nirms: 'NIRMS',
      row_location: {
        rowNumber: 2,
        sheetName: null
      }
    }
  ],
  registration_approval_number: 'RMS-GB-000040-001',
  parserModel: parserModel.ICELAND2
}

export default {
  validTestResult,
  invalidTestResult_MissingCells,
  invalidTestResult_MultipleRms,
  invalidTestResult_MissingKgUnit,
  validCooTestResult
}
