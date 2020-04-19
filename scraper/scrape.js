const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');

function _configure(_config) {
    const host = 'https://www.azlyrics.com';
    return {
        host: host,
        url: `${host}/${_config.artist.charAt(0)}/${_config.artist}.html`,
        filepath: `${_config.dest}/${_config.artist}.json`,
        requestInterval: _config.requestInterval || 4000,
        limit: _config.limit,
    }
}

let config;
module.exports = (_config, go) => {
    config = _configure(_config);
    let tracks = [];
    request({url: config.url,}, (err, response, html) => {
        if (err) return go(err);
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
                    if (config.limit && tracks.length >= config.limit) return go('END');
                    return scrapeLyrics(config.host + song.lyricsLink.slice(2), (e, lyricsText) => {
                        if (e) return go(e);
                        let phrases = lyricsText.split('\n\n').filter(p => p);
                        song.lyrics = phrases.map(p => p.split('\n').filter(l => l));
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
            });
    });
};

let emptyLyrics = [];
function scrapeLyrics(url, go) {
    request({url: url,}, (err, response, html) => {
        if (err) return go(err);
        let $ = cheerio.load(html);
        let mainPage = $('.main-page');
        let row = mainPage.children('.row');
        let lyricsDiv = row.find('div:not([class])');
        if (!lyricsDiv.text()) emptyLyrics.push(url);
        return go(null, lyricsDiv.text());
    });
}

function _writeToFile(tracks, go) {
    fs.writeFile(config.filepath, JSON.stringify(tracks, null, 4), go || ((err) => {if (err) console.log(err)}));
}
