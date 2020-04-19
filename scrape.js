const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');

const host = 'https://www.azlyrics.com';
const url = 'https://www.azlyrics.com/a/arcadefire.html';

// const proxies = ["http://skullproxy.com"];
const requestInterval = 4000;
const limit = 2;

let config;
module.exports = (_config, go) => {
    config = _configure(_config);
    let tracks = [];
    request({url: config.url/*, proxy: getProxy()*/}, (err, response, html) => {
        if (err) return go(err);
        console.log('im back');
        let $ = cheerio.load(html);
        let albums = {};
        let activeAlbum = null;
        let children = $('#listAlbum').children();
        return async.eachSeries(children,
            (child, go) => {
                let el = $(child);
                if (el.hasClass('album')) {
                    activeAlbum = el.text();
                    albums[el.text()] = [];
                    return go();
                } if (el.hasClass('listalbum-item')) {
                    if (!el.text()) return go();
                    let song = {
                        name: el.text(),
                        album: activeAlbum,
                        lyricsLink: el.children('a').attr('href'),
                    };
                    albums[activeAlbum].push(song);
                    console.log(song.lyricsLink);
                    if (tracks.length >= limit) return go('END');
                    return scrapeLyrics(host + song.lyricsLink.slice(2), (e, lyricsText) => {
                        if (e) return go(e);
                        let phrases = lyricsText.split('\n\n').filter(p => p);
                        song.lyrics = phrases.map(p => p.split('\n').filter(l => l));
                        song.datapath = el.attr('href');
                        console.log('\n\n', lyricsText, '\n\n');
                        if (lyricsText) tracks.push(song);
                        _writeToFile(tracks);
                        return setTimeout(go, config.requestInterval);
                    });
                }
                return go();
            }, (e) => {
                console.log(e || 'success');
                console.log('albums', JSON.stringify(albums, null, 4));
                console.log('pieces', JSON.stringify(tracks, null, 4));
                if (e) return go(e);
                return _writeToFile(tracks, go);
                // return fs.writeFile('pieces.json', JSON.stringify(tracks, null, 4), go);
                // console.log('emptyLyrics', emptyLyrics);
            });
    });
};

let emptyLyrics = [];
function scrapeLyrics(url, go) {
    request({url: url/*, proxy: getProxy()*/}, (err, response, html) => {
        if (err) return go(err);
        let $ = cheerio.load(html);
        // let divs = $('div:not([class])')
        let mainPage = $('.main-page');
        let row = mainPage.children('.row');
        let lyricsDiv = row.find('div:not([class])');
        // console.log(lyricsDiv.text());
        if (!lyricsDiv.text()) emptyLyrics.push(url);
        return go(null, lyricsDiv.text());
    });
}

function _writeToFile(tracks, go) {
    fs.writeFile(config.filepath, JSON.stringify(tracks, null, 4), go || ((err) => {if (err) console.log(err)}));
}

function _configure(_config) {
    return {
        filepath: `${_config.dest}/${_config.artist}.json`,
        url: `https://www.azlyrics.com/${_config.artist.charAt(0)}/${_config.artist}.html`,
        requestInterval: _config.requestInterval || 4000,
    }
}

// let lyricsUrl = 'https://www.azlyrics.com/lyrics/arcadefire/everythingnow.html';
// scrapeLyrics(lyricsUrl, () => {
//     console.log('hii');
// })

function getProxy() {
    let i = Math.floor(Math.random() * proxies.length);
    console.log(proxies[i]);
    return proxies[i];
}
// getProxy();
