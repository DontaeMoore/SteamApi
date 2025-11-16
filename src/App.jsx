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
  // Deadlock hero stats state
  const [heroStats, setHeroStats] = useState(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState(null);
  // Deadlock heroes metadata (id -> name)
  const [heroMap, setHeroMap] = useState({});
  const [heroMapLoading, setHeroMapLoading] = useState(false);
  const [heroMapError, setHeroMapError] = useState(null);

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

  // Fetch Deadlock heroes metadata (id/name) once on mount
  useEffect(() => {
    async function fetchHeroes() {
      try {
        setHeroMapLoading(true);
        setHeroMapError(null);
        const resp = await fetch('http://localhost:3001/api/deadlock/heroes');
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch heroes');
        console.log('Deadlock heroes:', data);
        // Build robust id -> name map, accommodating different field names
        const map = {};
        const list = Array.isArray(data) ? data : (Array.isArray(data?.heroes) ? data.heroes : []);
        for (const h of list) {
          const id = h?.id ?? h?.hero_id ?? h?.heroId;
          const name = h?.name ?? h?.displayName ?? h?.localized_name ?? (id != null ? `Hero ${id}` : undefined);
          if (id != null) map[String(id)] = name || `Hero ${id}`;
        }
        setHeroMap(map);
      } catch (e) {
        console.error('Error fetching Deadlock heroes:', e);
        setHeroMapError(e.message);
      } finally {
        setHeroMapLoading(false);
      }
    }
    fetchHeroes();
  }, []);

  // Fetch Deadlock hero stats for your account once on mount
  useEffect(() => {
    async function fetchHeroStats() {
      try {
        setHeroLoading(true);
        setHeroError(null);
        // Use backend env (DEADLOCK_ACCOUNT_ID or derived from STEAM_ID)
        const resp = await fetch('http://localhost:3001/api/deadlock/hero-stats');
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch hero stats');
        console.log('Deadlock hero stats:', data);
        setHeroStats(data);
      } catch (e) {
        console.error('Error fetching Deadlock hero stats:', e);
        setHeroError(e.message);
      } finally {
        setHeroLoading(false);
      }
    }
    fetchHeroStats();
  }, []);

  // Derived helpers for sorting/rendering hero stats
  const getMatches = (e) => (e?.matches_played ?? e?.matches ?? 0);
  const sortedHeroStats = Array.isArray(heroStats)
    ? [...heroStats].sort((a, b) => getMatches(b) - getMatches(a))
    : null;

  return (
    <div className="app">
      <div className="section section--full-height">
        <div className="section__inner">
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
      </div>
      <div className="section section--full-height">
        <div className="section__inner">
          <h1>Deadlock Stats.</h1>
          <h2>LoGic Hero Stats</h2>
          {heroError ? (
            <p className="error">{heroError}</p>
          ) : heroLoading ? (
            <p>Loading hero stats...</p>
          ) : heroStats ? (
            <div>
              {/* Many APIs return an array; if this returns an object, adjust accordingly */}
              {Array.isArray(heroStats) ? (
                <>
                  <p>Total heroes in response: {heroStats.length}</p>
                  <ul style={{ textAlign: 'left', maxHeight: 240, overflow: 'auto', margin: '0 auto' }}>
                    {sortedHeroStats.map((entry, i) => (
                      <li key={entry.hero_id ?? i}>
                        {/* Try common fields; fallback to JSON preview */}
                        {entry.hero_id !== undefined ? (
                          <>
                            <strong>{heroMap[String(entry.hero_id)] || 'Hero'}</strong>{' '}
                            {(entry.matches_played !== undefined || entry.matches !== undefined) && (
                              <span> — matches: {getMatches(entry)}</span>
                            )}
                            {entry.wins !== undefined && (
                              <span> — wins: {entry.wins}</span>
                            )}
                          </>
                        ) : (
                          <code>{JSON.stringify(entry)}</code>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <pre style={{ textAlign: 'left' }}>{JSON.stringify(heroStats, null, 2)}</pre>
              )}
            </div>
          ) : (
            <p>No hero stats found.</p>
          )}
          {heroMapError && <p className="error">Heroes metadata: {heroMapError}</p>}
          {heroMapLoading && <p>Loading heroes metadata…</p>}
          </div>
        </div>






      
    </div>
  );
}

export default App;