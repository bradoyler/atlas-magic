const fs = require('fs')
const path = require('path')
const topojson = require('topojson')
const io = require('./io')
const debug = require('debug')('atlas')
// const atlasHome = '.atlasfiles'

function combineGeo2topo ({ output, simplify, quantize }, fileNameA, fileNameB) {
  debug('combine', { simplify, quantize }, fileNameA, fileNameB)
  const fileA = fs.readFileSync(fileNameA, 'utf8')
  const fileB = fs.readFileSync(fileNameB, 'utf8')
  const jsonA = JSON.parse(fileA)
  const jsonB = JSON.parse(fileB)
  const nameA = path.basename(fileNameA, path.extname(fileNameA))
  const nameB = path.basename(fileNameB, path.extname(fileNameB))
  const geoJsonA = topojson.feature(jsonA, jsonA.objects[nameA])
  const geoJsonB = topojson.feature(jsonB, jsonB.objects[nameB])

  const geoObjects = {}
  geoObjects[nameA] = geoJsonA
  geoObjects[nameB] = geoJsonB
  const pretopo = topojson.presimplify(topojson.topology(geoObjects, quantize))
  const jsonString = JSON.stringify(topojson.simplify(pretopo, simplify))

  if (output) {
    io.writeFile(output, jsonString)
  } else {
    debug('topojson.size::', Math.floor(jsonString.length / 1000) + 'k')
    console.log(jsonString)
  }
}

module.exports = combineGeo2topo
