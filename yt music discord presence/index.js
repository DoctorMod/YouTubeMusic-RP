const DiscordRPC = require('discord-rpc');
const express = require('express');
var song = 'Waiting for music...';
var artist = '...';
const app = express();
var tempTime = '0:00';
var timeMax = Date.now();
var timeNow = timeMax;
var timeout = 0;
// Set this to your Client ID.
const clientId = '935838731603165184';

var rpc;

function connectDiscord() {
    try {
        rpc = new DiscordRPC.Client({ transport: 'ipc' });
    } catch (e) {
        console.log(e);
        setTimeout(connectDiscord, 3000);
    }
}

connectDiscord()

console.log('Starting YouTubeMusicDiscordRichPresence...')

app.use(express.json());
app.post("/", (request, response) => {
    let content = request.body;
    if (content.end) {
        console.log("Session Ended!");
        response.sendStatus(200);
        rpc.clearActivity();
        return;
    }

    if (content.song == undefined || content.song == null || tempTime == content.timeMax.replace(' ', '') || content.timeMax.replace(' ', '') == '0:00') {
        response.sendStatus(200);
        return;
    }

    if (song == content.song) {
        response.sendStatus(200);
        return;
    }

    tempTime = content.timeMax.replace(' ', '');
    song = content.song

    console.log('Playing now ' + content.song + ' by ' + content.artist + ' Time: ' + content.timeMax.replace(' ', ''));
    update(content.song, content.artist, Date.now(), timeToMilli(content.timeMax.replace(' ', '')));
    response.sendStatus(200);
});

function timeToMilli(time) {
    var temp = Date.now();
    if (time.split(':').length == 2) {
        temp += Math.round(parseFloat(time.split(':')[0]) * 60000);
        temp += Math.round(parseFloat(time.split(':')[1]) * 1000);
    } else if (time.split(':').length == 3) {
        temp += Math.round(parseFloat(time.split(':')[0]) * 3600000);
        temp += Math.round(parseFloat(time.split(':')[1]) * 60000);
        temp += Math.round(parseFloat(time.split(':')[2]) * 1000);
    }
    return temp;
}

app.listen(3000, () => console.log('Listening!'));

function update(song_, artist_, timeNow_, timeMax_) {
    song = song_;
    artist = artist_;
    timeMax = timeMax_;
    timeNow = timeNow_;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        rpc.clearActivity();
        console.log("Connection Timeout!")
    }, timeMax_ - timeNow_ + 20000);
    console.log("Newtimeout of %d", timeMax_ - timeNow_ + 20000, "set!");
    setActivity();
}

async function setActivity() {
    if (!rpc) {
        return;
    }

    if (timeMax != 0) {
        rpc.setActivity({
            type: 2,
            state: artist,
            details: song,
            startTimestamp: timeNow,
            endTimestamp: timeMax,
            largeImageKey: 'ytmusic',
            smallImageKey: 'play',
            instance: true,
        });
    }
}

rpc.login({ clientId }).catch(console.error);