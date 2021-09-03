export const APP_NAME = 'time-on-battery-m1'
export const VERSION = '2.0.5'
export const DESCRIPTION = `Mac OS terminal app for measure real elapsed time on battery between charging.
Without sleeping time unlike in system's Activity Monitor.
v${VERSION}
`
export const IS_CHARGING_CMD = `system_profiler SPPowerDataType | grep Connected | awk '{print $2}'`
export const DISPLAY_BRIGHTNESS_CMD = `/usr/libexec/corebrightnessdiag status-info | grep 'DisplayServicesBrightness ' | grep -Eo "\\d+(?:\\.\\d+)?"`
export const BATTERY_LEVEL_CMD = `ioreg -l -w0 | grep '"CurrentCapacity" =' | grep -Eo "\\d+(?:\\.\\d+)?"`
export const IS_LID_CLOSED = `ioreg -r -k AppleClamshellState -d 1 | grep AppleClamshellState | awk '{print $3}'`
export const DATE_FORMAT = 'DD.MM.YYYY HH:mm'
export const DATA_FILENAME = 'tob-data.csv'
export const DATA_HEADERS = ['Date', 'Is charging?', 'Brightness', 'Is lid closed?']
export const CSV_SEPARATOR = ','
