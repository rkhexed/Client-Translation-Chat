// server.js

const express = require('express'); // Importing express
const http = require('http'); // Importing http module
const { Server } = require('socket.io'); // Importing socket.io

const app = express(); // Creating an express app
const server = http.createServer(app); // Creating an HTTP server
const io = new Server(server); // Creating a socket.io server

// Middleware to parse JSON requests
app.use(express.json());

// API Endpoint Example
app.post('/translate', (req, res) => {
    const { text } = req.body;
    // Logic to handle translation (e.g., using your ML model)
    const translatedText = translateText(text); // Placeholder for translation function
    res.json({ translated_text: translatedText }); // Sending the response
});

// Handling WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (msg) => {
        console.log('Message received: ' + msg);
        // Here, you can call your ML model for translation and emit the response
        socket.emit('message', 'Reply from server: ' + msg); // Example response
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Starting the server
server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
