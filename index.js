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

function buildGeoJson (source) {
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
    return geoObject
  })
}

function shp2geo ({ command }) {
  // const writeStream = fs.createWriteStream(`${atlasHome}/${command}.geojson`).on('error', io.handleEpipe)
  return shapefile.open(`${atlasHome}/${command}.shp`)
          .then((source) => buildGeoJson(source))
          .catch(console.error)
}

function geo2topo (geoJson, { command, output, simplify, quantize }) {
  debug('geo2topo.settings::', { command, output, simplify, quantize })
  const geoObjects = {}
  geoObjects[settings.command] = geoJson
  const pretopo = topojson.presimplify(topojson.topology(geoObjects, quantize))
  const jsonString = JSON.stringify(topojson.simplify(pretopo, simplify))
  if (output) {
    debug('topojson.length::', Math.floor(jsonString.length / 1000) + 'k')
    fs.writeFileSync(`${output}`, jsonString)
  } else {
    debug('topojson.length::', Math.floor(jsonString.length / 1000) + 'k')
    console.log(jsonString)
  }
}

function run ({ command, listfile, filterkey, output, simplify, quantize, max }) {
  // set options
  settings = { command, listfile, filterkey, output, simplify, quantize, max }

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
  .then((geoJson) => geo2topo(geoJson, settings))
  .catch(console.error)
}

module.exports = {
  run,
  shp2geo,
  geo2topo
}
