#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs')
const argv = require('yargs').argv
const magic = require('../')

// console.log('>> args:', argv)

const {
  filterkey = 'FIPS',
  listfile = 'filterlist.csv',
  name = 'counties',
} = argv

// const outputfile = argv.out

function run() {
  if (name !== 'counties') {
    console.log(`Sorry, don't support a ${atlastype} atlas yet`)
    return
  }

  if (!fs.existsSync(listfile)) {
    console.log(`OOPS, the ${listfile} file doesn't exist`)
    return
  }

  magic({ name, listfile, filterkey })  
}

run()
