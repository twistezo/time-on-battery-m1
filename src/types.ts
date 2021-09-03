export type YesOrNo = 'Yes' | 'No'
export type IsCharging = boolean
export type IsLidCLosed = boolean
export type Brightness = number
export type DateFormatted = string
export type HoursAndMinutes = string
export type BatteryLevel = number
export type Data = [DateFormatted, IsCharging, Brightness, IsLidCLosed, BatteryLevel]
export type Log = [DateFormatted, DateFormatted, HoursAndMinutes, BatteryLevel, BatteryLevel]
