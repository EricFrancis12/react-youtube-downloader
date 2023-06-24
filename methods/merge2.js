const crypto = require('crypto');
const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');




module.exports = async function merge(v, itag, outputPath) {
    console.log('Starting merge2');
    const tmpAudioPath = `./tmp/${crypto.randomUUID()}.mov`;
    const tmpVideoPath = `./tmp/${crypto.randomUUID()}.mp4`;

    await new Promise((resolve, reject) => {
        try {
            const audio = ytdl(v, { quality: 'highestaudio' });
            const video = ytdl(v, { quality: itag });

            const audioWriteStream = fs.createWriteStream(tmpAudioPath);
            audio.pipe(audioWriteStream);

            const videoWriteStream = fs.createWriteStream(tmpVideoPath);
            video.pipe(videoWriteStream);

            let audioFinished = false;
            let videoFinished = false;

            audio.on('end', () => {
                audioFinished = true;
                if (audioFinished && videoFinished) resolve();
            });

            video.on('end', () => {
                videoFinished = true;
                if (audioFinished && videoFinished) resolve();
            });

        } catch (err) {
            console.error(err);
            reject(err);
        }
    });

    return await new Promise((resolve, reject) => {
        ffmpeg()
            .input(tmpAudioPath) // Specify the path to the audio file
            .input(tmpVideoPath) // Specify the path to the video file
            .outputOptions('-c:v copy') // Copy video codec without re-encoding
            .outputOptions('-c:a aac') // Set audio codec to AAC
            .outputOptions('-strict -2') // Enable experimental AAC codec if needed
            .save(outputPath) // Save the merged file to the specified output path
            .on('end', () => {
                // Merging completed successfully
                resolve(outputPath);
                fs.unlink(tmpAudioPath, () => console.log(`Deleted file: ${tmpAudioPath}`));
                fs.unlink(tmpVideoPath, () => console.log(`Deleted file: ${tmpVideoPath}`));
            })
            .on('error', (err) => {
                console.error('Error while merging files:', err);
                reject(err);
            });
    });
}
