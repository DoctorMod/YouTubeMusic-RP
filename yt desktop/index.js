const cp = require('child_process');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');

const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './' });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/download', (req, res) => {
    console.log('Downloading');
    const ref = req.query.url;
    // Get audio streams
    const audio = ytdl(ref, { filter: "audio", quality: '18' });
    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '8', '-hide_banner',
        // Set inputs
        '-i', 'pipe:3',
        // Map audio from streams
        '-map', '0:a',
        // Keep encoding
        '-c:v', 'copy',
        // Define output file
        'downloads/' + new URLSearchParams(new URL(ref).search).get('v') + '.ogg',
    ], {
        windowsHide: true,
        stdio: [
            'inherit', 'inherit', 'inherit', 'pipe',
        ],
    });
    audio.pipe(ffmpegProcess.stdio[3]);
})