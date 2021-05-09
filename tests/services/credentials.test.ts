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

const unknownEmail = "delabate@oss.fr"

const ssmClientSendMock = jest.fn()

jest.mock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: jest.fn(() => {
      return {
        send: ssmClientSendMock
      }
    }),
    GetParameterCommand: jest.fn()
  }
})

describe('credentials', () => {
  beforeEach(() => {
    ssmClientSendMock.mockReset()
  })

  test('should resolve to a list of all credentials', async () => {
    ssmClientSendMock.mockResolvedValue({
      Parameter: {
        Value: JSON.stringify(dummyCredentials)
      }
    })

    expect(await getCredentials()).toEqual<Credentials[]>(dummyCredentials)
  })

  test('should resolve to a list of credentials given by email', async () => {
    ssmClientSendMock.mockResolvedValue({
      Parameter: {
        Value: JSON.stringify([dummyCredentials[0]])
      }
    })

    const credentials = await getCredentials(dummyCredentials[0].email)
    expect(credentials).toEqual<Credentials[]>([dummyCredentials[0]])
  })

  test('should resolve to an empty list of credentials', async () => {
    ssmClientSendMock.mockResolvedValue({
      Parameter: undefined
    })

    const credentials = await getCredentials(unknownEmail)
    expect(credentials).toEqual<Credentials[]>([])
  })

  test('should reject to parameter store not found', () => {
    expect(getCredentials()).rejects.toThrowError()
  })

  afterAll(() => {
    jest.unmock('@aws-sdk/client-ssm')
  })
})
