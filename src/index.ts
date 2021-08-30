#!/usr/bin/env node

import { Command } from 'commander'
import figlet from 'figlet'
import chalk from 'chalk'
import { APP_NAME, DESCRIPTION } from './constants'
import { cronJob } from './cron'
import { generateLogs } from './log'

console.log(chalk.cyan(figlet.textSync(APP_NAME)))
console.log(chalk.gray(DESCRIPTION))

const cli = new Command()
cli.description(DESCRIPTION).version('1.0.0', '-v, --version', 'output the current version')

// l -q 2 OR log -q 2
cli
  .command('log', { isDefault: true })
  .alias('l')
  .option('-q, --quantity <number>', 'show n last logs', '10')
  .description('show last 10 logs')
  .action(options => {
    const { quantity } = options
    console.log(chalk.cyan(`Last ${quantity} logs`))
    generateLogs(quantity)
  })

cli
  .command('run')
  .alias('r')
  .description('run service in background')
  .action(() => {
    console.log(`Service is running...`)
    cronJob.start()
  })

cli.parse(process.argv)
