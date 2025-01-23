const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const axios = require('axios');

// Language configuration with mBART codes
const supportedLanguages = {
    "English": "en_XX",
    "Spanish": "es_XX",
    "French": "fr_XX",
    "German": "de_XX",
    "Italian": "it_XX",
    "Portuguese": "pt_XX",
    "Russian": "ru_RU",
    "Chinese": "zh_CN",
    "Japanese": "ja_XX",
    "Korean": "ko_KR"
};

// Store connected users with their language preferences
let users = new Map();

// Translation function
async function translateMessage(text, sourceLang, targetLang) {
    try {
        const response = await axios.post('http://127.0.0.1:8000/translate/', {
            text: text,
            source_lang: sourceLang,
            target_lang: targetLang
        });
        
        if (response.data && response.data.translated_text) {
            return response.data.translated_text;
        } else {
            throw new Error('Translation response format invalid');
        }
    } catch (error) {
        console.error('Translation error:', error.message);
        throw error;
    }
}

// Socket connection handling
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Handle new messages
    socket.on("message", async (data) => {
        const sender = users.get(socket.id);
        if (!sender) return;

        const messageToSend = {
            text: data.message,
            name: data.username,
            id: `${socket.id}-${Date.now()}`
        };

        // Send original message to sender
        socket.emit("messageResponse", messageToSend);

        // Translate and send messages to other users
        for (const [recipientId, recipient] of users) {
            if (recipientId !== socket.id) {
                try {
                    if (recipient.preferredLang !== sender.preferredLang) {
                        console.log(`Translating from ${sender.preferredLang} to ${recipient.preferredLang}`);
                        
                        const translatedText = await translateMessage(
                            data.message,
                            sender.preferredLang,
                            recipient.preferredLang
                        );

                        const translatedMessage = {
                            text: translatedText,
                            name: data.username,
                            id: `${messageToSend.id}-tr-${recipientId}`,
                            isTranslated: true,
                            originalLanguage: sender.preferredLang,
                            translatedLanguage: recipient.preferredLang
                        };

                        socket.to(recipientId).emit("messageResponse", translatedMessage);
                    } else {
                        socket.to(recipientId).emit("messageResponse", messageToSend);
                    }
                } catch (err) {
                    console.error("Translation failed:", err);
                    // Fall back to original message if translation fails
                    socket.to(recipientId).emit("messageResponse", {
                        ...messageToSend,
                        translationError: true
                    });
                }
            }
        }
    });

    // Handle new user joining
    socket.on("newUser", data => {
        const userInfo = {
            username: data.username,
            socketID: socket.id,
            preferredLang: supportedLanguages[data.preferredLang] || "en_XX"
        };
        users.set(socket.id, userInfo);
        socketIO.emit("newUserResponse", Array.from(users.values()));
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        users.delete(socket.id);
        socketIO.emit("newUserResponse", Array.from(users.values()));
    });
});

// API endpoint to get supported languages
app.get('/api/languages', (req, res) => {
    const languages = Object.entries(supportedLanguages).map(([name, code]) => ({
        name,
        code,
        nativeName: name
    }));
    res.json(languages);
});

// API endpoint to test translation
app.post('/api/test-translation', async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;
        const translated = await translateMessage(text, sourceLang, targetLang);
        res.json({ success: true, translated_text: translated });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});