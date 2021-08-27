import { CronJob } from 'cron'
// import moment from 'moment'
import momentTimezone from 'moment-timezone'
import shell from 'shelljs'
import { displayBrightnessCmd, isChargingCmd } from './constants'

// const cronTime = '1 * * * * *' // every 1 minute (http://crontab.org/)
// TODO: remove
const cronTime = '* * * * * *' // every 1 minute (http://crontab.org/)

export const cronJob = new CronJob(
  cronTime,
  () => {
    // Is notebook connected to charger? `Yes` or `No`
    const isCharging = shell.exec(isChargingCmd, { silent: true }).toString()
    console.log('Is charging?', isCharging)

    // Show current display brightness
    const displayBrightness = shell.exec(displayBrightnessCmd, { silent: true }).toString()
    console.log('Display brightness:', displayBrightness)
  },
  null,
  true,
  momentTimezone.tz.guess()
)
