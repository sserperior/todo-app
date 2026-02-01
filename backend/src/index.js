import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import DBConnector from './db.js';

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
]);

const app = express();

app.use(express.json());

app.get('/api/lists', async (req, res) => {
    const owner = 'you'; // Stub for now
    const todos = await dbConnector.find(DBConstants.dbName, DBConstants.collectionName, { owner }, { createdAt: -1 }, { _id: 1, name: 1, owner: 1 });
    res.json(todos);
});

app.get('/api/lists/:id', async (req, res) => {
    const { id } = req.params;
    const todoList = await dbConnector.findById(DBConstants.dbName, DBConstants.collectionName, id, { _id: 1, name: 1, items: 1 });
    res.json(todoList);
});

app.post('/api/addlist', async (req, res) => {
    const { name } = req.body;
    const todoList = {
        name,
        owner: 'you', // stub for now
        items: [],
        createdAt: new Date(),
    };
    const { insertedId } = await dbConnector.insertOne(DBConstants.dbName, DBConstants.collectionName, todoList);
    res.status(201).json({ id: insertedId });
});

app.patch('/api/todolist/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await dbConnector.updateOne(DBConstants.dbName, DBConstants.collectionName, { _id: id }, { $set: { name } });
    res.status(200).send();
});

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

    ws.on('message', async message => {
        // Messages come in as a Buffer. They need to be converted to a string first.
        const messageString = message.toString();
        const jsonMessage = JSON.parse(messageString);
        if (jsonMessage?.api === 'lists') {
            // Initial connection.Send the list of todos to the client.
            // owner stubbed to 'you' for now.
            const todos = await dbConnector.find(DBConstants.dbName, DBConstants.collectionName, { owner: 'you' }, { createdAt: -1 }, { _id: 1, name: 1, owner: 1 });
            const message = {
                api: 'lists',
                result: todos,
            };
            ws.send(JSON.stringify(message));
        }
    });

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