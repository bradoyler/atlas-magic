const fs = require('fs')
const rp = require('request')
const debug = require('debug')('atlas')
const atlasHome = '.atlasfiles'

function downloadFile (name) {
  if (fs.existsSync(`${atlasHome}/${name}`)) {
    debug('skip download!')
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(`${atlasHome}/${name}`)
    fileStream.on('finish', resolve)
    .on('error', reject)

    rp.get(`http://s3.amazonaws.com/atlas-shapes/${name}`)
      .on('error', reject)
      .pipe(fileStream)
  })
}

function writeFile (name, string) {
  debug(string.length, name, ':string.length')
  fs.writeFileSync(`${atlasHome}/${name}`, string)
}

function readObject (stream) {
  return new Promise(function (resolve, reject) {
    var data = []
    stream.on('data', function (d) { data.push(d) })
        .on('end', function () { resolve(JSON.parse(Buffer.concat(data))) })
        .on('error', reject)
  })
}

function handleEpipe (error) {
  if (error.code === 'EPIPE' || error.errno === 'EPIPE') {
    process.exit(0)
  }
}

function handleError (error) {
  console.error()
  console.error('  error: ' + error.message)
  console.error()
  process.exit(1)
}

module.exports = {
  writeFile,
  downloadFile,
  readObject,
  handleEpipe,
  handleError
}
