import DeciplusClient from './services/deciplus'
import Course from './models/course'
import WantedCourse from './models/wantedCourse'
import { getFrenchDayFromDate, getHourFromDate } from './helpers'

export function isRightHour(date: Date, wantedHour: string){
    return getHourFromDate(date) === wantedHour
}

export function isRightDay(date: Date, wantedDay: string){
    return getFrenchDayFromDate(date).toLocaleLowerCase() === wantedDay.toLocaleLowerCase()
}

export function findCourses(courses: Course[], wantedCourses: WantedCourse[]): Course[] {
    return courses.filter((course: Course) => {
        return wantedCourses.find((wantedCourse: WantedCourse) => {
            return isRightDay(course.date, wantedCourse.day)
                && isRightHour(course.date, wantedCourse.hour)
                && course.room === wantedCourse.room
                && course.activity === wantedCourse.activity
        })
    })
}

const wantedCourses: WantedCourse[] = [
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
    const wantedCoursesToBook = findCourses(courses, wantedCourses)
    
    await Promise.all(wantedCoursesToBook.map((course: Course) => {
        return client.bookCourse(course)
    }))

    return wantedCoursesToBook
}
