import { parseBricktuberData, normalizeNitterDate } from "./scrape"
import { readFileSync } from "fs"
import { describe, test, expect } from "vitest"

describe('helpers', function () {
    test('normalizeNitterDate', function () {
        expect(normalizeNitterDate('Sep 5, 2024 · 4:57 PM UTC')).to.equal('2024-09-05T16:57:00.000Z')
    })
})

describe("scrape", function () {
    test("thread", function () {
        const html = readFileSync('./fixtures/thread.html', { encoding: 'utf-8' })
        const { twitterImageUrls, twitterHandle, date, legoMondayDate, vtuberTwitterUrl } = parseBricktuberData(html, 'https://x.com/barbariengineer/status/1833573535597338765')
        expect(date).to.equal('2024-09-10T18:29:00.000Z')
        expect(legoMondayDate).to.equal('2024-09-09T00:00:00.000Z')
        expect(twitterHandle).to.equal(null)
        expect(vtuberTwitterUrl).to.equal(null)
        expect(twitterImageUrls).to.deep.equal([
            'https://pbs.twimg.com/media/GXIpSrtWMAAk-tb?format=jpg&name=large',
            'https://pbs.twimg.com/media/GXIpUZUXoAAb4Du?format=jpg&name=large',
            'https://pbs.twimg.com/media/GXIpV--WkAA_jwK?format=jpg&name=large'
        ])
    })
    test("simple", function () {
        const html = readFileSync('./fixtures/simple.html', { encoding: 'utf-8' })
        const { twitterImageUrls, twitterHandle, date, vtuberTwitterUrl, imageUrls, presentationTweetUrl } = parseBricktuberData(html, 'https://x.com/barbariengineer/status/1831738467371643232')
        expect(date).to.equal('2024-09-05T16:57:00.000Z')
        // expect(vtuberName).to.equal('Alfhilde 🦊⚔️ ASTRALINE')
        expect(twitterHandle).to.equal('AlfhildeO')
        expect(vtuberTwitterUrl).to.equal('https://x.com/AlfhildeO')
        expect(presentationTweetUrl).to.equal('https://x.com/barbariengineer/status/1831738467371643232')
        expect(twitterImageUrls).to.deep.equal([
            'https://pbs.twimg.com/media/GWukWP_XIAArLiI?format=jpg&name=large',
            'https://pbs.twimg.com/media/GWukX0hXkAAiR7j?format=jpg&name=large',
            'https://pbs.twimg.com/media/GWukZnHW8AAAJQn?format=jpg&name=large'
        ])
    })
    test('simple2', function () {
        const html = readFileSync('./fixtures/simple2.html', { encoding: 'utf-8' })
        const { twitterImageUrls, twitterHandle, date, vtuberTwitterUrl, imageUrls, presentationTweetUrl } = parseBricktuberData(html, 'https://x.com/barbariengineer/status/1831738467371643232')
        expect(date).to.equal('2024-09-05T16:57:00.000Z')
        expect(twitterHandle).to.equal('AlfhildeO')
        expect(vtuberTwitterUrl).to.equal('https://x.com/AlfhildeO')
        expect(presentationTweetUrl).to.equal('https://x.com/barbariengineer/status/1831738467371643232')
        expect(twitterImageUrls).to.deep.equal([
            'https://pbs.twimg.com/media/GWukWP_XIAArLiI?format=jpg&name=large',
            'https://pbs.twimg.com/media/GWukX0hXkAAiR7j?format=jpg&name=large',
            'https://pbs.twimg.com/media/GWukZnHW8AAAJQn?format=jpg&name=large'
        ])
    })
})