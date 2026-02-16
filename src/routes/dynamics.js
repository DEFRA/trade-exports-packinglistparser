import Joi from 'joi'
import { getDispatchLocation } from '../services/dynamics-service.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { config } from '../config.js'
import { STATUS_CODES } from './statuscodes.js'

/**
 * Test route for Dynamics service
 * GET /dynamics/dispatch-location/{applicationId}
 *
 * Security considerations:
 * - Only enabled in non-production environments
 * - Requires valid application ID format
 * - Returns sanitized error messages (no sensitive data)
 * - Rate limited by application-level settings
 */
const getDispatchLocationRoute = {
  method: 'GET',
  path: '/dynamics/dispatch-location/{applicationId}',
  options: {
    description:
      'Test endpoint to retrieve dispatch location from Dynamics 365',
    notes:
      'Returns REMOS ID for a given establishment/application ID. Only available in non-production environments.',
    tags: ['api', 'dynamics', 'test'],
    validate: {
      params: Joi.object({
        applicationId: Joi.string()
          .min(1)
          .max(100)
          .pattern(/^[a-zA-Z0-9\-_]+$/)
          .required()
          .description('Establishment or Application ID')
      })
    },
    response: {
      schema: Joi.object({
        applicationId: Joi.string().required(),
        remosId: Joi.string().allow(null).required(),
        success: Joi.boolean().required(),
        environment: Joi.string().required(),
        timestamp: Joi.string().isoDate().required(),
        error: Joi.string().optional()
      })
    }
  },
  handler: async (request, h) => {
    const { applicationId } = request.params
    const environment = config.get('cdpEnvironment')

    try {
      request.logger.info(
        `Dynamics test endpoint: Getting dispatch location for application ${applicationId}`
      )

      const remosId = await getDispatchLocation(applicationId)

      const response = {
        applicationId,
        remosId,
        success: remosId !== null,
        environment,
        timestamp: new Date().toISOString()
      }

      if (remosId === null) {
        request.logger.warn(
          { applicationId },
          'Dynamics test endpoint: No REMOS ID found'
        )
        return h.response(response).code(STATUS_CODES.NOT_FOUND)
      }

      request.logger.info(
        `Dynamics test endpoint: Successfully retrieved REMOS ID ${remosId} for application ${applicationId}`
      )

      return h.response(response).code(STATUS_CODES.OK)
    } catch (err) {
      request.logger.error(
        formatError(err),
        `Dynamics test endpoint: Error retrieving dispatch location for ${applicationId}`
      )

      return h
        .response({
          applicationId,
          remosId: null,
          success: false,
          environment,
          timestamp: new Date().toISOString(),
          error: 'Internal server error'
        })
        .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
    }
  }
}

/**
 * Health check for Dynamics service configuration
 * GET /dynamics/health
 *
 * Checks if Dynamics is properly configured without making actual requests
 */
const dynamicsHealthCheck = {
  method: 'GET',
  path: '/dynamics/health',
  options: {
    description: 'Check Dynamics 365 service configuration',
    notes: 'Validates that all required Dynamics configuration is present',
    tags: ['api', 'dynamics', 'health']
  },
  handler: async (request, h) => {
    const dynamicsConfig = config.get('dynamics')
    const environment = config.get('cdpEnvironment')

    const checks = {
      url: !!dynamicsConfig.url,
      tokenUrl: !!dynamicsConfig.tokenUrl,
      clientId: !!dynamicsConfig.clientId,
      clientSecret: !!dynamicsConfig.clientSecret,
      resource: !!dynamicsConfig.resource
    }

    const isConfigured = Object.values(checks).every((check) => check === true)

    const response = {
      service: 'dynamics',
      configured: isConfigured,
      environment,
      checks: {
        url: checks.url ? 'configured' : 'missing',
        tokenUrl: checks.tokenUrl ? 'configured' : 'missing',
        clientId: checks.clientId ? 'configured' : 'missing',
        clientSecret: checks.clientSecret ? 'configured' : 'missing',
        resource: checks.resource ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    }

    if (!isConfigured) {
      request.logger.warn(
        { checks: response.checks, environment },
        'Dynamics service is not fully configured'
      )
      return h.response(response).code(STATUS_CODES.SERVICE_UNAVAILABLE)
    }

    request.logger.info('Dynamics service is properly configured')
    return h.response(response).code(STATUS_CODES.OK)
  }
}

export { getDispatchLocationRoute, dynamicsHealthCheck }
