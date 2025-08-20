const express = require('express');
const bodyParser = require('body-parser');
const codeRunRouter = require('./Routes/codeRun');
const cors = require('cors');
const url = require('url');
const WebSocket = require('ws');
const shareDB = require('sharedb');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const share = new shareDB({ presence: true });
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/code', codeRunRouter);

const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', ws => {
    const stream = new WebSocketJSONStream(ws);
    share.listen(stream);
});

const videoSocket = new WebSocket.Server({ noServer: true });

// ✅ NEW: Manages clients per room.
// The structure is: Map<roomId, { clients: Map<ws, userInfo>, userToWs: Map<userId, ws> }>
const rooms = new Map();

videoSocket.on('connection', (ws, roomId) => {
    // 3. Add the new client to the specific room
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { clients: new Map(), userToWs: new Map() });
    }
    const room = rooms.get(roomId);

    const userId = uuidv4();
    const userInfo = { userId, userName: 'Anonymous' };
    room.clients.set(ws, userInfo);
    room.userToWs.set(userId, ws);

    console.log(`User ${userId} connected to room ${roomId}`);

    // Assign a unique ID to the newly connected client
    ws.send(JSON.stringify({ type: 'assign-id', id: userId }));

    ws.on('message', data => {
        let message;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse message:', data);
            return;
        }
        
        const senderInfo = room.clients.get(ws);
        if (!senderInfo) return;

        if (message.type === 'join' && message.name) {
            senderInfo.userName = message.name;
        }

        const messageWithSender = { ...message, from: senderInfo.userId, name: senderInfo.userName };

        // 4. Broadcast messages only to clients in the same room
        if (message.to && room.userToWs.has(message.to)) {
            const recipientWs = room.userToWs.get(message.to);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                recipientWs.send(JSON.stringify(messageWithSender));
            }
        } else {
            room.clients.forEach((info, client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageWithSender));
                }
            });
        }
    });

    ws.on('close', () => {
        // 5. Clean up the user from their specific room
        const leavingUserInfo = room.clients.get(ws);
        if (!leavingUserInfo) return;

        const { userId, userName } = leavingUserInfo;
        console.log(`User ${userId} (${userName}) disconnected from room ${roomId}`);
        
        // Notify others in the same room
        room.clients.forEach((info, client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'leave', from: userId, name: userName }));
            }
        });

        room.clients.delete(ws);
        room.userToWs.delete(userId);

        // If the room is now empty, remove it to save memory
        if (room.clients.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} is now empty and has been closed.`);
        }
    });
});

const connection = share.connect();
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    // ✅ 1. Extract roomId from the URL for video chat connections
    const videoMatch = pathname.match(/^\/foo\/([\w-]+)$/);

    if (videoMatch) {
        const roomId = videoMatch[1];
        // ✅ 2. Pass roomId to the connection handler
        videoSocket.handleUpgrade(request, socket, head, ws => {
            videoSocket.emit('connection', ws, roomId);
        });
    } else if (pathname === '/bar') {
        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws);
        });
    } else {
        socket.destroy();
    }
});

app.post('/', (req, res) => {
    const id = req.body.id;
    const doc = connection.get('examples', id);
    doc.fetch(err => {
        if (err) throw err;
        if (doc.type === null) {
            doc.create({ content: '', output: [''], input: [''], lang: [''] });
        }
        res.send('Document handled');
    });
});