import { CronJob } from 'cron'
import moment from 'moment'
import { DATA_FILENAME, DATA_HEADERS, CSV_SEPARATOR, DATE_FORMAT } from './constants'
import fs from 'fs'
import os from 'os'
import { Data } from './types'
import { formatDate } from './utils'
import { getDisplayBrightness, getIsCharging, getIsLidClosed } from './commands'

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
    formatDate(moment(), DATE_FORMAT),
    getIsCharging(),
    getDisplayBrightness(),
    getIsLidClosed(),
  ]
  writeDataToFile(data, DATA_FILENAME)
}

export const cronJob = new CronJob('1 * * * * *', cronFn, null, false)
