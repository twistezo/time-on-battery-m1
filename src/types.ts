import { Moment } from 'moment'

export type IsChargingRaw = 'Yes' | 'No'
export type IsCharging = 0 | 1
export type Brightness = number
export type Data = [Moment, IsCharging, Brightness]
