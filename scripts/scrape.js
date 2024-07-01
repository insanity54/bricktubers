// inspiration: https://github.com/sk1ppi-archived/javascript-nitterio/blob/21698f2a3753813a91282c228d5b47efe69ab9b9/index.js

const cheerio = require('cheerio')
const dotenv = require('dotenv')
const moment = require('moment')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
dotenv.config({ path: path.join(__dirname, '../.env' ) })


if (!process.env.NITTER_USERNAME) throw new Error('NITTER_USERNAME is undefined in environment');
if (!process.env.NITTER_PASSWORD) throw new Error('NITTER_PASSWORD is undefined in environment');
if (!process.env.ZEROSHEETS_BEARER_TOKEN) throw new Error('ZEROSHEETS_BEARER_TOKEN is undefined in environment')


async function addRowToSpreadsheet(data) {
    const url = "https://api.zerosheets.com/v1/sd4"
    // for (const i in data.imageUrls) {
    //     console.log(`url:${i}`)
    // }
    console.log(JSON.stringify(data, null, 2))
    const payload = {
        'Date': moment(data.date).format('MM/DD/YYYY'),
        'VTuber Name': data.vtuberName,
        'VTuber Twitter': data.vtuberTwitterUrl,
        'Image1': data.imageUrls?.at(0) || '',
        'Image2': data.imageUrls?.at(1) || '',
        'Image3': data.imageUrls?.at(2) || '',
        'Image4': data.imageUrls?.at(3) || '',
        'Presentation Tweet': data.presentationTweetUrl
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.ZEROSHEETS_BEARER_TOKEN}`
        },
        body: JSON.stringify(payload)
    })
    let body
    if (!res.ok) {
        body = await res.text()
        console.error(body)
        throw new Error('response was not OK.')
    }
    body = await res.json()
    console.log(body)
}


async function getBricktuberData(nitterTweetUrl) {
    if (!nitterTweetUrl) {
        throw new Error("nitterTweetUrl is required")
    }

    // Find the most recent Monday
    let date = moment().format('YYYY-MM-DD');
    let recentMonday;
    do {
        date = moment(date).subtract(1, 'days');
        recentMonday = date.format('dddd'); // Format as 'ddd' for 'Mon', 'Tue', etc.
    } while (recentMonday !== 'Monday');
    // console.log(`most recent monday was ${date}`)

    let vtuberName = ''
    let vtuberTwitterUrl = ''
    let imageUrls = []
    let presentationTweetUrl = ''




    const res = await fetch(nitterTweetUrl, {
        method: "GET",
        headers: {
            'Authorization': `Basic ${Buffer.from(process.env.NITTER_USERNAME + ":" + process.env.NITTER_PASSWORD).toString('base64')}`,
            "Accept": "text/html",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "TE": "Trailers",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0"
        }
    })
    if (!res.ok) {
        throw new Error('response was not OK')
    }
    const body = await res.text()
    const $ = cheerio.load(body)
    
    // Get the vtuber name
    const tweetContentCss = 'div.tweet-content'
    const tweetContent = $(tweetContentCss)
    const twitterUsernames = tweetContent.find('a')
    vtuberName = twitterUsernames.first().attr('title')

    // Get the vtuber twitter URL
    vtuberTwitterUrl = `https://x.com${twitterUsernames.first().attr('href')}`

    // Get the image URLS
    const imagesCss = 'div.attachment.image'
    const attachmentImages = $(imagesCss)
    for (const image of attachmentImages) {
        const href = $(image).find('a').attr('href')
        const id = href.split('%2F').at(1).split('.').at(0)
        imageUrls.push(`https://pbs.twimg.com/media/${id}?format=jpg&name=large`)
    }

    // Get the presentation tweet URL
    presentationTweetUrl = nitterTweetUrl.replace('nitter.sbtp.xyz', 'x.com')


    return { 
        date, vtuberName, vtuberTwitterUrl, imageUrls, presentationTweetUrl
    }
}




async function main() {
    const argv = yargs(hideBin(process.argv)).argv
    // console.log(argv)
    // process.exit(3)
    const nitterTweetUrl = argv._?.at(0)
    if (!nitterTweetUrl) throw new Error('nitterTweetUrl must be the first argument. example: `node ./scripts/scrape.js https://nitter.sbtp.xyz/barbariengineer/status/1806094563922022538');
    const data = await getBricktuberData(nitterTweetUrl)
    console.log(`  > Data gathering complete.`)
    console.log(`  > date:                 ${data.date}`)
    console.log(`  > vtuberName:           ${data.vtuberName}`)
    console.log(`  > vtuberTwitterUrl:     ${data.vtuberTwitterUrl}`)
    console.log(`  > imageUrls:            ${data.imageUrls.join(', ')}`)
    console.log(`  > presentationTweetUrl: ${data.presentationTweetUrl}`)

    await addRowToSpreadsheet(data)
    
}


main()

