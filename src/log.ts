import chalk from 'chalk'
import fs from 'fs'
import os from 'os'
import { CSV_SEPARATOR, DATA_FILENAME, DATE_FORMAT } from './constants'
import { Data, DateFormatted, IsCharging, Log } from './types'
import { hoursAndMinutesBetween, parseFormattedDate } from './utils'

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

const calculateLastTimesOnBattery = (data: Data[], last: number) => {
  const periods: Log[] = []
  let lastChargingDate: DateFormatted | null = null
  let lastChargingIndex: number | null = null // to excluding neighbors numbers

  data.forEach((d: Data, i: number) => {
    const [date, isCharging] = d

    if (isCharging === 1) {
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

  return periods.slice(Math.max(periods.length - last, 0))
}

const printLogs = (logs: Log[]) => {
  logs.forEach((l: Log, i: number) => {
    const [dateFrom, dateTo, timeOnBattery] = l
    console.log(`${i + 1}. ${dateFrom} - ${dateTo}: ${chalk.green(timeOnBattery)}`)
  })
}

export const generateLogs = (last: number): void => {
  fs.stat(DATA_FILENAME, err => {
    if (err == null) {
      const data = processRawData()
      const ltob = calculateLastTimesOnBattery(data, last)
      printLogs(ltob)
    } else if (err.code === 'ENOENT') {
      console.log('Log file not found or empty.\nRun service first -> "tob run" or "tob r.')
    }
  })
}
