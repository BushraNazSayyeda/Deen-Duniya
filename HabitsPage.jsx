import React, { useState } from 'react';
import { useLocalStorage, getTodayKey, calculateStreak, getStreakBadge } from '../hooks/useLocalStorage';

const DEFAULT_HABITS = [
  { id: 'h_fajr', name: 'Fajr Prayer', emoji: '🌅', category: 'Deen', time: '05:30', frequency: 'daily' },
  { id: 'h_dhikr', name: 'Evening Dhikr', emoji: '📿', category: 'Deen', time: '19:00', frequency: 'daily' },
  { id: 'h_quran', name: 'Quran Reading', emoji: '📖', category: 'Deen', time: '08:00', frequency: 'daily' },
  { id: 'h_water', name: 'Water Goal (2.5L)', emoji: '💧', category: 'Wellness', time: null, frequency: 'daily' },
  { id: 'h_skincare', name: 'Morning Skincare', emoji: '✨', category: 'Wellness', time: '07:00', frequency: 'daily' },
  { id: 'h_nskincare', name: 'Night Skincare', emoji: '🌙', category: 'Wellness', time: '22:00', frequency: 'daily' },
];

const CATEGORIES = ['All', 'Deen', 'Wellness', 'Productivity'];

export default function HabitsPage() {
  const [customHabits, setCustomHabits] = useLocalStorage('custom_habits', []);
  const todayKey = getTodayKey();
  const [habitsDone, setHabitsDone] = useLocalStorage(`habits_done_${todayKey}`, []);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const [newHabit, setNewHabit] = useState({
    name: '', emoji: '⭐', category: 'Productivity', time: '09:00', frequency: 'daily'
  });

  const allHabits = [...DEFAULT_HABITS, ...customHabits];
  const filtered = filter === 'All' ? allHabits : allHabits.filter(h => h.category === filter);

  const toggle = (id) => {
    setHabitsDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    setCustomHabits(prev => [...prev, { ...newHabit, id: `ch_${Date.now()}` }]);
    setNewHabit({ name: '', emoji: '⭐', category: 'Productivity', time: '09:00', frequency: 'daily' });
    setShowAdd(false);
  };

  const removeHabit = (id) => {
    setCustomHabits(prev => prev.filter(h => h.id !== id));
  };

  const doneCount = allHabits.filter(h => habitsDone.includes(h.id)).length;
  const pct = Math.round((doneCount / allHabits.length) * 100);

  const emojis = ['⭐', '🏃', '📚', '🧘', '💪', '🎯', '💡', '🎨', '🎵', '✍️', '🌱', '🔬', '💻', '🤝'];
  const catColors = { Deen: 'var(--gold)', Wellness: 'var(--emerald)', Productivity: 'var(--sky)' };

  return (
    <div className="page fade-in">
      <div className="page-title">🔁 All Habits</div>
      <div className="page-subtitle">Your complete habit tracker</div>

      {/* Progress summary */}
      <div className="card card-gold" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>
              {doneCount}/{allHabits.length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>habits completed today</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: pct >= 80 ? 'var(--emerald)' : 'var(--gold)' }}>{pct}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>completion rate</div>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 10 }}>
          <div className={`progress-fill ${pct >= 100 ? 'progress-emerald' : 'progress-gold'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Category filter */}
      <div className="chips-row">
        {CATEGORIES.map(c => (
          <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Habit list */}
      {filtered.map((habit, i) => {
        const done = habitsDone.includes(habit.id);
        const isCustom = habit.id.startsWith('ch_');
        const catColor = catColors[habit.category] || 'var(--text-secondary)';

        return (
          <div
            key={habit.id}
            className="card fade-in"
            style={{ animationDelay: `${i * 0.04}s`, cursor: 'pointer' }}
            onClick={() => toggle(habit.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, filter: done ? 'grayscale(0.5)' : 'none' }}>{habit.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: done ? 'var(--text-dim)' : 'var(--cream)', textDecoration: done ? 'line-through' : 'none' }}>
                    {habit.name}
                  </span>
                  <span style={{ fontSize: 10, color: catColor, fontWeight: 600, letterSpacing: '0.06em' }}>{habit.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  {habit.time && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>⏰ {habit.time}</span>}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{habit.frequency}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isCustom && (
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                    onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }}
                  >×</button>
                )}
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: done ? 'var(--emerald)' : 'transparent',
                  border: `2px solid ${done ? 'var(--emerald)' : 'rgba(255,255,255,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'var(--transition)'
                }}>
                  {done && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add habit */}
      {showAdd ? (
        <div className="card">
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: 'var(--gold)', marginBottom: 14 }}>+ New Habit</div>
          <input className="input" placeholder="Habit name *" value={newHabit.name} onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 10 }} />

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Emoji</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {emojis.map(e => (
                <button key={e} style={{ fontSize: 20, background: newHabit.emoji === e ? 'var(--gold-dim)' : 'transparent', border: newHabit.emoji === e ? '1px solid var(--gold)' : '1px solid transparent', borderRadius: 6, padding: '3px 7px', cursor: 'pointer' }} onClick={() => setNewHabit(p => ({ ...p, emoji: e }))}>{e}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Category</label>
              <select className="input" value={newHabit.category} onChange={e => setNewHabit(p => ({ ...p, category: e.target.value }))}>
                <option>Deen</option>
                <option>Wellness</option>
                <option>Productivity</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Time</label>
              <input className="input" type="time" value={newHabit.time} onChange={e => setNewHabit(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-gold" style={{ flex: 2 }} onClick={addHabit} disabled={!newHabit.name.trim()}>Add Habit</button>
          </div>
        </div>
      ) : (
        <button className="btn" style={{ width: '100%', marginTop: 4 }} onClick={() => setShowAdd(true)}>
          + Add Custom Habit
        </button>
      )}
    </div>
  );
}
