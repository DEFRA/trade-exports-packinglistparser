import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand
} from '@aws-sdk/client-cognito-identity'

import { ClientAssertionCredential } from '@azure/identity'
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
 * @param {string} tenantID - Azure tenant ID
 * @param {string} clientID - Azure client ID
 * @returns {ClientAssertionCredential} Azure credential object
 */
export function getAzureCredentials(tenantID, clientID) {
  return new ClientAssertionCredential(tenantID, clientID, getCognitoToken)
}
