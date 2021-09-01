#!/usr/bin/env node

import { Command } from 'commander'
import figlet from 'figlet'
import chalk from 'chalk'
import { APP_NAME, DESCRIPTION } from './constants'
import { cronJob } from './cron'
import { generateLogs } from './logs'

console.log(chalk.cyan(figlet.textSync(APP_NAME)))
console.log(chalk.gray(DESCRIPTION))

const cli = new Command()
cli.description(DESCRIPTION).version('1.2.0', '-v, --version', 'output the current version')

cli
  .command('log', { isDefault: true })
  .alias('l')
  .option('-q, --quantity <number>', 'show last n periods on battery', '10')
  .description('show last periods on battery')
  .action(options => void generateLogs(options.quantity))

cli
  .command('service')
  .alias('s')
  .description('run service in background')
  .action(() => {
    console.log(`Service is running...`)
    cronJob.start()
  })

cli.parse(process.argv)
