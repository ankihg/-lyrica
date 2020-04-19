const scrape = require('./scraper').scrape;
const xtract = require('./xtractor').xtract;
const tweet = require('./tweeter').tweet;
const ERRORS = require('./Errors');

let line;
try { line = xtract({artist: 'arcadefire', source: '../output'}); }
catch (err) {
    if (err === ERRORS.XTRACTOR.ARTIST_NOT_IN_BANK)
        console.log('no artist');
}

tweet(line);
