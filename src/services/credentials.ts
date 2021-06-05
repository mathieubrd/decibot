import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import Credentials from '../models/credentials'

export const getCredentials = async (secretId: string, email?: string): Promise<Credentials[]> => {
  const client = new SecretsManagerClient({})
  const command = new GetSecretValueCommand({
    SecretId: secretId
  })
  
  const response = await client.send(command)

  if (!response.SecretString) {
    return []
  }

  const json: {[key: string]: string} = JSON.parse(response.SecretString)
  const emails = Object.keys(json)

  const credentials = emails.map((email: string) => {
    return {
      email: email,
      password: json[email]
    } as Credentials
  })

  if (!email) {
    return credentials
  }

  return credentials.filter((credential: Credentials) => {
    return credential.email === email
  })
}
