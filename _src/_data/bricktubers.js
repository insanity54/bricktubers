

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env' ) })
const EleventyFetch = require("@11ty/eleventy-fetch");
const slugify = require('slugify', {
  replacement: '-',
  lower: true,
  strict: true,
  trim: true
})

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
if (typeof GOOGLE_API_KEY === 'undefined') throw new Error('GOOGLE_API_KEY is undefined in env!')
const spreadsheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1ChEgFmSQ7LnyHkHGX0WDXE7v1vuWLJ2TkveZf0FtISI/values/Sheet1?key=${GOOGLE_API_KEY}`

function unmarshallVtuberSpreadsheetData(json) {
  let data = []
  // console.log(json.values)
  json.values.slice(1).forEach((datum, i) => {
    let bt = {}
    bt.id = i
    bt.bebNumber = datum[0]
    bt.date = datum[1]
    bt.vtuberName = datum[2]
    bt.vtuberSlug = !!datum[3] ? slugify(datum[3]?.split('/').at(-1)) : 'bricktuber-'+i
    bt.vtuberTwitter = datum[3]
    bt.image1 = datum[4]
    bt.image2 = datum[5]
    bt.image3 = datum[6]
    bt.image4 = datum[7]
    bt.presentationTweet = datum[8]
    bt.instructions = datum[9]
    data.push(bt)
  })
  
  return data
}

async function fetchBricktuberData(url) {
  // console.log(`  >> getching ${url}`)
  const json = await EleventyFetch(url, {
    duration: '1m',
    type: 'json'
  })
  return unmarshallVtuberSpreadsheetData(json)
}

module.exports = async function() {
  return fetchBricktuberData(spreadsheetUrl)
};

