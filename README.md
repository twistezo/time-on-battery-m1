# time-on-battery-m1

Mac OS app for measure real elapsed time on battery between charging.
Without sleeping time unlike in system's Activity Monitor.

## Requirements

- MacOS Big Sur
- M1 processor

## Installation

- npm: `npm install -g @twistezo/time-on-battery-m1`
- yarn: `yarn global add @twistezo/time-on-battery-m1`
- build locally or download executable binary file from GitHub and use it

Note that to running downloaded binary it's necessary to add permissions: `sudo chmod 755 ./time-on-battery-m1`.

## Usage

Run in terminal `tob`, `time-on-battery` or `time-on-battery-m1`.

```
Usage: tob [options] [command]

Options:
  -v, --version    output the current version

Commands:
  log|l [options]  show last 10 logs
  run|r            run service in background
  help [command]   display help for command
```

```
Usage: tob log|l [options]

show last 10 logs

Options:
  -q, --quantity <number>  show n last logs (default: "10")
```

For example run `tob r` as a background service and in the other terminal tab run `tob` or `tob l -q 20` for 10 (default) or 20 last logs.

## Development

- Start dev (TS): `npm run start`
- Build (JS): `npm run build`
- Start build (JS): `npm run start:build`
- Publish to npm: `npm login && npm run publish`
- Build arm64 binary: `npm run build:bin`

## Example

 <img src="https://i.imgur.com/EYXAHnl.png">
