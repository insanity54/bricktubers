#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { getTweetHtml, addRowToSpreadsheet, parseBricktuberData } = require('./scripts/scrape.js')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '.env' ) })
const version = require('./package.json').version




async function scrape(tweetUrl) {
    if (!tweetUrl) throw new Error('tweetUrl must be the first argument. example: `./bricktubers.js scrape https://x.com/barbariengineer/status/1833573532166414720`');
    
    const html = await getTweetHtml(tweetUrl)
    // console.log(html)
    const data = parseBricktuberData(html, tweetUrl)
    console.log(`  > Data gathering complete.`)
    console.log(data)
    // console.log(`  > date:                 ${data.date}`)
    // console.log(`  > legoMondayDate:       ${data.legoMondayDate}`)
    // console.log(`  > twitterHandle:        ${data.twitterHandle}`)
    // console.log(`  > vtuberTwitterUrl:     ${data.vtuberTwitterUrl}`)
    // console.log(`  > twitterImageUrls:     ${data.twitterImageUrls.join(', ')}`)
    // console.log(`  > presentationTweetUrl: ${data.presentationTweetUrl}`)

    await addRowToSpreadsheet(data)
}

yargs(hideBin(process.argv)).command('scrape <url>', 'Get Bricktuber data from a public tweet', (yargs) => {
    return yargs.positional('url', {
        describe: 'location from which to scrape bricktuber data',
    })
}, async (argv) => {
    console.log(argv)
    console.log('scraping '+ argv.url)
    await scrape(argv.url)
})
    .version(version)
    .strictCommands()
    .demandCommand(1)
    .parse()

