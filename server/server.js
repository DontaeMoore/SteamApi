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

// Route to get Steam profiles (you + friends)
app.get('/api/profile', async (req, res) => {
  try {
    // Combine all Steam IDs (you + your friends)
    const steamIds = [
      process.env.STEAM_ID,
      process.env.FRIEND1_STEAM_ID,
      process.env.FRIEND2_STEAM_ID
    ].filter(id => id).join(','); // Filter out undefined IDs and join with commas
    
    const url = `${STEAM_API_URL}?key=${process.env.STEAM_API_KEY}&steamids=${steamIds}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Steam API request failed');
    }

    // Return all players instead of just the first one
    res.json(data.response.players);
  } catch (error) {
    console.error('Error fetching Steam profiles:', error);
    res.status(500).json({ error: 'Failed to fetch Steam profiles' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});