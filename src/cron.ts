import { CronJob } from 'cron'
import moment from 'moment'
import {
  DATA_FILENAME,
  DATA_HEADERS,
  CSV_SEPARATOR,
  INTERVAL,
  DATE_FORMAT_WITH_SECONDS,
} from './constants'
import fs from 'fs'
import os from 'os'
import { Data } from './types'
import { clamp, formatDate } from './utils'
import { getBatteryLevel, getDisplayBrightness, getIsCharging, getIsLidClosed } from './commands'

const writeDataToFile = (data: Data, filename: string) => {
  const writeStream = fs.createWriteStream(filename, { flags: 'a' })

  fs.stat(filename, err => {
    if (err == null) {
      writeStream.write(data.join(CSV_SEPARATOR) + os.EOL)
    } else if (err.code === 'ENOENT') {
      writeStream.write(DATA_HEADERS.join(CSV_SEPARATOR) + os.EOL)
      writeStream.write(data.join(CSV_SEPARATOR) + os.EOL)
    }
  })
}

const cronFn = () => {
  const data: Data = [
    formatDate(moment(), DATE_FORMAT_WITH_SECONDS),
    getIsCharging(),
    getDisplayBrightness(),
    getIsLidClosed(),
    getBatteryLevel(),
  ]
  writeDataToFile(data, DATA_FILENAME)
}

export const cronJob = (interval: number): CronJob =>
  new CronJob(`*/${clamp(INTERVAL.MIN, INTERVAL.MAX, interval)} * * * * *`, cronFn, null, false)
