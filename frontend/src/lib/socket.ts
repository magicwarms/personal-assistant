import { io } from 'socket.io-client';

// Initialize Socket.io client
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Function to process user input through WebSocket
export async function processUserInput(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Emit the user input to the server
    socket.emit('process-input', { message: input });

    // Wait for the response
    socket.once('process-response', (response) => {
      resolve(response.message);
    });

    // Handle timeout
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, 10000);
  });
}

export default socket;