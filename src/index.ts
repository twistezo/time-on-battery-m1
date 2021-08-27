import { Command } from 'commander'
import figlet from 'figlet'
import chalk from 'chalk'
// import moment from 'moment'
import { appName, description } from './constants'
import { cronJob } from './cron'

console.log(chalk.cyan(figlet.textSync(appName)))
console.log(chalk.gray(description))

const cli = new Command()
cli
  .description(description)
  .option('-d, --debug', 'output extra debugging')
  .option('-s, --service', 'run service')
  .option('-l, --log <last>', 'show n last logs', '10')
  .option('-o, --open', 'open log file')
  .version('1.0.0', '-v, --version', 'output the current version')
  .parse(process.argv)

const options = cli.opts()
if (options.debug) {
  console.log(options)
} else if (options.open) {
  console.log('Opening log file...')
} else if (options.service) {
  console.log(`Running service...`)
  cronJob.start()
} else if (options.log) {
  console.log(`Last ${options.log} logs:`)
}
