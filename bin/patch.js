// @ts-check
const inquirer = require('inquirer')
const chalk = require('chalk')
const prompt = inquirer.createPromptModule()
const package = require('../package.json')
const { execSync } = require('child_process')
const { resolve } = require('path')
const { readdirSync } = require('fs')
const PATCH_DIR = resolve(process.cwd(), './patch')

async function bootstarp() {
  console.log(chalk.yellowBright('mx-space server patch center'))

  console.log(chalk.yellow(`current version: ${package.version}`))

  const patchFiles = readdirSync(PATCH_DIR).filter(
    (file) => file.startsWith('v') && file.endsWith('.ts'),
  )

  prompt({
    type: 'list',
    name: 'version',
    message: 'Select version you want to patch.',
    choices: patchFiles.map((f) => f.replace(/\.ts$/, '')),
  }).then(({ version }) => {
    try {
      execSync('ts-node -v')
      console.log(chalk.green('ts-node is ready.'))
    } catch {
      console.log(chalk.red('ts-node is not installed.'))
      process.exit(-1)
    }
    const patchPath = resolve(PATCH_DIR, version + '.ts')
    console.log(chalk.green('starting patch... ' + patchPath))
    execSync(`ts-node ${patchPath}`)
  })
}

bootstarp()
