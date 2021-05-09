import * as helpers from '../src/helpers'
import { set } from 'date-fns'

describe('get french day from date', () => {
  test('should return "mercredi"', () => {
    const date = new Date(2021, 4, 5)
    expect(helpers.getFrenchDayFromDate(date)).toBe('mercredi')
  })
  
  test('should not return "mercredi"', () => {
    const date = new Date(2021, 4, 6)
    expect(helpers.getFrenchDayFromDate(date)).not.toBe('mercredi')
  })
})

describe('get hour from date', () => {
  test('should return "14:00"', () => {
    const date = set(new Date(), {
      hours: 14,
      minutes: 0
    })

    expect(helpers.getHourFromDate(date)).toBe('14:00')
  })

  test('should not return "14:00"', () => {
    const date = set(new Date(), {
      hours: 15,
      minutes: 15
    })

    expect(helpers.getHourFromDate(date)).not.toBe('14:00')
  })
})
