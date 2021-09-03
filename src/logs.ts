import chalk from 'chalk'
import fs from 'fs'
import os from 'os'
import { getBatteryLevel } from './commands'
import { CSV_SEPARATOR, DATA_FILENAME, DATE_FORMAT } from './constants'
import { BatteryLevel, Data, DateFormatted, HoursAndMinutes, Log } from './types'
import {
  durationBetween,
  durationToHoursAndMinutes,
  parseFormattedDate,
  stringToBoolean,
} from './utils'

const readRawData = (): string => fs.readFileSync(DATA_FILENAME).toString()

const cleanRawData = (rawData: string): string[][] => {
  const cleaned = rawData
    .split(os.EOL)
    .map(e => (!e ? [] : e.split(CSV_SEPARATOR)))
    .filter(e => e.length > 0)
  cleaned.shift()

  return cleaned
}

const convertCleanedRawData = (cleanedRawData: string[][]): Data[] =>
  cleanedRawData.map(
    (e): Data => [
      parseFormattedDate(e[0], DATE_FORMAT),
      stringToBoolean(e[1]),
      parseFloat(e[2]),
      stringToBoolean(e[3]),
    ]
  )

const processRawData = (): Data[] => {
  const rawData = readRawData()
  const cleanedRawData = cleanRawData(rawData)
  return convertCleanedRawData(cleanedRawData)
}

const calculatePeriodsOnBattery = (data: Data[], quantity: number): Log[] => {
  const periods: Log[] = []
  let periodStart: DateFormatted | null = null
  let periodEnd: DateFormatted | null = null
  let sleepDuration = 0

  data.reduce((current, next): Data => {
    const [dateCurrent, isChargingCurrent, , isLidClosedCurrent] = current
    const [dateNext, isChargingNext, , isLidClosedNext] = next

    if (isChargingCurrent && !isChargingNext && !isLidClosedNext) {
      if (!periodStart) {
        periodStart = dateNext
      } else if (periodStart && !periodEnd) {
        periodEnd = dateNext
      }
    } else if (!isChargingCurrent && isChargingNext && !isLidClosedCurrent) {
      if (periodStart && !periodEnd) {
        periodEnd = dateCurrent
      }
    } else if (isChargingCurrent && isChargingNext) {
      periodStart = null
      periodEnd = null
      sleepDuration = 0
    }

    if (periodStart && !periodEnd) {
      if (isLidClosedCurrent && isLidClosedNext) {
        sleepDuration += durationBetween(dateNext, dateCurrent, DATE_FORMAT)
      }
    }

    if (periodStart && periodEnd && sleepDuration) {
      const periodsDuration = durationBetween(periodEnd, periodStart, DATE_FORMAT)
      const duration = periodsDuration - sleepDuration
      const hoursAndMinutes = durationToHoursAndMinutes(duration)

      if (hoursAndMinutes) {
        periods.push([periodStart, periodEnd, hoursAndMinutes])
      }

      periodStart = null
      periodEnd = null
      sleepDuration = 0
    }

    return next
  })

  const slicedToLastN = periods.slice(Math.max(periods.length - quantity, 0))
  return slicedToLastN
}

const calculateTimeFromCharging = (data: Data[]): HoursAndMinutes => {
  let lastChargingIndex: number | null = null
  let tempData = [...data].reverse()
  let duration = 0

  for (const [i, data] of tempData.entries()) {
    const [, isCharging] = data

    if (isCharging) {
      lastChargingIndex = i
      break
    }
  }

  if (lastChargingIndex) {
    tempData = tempData.slice(0, lastChargingIndex)
    tempData = tempData.reverse()

    tempData.reduce((current, next): Data => {
      const [dateCurrent, , , isLidCLosedCurrent] = current
      const [dateNext, , , isLidClosedNext] = next

      if (!isLidCLosedCurrent && !isLidClosedNext) {
        duration += durationBetween(dateNext, dateCurrent, DATE_FORMAT)
      }

      return next
    })
  }

  return durationToHoursAndMinutes(duration)
}

const print = ({
  timeElapsedFromLastCharging,
  batteryLevel,
  logs,
  quantity,
}: {
  timeElapsedFromLastCharging: HoursAndMinutes
  batteryLevel: BatteryLevel
  logs: Log[]
  quantity: number
}) => {
  if (timeElapsedFromLastCharging) {
    console.log(`${chalk.cyan('Time elapsed from last charging')}`)
    console.log(`${chalk.green(timeElapsedFromLastCharging)}\n`)
  }

  console.log(`${chalk.cyan('Battery level')}`)
  console.log(`${chalk.green(`${batteryLevel}%`)}`)

  console.log(`\n${chalk.cyan(`Last ${quantity} periods on battery`)}`)
  if (logs) {
    logs.forEach((l: Log, i: number) => {
      const [dateFrom, dateTo, timeOnBattery] = l
      console.log(`${chalk.cyan(i + 1)}. ${dateFrom} - ${dateTo} -> ${chalk.green(timeOnBattery)}`)
    })
  } else {
    console.log('Not enough data for calculations...')
    console.log('Check if the service is running or wait a while for collecting the data.')
  }
}

export const generateLogs = (quantity: number): void => {
  fs.stat(DATA_FILENAME, err => {
    if (err == null) {
      const data = processRawData()
      const logs = calculatePeriodsOnBattery(data, quantity)
      const timeElapsedFromLastCharging = calculateTimeFromCharging(data)
      const batteryLevel = getBatteryLevel()

      print({ timeElapsedFromLastCharging, batteryLevel, logs, quantity })
    } else if (err.code === 'ENOENT') {
      console.log(
        'Error. Log file not found or empty.\nFirstly run service with argument "service".'
      )
    }
  })
}
