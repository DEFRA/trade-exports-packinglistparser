import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand
} from '@aws-sdk/client-cognito-identity'

import { ClientAssertionCredential } from '@azure/identity'

const cognitoClient = new CognitoIdentityClient({ region: 'eu-west-2' })

async function getCognitoToken() {
  const logins = {
    'trade-exports-packinglistparser-aad-access':
      'trade-exports-packinglistparser'
  }

  const command = new GetOpenIdTokenForDeveloperIdentityCommand({
    IdentityPoolId: 'eu-west-2:088d2b8d-c13b-4ed1-83ee-aff0080e46aa',
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
