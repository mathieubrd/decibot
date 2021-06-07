import { formatISO } from 'date-fns'
import isBefore from 'date-fns/isBefore'
import axios, { AxiosInstance, AxiosError, AxiosResponse, Method } from 'axios'
import Course from '../models/course'

export type DeciplusTokens = {
    token: string
    clubToken: string
}

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
        try {
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
        } catch (e) {
            throw this.handleError(e as AxiosError)
        }
    }

    async getCourses(from: Date, to: Date): Promise<Course[]> {
        if (isBefore(to, from)) {
            throw new DeciplusInvalidParameterError("From date cannot be before to date")
        }

        const fromDateFormatted = formatISO(from, { representation: 'date' })
        const toDateFormatted = formatISO(to, { representation: 'date' })

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

    async bookCourse(course: Course): Promise<Course> {
        await this.request("post", `/members/v1/booking/${course.id.toString()}/addMember`)
        return course
    }

    private async request(method: Method, url: string, params?: { [key: string]: string } ): Promise<AxiosResponse> {
        try {
            const response = await this.instance.request({
                method: method,
                url: url,
                params: params
            })

            return response

        } catch(error) {
            throw this.handleError(error as AxiosError)
        }
    }

    private handleError(err: AxiosError) {
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // console.error(err.response.data.message)
            if (err.response.data.message.includes('Authentication failed')) {
                throw new DeciplusAuthError(err.response.data.message)
            }

            if (err.response.data.message.includes('already registered to this booking')) {
                throw new DeciplusAlreadyBookedError(err.response.data.message)
            }

            if (err.response.data.message.includes('max booking')) {
                throw new DeciplusQuotaError(err.response.data.message)
            }

            if (err.response.data.message.includes('complete')) {
                throw new DeciplusBookingComplete(err.response.data.message)
            }
            
            throw new DeciplusApiError(err.response.data.message)
        } else if (err.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            // console.error(err.request)
            throw new DeciplusRequestError(err.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(err.message)
        }
    }
}

export class DeciplusInvalidParameterError extends Error {
    constructor(message?: string) {
        super(message)
        this.name= "DeciplusInvalidParameterError"
        Object.setPrototypeOf(this, DeciplusInvalidParameterError.prototype)
    }
}

export class DeciplusAuthError extends Error {
    constructor(message?: string) {
        super(message)
        this.name= "DeciplusAuthError"
        Object.setPrototypeOf(this, DeciplusAuthError.prototype)
    }
}

export class DeciplusQuotaError extends Error {

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusQuotaError"
        Object.setPrototypeOf(this, DeciplusQuotaError.prototype)
    }

}

export class DeciplusRequestError extends Error {

    constructor(message?: string) {
        super(message)
        this.name= "DeciplusRequestError"
        Object.setPrototypeOf(this, DeciplusRequestError.prototype)
    }
    
}

export class DeciplusAlreadyBookedError extends Error {
    constructor(message?: string) {
        super(message)
        this.name= "DeciplusAlreadyBookedError"
        Object.setPrototypeOf(this, DeciplusAlreadyBookedError.prototype)
    }  
}

export class DeciplusApiError extends Error {
    constructor(message?: string) {
        super(message)
        this.name= "DeciplusApiError"
        Object.setPrototypeOf(this, DeciplusApiError.prototype)
    } 
}

export class DeciplusBookingComplete extends Error {
    constructor(message?: string) {
        super(message)
        this.name= "DeciplusBookingComplete"
        Object.setPrototypeOf(this, DeciplusApiError.prototype)
    } 
}

