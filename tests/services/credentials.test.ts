import { getCredentials } from '../../src/services/credentials'
import Credentials from '../../src/models/credentials'

const dummyCredentials = [
  {
    email: 'john.doe@example.com',
    password: 'P@ssw0rd!123'
  },
  {
    email: 'tom.scoot@dummy.com',
    password: 'N0elFl@ntier!123'
  }
] as Credentials[]

const secretValue = {
  'john.doe@example.com': 'P@ssw0rd!123',
  'tom.scoot@dummy.com': 'N0elFl@ntier!123'
}

const unknownEmail = "delabate@oss.fr"
const secretId = "secret-123"

const secretsManagerClient = jest.fn()

jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    SecretsManagerClient: jest.fn(() => {
      return {
        send: secretsManagerClient
      }
    }),
    GetSecretValueCommand: jest.fn()
  }
})

describe('credentials', () => {
  beforeEach(() => {
    secretsManagerClient.mockReset()
  })

  test('should resolve to a list of all credentials', async () => {
    secretsManagerClient.mockResolvedValue({
      SecretString: JSON.stringify(secretValue)
    })

    expect(await getCredentials(secretId)).toEqual<Credentials[]>(dummyCredentials)
  })

  test('should resolve to a list of credentials given by email', async () => {
    secretsManagerClient.mockResolvedValue({
      SecretString: JSON.stringify(secretValue)
    })

    const credentials = await getCredentials(secretId, dummyCredentials[0].email)
    expect(credentials).toEqual<Credentials[]>([dummyCredentials[0]])
  })

  test('should resolve to an empty list of credentials', async () => {
    secretsManagerClient.mockResolvedValue({
      SecretString: undefined
    })

    const credentials = await getCredentials(unknownEmail)
    expect(credentials).toEqual<Credentials[]>([])
  })

  test('should reject to parameter store not found', () => {
    expect(getCredentials(secretId)).rejects.toThrowError()
  })

  afterAll(() => {
    jest.unmock('@aws-sdk/client-ssm')
  })
})
