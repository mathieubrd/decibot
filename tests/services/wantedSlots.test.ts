import { getWantedSlots } from '../../src/services/wantedSlots'
import WantedSlot from '../models/wantedSlot'

const fakeEmail = 'mathieu.brochard@outlook.com'
const fakeWantedSlots = [
  {
    activity: 'WOD',
    day: 'lundi',
    hour: '14:00',
    room: 'PREAU'
  }
] as WantedSlot[]

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn()
  }
})

const documentClientSendMock = jest.fn()
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => {
        return {
          send: documentClientSendMock
        }
      })
    },

    GetCommand: jest.fn()
  }
})

describe('wanted slots service', () => {
  beforeEach(() => {
    documentClientSendMock.mockReset()
  })

  test('should resolve to a list of wanted slots', async () => {
    documentClientSendMock.mockResolvedValue({
      Item: {
        wanted_slots: fakeWantedSlots
      }
    })

    expect(await getWantedSlots(fakeEmail)).toEqual(fakeWantedSlots)
  })

  test('should resolve to a empty list of wanted slots', async () => {
    documentClientSendMock.mockResolvedValue({
      Item: {
        wanted_slots: []
      }
    })

    expect(await getWantedSlots(fakeEmail)).toEqual([])
  })

  afterAll(() => {
    jest.unmock('@aws-sdk/client-dynamodb')
  })
})
