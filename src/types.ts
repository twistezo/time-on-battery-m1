export type IsChargingRaw = 'Yes' | 'No'
export type IsCharging = 0 | 1
export type Brightness = number
export type DateFormatted = string
export type HoursAndMinutes = string
export type BatteryLevel = number
export type Data = [DateFormatted, IsCharging, Brightness]
export type Log = [DateFormatted, DateFormatted, HoursAndMinutes]
