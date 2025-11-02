import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5500', 'http://127.0.0.1:5500'] // Allow multiple frontend URLs
}));

// Steam API endpoint
const STEAM_API_URL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/';

// Route to get Steam profile
app.get('/api/profile', async (req, res) => {
  try {
    const url = `${STEAM_API_URL}?key=${process.env.STEAM_API_KEY}&steamids=${process.env.STEAM_ID}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Steam API request failed');
    }

    res.json(data.response.players[0]);
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    res.status(500).json({ error: 'Failed to fetch Steam profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});