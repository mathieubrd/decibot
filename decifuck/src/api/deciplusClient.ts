import DeciplusTokens from './models/deciplusTokens'
import { DeciplusQuotaError, DeciplusRequestError, DeciplusAlreadyBookedError, DeciplusApiError } from './models/deciplusErrors'
import { formatISO } from 'date-fns'
import axios, { AxiosInstance, AxiosError, AxiosResponse, Method } from 'axios'
import Course from './models/course'

export default class DeciplusClient {
    static readonly BASE_URL = "https://api.deciplus.pro/"
    
    tokens?: DeciplusTokens
    instance: AxiosInstance
    username: String
    password: String

    constructor(username: string, password: string) {
        this.tokens = undefined
        this.instance = axios.create()
        this.username = username
        this.password = password
    }

    async auth() {
    
        const response = await axios.post(
            `${DeciplusClient.BASE_URL}/deciplus-members/v1/authenticate`, 
            {
                email: this.username,
                password: this.password
            }, 
            {
                headers: { 'Content-Type': 'application/json' }
            }
        )

        const data = response.data

        this.tokens = {
            token: data.tokens.deciplus,
            clubToken: data.tokens.clubs[Object.keys(data.tokens.clubs)[0]][0].token
        } as DeciplusTokens

        this.instance = axios.create({
            baseURL: `${DeciplusClient.BASE_URL}`,
            timeout: 3600,
            headers: {'x-access-token': this.tokens.clubToken}
          })
    }

    async getCourses(from: Date, to: Date): Promise<Course[]> {
        const fromDateFormatted = formatISO(from, { representation: 'date' })
        const toDateFormatted = formatISO(to, { representation: 'date' })

        if (!this.tokens) {
            throw new Error("Missing tokens")
        }
        const response = await this.request("GET", "/members/v1/classes", {
            from: encodeURIComponent(fromDateFormatted),
            to: encodeURIComponent(toDateFormatted)
        })
        const courses = response.data.map((data: any) => {
            return {
                id: data.id,
                activity: data.description.trim(),
                bookedMembers: data.bookedMembers,
                maxBookings: data.maxBookings,
                date: new Date(data.startDate),
                room: data.resource.name.trim()
            } as Course
        }) as Course[]
        return courses
    }

    async bookCourse(course: Course) {
        const response = await this.request("post", `/members/v1/booking/${course.id.toString()}/addMember`)
    }

    // create a generic function that handle every request to the api errors
    private async request(method: Method, url: string, params?: { [key: string]: string } ): Promise<AxiosResponse> {
        try {
            return await this.instance.request({
                method: method,
                url: url,
                params: params
            })
        } catch(error) {
            const err = error as AxiosError
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.error(err.response.data.message)
                if (err.response.data.message.includes('already registered to this booking')) {
                    throw new DeciplusAlreadyBookedError(err.response.data.message)
                }
                if (err.response.data.message.includes('max booking')) {
                    throw new DeciplusQuotaError(err.response.data.message)
                }
                throw new DeciplusApiError
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                // console.error(err.request)
                throw new DeciplusRequestError(err.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error(err.message)
                throw new Error(err.message)
            }
        }
    }
}