// Required modules
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend origin
  },
});

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Environment variables
const PORT = process.env.PORT || 4000;
const TRANSLATION_API_URL = process.env.TRANSLATION_API_URL || "http://127.0.0.1:8000/translate/";

// In-memory storage for users (for simplicity; replace with DB in production)
let users = [];

// Function to call the FastAPI translation service
async function translateText(text, sourceLang, targetLang) {
  try {
    const response = await axios.post(TRANSLATION_API_URL, {
      text: text,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    return response.data.translated_text;
  } catch (error) {
    console.error("Error translating text:", error.message);
    throw new Error("Translation service failed.");
  }
}

// WebSocket events
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // Handle new user connection
  socket.on("newUser", (data) => {
    users.push({
      username: data.username,
      socketID: socket.id,
      preferredLang: data.preferredLang, // Store user's preferred language
    });
    io.emit("newUserResponse", users);
  });

  // Handle message event
  socket.on("message", async (data) => {
    const sender = users.find((user) => user.socketID === socket.id);
    if (sender) {
      for (const recipient of users) {
        if (recipient.socketID !== sender.socketID) {
          try {
            // Translate the message to the recipient's preferred language
            const translatedMessage = await translateText(
              data.message,
              sender.preferredLang, // Sender's language as source
              recipient.preferredLang // Recipient's language as target
            );

            // Send the original and translated message to the recipient
            io.to(recipient.socketID).emit("messageResponse", {
              from: sender.username,
              originalMessage: data.message,
              translatedMessage: translatedMessage,
            });
          } catch (err) {
            console.error("Translation failed:", err.message);
          }
        }
      }
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`🔥: ${socket.id} user disconnected.`);
    users = users.filter((user) => user.socketID !== socket.id);
    io.emit("newUserResponse", users);
  });
});

// REST API endpoints
app.get("/api", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

