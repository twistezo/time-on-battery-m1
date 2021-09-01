# time-on-battery-m1

Mac OS terminal app for measure real elapsed time on battery between charging.
Without sleeping time unlike in system's Activity Monitor.

## Requirements

- MacOS Big Sur
- M1 processor (arm64)

## Installation

- npm: `npm install -g @twistezo/time-on-battery-m1`
- yarn: `yarn global add @twistezo/time-on-battery-m1`
- build locally or download executable binary file from GitHub and use it

Note that to running downloaded binary it's necessary to add permissions: `sudo chmod 755 ./time-on-battery-m1`.

## Usage

### Standard way

From npm/yarn you can use globally names:

- `tob`
- `time-on-battery`
- `time-on-battery-m1`

Run in terminal `tob s` and in the other tab run `tob` or `tob l -q 20` for 10 (default) or 20 last logs. You can find logs in `tob-data.csv` file which is updated every 1 minute and placed in path where you did run the service.

### Background service

1. Install `pm2` process manager for running app service in background

   `npm install pm2 -g`

2. Start app service

   `pm2 start tob -- s`

3. You can check current status with `pm2 list` or in `tob-data.csv` file.

4. You can stop the service with `pm2 stop tob`.

5. After update to new version just reload the service with `pm2 reload tob`

## Commands

```
Usage: tob [options] [command]

Options:
  -v, --version    output the current version
  -h, --help       display help for command

Commands:
  log|l [options]  show last 10 logs
  service|s        run service in background
```

```
Usage: tob log|l [options]

show last periods on battery

Options:
  -q, --quantity <number>  show last n periods on battery (default: "10")
```

## Development

- Install dependencies: `npm install`
- Start dev (TS): `npm run start`
- Build (JS): `npm run build`
- Start build (JS): `npm run start:build`
- Publish to npm: `npm login && npm publish`
- Build arm64 binary: `npm run build:bin`

## Screenshot

 <img src="https://i.imgur.com/Hmy91dh.png">
