import { fr } from 'date-fns/locale'
import { format } from 'date-fns'
import Course from './models/course'
import WantedSlot from './models/wantedSlot'

export function getFrenchDayFromDate(date: Date): string {
    const day = format(date, "EEEE", { locale: fr })
    return day
}

export function getHourFromDate(date: Date): string {
    const hour = format(date, "kk:mm")
    return hour
}

export function isRightHour(date: Date, wantedHour: string){
    return getHourFromDate(date) === wantedHour
}

export function isRightDay(date: Date, wantedDay: string){
    return getFrenchDayFromDate(date).toLocaleLowerCase() === wantedDay.toLocaleLowerCase()
}

export function findCourses(courses: Course[], WantedSlots: WantedSlot[]): Course[] {
    return courses.filter((course: Course) => {
        return WantedSlots.find((WantedSlot: WantedSlot) => {
            return isRightDay(course.date, WantedSlot.day)
                && isRightHour(course.date, WantedSlot.hour)
                && course.room === WantedSlot.room
                && course.activity === WantedSlot.activity
        })
    })
}
