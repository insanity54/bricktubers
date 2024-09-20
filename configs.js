require('dotenv/config')

if (!process.env.NITTER_USERNAME) throw new Error('NITTER_USERNAME is undefined in environment');
if (!process.env.NITTER_PASSWORD) throw new Error('NITTER_PASSWORD is undefined in environment');
if (!process.env.ZEROSHEETS_BEARER_TOKEN) throw new Error('ZEROSHEETS_BEARER_TOKEN is undefined in environment');


module.exports = {
    nitterUsername: process.env.NITTER_USERNAME,
    nitterPassword: process.env.NITTER_PASSWORD,
    zerosheetsBearerToken: process.env.ZEROSHEETS_BEARER_TOKEN
}