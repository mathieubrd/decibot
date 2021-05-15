import DeciplusClient from './services/deciplus'
import Course from './models/course'
import WantedSlot from './models/wantedSlot'
import { getFrenchDayFromDate, getHourFromDate } from './helpers'

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

const WantedSlots: WantedSlot[] = [
    {
        day: "mercredi",
        hour: "14:00",
        activity: "WOD TEENS",
        room: ".PREAU"
    }
]

const credentials = {
    email: "john.doe@example.com",
    password: "P@ssword!123"
}

export const handler = async (): Promise<Course[]> => {
    const client = new DeciplusClient(credentials.email, credentials.password)
    await client.auth()

    const fromDate= new Date(2021, 3, 20)
    const toDate = new Date(2021, 4, 20)
    const courses = await client.getCourses(fromDate, toDate)
    const WantedSlotsToBook = findCourses(courses, WantedSlots)
    
    await Promise.all(WantedSlotsToBook.map((course: Course) => {
        return client.bookCourse(course)
    }))

    return WantedSlotsToBook
}
