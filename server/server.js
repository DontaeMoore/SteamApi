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
      process.env.TIM_STEAM_ID,
      process.env.ISAHIA_STEAM_ID
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

// Route to get status of Deadlock API
app.get('/deadlock/status', async (req, res) => {
  try {
    // we need no parameters
    console.log('Fetching Deadlock status...');
    
    const url = 'https://api.deadlock-api.com/v1/info/health';
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Deadlock Api Call failed');
    }

    console.log('Deadlock status data:', data);
    

    // Return the whole JSON object
    res.json(data);
  } catch (error) {
    console.error('Error fetching Deadlock status:', error);
    res.status(500).json({ error: 'Failed to fetch Deadlock status' });
  }
});


// GET /api/deadlock/hero-stats?account_id=133440116&hero_ids=... (optional extra filters)
app.get('/api/deadlock/hero-stats', async (req, res) => {
  try {
    // Resolve account_id priority: query > DEADLOCK_ACCOUNT_ID > derived from STEAM_ID
    

    const accountIds = [
      process.env.DEADLOCK_ACCOUNT_ID,
      process.env.TIM_DEADLOCK_ACCOUNT_ID,
      process.env.ISAHIA_DEADLOCK_ACCOUNT_ID
    ].filter(id => id).join(',');
   

   

    const baseUrl = 'https://api.deadlock-api.com/v1/players/hero-stats';
    const params = new URLSearchParams();
    params.set('account_ids', accountIds);

    // Pass through known optional filters if provided and not literal 'null'
    const passThrough = ['hero_ids','min_unix_timestamp','max_unix_timestamp','min_duration_s','max_duration_s','min_networth','max_networth','min_average_badge','max_average_badge','min_match_id','max_match_id'];
    for (const key of passThrough) {
      const v = req.query[key];
      if (v !== undefined && v !== null && v !== 'null' && v !== '') {
        params.set(key, String(v));
      }
    }

    const url = `${baseUrl}?${params.toString()}`;
    const r = await fetch(url);
    const text = await r.text();
    // console.log('Deadlock API response text:', text);
    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error('Deadlock API non-JSON:', text);
      return res.status(502).json({ error: 'Deadlock API returned non-JSON', body: text });
    }
    if (!r.ok) {
      console.error('Deadlock API error', r.status, data);
      return res.status(r.status).json({ error: 'Deadlock API error', status: r.status, body: data });
    }
    return res.json(data);
  } catch (error) {
    console.error('Error fetching Deadlock hero stats:', error);
    res.status(500).json({ error: 'Failed to fetch Deadlock hero stats' });
  }
});

// GET /api/deadlock/heroes -> proxies Deadlock heroes metadata (id -> name mapping)
app.get('/api/deadlock/heroes', async (_req, res) => {
  try {
    const url = 'https://assets.deadlock-api.com/v2/heroes';
    const r = await fetch(url);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error('Deadlock heroes non-JSON:', text);
      return res.status(502).json({ error: 'Deadlock heroes returned non-JSON', body: text });
    }
    if (!r.ok) {
      console.error('Deadlock heroes error', r.status, data);
      return res.status(r.status).json({ error: 'Deadlock heroes error', status: r.status, body: data });
    }
    return res.json(data);
  } catch (error) {
    console.error('Error fetching Deadlock heroes:', error);
    res.status(500).json({ error: 'Failed to fetch Deadlock heroes' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});