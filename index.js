const fs = require('fs')
const shapefile = require('shapefile')
const topojson = require('topojson')
const rp = require('request')
const debug = require('debug')('atlas')

const atlasHome = '.atlasfiles'
let settings = {}
let jsonString = ''
let list = ''

function filterByProps (result) {
  // debug('properties >>', result.value.properties)

  // us-counties
  if (settings.command === 'us-counties') {
    if (!list) {
      console.log('Please supply a listfile for us-counties')
      return ''
    }
    // has filter
    const prop = 'FIPS' || settings.filterkey
    if (list && result.value.properties[prop].match(list)) {
      return `${JSON.stringify(result.value)},`
    }
    return ''
  }

  if (settings.command === 'us-cities') {
    const prop = 'POP_2010' || settings.filterkey
    if (result.value.properties[prop] > settings.max) {
      return `${JSON.stringify(result.value)},`
    }
    return ''
  }
  return `${JSON.stringify(result.value)},`
}

function getGeo () {
  return shapefile.open(`${atlasHome}/${settings.command}.shp`)
          .then(shape => {
            jsonString += `{"type":"FeatureCollection","bbox":${JSON.stringify(shape.bbox)}`
            jsonString += ',"features":['
            return shape.read()
                .then(function (result) {
                  if (result.done) return
                  return shape.read()
                    .then(function appendFeature (result) {
                      if (result.done) {
                        return
                      }
                      jsonString += filterByProps(result)
                      return shape.read().then(appendFeature)
                    })
                    .then(() => {
                      let json = jsonString.slice(0, -1)
                      json += ']}\n'
                      return json
                    })
                })
          })
          .catch(error => console.error(error.stack))
}

function shp2topo () {
  getGeo()
  .then(geoJson => {
    debug('geoJson.length::', geoJson.length)
    debug('settings::', settings)
    const topo = topojson.topology({ counties: JSON.parse(geoJson) })
    const ptopo = topojson.presimplify(topo)
    const topology = topojson.simplify(ptopo, settings.simplify) // 1e-4
    if (settings.output) {
      const jsonString = JSON.stringify(topology)
      debug('topojson.length::', jsonString.length)
      fs.writeFileSync(`${settings.output}`, jsonString)
    } else {
      console.log(JSON.stringify(topology))
    }
  })
}

function magic ({ command, listfile, filterkey, output, simplify, max }) {
  // set options
  settings = { command, listfile, filterkey, output, simplify, max }

  if (listfile) { // use a filterlist
    list = fs.readFileSync(listfile).toString().split('\n').join('|')
    if (list.charAt(list.length - 1) === '|') {
      list = list.slice(0, -1)
    }
  }

  // debug('list:', list)

  if (fs.existsSync(`${atlasHome}/${command}.shp`)) {
    debug('skip download!')
    shp2topo()
    return
  }

  if (!fs.existsSync(atlasHome)) {
    fs.mkdirSync(atlasHome)
  }

  rp.get(`http://s3.amazonaws.com/atlas-shapes/${command}.dbf`)
    .on('response', function (res) {
      if (res.statusCode !== 200) {
        throw Error(`dbf: ${res.statusMessage} ${res.statusCode}`)
      }
      const fileStreamDbf = fs.createWriteStream(`${atlasHome}/${command}.dbf`)
      fileStreamDbf.on('finish', () => {
        const fileStreamShp = fs.createWriteStream(`${atlasHome}/${command}.shp`)
        fileStreamShp.on('finish', () => {
          // download complete
          shp2topo()
        })
        rp.get(`http://s3.amazonaws.com/atlas-shapes/${command}.shp`)
          .on('error', console.log)
          .pipe(fileStreamShp)
      })
      this.pipe(fileStreamDbf)
    })
    .on('error', console.log)
}

module.exports = magic
