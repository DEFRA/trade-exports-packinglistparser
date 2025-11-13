import { config } from '../config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()
const dsConfig = config.get('dynamics')
const GET_DISPATCH_LOCATION_METHOD = 'getDispatchLocation()'

/**
 * Request a bearer token from the OAuth endpoint
 * @returns {Promise<string>} Access token
 * @throws {Error} If token request fails
 */
async function bearerTokenRequest() {
  try {
    const response = await fetch(dsConfig.tokenUrl, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: dsConfig.grantType,
        client_id: dsConfig.clientId,
        client_secret: dsConfig.clientSecret,
        resource: dsConfig.resource
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Bearer token request failed - Status: ${response.status}, Response: ${errorText}`
      )
    }

    const json = await response.json()

    if (!json.access_token) {
      throw new Error('No access token in response')
    }

    return json.access_token
  } catch (err) {
    logger.error({ err }, 'bearerTokenRequest() failed')
    throw err
  }
}

/**
 * Validate bearer token format
 * @param {string} bearerToken - Token to validate
 * @returns {boolean} True if valid
 */
function validateBearerToken(bearerToken) {
  return (
    bearerToken &&
    typeof bearerToken === 'string' &&
    !bearerToken.includes('Error')
  )
}

/**
 * Make HTTP request to Dynamics API
 * @param {string} bearerToken - OAuth access token
 * @param {string} applicationId - Application/Establishment ID
 * @returns {Promise<{response: Response, status: number}>}
 */
async function makeDynamicsRequest(bearerToken, applicationId) {
  const token = 'Bearer ' + bearerToken
  const url = `${dsConfig.url}/api/data/v9.2/trd_inspectionlocations(${applicationId})?$select=rms_remosid`

  const response = await fetch(encodeURI(url), {
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  })

  return { response, status: response.status }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Handle successful Dynamics response
 * @param {Response} response - HTTP response
 * @param {number} attempt - Current attempt number
 * @param {string} applicationId - Application ID
 * @returns {Promise<string>} REMOS ID
 */
async function handleSuccessResponse(response, attempt, applicationId) {
  const result = await response.json()
  if (attempt > 1) {
    logger.info(
      `Successfully retrieved record for ${applicationId} after ${attempt} attempts`
    )
  }
  return result.rms_remosid
}

/**
 * Log HTTP errors (non-retryable)
 * @param {number} status - HTTP status code
 * @param {string} errorText - Error response text
 */
function logHttpError(status, errorText) {
  const message = `Request failed - HTTP ${status}: ${errorText}`
  logger.error(message)
}

/**
 * Log catch errors (retryable network errors)
 * @param {number} attempt - Current attempt number
 * @param {number} maxRetries - Maximum retry attempts
 * @param {string} errorMessage - Error message
 * @param {number} retryDelayMs - Retry delay in milliseconds
 */
function logCatchError(attempt, maxRetries, errorMessage, retryDelayMs) {
  const isLastAttempt = attempt === maxRetries
  const message = isLastAttempt
    ? `Final attempt failed with error: ${errorMessage}`
    : `Attempt ${attempt} failed with error: ${errorMessage}, retrying in ${retryDelayMs}ms`

  logger.error(message)
}

/**
 * Get dispatch location from Dynamics 365 by establishment ID
 * Includes retry logic for network failures (not HTTP errors)
 *
 * @param {string} applicationId - Establishment/Application ID
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @param {number} [retryDelayMs=2000] - Delay between retries in milliseconds
 * @returns {Promise<string|null>} REMOS ID or null if failed
 */
async function getDispatchLocation(
  applicationId,
  maxRetries = dsConfig.maxRetries,
  retryDelayMs = dsConfig.retryDelayMs
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const bearerToken = await bearerTokenRequest()

      if (!validateBearerToken(bearerToken)) {
        const error = new Error(`Failed to obtain bearer token: ${bearerToken}`)
        logger.error({ err: error }, GET_DISPATCH_LOCATION_METHOD)
        return null
      }

      const { response, status } = await makeDynamicsRequest(
        bearerToken,
        applicationId
      )

      if (response.ok) {
        return await handleSuccessResponse(response, attempt, applicationId)
      }

      // Any HTTP error response - don't retry, return immediately
      const errorText = await response.text()
      logHttpError(status, errorText)
      return null
    } catch (err) {
      // Only retry on fetch failures (network errors)
      logCatchError(attempt, maxRetries, err.message, retryDelayMs)

      if (attempt === maxRetries) {
        return null
      }

      await sleep(retryDelayMs)
    }
  }

  return null
}

export { getDispatchLocation, bearerTokenRequest }
