import { Moment, default as moment } from 'moment'
import { HoursAndMinutes } from './types'

export const parseFormattedDate = (date: string, format: string): string =>
  moment(date, format).format(format)

export const formatDate = (date: Moment, format: string): string => moment(date).format(format)

export const durationBetween = (endDate: string, startDate: string, format: string): number =>
  moment(endDate, format).diff(moment(startDate, format))

export const hoursAndMinutesBetween = (
  endDate: string,
  startDate: string,
  format: string
): HoursAndMinutes => durationToHoursAndMinutes(durationBetween(endDate, startDate, format))

// Author: https://stackoverflow.com/a/58826445/7268884
export const durationToHoursAndMinutes = (duration: number): HoursAndMinutes => {
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

export const stringToBoolean = (value: string): boolean => value.toLowerCase() === 'true'

export const clamp = (min: number, max: number, value: number): number =>
  Math.max(min, Math.min(value, max))
