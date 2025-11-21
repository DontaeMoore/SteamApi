import React, { useEffect, useState } from 'react';

export default function DeadlockStatsSection() {
  const [heroStats, setHeroStats] = useState(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState(null);

  const [heroMap, setHeroMap] = useState({});
  const [heroMapLoading, setHeroMapLoading] = useState(false);
  const [heroMapError, setHeroMapError] = useState(null);

  // Fetch heroes metadata (id -> name)
  useEffect(() => {
    async function fetchHeroes() {
      try {
        setHeroMapLoading(true);
        setHeroMapError(null);
        const resp = await fetch('http://localhost:3001/api/deadlock/heroes');
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch heroes');
        console.log('Deadlock heroes:', data);
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

  // Fetch hero stats for your account (account resolved in backend)
  useEffect(() => {
    async function fetchHeroStats() {
      try {
        setHeroLoading(true);
        setHeroError(null);
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

  // Sorting + grouping helpers (use matches_played only)
  const getMatches = (e) => (e?.matches_played ?? 0);

  // Friendly account labels (update if needed)
  const ACCOUNT_NAMES = {
    '133440116': 'LoGic',
    '222305299': 'Pie',
    '111338096': 'uomeakill',
  };
  const ORDER = ['133440116', '222305299', '111338096'];

  const grouped = React.useMemo(() => {
    if (!Array.isArray(heroStats)) return null;
    const acc = {};
    for (const row of heroStats) {
      const id = String(row.account_id ?? 'unknown');
      (acc[id] = acc[id] || []).push(row);
    }
    // sort each group by matches desc
    for (const id of Object.keys(acc)) {
      acc[id].sort((a, b) => getMatches(b) - getMatches(a));
    }
    return acc;
  }, [heroStats]);

  return (
    <div className="section section--full-height">
      <div className="section__inner">
        <h1>Deadlock Stats.</h1>
        <h2>Hero Stats by Account</h2>
        {heroError ? (
          <p className="error">{heroError}</p>
        ) : heroLoading ? (
          <p>Loading hero stats...</p>
        ) : heroStats ? (
          <div>
            {Array.isArray(heroStats) && grouped ? (
              <>
                <p>Total rows: {heroStats.length}</p>
                <div className="stats-container">
                  {[
                    ...ORDER.filter((id) => grouped[id]),
                    ...Object.keys(grouped).filter((id) => !ORDER.includes(id)),
                  ].map((accountId) => (
                    <div key={accountId} className="statsProfile">
                      <h3>
                        {ACCOUNT_NAMES[accountId] || accountId} {' '}
                        {grouped[accountId].length} Unique Heroes
                        
                      </h3>

                      <div style={{ textAlign: 'center', overflow: 'auto', margin: 0 }}>
                        {grouped[accountId].map((entry, i) => (
                          <li key={`${accountId}-${entry.hero_id ?? i}`}>
                            {entry.hero_id !== undefined ? (
                              <>
                                <strong>{heroMap[String(entry.hero_id)] || 'Hero'}</strong>{' '}
                                {entry.matches_played != null && (
                                  <span> — games: {entry.matches_played}</span>
                                )}
                                {entry.wins !== undefined && (
                                  <span> — wins: {entry.wins}</span>
                                )}
                                {entry.matches_played !== undefined && entry.wins !== undefined && (
                                  <span> — wr: {((entry.wins / entry.matches_played) * 100).toFixed(0)}%</span>
                                )}
                              </>
                            ) : (
                              <code>{JSON.stringify(entry)}</code>
                            )}
                          </li>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
  );
}
