export const APP_NAME = 'time-on-battery-m1'
export const DESCRIPTION = `Mac OS app for measure real elapsed time on battery between charging.
Without sleeping time unlike in system's Activity Monitor.
Requires Big Sur and M1 processor.
`
export const IS_CHARGING_CMD = `system_profiler SPPowerDataType | grep Connected | awk '{print $2}'`
export const DISPLAY_BRIGHTNESS_CMD = `/usr/libexec/corebrightnessdiag status-info | grep 'DisplayServicesBrightness ' | grep -Eo "\\d+(?:\\.\\d+)?"`
export const DATE_FORMAT = 'DD.MM.YYYY HH:mm'
export const DATA_FILENAME = 'tob-data.csv'
export const DATA_HEADERS = ['Date', 'Is charging?', 'Brightness']
export const CSV_SEPARATOR = ','
