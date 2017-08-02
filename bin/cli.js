#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs')
const argv = require('yargs').argv
const magic = require('../')
const combine = require('./combine')

const commandList = [
  '404-test',
  'us-rivers',
  'us-counties',
  'us-cities',
  'us-states',
  'combine-topo'
]

let {
  _ : commands,
  filterkey = 'FIPS',
  listfile,
  output,
  quantize = '1e6',
  simplify = 0.0006,
  max = 100000
} = argv

// const output = argv.out
const command = commands[0]

function run() {
  if (commandList.indexOf(command) === -1) {
    console.log(` '${command}' is not a supported command`)
    return
  }

  if (listfile && !fs.existsSync(listfile)) {
    console.log(`OOPS, the ${listfile} file doesn't exist`)
    return
  }

  if (command === 'us-states' && !argv.simplify) {
    simplify = 0.005
  }

  if (command === 'combine-topo') {
    if (!argv.simplify) {
      simplify = 0.005
    }
    combine({ output, simplify, quantize }, `${commands[1]}`, `${commands[2]}`);
    return
  }

  magic.run({ command, listfile, filterkey, output, max, simplify, quantize })
}

run()
