import { Moment, default as moment } from 'moment'
import { HoursAndMinutes } from './types'

export const parseFormattedDate = (date: string, format: string): string =>
  moment(date, format).format(format)

export const formatDate = (date: Moment, format: string): string => moment(date).format(format)

export const hoursAndMinutesBetween = (
  endDate: string,
  startDate: string,
  format: string
): string => durationToHoursAndMinutes(moment(endDate, format).diff(moment(startDate, format)))

// https://stackoverflow.com/a/58826445/7268884
const durationToHoursAndMinutes = (duration: number): HoursAndMinutes => {
  const portions: string[] = []

  const msInHour = 1000 * 60 * 60
  const hours = Math.trunc(duration / msInHour)
  if (hours > 0) {
    portions.push(hours + 'h')
    duration = duration - hours * msInHour
  }

  const msInMinute = 1000 * 60
  const minutes = Math.trunc(duration / msInMinute)
  if (minutes > 0) {
    portions.push(minutes + 'm')
    duration = duration - minutes * msInMinute
  }

  const seconds = Math.trunc(duration / 1000)
  if (seconds > 0) {
    portions.push(seconds + 's')
  }

  return portions.join(' ')
}
