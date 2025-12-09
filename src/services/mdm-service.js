import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'

const logger = createLogger()

/**
 * Call Azure API Management with automatic token authentication
 * @param {string} url - Full API URL
 * @param {Object} - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response object
 * @throws {Error} If token retrieval or API call fails
 */
export async function callAzureApiWithToken(url, options) {
  try {
    const { defraCloudTenantId } = config.get('azure') || {}
    const { clientId, internalAPIMScope, subscriptionKey } = config.get('mdm')

    if (!defraCloudTenantId || !clientId) {
      throw new Error(
        'Missing Azure configuration (defraCloudTenantId, clientId)'
      )
    }

    // Get Azure credentials and request token
    const credential = getAzureCredentials(defraCloudTenantId, clientId)
    logger.info({ internalAPIMScope }, 'Requesting Azure AD token for API call')

    const tokenResponse = await credential.getToken(internalAPIMScope)

    if (!tokenResponse || !tokenResponse.token) {
      throw new Error('Failed to obtain access token')
    }

    logger.info('Successfully obtained Azure AD token')

    // Prepare headers with Bearer token
    const headers = {
      Authorization: `Bearer ${tokenResponse.token}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Make the API call
    logger.info({ url, method: options.method || 'GET' }, 'Calling Azure API')

    const response = await fetch(url, {
      ...options,
      headers
    })

    logger.info(
      { url, status: response.status, ok: response.ok },
      'Azure API response received'
    )

    return response
  } catch (err) {
    logger.error({ err, url }, 'Failed to call Azure API')
    throw err
  }
}

/**
 * Call Azure API Management and return JSON response
 * @param {string} url - Full API URL
 * @param {Object} - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} If API call fails or returns non-OK status
 */
export async function callAzureApiJson(url, options) {
  const response = await callAzureApiWithToken(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    const error = new Error(
      `API call failed: ${response.status} ${response.statusText} - ${errorText}`
    )
    error.status = response.status
    error.statusText = response.statusText
    error.responseBody = errorText
    throw error
  }

  return response.json()
}

/**
 * GET request to Azure API Management to retrieve ineligible items
 * @returns {Promise<Object>} Parsed JSON response
 */
export function getIneligibleItems() {
  const { internalAPIMEndpoint, getIneligibleItemsEndpoint } = config.get('mdm')
  const url = `${internalAPIMEndpoint}${getIneligibleItemsEndpoint}`
  logger.info(`Getting ineligible items from MDM API - ${url}`)
  return getFromAzureApi(url, {})
}

/**
 * GET request to Azure API Management
 * @param {string} url - Full API URL
 * @param {Object} - Additional headers
 * @returns {Promise<Object>} Parsed JSON response
 */
async function getFromAzureApi(url, headers) {
  return callAzureApiJson(url, {
    method: 'GET',
    headers
  })
}

/**
 * POST request to Azure API Management
 * @param {string} url - Full API URL
 * @param {Object} body - Request body (will be JSON stringified)
 * @param {Object} - Additional headers
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function postToAzureApi(url, body, headers) {
  return callAzureApiJson(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
}
