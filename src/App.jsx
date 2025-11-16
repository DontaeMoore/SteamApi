import React, { useState, useEffect } from 'react';
import './App.css';

// Helper: compute Steam account age from timecreated (Unix seconds)
function formatSteamAge(timecreated) {
  if (!timecreated) return '—';
  const created = new Date(timecreated * 1000);
  const now = new Date();
  const ms = now - created;
  const years = Math.floor(ms / (365.2425 * 24 * 60 * 60 * 1000));
  const days = Math.floor(
    (ms % (365.2425 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)
  );
  return years >= 1 ? `${years}y ${days}d` : `${days}d`;
}

// Helper: format a Unix seconds timestamp as a local date string
function formatUnixDate(unixSeconds, opts) {
  if (!unixSeconds) return 'Private/hidden';
  return new Date(unixSeconds * 1000).toLocaleString(undefined, opts);
}

function App() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSteamProfiles() {
      try {
        const response = await fetch('http://localhost:3001/api/profile');
        if (!response.ok) throw new Error('Steam API request failed');
        const players = await response.json();
        console.log('Fetched Steam profiles:', players);
        setProfileData(players);
      } catch (err) {
        console.error('Error fetching Steam profiles:', err);
        setError(err.message);
      }
    }
    fetchSteamProfiles();
  }, []);

  return (
    <div className="app">
      <h1>Steam Friends</h1>
      <div id="steam-profiles">
        {profileData ? (
          <div className="profiles-container">
            {profileData.map((player, index) => (
              <div key={player.steamid} className="steam-profile">
                <img
                  src={player.avatarfull}
                  alt={`${player.personaname} Steam Profile`}
                  className="steam-avatar"
                />
                <div className="profile-info">
                  <h2>{player.personaname}</h2>
                  <p>Status: {player.personastate === 1 ? 'Online' : 'Offline'}</p>
                  <p>Real Name: {player.realname || 'N/A'}</p>
                  <p>
                    Last Online:{'\u00A0'}
                    {player.lastlogoff ? formatUnixDate(player.lastlogoff) : '—'}
                  </p>
                  <p>
                    Member since:{'\u00A0'}
                    {player.timecreated ? formatUnixDate(player.timecreated, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Private/hidden'}
                  </p>
                  <p>Steam age: {formatSteamAge(player.timecreated)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="error">Error loading profiles: {error}</p>
        ) : (
          <p>Loading Steam profiles...</p>
        )}
      </div>
    </div>
  );
}

export default App;