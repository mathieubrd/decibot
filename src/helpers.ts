import { fr } from 'date-fns/locale'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

export function getFrenchDayFromDate(date: Date): string {
    const day = format(date, "EEEE", { locale: fr })
    return day
}

export function getHourFromDate(date: Date): string {
    const parisTime = utcToZonedTime(date, 'Europe/Paris')
    const hour = format(parisTime, "kk:mm")
    return hour
}
