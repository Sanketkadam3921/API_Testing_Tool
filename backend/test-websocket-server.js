import { WebSocketServer } from 'ws';

/**
 * Simple WebSocket test server for testing WebSocket connections
 * Run with: node test-websocket-server.js
 */
const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WebSocket test server running on ws://localhost:${PORT}`);
console.log(`📝 Connect from the frontend using: ws://localhost:${PORT}`);

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`✅ New client connected from ${clientIp}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to WebSocket test server',
        timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        console.log(`📨 Received message:`, data.toString().substring(0, 100));
        
        // Echo the message back
        if (data instanceof Buffer) {
            // Binary message
            console.log(`📦 Echoing binary message (${data.length} bytes)`);
            ws.send(data);
        } else {
            // Text message
            try {
                const parsed = JSON.parse(data.toString());
                ws.send(JSON.stringify({
                    type: 'echo',
                    original: parsed,
                    timestamp: new Date().toISOString()
                }));
            } catch {
                // Not JSON, echo as text
                ws.send(JSON.stringify({
                    type: 'echo',
                    message: data.toString(),
                    timestamp: new Date().toISOString()
                }));
            }
        }
    });

    // Handle connection close
    ws.on('close', () => {
        console.log(`❌ Client disconnected from ${clientIp}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error:`, error.message);
    });

    // Send periodic heartbeat
    const heartbeatInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            }));
        } else {
            clearInterval(heartbeatInterval);
        }
    }, 30000); // Every 30 seconds

    ws.on('close', () => {
        clearInterval(heartbeatInterval);
    });
});

wss.on('error', (error) => {
    console.error(`❌ WebSocket server error:`, error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    wss.close(() => {
        console.log('✅ WebSocket server closed');
        process.exit(0);
    });
});

