import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function SettingsPage({ settings, setSettings }) {
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToday = () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    ['salah', 'dhikr', 'water', 'fast', 'skincare_morning', 'skincare_night', 'tasks_done', 'habits_done', 'health_habits_done', 'quran_log'].forEach(k => {
      localStorage.removeItem(`${k}_${todayKey}`);
    });
    showToast("✅ Today's data reset");
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try { data[key] = JSON.parse(localStorage.getItem(key)); } catch { data[key] = localStorage.getItem(key); }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deen-duniya-data.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Data exported!');
  };

  const methods = [
    { value: 1, label: 'Muslim World League' },
    { value: 2, label: 'ISNA (North America)' },
    { value: 3, label: 'Egypt General Authority' },
    { value: 4, label: 'Umm Al-Qura (Makkah)' },
    { value: 5, label: 'University of Islamic Sciences, Karachi' },
    { value: 7, label: 'Institute of Geophysics, Tehran' },
    { value: 8, label: 'Gulf Region' },
    { value: 12, label: 'Union of Islamic Organizations of France' },
  ];

  return (
    <div className="page fade-in">
      <div className="page-title">⚙️ Settings</div>
      <div className="page-subtitle">Customize your experience</div>

      {/* Location */}
      <div className="section-title">📍 Location & Prayer</div>
      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            City (leave blank to use device location)
          </label>
          <input
            className="input"
            placeholder="e.g. Gurugram, London, Dubai..."
            value={settings.manualCity || ''}
            onChange={e => update('manualCity', e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Prayer times update automatically based on your city</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Calculation Method</label>
          <select className="input" value={settings.method || 2} onChange={e => update('method', parseInt(e.target.value))}>
            {methods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Asr Calculation (Madhab)</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ v: 0, l: 'Standard (Shafi/Maliki/Hanbali)' }, { v: 1, l: 'Hanafi' }].map(({ v, l }) => (
              <button key={v} className={`chip ${settings.school === v ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '8px' }} onClick={() => update('school', v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Wellness goals */}
      <div className="section-title">🌿 Wellness</div>
      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            Daily Water Goal (ml) — currently {settings.waterGoal || 2500}ml
          </label>
          <input
            className="input" type="number" min={500} max={6000} step={250}
            value={settings.waterGoal || 2500}
            onChange={e => update('waterGoal', parseInt(e.target.value))}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Morning Routine Time</label>
            <input className="input" type="time" value={settings.morningRoutine || '07:00'} onChange={e => update('morningRoutine', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Night Routine Time</label>
            <input className="input" type="time" value={settings.nightRoutine || '22:00'} onChange={e => update('nightRoutine', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Quran */}
      <div className="section-title">📖 Quran</div>
      <div className="card">
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Daily Quran Reminder Time</label>
        <input className="input" type="time" value={settings.quranReminder || '08:00'} onChange={e => update('quranReminder', e.target.value)} />
      </div>

      {/* Ramadan */}
      <div className="section-title">🌙 Ramadan</div>
      <div className="card">
        <div className="row-between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Ramadan Mode</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Show Sehri & Iftar timings</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.ramadanMode || false} onChange={e => update('ramadanMode', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Data */}
      <div className="section-title">💾 Data</div>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-emerald" style={{ width: '100%', padding: '12px' }} onClick={exportData}>
            📥 Export All Data as JSON
          </button>
          <button className="btn" style={{ width: '100%', padding: '12px', borderColor: 'rgba(255,107,107,0.3)', color: 'var(--coral)' }} onClick={resetToday}>
            🔄 Reset Today's Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="section-title">ℹ️ About</div>
      <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 24, color: 'var(--gold)', marginBottom: 8 }}>بِسْمِ اللَّهِ</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>Deen & Duniya</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          Your complete Islamic life companion — balancing spiritual practice and worldly productivity.
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>v1.0 · Built with ❤️ & Prayer Times via AlAdhan API</div>
      </div>

      <div style={{ height: 20 }} />
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
