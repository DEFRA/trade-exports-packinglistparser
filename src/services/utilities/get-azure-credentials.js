import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand
} from '@aws-sdk/client-cognito-identity'

import {
  ClientAssertionCredential,
  ClientSecretCredential
} from '@azure/identity'
import { config } from '../../config.js'

const { poolId, region } = config.get('aws')

const cognitoClient = new CognitoIdentityClient({ region })

/**
 * Gets an OpenID token from AWS Cognito for Azure AD federation
 * @returns {Promise<string>} OpenID token from Cognito
 * @throws {Error} If Cognito token request fails
 */
async function getCognitoToken() {
  const logins = {
    'trade-exports-packinglistparser-aad-access':
      'trade-exports-packinglistparser'
  }

  const command = new GetOpenIdTokenForDeveloperIdentityCommand({
    IdentityPoolId: poolId,
    Logins: logins
  })

  return cognitoClient
    .send(command)
    .then(function (data) {
      return data.Token
    })
    .catch(function (error) {
      throw error
    })
}

/**
 * Creates Azure ClientAssertionCredential using Cognito token for authentication
 * Or ClientSecretCredential if client secret is available (for local dev)
 * @param {string} tenantID - Azure tenant ID
 * @param {string} clientID - Azure client ID
 * @returns {ClientAssertionCredential|ClientSecretCredential} Azure credential object
 */
export function getAzureCredentials(tenantID, clientID) {
  const { clientSecret } = config.get('mdm')

  // If client secret is provided, use ClientSecretCredential (local dev)
  if (clientSecret) {
    return new ClientSecretCredential(tenantID, clientID, clientSecret)
  }

  // Otherwise use ClientAssertionCredential with Cognito (cloud)
  return new ClientAssertionCredential(tenantID, clientID, getCognitoToken)
}
