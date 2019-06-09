var readlineSync = require('readline-sync'),
    EventEmitter = require('events'),
    steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    crypto = require("crypto"),
    dota2 = require("../"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true);

// Load config
global.config = require("./config");

// Load in server list if we've saved one before
if (fs.existsSync('servers')) {
    steam.servers = JSON.parse(fs.readFileSync('servers'));
}

// Login, only passing authCode if it exists
var logOnDetails = {
    "account_name": global.config.steam_user,
    "password": global.config.steam_pass,
};
if (global.config.steam_guard_code) logOnDetails.auth_code = global.config.steam_guard_code;
if (global.config.two_factor_code) logOnDetails.two_factor_code = global.config.two_factor_code;

// try {
//     var sentry = fs.readFileSync('sentry');
//     if (sentry.length) logOnDetails.sha_sentryfile = sentry;
// } catch (beef) {
//     util.log("Cannae load the sentry. " + beef);
// }

var onSteamLogOn = function() {
    Dota2.launch();
    Dota2.on("ready", function() {
        Dota2.requestMatchDetails(4800467300);
        Dota2.on("matchDetailsData", function (matchId, matchData) {
            console.log(JSON.stringify(matchData, null, 2));
        });
    })
}

var eventBus = new EventEmitter();

eventBus.on('conn', () => {
    steamClient.removeAllListeners();
    steamClient.connect();
    steamClient.on('connected', function() {
        console.log('connected')
        steamUser.logOn(logOnDetails);
    });
    steamClient.on('needTwoFactor', function(eresult) {
        console.log('needTwoFactor', eresult);
        let code = readlineSync.question(`input tow factor code:`);
        logOnDetails.two_factor_code = code;
        console.log(logOnDetails);
        steamClient.disconnect();
        eventBus.emit('conn');
    });
    steamClient.on('logonDenied', function(eresult) {
        console.log('logonDenied', eresult);
        let code = readlineSync.question(`input auth code:`);
        logOnDetails.steam_guard_code = code;
        console.log(logOnDetails);
        steamClient.disconnect();
        eventBus.emit('conn');
    });
    steamClient.on('logOnResponse', onSteamLogOn);
});


eventBus.emit('conn')






