import React from 'react';
import './App.css';
import SteamFriendsSection from './components/SteamFriendsSection.jsx';
import DeadlockStatsSection from './components/DeadlockStatsSection.jsx';
import DumbCharts from './components/DumbCharts.jsx';

export default function App() {
  return (
    <div className="app">
      <SteamFriendsSection />
      <DeadlockStatsSection />
      <DumbCharts />
    </div>
  );
}