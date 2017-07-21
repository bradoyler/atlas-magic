const fs = require('fs')
const shapefile = require('shapefile')
const topojson = require('topojson')
const rp = require('request')
const debug = require('debug')('atlas')

let jsonString = ''
let list = ''

function getGeo (name) {
  return shapefile.open(`files/${name}.shp`)
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

function shp2topo (name) {
  getGeo(name)
  .then(geoJson => {
    debug('geoJson::', geoJson.length)
    const topo = topojson.topology({ counties: JSON.parse(geoJson) })
    const ptopo = topojson.presimplify(topo);
    const topology = topojson.simplify(ptopo, .0006); // 1e-6
    // fs.writeFileSync(`${name}.json`, JSON.stringify(topo))
    console.log(JSON.stringify(topology))
  })
}

function magic ({ name, listfile, filterkey }) {
  list = fs.readFileSync(listfile).toString().split('\n').join('|')
  if (list.charAt(list.length - 1) === '|') {
    list = list.slice(0, -1)
  }

  debug('list:', list)

  if (fs.existsSync(`files/${name}.shp`)) {
    debug('skip download!')
    shp2topo(name)
    return
  }

  const fileStreamDbf = fs.createWriteStream(`files/${name}.dbf`)
  const fileStreamShp = fs.createWriteStream(`files/${name}.shp`)

  fileStreamShp.on('finish', () => {
    // console.log('downloads done!');
    shp2topo(name)
  })

  fileStreamDbf.on('finish', () => {
    // console.log('dbf download done!');
    rp.get(`http://s3.amazonaws.com/atlas-shapes/${name}.shp`)
      .on('error', console.log)
      .pipe(fileStreamShp)
  })

  rp.get(`http://s3.amazonaws.com/atlas-shapes/${name}.dbf`)
    .on('error', console.log)
    .pipe(fileStreamDbf)
}

module.exports = magic
