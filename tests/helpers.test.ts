import {
  getFrenchDayFromDate,
  getHourFromDate,
  isRightDay,
  isRightHour,
  findCourses
} from '../src/helpers'
import WantedSlot from '../src/models/wantedSlot'
import Course from '../src/models/course'
import { set } from 'date-fns'

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

describe('get french day from date', () => {
  test('should return "mercredi"', () => {
    const date = new Date(2021, 4, 5)
    expect(getFrenchDayFromDate(date)).toBe('mercredi')
  })
  
  test('should not return "mercredi"', () => {
    const date = new Date(2021, 4, 6)
    expect(getFrenchDayFromDate(date)).not.toBe('mercredi')
  })
})

describe('get hour from date', () => {
  test('should return "14:00"', () => {
    const date = set(new Date(), {
      hours: 14,
      minutes: 0
    })

    expect(getHourFromDate(date)).toBe('14:00')
  })

  test('should not return "14:00"', () => {
    const date = set(new Date(), {
      hours: 15,
      minutes: 15
    })

    expect(getHourFromDate(date)).not.toBe('14:00')
  })
})

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

describe('find courses by wanted courses', () => {
  test('should find one course', () => {
    const wantedCourses: WantedSlot[] = [
      {
        day: "Mercredi",
        hour: "14:00",
        activity: "WOD TEENS",
        room: "FAKE"
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
        room: "FAKE"
      }
    ]
  
    expect(findCourses(availableCourses, wantedCourses).length).toBe(0)
  })
})
