import * as PlayHT from 'playht';
import fs from 'fs';

// Initialize client
PlayHT.init({
    userId: '<YOUR_USER_ID>',
    apiKey: '<YOUR_API_KEY>',
});

async function streamAudio(text: string) {
    const stream = await PlayHT.stream(text, { voiceEngine: 'PlayDialog' });
    stream.on('data', (chunk) => {
        // Do whatever you want with the stream, you could save it to a file, stream it in realtime to the browser or app, or to a telephony system
        fs.appendFileSync('output.mp3', chunk);
    });
    return stream;
}