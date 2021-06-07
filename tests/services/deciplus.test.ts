import axios from 'axios'
import DeciplusClient, { DeciplusTokens } from '../../src/services/deciplus'
import {
  DeciplusAlreadyBookedError,
  DeciplusAuthError,
  DeciplusInvalidParameterError,
  DeciplusQuotaError
} from '../../src/services/deciplus'
import Course from '../../src/models/course'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.create = jest.fn(() => mockedAxios)

const username = 'john.doe@example.com'
const password = "P@ssw0rd!123"
const client = new DeciplusClient(username, password)
client.instance = axios.create()

const deciplusTokens: DeciplusTokens = {
  clubToken: 'dummy-club-token',
  token: 'dummy-token'
}

const dummyCourse = {
  id: 123,
  activity: 'WOD',
  bookedMembers: 2,
  maxBookings: 10,
  date: new Date(),
  room: 'PREAU'
} as Course

describe('deciplus client', () => {
  describe('auth', () => {
    test('should auth user', async () => {
      const response = {
        data: {
          tokens: {
            deciplus: deciplusTokens.token,
            clubs: {
              dummyClub: [{
                token: deciplusTokens.clubToken
              }]
            }
          }
        }
      }
  
      mockedAxios.post.mockResolvedValue(response)
      await client.auth()
  
      expect(client.tokens).toMatchObject(deciplusTokens)
    })
  
    test('should not auth user and throw DeciplusAuthError', () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 403,
          data: {
            message: "Authentication failed: login or password incorrect !"
          }
        }
      })
  
      return expect(() => client.auth()).rejects.toThrow(DeciplusAuthError)
    })
  })

  describe('get available courses', () => {
    test('should return courses', async () => {
      const from = new Date(2021, 4, 1)
      const to = new Date(2021, 4, 15)
  
      client.instance.request = jest.fn().mockResolvedValueOnce({
        data: [{
          id: dummyCourse.id,
          description: dummyCourse.activity,
          bookedMembers: dummyCourse.bookedMembers,
          maxBookings: dummyCourse.maxBookings,
          startDate: dummyCourse.date,
          resource: {
            name: dummyCourse.room
          }
        }]
      })
  
      const courses = await client.getCourses(from, to)
  
      expect(courses).toMatchObject([dummyCourse])
    })
  
    test('should return empty course array', async () => {
      const from = new Date(2021, 4, 1)
      const to = new Date(2021, 4, 15)
  
      client.instance.request = jest.fn().mockResolvedValueOnce({
        data: []
      })
  
      const courses = await client.getCourses(from, to)
  
      expect(courses.length).toBe(0)
    })
  
    test('get courses should fail from after to', () => {
      const from = new Date(2021, 4, 15)
      const to = new Date(2021, 4, 1)
  
      client.instance.request = jest.fn().mockRejectedValueOnce({
        data: {
          message: "From date is above start date"
        }
      })
  
      return expect(() => client.getCourses(from, to)).rejects.toThrow(DeciplusInvalidParameterError)
    })
  })

  describe('book course', () => {
    test('should book a course', () => {
      client.instance.request = jest.fn().mockResolvedValue(dummyCourse)
      expect(client.bookCourse(dummyCourse)).resolves.toBe(dummyCourse)
    })

    test('should fail booking course quota exceeded', () => {
      client.instance.request = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: 'max booking'
          }
        }
      })

      return expect(() => client.bookCourse(dummyCourse)).rejects.toThrow(DeciplusQuotaError)
    })

    test('should fail booking course already booked', async () => {
      client.instance.request = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: 'This member is already registered to this booking'
          }
        }
      })

      await expect(client.bookCourse(dummyCourse)).rejects.toThrow(DeciplusAlreadyBookedError)
    })
  })
})
