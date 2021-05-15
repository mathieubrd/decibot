import { isRightHour, isRightDay, findCourses } from '../src'
import { set } from 'date-fns'
import WantedSlot from './models/wantedSlot'
import Course from '../src/models/course'
import { handler } from '../src/index'
import DeciplusClient from '../src/services/deciplus'

const availableCourses: Course[] = [
  {
    id: 1234,
    activity: 'WOD TEENS',
    bookedMembers: 2,
    maxBookings: 10,
    date: set(new Date(2021, 4, 5), {
      hours: 14,
      minutes: 0
    }),
    room: '.PREAU'
  }
]

test('should be the same hour', () => {
  const date = set(new Date(), {
    hours: 14,
    minutes: 0
  })

  expect(isRightHour(date, '14:00')).toBeTruthy()
})

test('should not be the same hour', () => {
  const date = set(new Date(), {
    hours: 14,
    minutes: 10
  })

  expect(isRightHour(date, '14:00')).not.toBeTruthy()
})

test('should be the same day', () => {
  const date = new Date(2021, 4, 9)

  expect(isRightDay(date, 'dimanche')).toBeTruthy()
})

test('should not be the same day', () => {
  const date = new Date(2021, 4, 9)

  expect(isRightDay(date, 'lundi')).not.toBeTruthy()
})

test('should find one course', () => {
  const wantedCourses: WantedSlot[] = [
    {
      day: "Mercredi",
      hour: "14:00",
      activity: "WOD TEENS",
      room: ".PREAU"
    }
  ]

  expect(findCourses(availableCourses, wantedCourses)).toMatchObject(availableCourses)
})

test('should not find course', () => {
  const wantedCourses: WantedSlot[] = [
    {
      day: "Jeudi",
      hour: "14:00",
      activity: "WOD",
      room: ".PREAU"
    }
  ]

  expect(findCourses(availableCourses, wantedCourses).length).toBe(0)
})

describe('handler', () => {
  beforeAll(() => {
    jest.spyOn(DeciplusClient.prototype, 'auth').mockResolvedValue()
    jest.spyOn(DeciplusClient.prototype, 'bookCourse').mockResolvedValue()
  })

  test('handler should resolve to a list of booked courses', () => {
    jest.spyOn(DeciplusClient.prototype, 'getCourses').mockResolvedValue(availableCourses)
  
    return expect(handler()).resolves.toStrictEqual(availableCourses)
  })
  
  test('handler should resolve to an empty bookded courses', () => {
    jest.spyOn(DeciplusClient.prototype, 'getCourses').mockResolvedValue([])

    return expect(handler()).resolves.toStrictEqual([])
  })  
})
