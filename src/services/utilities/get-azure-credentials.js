import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand
} from '@aws-sdk/client-cognito-identity'

import { ClientAssertionCredential } from '@azure/identity'
import { config } from '../../config.js'

const { poolId, region } = config.get('aws')

const cognitoClient = new CognitoIdentityClient({ region })

async function getCognitoToken() {
  const logins = {
    'trade-exports-packinglistparser-aad-access':
      'trade-exports-packinglistparser'
  }

  const command = new GetOpenIdTokenForDeveloperIdentityCommand({
    IdentityPoolId: poolId,
    logins
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

export function getAzureCredentials(tenantID, clientID) {
  return new ClientAssertionCredential(tenantID, clientID, getCognitoToken)
}
