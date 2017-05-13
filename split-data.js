const _       = require('lodash')
const Promise = require('bluebird')
const fs      = require('fs')

let doneCount  = 0
let totalCount = 0

console.log('Reading file...')

fs.readFile('data.json', 'utf8', (err, json) => {
    if (err) {throw err}

    console.log('Parsing json...')

    let data = JSON.parse(json)
    totalCount = data.length

    console.log(data.length)

    console.log('Splitting data...')

    let promises = _.map(data, writeRecord)

    Promise.all(promises).then(res => {
        console.log('Done!')
    })
})

function writeRecord(record) {
    return new Promise((resolve, reject) => {
        fs.writeFile('data/' + record.ditemid + '.json', JSON.stringify(record), (err, res) => {
            if (err) {throw err}
            doneCount++
            console.log(doneCount + '/' + totalCount)
            resolve()
        })
    })
}