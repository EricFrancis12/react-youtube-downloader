require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend", "build")));
app.use(express.static('public'));

const ytdl = require('ytdl-core');

const merge = require('./methods/merge');
const merge2 = require('./methods/merge2');





// app.get('/', (req, res) => {
//     res.status(200).sendFile('./test.html', { root: './' });
// });





app.post('/info', async (req, res) => {
    try {
        let v;
        if (ytdl.validateID(req.body.input)) {
            v = req.body.input;
        } else if (ytdl.validateURL(req.body.input)) {
            v = ytdl.getVideoID(req.body.input);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Error: Invalid video ID.'
            })
        }

        const videoInfo = await ytdl.getInfo(req.body.input);

        const formats = [];

        videoInfo.player_response.streamingData.formats.forEach(format => {
            const item = makeItem(v, format);
            formats.push(item);
        });

        videoInfo.player_response.streamingData.adaptiveFormats.forEach(format => {
            const item = makeItem(v, format);
            formats.push(item);
        });

        function makeItem(v, format) {
            const mergeRequired = !format.audioChannels;
            return {
                v,
                q: format.qualityLabel,
                itag: format.itag,
                mergeRequired
            };
        }

        const videoData = {
            title: videoInfo.player_response.videoDetails.title,
            channelName: videoInfo.player_response.videoDetails.author,
            duration: videoInfo.player_response.videoDetails.lengthSeconds,
            views: videoInfo.player_response.videoDetails.viewCount,
            thumbnailUrl: `https://img.youtube.com/vi/${v}/maxresdefault.jpg`
        };

        res.status(200).json({
            success: true,
            formats,
            videoData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});





app.post('/download', async (req, res) => {
    console.log(req.body);

    try {
        const ytURL = `https://youtube.com?v=${req.body.v}`;

        if (req.body.mergeRequired === false) {
            const videoStream = ytdl(ytURL, { quality: req.body.itag });

            res.setHeader('Content-Type', 'video/mp4');
            videoStream.pipe(res);
        } else {
            const mergedPath = `./tmp/${crypto.randomUUID()}.mp4`;
            if (req.query.merge === '1') {
                await merge(req.body.v, req.body.itag, mergedPath);
            } else {
                await merge2(req.body.v, req.body.itag, mergedPath);
            }

            const stream = fs.createReadStream(mergedPath);
            const stat = fs.statSync(mergedPath);

            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
            res.setHeader('Content-Length', stat.size.toString());

            stream.pipe(res);

            stream.on('close', () => {
                fs.unlink(mergedPath, () => {
                    console.log(`File successfully deleted: ${mergedPath}`);
                });
            });

        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error streaming video from server.'
        });
    }
});





app.listen(process.env.PORT, () => console.log(`Server running at port ${process.env.PORT}`));
