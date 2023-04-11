



require('dotenv').config()
const EleventyFetch = require("@11ty/eleventy-fetch");


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
if (typeof GOOGLE_API_KEY === 'undefined') throw new Error('GOOGLE_API_KEY is undefined in env!')
const spreadsheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1HSTasBOCZUdIiAL1mUfjr-hdv_BMZpVXdgeJobNm_f8/values/Sheet1?key=${GOOGLE_API_KEY}`

async function fetchJson(url) {
  console.log(`  >> getching ${url}`)
  const json = await EleventyFetch(url, {
    duration: '1s',
    type: 'json'
  })
  console.log(json)
  return json
}

module.exports = async function() {
  return fetchJson(spreadsheetUrl)
};

