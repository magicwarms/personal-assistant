import 'dotenv/config'

import express, { RequestHandler } from 'express';
import { CONFIG } from './config';
import OllamaService from './services/ollamaService';
import { createServer } from "http";
import { Server } from "socket.io";
import { debug } from 'console';
import { join } from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

// Middleware
app.use(express.json());

// CORS middleware
const corsMiddleware: RequestHandler = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
};

app.use(corsMiddleware);

// Add request logging
app.use((req, _, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Serve static files
app.use(express.static('uploads'));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/frontend/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected with ID:', { socketId: socket.id });

    socket.on("submitMessage", async (message: string) => {
        console.log({ submittedMessage: message });

        const response = await OllamaService.generatePlanner(message);
        // for await (const part of response) {
        //     socket.emit("generateResponse", part.message.content);
        // }
        socket.emit("generateResponse", response);
    })
});


io.on('disconnect', () => {
    console.log('user disconnected');
})

// Start server
httpServer.listen(CONFIG.PORT, () => {
    console.log(`Server running on port ${CONFIG.PORT}`);
});

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server')
    httpServer.close(() => {
        debug('HTTP server closed')
    })
})