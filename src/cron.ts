import { CronJob } from 'cron'
import moment from 'moment'
import shell from 'shelljs'
import {
  DISPLAY_BRIGHTNESS_CMD,
  IS_CHARGING_CMD,
  DATA_FILENAME,
  DATA_HEADERS,
  CSV_SEPARATOR,
  DATE_FORMAT,
} from './constants'
import fs from 'fs'
import os from 'os'
import { Brightness, Data, IsCharging, IsChargingRaw } from './types'
import { formatDate } from './utils'

const getIsCharging = (): IsCharging =>
  (shell.exec(IS_CHARGING_CMD, { silent: true }).toString().replace(/\n/g, '') as IsChargingRaw) ===
  'Yes'
    ? 1
    : 0

const getDisplayBrightness = (): Brightness => {
  const brightness: string = shell.exec(DISPLAY_BRIGHTNESS_CMD, { silent: true }).toString()
  if (!brightness) {
    return 0
  } else {
    return parseFloat(brightness)
  }
}

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
  const data: Data = [formatDate(moment(), DATE_FORMAT), getIsCharging(), getDisplayBrightness()]
  writeDataToFile(data, DATA_FILENAME)
}

export const cronJob = new CronJob('1 * * * * *', cronFn, null, false)
