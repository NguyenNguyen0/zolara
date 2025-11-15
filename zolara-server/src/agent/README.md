# Zolara AI Agent Module

This module provides AI-powered chat functionality for the Zolara messaging application using Google's Gemini AI.

## Features

- **REST API Endpoints**: Traditional HTTP-based chat interface
- **WebSocket Streaming**: Real-time streaming chat responses
- **No Authentication Required**: Public access for ease of use
- **Conversation History**: Support for maintaining chat context
- **Session Management**: Track conversations with session IDs

## API Endpoints

### REST API

#### POST `/api/v1/agent/chat`
Send a message to the AI agent and receive a complete response.

**Request Body:**
```json
{
  "message": "Hello, how can you help me?",
  "history": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "role": "assistant", 
      "content": "Previous response",
      "timestamp": "2024-01-01T00:00:05Z"
    }
  ],
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "content": "AI response content",
  "sessionId": "session_123456789",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "tokensUsed": 150
}
```

#### GET `/api/v1/agent/config`
Get current AI agent configuration.

#### GET `/api/v1/agent/status`
Check AI agent service availability.

### WebSocket API

Connect to the WebSocket namespace: `/agent`

#### Events to Listen For:

- `connected` - Connection established
- `chatChunk` - Streaming response chunks
- `chatStarted` - Chat processing started
- `chatError` - Error occurred

#### Events to Send:

- `chat` - Send chat message for streaming response
- `heartbeat` - Keep connection alive
- `getStatus` - Get service status

#### Example WebSocket Usage:

```javascript
const socket = io('http://localhost:3000/agent');

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('chatChunk', (chunk) => {
  if (chunk.type === 'content') {
    console.log('Chunk:', chunk.content);
  } else if (chunk.type === 'done') {
    console.log('Chat completed');
  } else if (chunk.type === 'error') {
    console.error('Error:', chunk.error);
  }
});

// Send a message
socket.emit('chat', {
  message: 'Hello, AI!',
  history: [],
  sessionId: 'my-session'
});
```

## Environment Configuration

Make sure your `.env` file contains:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

## Agent Behavior

The AI agent is specifically configured to:

- Act as a helpful assistant for the Zolara messaging application
- Provide support for messaging features, groups, contacts, and settings
- Answer questions about application functionality
- Assist with troubleshooting common issues
- Provide tips and best practices

## Error Handling

The module includes comprehensive error handling:

- Invalid requests return appropriate HTTP status codes
- WebSocket errors are emitted as error events
- Service unavailability is gracefully handled
- Connection timeouts and cleanup are managed automatically

## Development Notes

- The module uses Google's Gemini 1.5 Flash model
- Temperature is set to 0.7 for balanced creativity/consistency
- Maximum response length is 2048 tokens
- WebSocket connections are cleaned up after 5 minutes of inactivity
- All responses include timestamps for tracking