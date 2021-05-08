import DeciplusClient from './deciplusClient'
import { DeciplusAlreadyBookedError, DeciplusQuotaError } from './models/deciplusErrors'
import Course from './models/course'
import WantedCourse from './models/wantedCourse'
import { getFrenchDayFromDate, getHourFromDate } from './helpers'


function isRightHour(date: Date, wantedHour: string){
    return getHourFromDate(date) === wantedHour
}

function isRightDay(date: Date, wantedDay: string){
    return getFrenchDayFromDate(date) === wantedDay
}

function findCourses(courses: Course[], wantedCourses: WantedCourse[]): Course[] {
    return courses.filter((course: Course) => {
        return wantedCourses.find((wantedCourse: WantedCourse) => {
            return isRightDay(course.date, wantedCourse.day)
                && isRightHour(course.date, wantedCourse.hour)
                && course.room === wantedCourse.room
                && course.activity === wantedCourse.activity
        })
    })
}

async function bookWantedCourses(client:DeciplusClient, courses: Course[]) {
    console.log("Booking Courses ...")
    try {
        courses.forEach(async (course: Course) => {
            try {
                await client.bookCourse(course)
                console.log(course)
            } catch (e) {
                if (e instanceof DeciplusAlreadyBookedError) {
                    console.log(`course ${course.activity} already booked at ${course.date}`)
                    return
                }
            }
        })
    } catch (e) {
        if (e instanceof DeciplusQuotaError) {
            return
        }
    }
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
    email: "maelle.leherisse@gmail.com",
    password: "mlb3262b"
}
const client = new DeciplusClient(credentials.email, credentials.password)
client.auth().then(_ => {
    // months begin at 0, meaning you have to do -1 on your dates
    const fromDate= new Date(2021, 3, 20)
    const toDate = new Date(2021, 4, 20)
    client.getCourses(fromDate, toDate).then((courses: Course[]) => {
        const wantedCoursesToBook = findCourses(courses, wantedCourses)
        bookWantedCourses(client, wantedCoursesToBook)
    })
})