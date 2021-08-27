export const appName = 'time-on-battery-m1'
export const description = `Mac OS app for measure real elapsed time on battery between charging.
Without sleeping time unlike system's Activity Monitor counts.
Requires Big Sur and M1 processor.
`
export const isChargingCmd = `system_profiler SPPowerDataType | grep Connected | awk '{print $2}'`
export const displayBrightnessCmd = `/usr/libexec/corebrightnessdiag status-info | grep 'DisplayServicesBrightness ' | grep -Eo "\\d+(?:\\.\\d+)?"`
