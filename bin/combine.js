const fs = require('fs')
const topojson = require('topojson')
const io = require('./io')
const debug = require('debug')('atlas')
const atlasHome = '.atlasfiles'

function combineGeo2topo ({ output, simplify, quantize }, fileNameA, fileNameB) {
  debug('combine', { simplify, quantize }, fileNameA, fileNameB)
  const fileA = fs.readFileSync(`${atlasHome}/${fileNameA}`, 'utf8')
  const fileB = fs.readFileSync(`${atlasHome}/${fileNameB}`, 'utf8')
  const objects = {}
  objects[fileNameA] = JSON.parse(fileA)
  objects[fileNameB] = JSON.parse(fileB)
  const topo = topojson.topology(objects, quantize)
  const ptopo = topojson.presimplify(topo)
  const topology = topojson.simplify(ptopo, simplify) // 1e-4
  const jsonString = JSON.stringify(topology)

  if (output) {
    io.writeFile(output, jsonString)
  } else {
    debug('topojson.size::', Math.floor(jsonString.length / 1000) + 'k')
    console.log(jsonString)
  }
}

module.exports = combineGeo2topo
