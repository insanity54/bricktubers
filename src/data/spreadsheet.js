const EleventyFetch = require("@11ty/eleventy-fetch");
const spreadsheetUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1ChEgFmSQ7LnyHkHGX0WDXE7v1vuWLJ2TkveZf0FtISI/values/Sheet1?key=AIzaSyB-16Q1shTe4jbaOHbjVLqyjX7k1RFwUgM'

async function fetchJson(url) {
  console.log(`  >> getching ${url}`)
  const json = await EleventyFetch(url, {
    duration: '1d',
    type: 'json'
  })
  return json
}

module.exports = async function() {
  return fetchJson(spreadsheetUrl)
};

