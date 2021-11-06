import DeciplusClient, { DeciplusBookingComplete } from './services/deciplus'
import Course from './models/course'
import { getWantedSlots } from './services/wantedSlots'
import { getCredentials } from './services/credentials'
import Credentials from './models/credentials'
import nextMonday from 'date-fns/nextMonday'
import endOfWeek from 'date-fns/endOfWeek'
import { findCourses } from './helpers'

export const handler = async (): Promise<void> => {
    const credentials = await getCredentials('decifuck')

    for(const {email, password} of credentials) {
        const client = new DeciplusClient(email, password)
        await client.auth()

        console.log('email', email);
        const wantedSlots = await getWantedSlots(email)
        console.log('wantedSlots', wantedSlots);

        if (wantedSlots.length) {
            console.info(wantedSlots);
            const fromDate= new Date()
            const toDate = endOfWeek(nextMonday(fromDate))

            const courses = await client.getCourses(fromDate, toDate)
            console.info('courses');
            console.info(courses);

            const wantedSlotsToBook = findCourses(courses, wantedSlots)
            console.info('wantedSlotsToBook');
            console.info(wantedSlotsToBook);

            const results = await Promise.all(wantedSlotsToBook.map((course: Course): Promise<Course | Error | undefined> => {
                //catch errors to let all requests execute even if there is one error
                //replace by allSettled when available
                //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
                return client.bookCourse(course).catch(e => {
                    console.error(e)
                    return e;
                });
            }))

            if(results) {
                const validResults = results.filter(result => !(result instanceof Error));
                if(validResults.length) {
                    console.log(`successfully booked ${validResults.length} courses`);
                }
            }
        }
    }
}