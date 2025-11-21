import React, { useEffect, useState } from 'react';

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

export default function SteamFriendsSection() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  //New state
  const [deadlockStatus, setDeadlockStatus] = useState('N/A');

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

  useEffect(() => {
    async function fetchDeadlockStatus() {
      try {
        console.log('in fetchDeadlockStatus useEffect');
        const response = await fetch('http://localhost:3001/deadlock/status');
        if (!response.ok) throw new Error('Deadlock Status request failed');
        const health = await response.json();
        console.log('Fetched Deadlock status:', health);
        setDeadlockStatus(health);
      } catch (err) {
        console.error('Error fetching Deadlock Status:', err);
        setError(err.message);
      }
    }
    fetchDeadlockStatus();
  }, []);

  return (
    <div className="section section--full-height">
      <div className="status">
      <div className="status-deadlock">Deadlock API STATUS: <a className="statusMessage">
        {deadlockStatus ? (
          deadlockStatus.services?.clickhouse && deadlockStatus.services?.postgres && deadlockStatus.services?.redis
            ? 'Online' 
            : 'Partial'
        ) : 'N/A'}
      </a></div>
      </div>
      <div className="section__inner">
        <h1>Steam Friends</h1>
        <div id="steam-profiles">
          {profileData ? (
            <div className="profiles-container">
              {profileData.map((player) => (
                <div key={player.steamid} className="steam-profile">
                  <img
                    src={player.avatarfull}
                    alt={`${player.personaname} Steam Profile`
                    }
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
                      {player.timecreated
                        ? formatUnixDate(player.timecreated, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Private/hidden'}
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
    </div>
  );
}
