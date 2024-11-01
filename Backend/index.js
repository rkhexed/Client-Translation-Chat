require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const harperSaveMessage = require('./services/harper-save-message');
const harperGetMessages = require('./services/harper-get-messages');
const leaveRoom = require('./utils/leave-room');

socket.on('send_message', async (data) => {
    const { message, username, room, __createdtime__ } = data;

    try {
        // Call ML translation API
        const response = await axios.post('http://localhost:8000/translate/', {
            text: message,
            source_lang: 'en', // add feature for users to set their language
            target_lang: 'es'  // target language of receiver, chat room implementation will have to be looked into oops
        });
        const translatedMessage = response.data.translated_text;

        // Emit the translated message to all users in the room
        io.in(room).emit('receive_message', { ...data, message: translatedMessage });
        
        // Save the original message and translated message in the database, need more understanding of HarperDB
        await harperSaveMessage(message, username, room, __createdtime__);
    } catch (error) {
        console.error("Error translating message:", error);
    }
});
