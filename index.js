'use strict';
console.log(process.argv);
const scrape = require('./scrape')
const config = require('./config')

exec(process.argv)

function exec(args) {
    scrape(config, () => {

    })
}
