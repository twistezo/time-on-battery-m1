import shell from 'shelljs'
import {
  BATTERY_LEVEL_CMD,
  DISPLAY_BRIGHTNESS_CMD,
  IS_CHARGING_CMD,
  IS_LID_CLOSED,
} from './constants'
import { BatteryLevel, Brightness, YesOrNo } from './types'

export const getBatteryLevel = (): BatteryLevel =>
  parseInt(shell.exec(BATTERY_LEVEL_CMD, { silent: true }).toString().replace(/\n/g, ''))

export const getIsCharging = (): boolean =>
  (shell.exec(IS_CHARGING_CMD, { silent: true }).toString().replace(/\n/g, '') as YesOrNo) === 'Yes'

export const getDisplayBrightness = (): Brightness => {
  const brightness: string = shell.exec(DISPLAY_BRIGHTNESS_CMD, { silent: true }).toString()
  if (!brightness) {
    return 0
  } else {
    return parseFloat(brightness)
  }
}
export const getIsLidClosed = (): boolean =>
  (shell.exec(IS_LID_CLOSED, { silent: true }).toString().replace(/\n/g, '') as YesOrNo) === 'Yes'
