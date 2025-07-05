const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

//require('dotenv').config();
console.log("GEMINI API KEY:", process.env.GEMINI_API_KEY); // Add this temporarily


const app = express();
app.use(cors());
app.use(express.json());

const logPath = 'chatLogs.json';

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Please act as a Engineering college professor helping the student in understanding
                 the topic whatever the student is asking about. He/She will talk to you about it. Limit your answers to max 80 words.

Question: ${userMessage}`,
              },
            ],
          },
        ],
      }
    );
    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you, please try again.";

    // Log to file
    const log = { timestamp: new Date(), userMessage, reply };
    fs.appendFileSync(logPath, JSON.stringify(log) + '\n');

    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'Gemini failed.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
