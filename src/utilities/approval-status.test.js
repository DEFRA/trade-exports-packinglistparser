import { describe, test, expect } from 'vitest'
import { determineApprovalStatus } from './approval-status.js'

describe('determineApprovalStatus', () => {
  describe('approved status', () => {
    test('should return "approved" when all required fields are present', () => {
      expect(determineApprovalStatus(true, null)).toBe('approved')
      expect(determineApprovalStatus(true, '')).toBe('approved')
      expect(determineApprovalStatus(true, 'some failure reason')).toBe(
        'approved'
      )
    })
  })

  describe('rejected_ineligible status', () => {
    test('should return "rejected_ineligible" when failure reasons contain prohibited item text', () => {
      const prohibitedReasons = [
        'Prohibited item identified on the packing list',
        'Some error: Prohibited item identified on the packing list and more text',
        'Prohibited item identified on the packing list - additional details'
      ]

      prohibitedReasons.forEach((reason) => {
        expect(determineApprovalStatus(false, reason)).toBe(
          'rejected_ineligible'
        )
      })
    })

    test('should prioritize "rejected_ineligible" over other failure types when multiple conditions exist', () => {
      const combinedReasons =
        'Prohibited item identified on the packing list\nInvalid Country of Origin ISO Code'
      expect(determineApprovalStatus(false, combinedReasons)).toBe(
        'rejected_ineligible'
      )
    })
  })

  describe('rejected_coo status', () => {
    test('should return "rejected_coo" when failure reasons contain missing country of origin', () => {
      const cooReasons = [
        'Missing Country of Origin',
        'Some error: Missing Country of Origin and more text',
        'Missing Country of Origin - additional details'
      ]

      cooReasons.forEach((reason) => {
        expect(determineApprovalStatus(false, reason)).toBe('rejected_coo')
      })
    })

    test('should return "rejected_coo" when failure reasons contain invalid country of origin ISO code', () => {
      const cooReasons = [
        'Invalid Country of Origin ISO Code',
        'Some error: Invalid Country of Origin ISO Code and more text',
        'Invalid Country of Origin ISO Code - additional details'
      ]

      cooReasons.forEach((reason) => {
        expect(determineApprovalStatus(false, reason)).toBe('rejected_coo')
      })
    })
  })

  describe('rejected_other status', () => {
    test('should return "rejected_other" for any other failure reasons when fields are not present', () => {
      const otherReasons = [
        'Some validation error',
        'Unknown error occurred',
        'File format not supported',
        'Missing required field',
        'Invalid data format'
      ]

      otherReasons.forEach((reason) => {
        expect(determineApprovalStatus(false, reason)).toBe('rejected_other')
      })
    })

    test('should return "rejected_other" when failure reasons is null and fields are not present', () => {
      expect(determineApprovalStatus(false, null)).toBe('rejected_other')
    })

    test('should return "rejected_other" when failure reasons is empty string and fields are not present', () => {
      expect(determineApprovalStatus(false, '')).toBe('rejected_other')
    })

    test('should return "rejected_other" when failure reasons is not a string and fields are not present', () => {
      expect(determineApprovalStatus(false, 123)).toBe('rejected_other')
      expect(determineApprovalStatus(false, {})).toBe('rejected_other')
      expect(determineApprovalStatus(false, [])).toBe('rejected_other')
    })
  })

  describe('edge cases', () => {
    test('should handle undefined failure reasons', () => {
      expect(determineApprovalStatus(false, undefined)).toBe('rejected_other')
    })

    test('should handle case sensitivity in failure reasons', () => {
      // The implementation uses case-sensitive includes() matching
      expect(
        determineApprovalStatus(
          false,
          'prohibited item identified on the packing list'
        )
      ).toBe('rejected_other')
      expect(
        determineApprovalStatus(
          false,
          'Prohibited Item Identified On The Packing List'
        )
      ).toBe('rejected_other')
      expect(
        determineApprovalStatus(
          false,
          'Prohibited item identified on the packing list'
        )
      ).toBe('rejected_ineligible')
    })

    test('should handle partial matches correctly', () => {
      // Should not match partial strings
      expect(determineApprovalStatus(false, 'Prohibited')).toBe(
        'rejected_other'
      )
      expect(determineApprovalStatus(false, 'item identified')).toBe(
        'rejected_other'
      )
      expect(determineApprovalStatus(false, 'Country of Origin')).toBe(
        'rejected_other'
      )
    })
  })
})
