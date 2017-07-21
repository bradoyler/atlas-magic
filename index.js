const fs = require('fs')
const shapefile = require('shapefile')
const topojson = require('topojson')
const rp = require('request')
const debug = require('debug')('atlas')

const atlasHome = '.atlasfiles'
let jsonString = ''
let list = ''

function getGeo ({ command, listfile, filterkey, outputfile }) {
  return shapefile.open(`${atlasHome}/${command}.shp`)
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

                      if (result.value.properties.FIPS.match(list)) {
                        // debug(result.value.properties.FIPS, result.value.properties.FIPS.match(list))
                        jsonString += `${JSON.stringify(result.value)},`
                      }
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

function shp2topo ({ command, listfile, filterkey, outputfile }) {
  getGeo({ command, listfile, filterkey, outputfile })
  .then(geoJson => {
    debug('geoJson::', geoJson.length)
    const topo = topojson.topology({ counties: JSON.parse(geoJson) })
    const ptopo = topojson.presimplify(topo)
    const topology = topojson.simplify(ptopo, 0.0006) // 1e-4
    if (outputfile) {
      fs.writeFileSync(`${outputfile}.json`, JSON.stringify(topo))
    } else {
      console.log(JSON.stringify(topology))
    }
  })
}

function magic ({ command, listfile, filterkey, outputfile }) {
  if (listfile) { // use a filterlist
    list = fs.readFileSync(listfile).toString().split('\n').join('|')
    if (list.charAt(list.length - 1) === '|') {
      list = list.slice(0, -1)
    }
  }

  debug('list:', list)

  if (fs.existsSync(`${atlasHome}/${command}.shp`)) {
    debug('skip download!')
    shp2topo({ command, listfile, filterkey, outputfile })
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
          shp2topo({ command, listfile, filterkey, outputfile })
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
