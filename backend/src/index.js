import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { WebSocketServer } from 'ws';
import DBConnector from './db.js';
import { messageHandler } from './messageHandler.js';

dotenv.config('../.env');

const DBConstants = {
    dbName: 'tododb',
    collectionName: 'lists',
};

const dbConnector = new DBConnector(process.env.MONGO_URI);
await Promise.all([
    dbConnector.createIndex(DBConstants.dbName, DBConstants.collectionName, 'name', { name: 1 }, { unique: true }),
    dbConnector.createIndex(DBConstants.dbName, DBConstants.collectionName, 'owner', { owner: 1 }),
    dbConnector.createIndex(DBConstants.dbName, DBConstants.collectionName, 'name_owner', { name: 1, owner: 1 }),
    dbConnector.createIndex(DBConstants.dbName, DBConstants.collectionName, 'items_id', { 'items.id': 1 }, { unique: true }),
]);

const app = express();

const distPath = path.resolve(import.meta.dirname, '..', '..', 'frontend', 'dist');
console.log('distPath', distPath);
app.use(express.static(distPath));

app.get('/*splat', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 4000;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', messageHandler(ws, DBConstants, dbConnector));

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected: ${code} ${reason}`);
    });

    ws.on('error', error => {
        console.error('Client error:', error);
    });
});

const shutdownDbConnectors = async () => {
    if (dbConnector) {
        await dbConnector.disconnect();
        console.log('MongoDB connection shut down successful.');
    }
};

const shutdownServers = async exitCode => {
    await shutdownDbConnectors();
    wss.close(() => {
        console.log('WebSocket server shutdown successful.');
        server.close(() => {
            console.log('Server shut down successful.');
            process.exit(exitCode);
        });
    });

    // Force kill after 60 seconds
    setTimeout(() => {
        console.error('Server did not shut down in 60 seconds.');
        process.exit(exitCode);
    }, 60000);
};

process.on('SIGINT', async () => {
    await shutdownServers(1);
});

process.on('SIGTERM', async () => {
    await shutdownServers(1);
});

process.on('uncaughtException', async err => {
    console.error('Uncaught Exception:', err);
    await shutdownServers(1);
});