#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs')
const argv = require('yargs').argv
const magic = require('../')

const atlasList = [
  'demo',
  'test',
  'us-counties',
  'us-cities',
]
// console.log('>> args:', argv._)

const {
  _ : commands,
  filterkey = 'FIPS',
  listfile,
  outputfile,
  simplify,
} = argv

// const outputfile = argv.out
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

  magic({ command, listfile, filterkey, outputfile })  
}

run()
