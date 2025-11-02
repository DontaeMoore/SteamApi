import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSteamProfile() {
      try {
        const response = await fetch('http://localhost:3001/api/profile');
        if (!response.ok) throw new Error('Steam API request failed');
        const player = await response.json();
        setProfileData(player);
      } catch (err) {
        console.error('Error fetching Steam profile:', err);
        setError(err.message);
      }
    }
    fetchSteamProfile();
  }, []);

  return (
    <div className="app">
      <div id="steam-profile">
        {profileData ? (
          <div className="steam-profile">
            <img
              src={profileData.avatarfull}
              alt="Steam Profile"
              className="steam-avatar"
            />
            <div className="profile-info">
              <h2>{profileData.personaname}</h2>
              <p>Status: {profileData.personastate === 1 ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        ) : error ? (
          <p className="error">Error loading profile: {error}</p>
        ) : (
          <p>Loading Steam profile...</p>
        )}
      </div>
    </div>
  );
}

export default App;