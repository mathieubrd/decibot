import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import Credentials from '../models/credentials'

const parameterStoreName = 'dummy'

export const getCredentials = async (email?: string): Promise<Credentials[]> => {
  const client = new SSMClient({})
  const command = new GetParameterCommand({
    Name: parameterStoreName
  })
  const response = await client.send(command)

  if (!response.Parameter || !response.Parameter.Value) {
    return []
  }

  const credentials = JSON.parse(response.Parameter.Value) as Credentials[]

  if (!email) {
    return credentials
  }

  return credentials.filter((credential: Credentials) => {
    return credential.email === email
  })
}
