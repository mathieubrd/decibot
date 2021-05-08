import { fr } from 'date-fns/locale'
import { format } from 'date-fns'

export function getFrenchDayFromDate(date: Date): string {
    return format(date, "EEEE", { locale: fr })
}

export function getHourFromDate(date: Date): string {
    return format(date, "kk:mm")
}
