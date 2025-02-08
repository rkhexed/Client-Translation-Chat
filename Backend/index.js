
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
const bcrypt = require('bcrypt');

require('dotenv').config();

// mongodb stuff
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DATABASE_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
// connect to mongodb
connectDB();


app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


// Language configuration with mBART codes
const supportedLanguages = {
    "English": "en_XX",
    "Spanish": "es_XX",
    "French": "fr_XX",
    "German": "de_DE",
    "Italian": "it_IT",
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
        try{
            collection = await connectDB('chatlog');
            collection.insertOne(messageToSend);
        } catch (e){
             return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        


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

app.get('/api/load-messages', async (req, res) => {
    try{
        collection = await connectDB('chatlog');
        entries = await collection.find({}).toArray()

       //console.log(entries);
        return res.status(200).json({success: true, data: entries})
        
    } catch (e){
         return res.status(500).json({ success: false, error: 'Internal server error' });
    }
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

//API endpoint to allow user to sign up
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required' });

    try {
        //connect to login collection
        collection = await connectDB('login');
        userExists = await collection.findOne({username:username});

        if (userExists) {
            //console.log("dies, (they already exist)");
            res.status(500).json({
                success: false,
                error: 'Username already exists'
            })
            return
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt );

        await collection.insertOne({username: username, password: hashedPassword});
       
        return res.json({success: true})

    } catch(e){
        console.error(e);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    

})

//api to allow login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required' });

    try {
        //connect to login collection
        collection = await connectDB('login');
        user = await collection.findOne({username:username});

        if (!user) {
            return res.status(400).json({success: false, error: 'User does not exist'})
        }

        match = bcrypt.compare(password, user.password);

        if(!match){
             return res.status(400).json({ success: false, error: 'Password is incorrect' });
        }
        // SUCCESS
        return res.json({success: true, token: username}) // CHANGE TO JWT TOKEN FOR SAFETY!!!!

    } catch(e){
        console.error(e);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    

})





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






async function connectDB(collection, db='logins') {
    try {
        collection = client.db(db).collection(collection); 
        return collection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }

}