import chalk from 'chalk'
import fs from 'fs'
import os from 'os'
import { getBatteryLevel } from './commands'
import { CSV_SEPARATOR, DATA_FILENAME, DATE_FORMAT, DATE_FORMAT_WITH_SECONDS } from './constants'
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
      parseFormattedDate(e[0], DATE_FORMAT_WITH_SECONDS),
      stringToBoolean(e[1]),
      parseFloat(e[2]),
      stringToBoolean(e[3]),
      parseInt(e[4]),
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
  let batteryStart: number | null = null
  let batteryEnd: number | null = null

  data.reduce((current, next): Data => {
    const [dateCurrent, isChargingCurrent, , isLidClosedCurrent, batteryCurrent] = current
    const [dateNext, isChargingNext, , isLidClosedNext, batteryNext] = next

    if (isChargingCurrent && !isChargingNext) {
      // charging has stopped
      if (isLidClosedCurrent && isLidClosedNext) {
        // charging has stopped with closed lid
        periodStart = dateNext
        batteryStart = batteryNext
      } else if (!isLidClosedNext || !isLidClosedCurrent) {
        // charging has stopped and lid has been opened
        if (!periodStart) {
          periodStart = dateNext
          batteryStart = batteryNext
        } else if (periodStart && !periodEnd) {
          periodEnd = dateNext
          batteryEnd = batteryNext
        }
      }
    } else if (!isChargingCurrent && isChargingNext) {
      // charging has started
      if (!isLidClosedCurrent) {
        // charging has started with opened lid
        if (periodStart && !periodEnd) {
          periodEnd = dateCurrent
          batteryEnd = batteryCurrent
        }
      } else if (isLidClosedNext) {
        // charging has started with closed lid
        periodEnd = dateNext
        batteryEnd = batteryNext
      }
    } else if (isChargingCurrent && isChargingNext) {
      // charging is in progress
      periodStart = null
      periodEnd = null
      sleepDuration = 0
      batteryStart = null
      batteryEnd = null
    }

    if (isLidClosedCurrent && isLidClosedNext) {
      sleepDuration += durationBetween(dateNext, dateCurrent, DATE_FORMAT_WITH_SECONDS)
    }

    if (periodStart && periodEnd && batteryStart && batteryEnd) {
      const periodsDuration = durationBetween(periodEnd, periodStart, DATE_FORMAT_WITH_SECONDS)
      const duration = periodsDuration - sleepDuration
      const hoursAndMinutes = durationToHoursAndMinutes(duration)

      if (hoursAndMinutes) {
        periods.push([periodStart, periodEnd, hoursAndMinutes, batteryStart, batteryEnd])
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

const calculateTimeFromCharging = (
  data: Data[]
): {
  time: HoursAndMinutes
  battery: BatteryLevel | null
} => {
  let lastChargingIndex: number | null = null
  let tempData = [...data].reverse()
  let duration = 0
  let batteryLevel: BatteryLevel | null = null

  for (const [i, data] of tempData.entries()) {
    const [, isChargingData] = data

    if (isChargingData) {
      lastChargingIndex = i
      break
    }
  }

  if (lastChargingIndex) {
    batteryLevel = tempData[lastChargingIndex][4]

    tempData = tempData.slice(0, lastChargingIndex)
    tempData = tempData.reverse()

    tempData.reduce((current, next): Data => {
      const [dateCurrent, , , isLidCLosedCurrent] = current
      const [dateNext, , , isLidClosedNext] = next

      if (!isLidCLosedCurrent && !isLidClosedNext) {
        duration += durationBetween(dateNext, dateCurrent, DATE_FORMAT_WITH_SECONDS)
      }

      return next
    })
  }

  return {
    time: durationToHoursAndMinutes(duration),
    battery: batteryLevel,
  }
}

const notEnoughDataInfo = (): void => {
  console.log('Not enough data for calculations...')
  console.log('Check if the service is running or wait a while for collecting the data.')
}

const print = ({
  timeElapsedFromLastCharging,
  lastChargingBatteryLevel,
  isCharging,
  currentBatteryLevel,
  logs,
  quantity,
}: {
  timeElapsedFromLastCharging: HoursAndMinutes
  lastChargingBatteryLevel: BatteryLevel | null
  isCharging: boolean
  currentBatteryLevel: BatteryLevel
  logs: Log[]
  quantity: number
}) => {
  if (timeElapsedFromLastCharging) {
    console.log(
      `${chalk.cyan('Time elapsed from last charging')}${
        lastChargingBatteryLevel ? chalk.cyan(' to ' + lastChargingBatteryLevel + '%') : ''
      }`
    )
    console.log(`${chalk.green(timeElapsedFromLastCharging)}\n`)
  }

  console.log(`${chalk.cyan('Battery level')}`)
  console.log(
    `${chalk.green(`${isCharging ? '⚡ ' : ''}${currentBatteryLevel}%`)}${
      isCharging ? chalk.green(' - charging...') : ''
    }`
  )

  console.log(`\n${chalk.cyan(`Last ${quantity} periods on battery`)}`)
  if (logs) {
    logs.forEach((l: Log, i: number) => {
      const [dateFrom, dateTo, timeOnBattery, batteryStart, batteryEnd] = l

      console.log(
        `${chalk.cyan(i + 1)} ${dateFrom} ${chalk.green(
          batteryStart + '%'
        )}\t- ${dateTo} ${chalk.yellow(batteryEnd + '%')}\t-> ${chalk.cyan(timeOnBattery)}`
      )
    })
  } else {
    notEnoughDataInfo()
  }
}

export const generateLogs = (quantity: number): void => {
  fs.stat(DATA_FILENAME, err => {
    if (err == null) {
      const data = processRawData()
      if (data.length === 0) {
        notEnoughDataInfo()
        return
      }

      const logs = calculatePeriodsOnBattery(data, quantity).reverse()
      const { time: timeElapsedFromLastCharging, battery: lastChargingBatteryLevel } =
        calculateTimeFromCharging(data)
      const currentBatteryLevel = getBatteryLevel()
      const isCharging = data[data.length - 1][1]

      print({
        timeElapsedFromLastCharging,
        lastChargingBatteryLevel,
        isCharging,
        currentBatteryLevel,
        logs,
        quantity,
      })
    } else if (err.code === 'ENOENT') {
      console.log('Error. Log file not found or empty.\nFirstly run service.')
    }
  })
}
