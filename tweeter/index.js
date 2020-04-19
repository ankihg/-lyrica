module.exports = { tweet: tweet, };
const Twit = require('twit');
const privateConf = require('./private-conf');

const twat = new Twit({
    consumer_key: privateConf.apiKey,
    consumer_secret: privateConf.apiSecret,
    access_token: privateConf.accessToken,
    access_token_secret: privateConf.accessTokenSecret,
    timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
});

function tweet(status) {
    console.log("mock tweet: " + status);

    // twat.post('statuses/update', { status: 'im a vampire'}, function(err, data, response) {
    //     console.log('response.statusCode', response.statusCode);
    //     console.log(response.statusCode == '200' ? '\n####SUCCESS' : '\n####ERROR')
    //     if (err) console.log(err);
    // })
}
