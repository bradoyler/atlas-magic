#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs')
const argv = require('yargs').argv
const magic = require('../')

const atlasList = [
  '404-test',
  'us-rivers',
  'us-counties',
  'us-cities',
]
// console.log('>> args:', argv._)

const {
  _ : commands,
  filterkey = 'FIPS',
  listfile,
  output,
  simplify = 0.0006,
  max = 100000
} = argv

// const output = argv.out
const command = commands[0]

function run() {
  if (atlasList.indexOf(command) < -1) {
    console.log(`Sorry, don't have a ${command} atlas yet`)
    return
  }

  if (listfile && !fs.existsSync(listfile)) {
    console.log(`OOPS, the ${listfile} file doesn't exist`)
    return
  }

  magic({ command, listfile, filterkey, output, max, simplify })  
}

run()
