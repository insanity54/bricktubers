// inspiration: https://github.com/sk1ppi-archived/javascript-nitterio/blob/21698f2a3753813a91282c228d5b47efe69ab9b9/index.js

const cheerio = require('cheerio')
// const htmlparser2 = require('htmlparser2')
const { DateTime } = require('luxon')
const configs = require('../configs.js')
const iso8601 = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
const { URL } = require('node:url')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const normalizeNitterDate = function (nitterDateString) {
    return DateTime.fromFormat(nitterDateString, "MMM d, yyyy · h:mm a 'UTC'", { zone: 'utc' }).toFormat(iso8601);
}

const addRowToSpreadsheet = async function addRowToSpreadsheet(data) {
    const url = "https://api.zerosheets.com/v1/sd4"

    console.log('adding row to spreadsheet')
    // for (const i in data.imageUrls) {
    //     console.log(`url:${i}`)
    // }
    // console.log(JSON.stringify(data, null, 2))
    const payload = {
        'Date': DateTime.fromJSDate(new Date(data.date)).toFormat('MM/dd/yyyy'),
        'VTuber Name': data.twitterDisplayName,
        'VTuber Twitter': data.vtuberTwitterUrl,
        'Image1': data.twitterImageUrls?.at(0) || '',
        'Image2': data.twitterImageUrls?.at(1) || '',
        'Image3': data.twitterImageUrls?.at(2) || '',
        'Image4': data.twitterImageUrls?.at(3) || '',
        'Presentation Tweet': data.presentationTweetUrl
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${configs.zerosheetsBearerToken}`
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
    // console.log(body)
}

/**
 * 
 * @param {string} html 
 * @param {string} url Example: https://nitter.sbtp.xyz/barbariengineer/status/1833573528756539857
 * @returns 
 */
const parseBricktuberData = function parseBricktuberData (html, nitterOrTwitterUrl) {
    if (!html) throw new Error('parseBricktuberData requires html as first arg');
    if (!nitterOrTwitterUrl) throw new Error('parseBricktuberData requires url as second argument');
    nitterOrTwitterUrl = convertToNitterUrl(nitterOrTwitterUrl)
    const urlPath = new URL(nitterOrTwitterUrl).pathname
    // console.log(html)
    // console.log(`parsingBricktuberData using url=${url}`)

    // let vtuberName = ''
    let vtuberTwitterUrl = ''
    let twitterImageUrls = []
    let twitterDisplayName = ''
    // let nitterImageUrls = []
    let presentationTweetUrl = ''

    // const $ = cheerio.load(htmlparser2.parseDocument(html, {}))
    const $ = cheerio.load(html)
    // experimental using jsdom
    const dom = new JSDOM(html)

    let date = normalizeNitterDate($('p.tweet-published').text())
    // Find the most recent Monday based on the tweet's date
    
    let legoMondayDate = DateTime.fromJSDate(new Date(date)).startOf('week').toFormat(iso8601);
    
    // get the tweet body that matches the statusNumber
    const $tweetBodies = $('div.tweet-body')

    const $matchingTweetBody = $tweetBodies.filter(function() {
        return $(this).find('span.tweet-date a').attr('href').includes(urlPath)
    })

    // @todo
    // * [x] get all the hrefs in the tweet content
    // * [x] filter out the hashtags, returning @<name> links
    // * [ ] If there is only one @<name>, vtuberName = `x.com/<name>`
    // * [ ] If there are multiple names, throw(?)
    // console.log(`matchingTweetBody=${$matchingTweetBody.text()}`)

    const tweetContentCss = 'div.tweet-content'
    const $tweetContent = $matchingTweetBody.find(tweetContentCss)
    // console.log($tweetContent.text())
    const $hrefs = $tweetContent.find('a')
    // $hrefs.each(console.log)
    
    
    const hashtags = $hrefs.filter((i, el) => el.attribs.href.includes('/search?q=')).map((i, el) => $(el).attr('href')).get()
    const mentions = $hrefs.filter((i, el) => !el.attribs.href.includes('/search?q=')).map((i, el) => $(el).attr('href')).get()

    // console.log(mentions)
    // console.log(hashtags)

    // console.log($hashtags.text())
    // console.log($hashtags.attr('href'))
    // console.log($mentions.attr('href'))
    



    // Get the vtuber name
    
    // const twitterUsernames = $tweetContent.find('a')

    const firstMention = mentions.at(0)
    const twitterHandle = (mentions.length > 0) ? firstMention.split('/').at(-1) : null
    const fullUrlTwitterHandle = `https://x.com/${twitterHandle}`

    // Get the vtuber twitter URL
    vtuberTwitterUrl = (mentions.length > 0) ? convertToTwitterUrl(fullUrlTwitterHandle) : null

    // Get the vtuber twitterDisplayName
    // console.log('>> firstMention as follows')
    // console.log(firstMention)

    // greets https://www.twilio.com/en-us/blog/web-scraping-and-parsing-html-in-node-js-with-jsdom
    const isTwitterProfileUrl = (link) => {
        // Return false if there is no href attribute.
        if(typeof link.href === 'undefined') { return false }
      
        return (link.href.split('/').at(-1) === twitterHandle)
      };
    const nodeList = [...dom.window.document.querySelectorAll('a')];
    twitterDisplayName = nodeList.find(isTwitterProfileUrl)?.title



    // Get the image URLS
    const imagesCss = 'div.attachment.image'
    const attachmentImages = $matchingTweetBody.find(imagesCss)
    for (const image of attachmentImages) {
        const href = $(image).find('a').attr('href')
        const id = href.split('%2F').at(1).split('.').at(0)
        twitterImageUrls.push(`https://pbs.twimg.com/media/${id}?format=jpg&name=large`)
        // nitterImageUrls.push(href)
    }

    // Get the presentation tweet URL
    // const url = $matchingTweetBody.find('span.tweet-date a').attr('href')
    // console.log(idk)
    presentationTweetUrl = convertToTwitterUrl(nitterOrTwitterUrl)
    // presentationTweetUrl = tweetUrl.replace('nitter.sbtp.xyz', 'x.com')

    return { date, twitterHandle, twitterDisplayName, twitterImageUrls, vtuberTwitterUrl, presentationTweetUrl, legoMondayDate }
}

const convertToNitterUrl = (url) => {
    if (!url) throw new Error('convertToNitterUrl requires string as first arg');
    return url
        .replace('x.com', 'nitter.sbtp.xyz')
        .replace('twitter.com', 'nitter.sbtp.xyz')
        .replace('#m', '')
}

const convertToTwitterUrl = (url) => {
    if (!url) throw new Error('convertToNitterUrl requires string as first arg');
    return url
        .replace('nitter.sbtp.xyz', 'x.com')
        .replace('#m', '')
}


const getTweetHtml = async function getTweetHtml(tweetUrl) {
    if (!tweetUrl) {
        throw new Error("tweetUrl is required")
    }
    const nitterUrl = convertToNitterUrl(tweetUrl)


    const res = await fetch(nitterUrl, {
        method: "GET",
        headers: {
            'Authorization': `Basic ${Buffer.from(configs.nitterUsername + ":" + configs.nitterPassword).toString('base64')}`,
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
    return body
}



module.exports = {
    getTweetHtml,
    parseBricktuberData,
    addRowToSpreadsheet,
    normalizeNitterDate,
    convertToTwitterUrl,
    convertToNitterUrl,
}

