import chalk from 'chalk'
import fs from 'fs'
import os from 'os'
import { CSV_SEPARATOR, DATA_FILENAME, DATE_FORMAT } from './constants'
import { Data, DateFormatted, HoursAndMinutes, IsCharging, Log } from './types'
import {
  durationBetween,
  durationToHoursAndMinutes,
  hoursAndMinutesBetween,
  parseFormattedDate,
} from './utils'

const readRawData = (): string => fs.readFileSync(DATA_FILENAME).toString()

const cleanRawData = (rawData: string): string[][] => {
  const cleaned = rawData.split(os.EOL).map(e => e.split(CSV_SEPARATOR))
  cleaned.shift()
  cleaned.pop()

  return cleaned
}

const convertCleanedRawData = (cleanedRawData: string[][]): Data[] =>
  cleanedRawData.map(
    (e): Data => [
      parseFormattedDate(e[0], DATE_FORMAT),
      parseInt(e[1]) as IsCharging,
      parseFloat(e[2]),
    ]
  )

const processRawData = (): Data[] => {
  const rawData = readRawData()
  const cleanedRawData = cleanRawData(rawData)
  return convertCleanedRawData(cleanedRawData)
}

const calculateLastTimesOnBattery = (data: Data[], last: number): Log[] => {
  const periods: Log[] = []
  let lastChargingDate: DateFormatted | null = null
  let lastChargingIndex: number | null = null // to excluding neighbors numbers

  data.forEach((d: Data, i: number) => {
    const [date, isCharging, brightness] = d

    if (isCharging === 1 && brightness > 0) {
      if (lastChargingDate === null) {
        lastChargingDate = date
        lastChargingIndex = i
      } else {
        if (lastChargingIndex && i - lastChargingIndex > 1) {
          periods.push([
            lastChargingDate,
            date,
            hoursAndMinutesBetween(date, lastChargingDate, DATE_FORMAT),
          ])
        }
        lastChargingDate = null
        lastChargingIndex = null
      }
    }
  })

  const slicedToLastN = periods.slice(Math.max(periods.length - last, 0))

  return slicedToLastN
}

const calculateTimeElapsedFromLastCharging = (data: Data[]): HoursAndMinutes => {
  let lastChargingIndex: number | null = null
  let tempData = [...data].reverse()
  let elapsedDuration = 0

  for (const [i, data] of tempData.entries()) {
    const [, isCharging] = data

    if (isCharging === 1) {
      lastChargingIndex = i
      break
    }
  }

  if (lastChargingIndex) {
    tempData = tempData.slice(0, lastChargingIndex)
    tempData = tempData.reverse()

    tempData.reduce((prev, curr): Data => {
      const [prevDate, , prevBrightness] = prev
      const [date, , brightness] = curr

      if (prevBrightness > 0 && brightness > 0) {
        elapsedDuration += durationBetween(date, prevDate, DATE_FORMAT)
      }
      return curr
    })
  }

  return durationToHoursAndMinutes(elapsedDuration)
}

const printLogs = (logs: Log[], timeElapsedFromLastCharging: HoursAndMinutes, last: number) => {
  if (timeElapsedFromLastCharging) {
    console.log(`${chalk.cyan('Time elapsed from last charging')}`)
    console.log(`${chalk.green(timeElapsedFromLastCharging)}`)
  }

  console.log(`\n${chalk.cyan(`Last ${last} logs`)}`)
  if (logs) {
    logs.forEach((l: Log, i: number) => {
      const [dateFrom, dateTo, timeOnBattery] = l
      console.log(`${chalk.cyan(i + 1)}. ${dateFrom} - ${dateTo} -> ${chalk.green(timeOnBattery)}`)
    })
  } else {
    console.log('Not enough data for calculating...')
    console.log('Check if the service is running or wait a while for collect the data.')
  }
}

export const generateLogs = (last: number): void => {
  fs.stat(DATA_FILENAME, err => {
    if (err == null) {
      const data = processRawData()
      const logs = calculateLastTimesOnBattery(data, last)
      const timeElapsedFromLastCharging = calculateTimeElapsedFromLastCharging(data)

      printLogs(logs, timeElapsedFromLastCharging, last)
    } else if (err.code === 'ENOENT') {
      console.log('Error. Log file not found or empty.\nRun service with argument "run".')
    }
  })
}
