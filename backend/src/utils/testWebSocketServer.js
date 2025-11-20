import { WebSocketServer } from 'ws';

/**
 * Simple WebSocket test server for testing WebSocket connections
 * Run with: node -e "import('./src/utils/testWebSocketServer.js')"
 */
const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WebSocket test server running on ws://localhost:${PORT}`);

wss.on('connection', (ws, req) => {
    console.log(`✅ New client connected from ${req.socket.remoteAddress}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to WebSocket test server',
        timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        console.log(`📨 Received message:`, data.toString());
        
        // Echo the message back
        if (data instanceof Buffer) {
            // Binary message
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
        console.log(`❌ Client disconnected`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error:`, error);
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
    console.error(`❌ WebSocket server error:`, error);
});

export default wss;

