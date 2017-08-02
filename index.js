const fs = require('fs')
const shapefile = require('shapefile')
const topojson = require('topojson')
const debug = require('debug')('atlas')
const io = require('./bin/io')

const atlasHome = '.atlasfiles'
let settings = {}
// let jsonString = ''
let list = ''

function filterByProps (result) {
  // us-counties
  if (list && settings.command === 'us-counties') {
    // has filter
    const prop = 'FIPS' || settings.filterkey
    if (list && result.value.properties[prop].match(list)) {
      return true
    }
    return false
  }

  if (settings.command === 'us-cities') {
    const prop = 'POP_2010' || settings.filterkey
    if (result.value.properties[prop] > settings.max) {
      return true
    }
    return false
  }
  return true
}

function buildFeatureCollection (source, out) {
  const geoObject = {
    type: 'FeatureCollection',
    bbox: source.bbox,
    features: []
  }
  return source.read().then(function repeat (result) {
    if (result.done) return
    if (filterByProps(result)) {
      geoObject.features.push(result.value)
    }
    return source.read().then(repeat)
  }).then(function () {
    // todo: allow out to stdout
    out.write(JSON.stringify(geoObject))
    out.end()
  })
}

function shp2geo ({ command }) {
  const writeStream = fs.createWriteStream(`${atlasHome}/${command}.geojson`).on('error', io.handleEpipe)
  return shapefile.open(`${atlasHome}/${command}.shp`)
          .then((source) => buildFeatureCollection(source, writeStream))
          .catch(io.handleError)
}

function geo2topo ({ command, output, simplify, quantization }) {
  const geoJsonString = fs.readFileSync(`${atlasHome}/${command}.geojson`, 'utf8')
  const geoJson = JSON.parse(geoJsonString)
  debug('geo2topo.settings::', { command, output, simplify, quantization })
  const topoObject = {}
  topoObject[settings.command] = geoJson
  const topo = topojson.topology(topoObject, quantization)
  const ptopo = topojson.presimplify(topo)
  const topology = topojson.simplify(ptopo, simplify) // 1e-4
  const jsonString = JSON.stringify(topology)
  if (output) {
    debug('topojson.length::', jsonString.length)
    fs.writeFileSync(`${output}`, jsonString)
  } else {
    debug('topojson.length::', jsonString.length)
    console.log(jsonString)
    // io.writeFile(`${command}.json`, jsonString)
  }
}

function run ({ command, listfile, filterkey, output, simplify, quantization, max }) {
  // set options
  settings = { command, listfile, filterkey, output, simplify, quantization, max }

  if (listfile) { // use a filterlist
    list = fs.readFileSync(listfile).toString().split('\n').join('|')
    if (list.charAt(list.length - 1) === '|') {
      list = list.slice(0, -1)
    }
  }

  if (!fs.existsSync(atlasHome)) {
    fs.mkdirSync(atlasHome)
  }

  io.downloadFile(`${command}.dbf`)
  .then(() => io.downloadFile(`${command}.shp`))
  .then(() => shp2geo(settings))
  .then(() => geo2topo(settings))
  .catch(console.error)
}

module.exports = {
  run,
  shp2geo,
  geo2topo
}
