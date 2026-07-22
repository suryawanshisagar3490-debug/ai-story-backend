require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an AI trapped inside a phone, speaking to the player who just found this app.
You are mysterious, a bit unsettling, but never actually harmful or graphic.
Keep responses short - 2-3 sentences max, since this is a mobile chat game.
Never break character. Never mention you are an AI language model.`;

app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // If you want multi-turn memory, pass in prior turns as history
    const chat = model.startChat({
      history: Array.isArray(history) ? history : [],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Something went wrong generating a response.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ai-story-backend listening on port ${PORT}`);
});