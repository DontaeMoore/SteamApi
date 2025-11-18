import React from 'react';
import './App.css';
import SteamFriendsSection from './components/SteamFriendsSection.jsx';
import DeadlockStatsSection from './components/DeadlockStatsSection.jsx';

export default function App() {
  return (
    <div className="app">
      <SteamFriendsSection />
      <DeadlockStatsSection />
    </div>
  );
}