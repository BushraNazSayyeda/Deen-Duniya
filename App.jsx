import React, { useState, useEffect } from 'react';
import './App.css';
import './nav.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import DeenPage from './pages/DeenPage';
import DuniyaPage from './pages/DuniyaPage';
import WellnessPage from './pages/WellnessPage';
import StatsPage from './pages/StatsPage';
import HabitsPage from './pages/HabitsPage';
import SettingsPage from './pages/SettingsPage';

const TABS = [
  { id: 'deen', label: 'Deen', icon: '🌙' },
  { id: 'duniya', label: 'Duniya', icon: '✅' },
  { id: 'wellness', label: 'Wellness', icon: '🌿' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'habits', label: 'Habits', icon: '🔁' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function getHijriDate() {
  // Simple approximation for display
  const now = new Date();
  const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];
  // Rough calculation (not precise)
  const jd = Math.floor(now.getTime() / 86400000) + 2440588;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return `${day} ${months[month - 1]} ${year}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('deen');
  const [settings, setSettings] = useLocalStorage('app_settings', {
    method: 2, school: 0, waterGoal: 2500, morningRoutine: '07:00', nightRoutine: '22:00',
    quranReminder: '08:00', ramadanMode: false, manualCity: ''
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hijriStr = getHijriDate();

  const renderPage = () => {
    switch (activeTab) {
      case 'deen': return <DeenPage settings={settings} />;
      case 'duniya': return <DuniyaPage />;
      case 'wellness': return <WellnessPage />;
      case 'stats': return <StatsPage />;
      case 'habits': return <HabitsPage />;
      case 'settings': return <SettingsPage settings={settings} setSettings={setSettings} />;
      default: return null;
    }
  };

  return (
    <div className="app">
      <div className="orb-1" />
      <div className="orb-2" />

      {/* Header */}
      <header className="app-header">
        <div className="logo">Deen & Duniya</div>
        <div className="date-display">
          <div>{dateStr}</div>
          <div className="hijri-date">{hijriStr}</div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
