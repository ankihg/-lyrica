module.exports = { xtract: xtract, };
const _config = require('./config');
const ERRORS = require('../Errors');

xtract()
function xtract(_confArg) {
    let conf = _confArg || _config;
    console.log(conf);

    let songs;
    try { songs = require(`${conf.source}/${conf.artist}.json`); }
    catch (err) { throw ERRORS.XTRACTOR.ARTIST_NOT_IN_BANK; }

    let song = _chooseRand(songs);
    let phrase = _chooseRand(song.lyrics);
    let line = _chooseRand(phrase);
    return line;
}

function _chooseRand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
