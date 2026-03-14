import React, { useState } from 'react';
import { useLocalStorage, getTodayKey, calculateStreak, getStreakBadge } from '../hooks/useLocalStorage';

const MORNING_STEPS = ['Cleanser', 'Toner', 'Vitamin C Serum', 'Moisturizer', 'SPF Sunscreen'];
const NIGHT_STEPS = ['Makeup Removal / Micellar Water', 'Oil Cleanser', 'Water-Based Cleanser', 'Toner', 'Treatment (Retinol/Niacinamide)', 'Moisturizer / Night Cream', 'Eye Cream'];

function WaterTracker() {
  const todayKey = getTodayKey();
  const [waterGoal] = useLocalStorage('water_goal', 2500);
  const [water, setWater] = useLocalStorage(`water_${todayKey}`, 0);
  const [waterHistory, setWaterHistory] = useLocalStorage('water_history', {});
  const [customAmount, setCustomAmount] = useState('');

  const add = (ml) => {
    setWater(prev => {
      const next = Math.min(prev + ml, waterGoal * 1.5);
      if (next >= waterGoal) {
        setWaterHistory(h => ({ ...h, [todayKey]: true }));
      }
      return next;
    });
  };

  const pct = Math.min(100, (water / waterGoal) * 100);
  const streak = calculateStreak(waterHistory);

  // Color gradient based on progress
  const waterColor = pct < 33 ? '#7dd3fc' : pct < 66 ? '#38BDF8' : '#0ea5e9';

  return (
    <div>
      <div className="section-title">💧 Water Tracker</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
          {/* Water bottle visualization */}
          <div style={{ position: 'relative', width: 60, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 60 100" style={{ width: '100%', height: '100%' }}>
              {/* Bottle outline */}
              <path d="M20,10 L20,6 Q20,2 24,2 L36,2 Q40,2 40,6 L40,10 Q48,14 48,20 L48,88 Q48,96 40,96 L20,96 Q12,96 12,88 L12,20 Q12,14 20,10 Z"
                fill="rgba(255,255,255,0.04)" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" />
              {/* Water fill */}
              <clipPath id="bottleClip">
                <path d="M20,10 L20,6 Q20,2 24,2 L36,2 Q40,2 40,6 L40,10 Q48,14 48,20 L48,88 Q48,96 40,96 L20,96 Q12,96 12,88 L12,20 Q12,14 20,10 Z" />
              </clipPath>
              <rect x="12" y={96 - (pct * 0.76)} width="36" height={pct * 0.76} fill={waterColor} clipPath="url(#bottleClip)" opacity="0.7" style={{ transition: 'all 0.6s ease' }} />
              {/* Percentage text */}
              <text x="30" y="56" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{Math.round(pct)}%</text>
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'var(--sky)' }}>
              {water >= 1000 ? `${(water / 1000).toFixed(1)}L` : `${water}ml`}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              of {waterGoal >= 1000 ? `${waterGoal / 1000}L` : `${waterGoal}ml`} goal
            </div>
            {pct >= 100 && (
              <div style={{ fontSize: 12, color: 'var(--emerald)', fontWeight: 600, marginTop: 4 }}>
                💧 Goal achieved! Well hydrated.
              </div>
            )}
            <div className="streak" style={{ marginTop: 8 }}>
              {getStreakBadge(streak)} {streak} day streak
            </div>
          </div>
        </div>

        {/* Quick add buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {[250, 500, 750, 1000].map(ml => (
            <button key={ml} className="btn btn-sm" style={{ flex: 1, minWidth: 60, background: 'var(--sky-dim)', borderColor: 'rgba(56,189,248,0.3)', color: 'var(--sky)' }} onClick={() => add(ml)}>
              +{ml >= 1000 ? '1L' : `${ml}ml`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="number" placeholder="Custom ml" value={customAmount} onChange={e => setCustomAmount(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-sm" style={{ background: 'var(--sky-dim)', borderColor: 'rgba(56,189,248,0.3)', color: 'var(--sky)' }} onClick={() => { if (customAmount) { add(parseInt(customAmount)); setCustomAmount(''); } }}>Add</button>
        </div>

        {water > 0 && (
          <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', marginTop: 8 }} onClick={() => setWater(0)}>Reset</button>
        )}
      </div>
    </div>
  );
}

function SkincareRoutine({ type }) {
  const todayKey = getTodayKey();
  const steps = type === 'morning' ? MORNING_STEPS : NIGHT_STEPS;
  const [done, setDone] = useLocalStorage(`skincare_${type}_${todayKey}`, []);
  const [history, setHistory] = useLocalStorage(`skincare_${type}_history`, {});

  const toggle = (i) => {
    setDone(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      if (next.length === steps.length) {
        setHistory(h => ({ ...h, [todayKey]: true }));
      }
      return next;
    });
  };

  const streak = calculateStreak(history);
  const pct = Math.round((done.length / steps.length) * 100);

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)' }}>
            {type === 'morning' ? '🌅 Morning Routine' : '🌙 Night Routine'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {done.length}/{steps.length} steps · {pct}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="streak">{getStreakBadge(streak)} {streak}d</div>
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 12 }}>
        <div className={`progress-fill ${pct === 100 ? 'progress-emerald' : 'progress-gold'}`} style={{ width: `${pct}%` }} />
      </div>

      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            cursor: 'pointer', transition: 'var(--transition)'
          }}
          onClick={() => toggle(i)}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: done.includes(i) ? 'var(--emerald)' : 'transparent',
            border: `2px solid ${done.includes(i) ? 'var(--emerald)' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)', flexShrink: 0
          }}>
            {done.includes(i) && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{
            fontSize: 13, color: done.includes(i) ? 'var(--text-dim)' : 'var(--text-primary)',
            textDecoration: done.includes(i) ? 'line-through' : 'none',
            transition: 'var(--transition)'
          }}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

function HealthHabits() {
  const [habits, setHabits] = useLocalStorage('health_habits', []);
  const todayKey = getTodayKey();
  const [habitsData, setHabitsData] = useLocalStorage(`health_habits_done_${todayKey}`, []);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '💊', time: '08:00' });

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    setHabits(prev => [...prev, { ...newHabit, id: Date.now().toString() }]);
    setNewHabit({ name: '', emoji: '💊', time: '08:00' });
    setShowAdd(false);
  };

  const toggle = (id) => {
    setHabitsData(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const emojis = ['💊', '🏃', '🧘', '😴', '🥗', '🏋️', '🚶', '🧴', '🫁', '❤️'];

  return (
    <div>
      <div className="section-title">🌿 Health Habits</div>
      {habits.map(h => (
        <div key={h.id} className="card" style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => toggle(h.id)}>
          <span style={{ fontSize: 22 }}>{h.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: habitsData.includes(h.id) ? 'var(--text-dim)' : 'var(--cream)', textDecoration: habitsData.includes(h.id) ? 'line-through' : 'none' }}>{h.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{h.time}</div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: habitsData.includes(h.id) ? 'var(--emerald)' : 'transparent',
            border: `2px solid ${habitsData.includes(h.id) ? 'var(--emerald)' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {habitsData.includes(h.id) && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
          </div>
        </div>
      ))}

      {showAdd ? (
        <div className="card">
          <div style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Habit name" value={newHabit.name} onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {emojis.map(e => (
                <button key={e} style={{ fontSize: 20, background: newHabit.emoji === e ? 'var(--gold-dim)' : 'transparent', border: newHabit.emoji === e ? '1px solid var(--gold)' : '1px solid transparent', borderRadius: 6, padding: '2px 6px', cursor: 'pointer' }} onClick={() => setNewHabit(p => ({ ...p, emoji: e }))}>{e}</button>
              ))}
            </div>
            <input className="input" type="time" value={newHabit.time} onChange={e => setNewHabit(p => ({ ...p, time: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-gold" style={{ flex: 2 }} onClick={addHabit}>Add Habit</button>
          </div>
        </div>
      ) : (
        <button className="btn" style={{ width: '100%' }} onClick={() => setShowAdd(true)}>+ Add Health Habit</button>
      )}
    </div>
  );
}

export default function WellnessPage() {
  return (
    <div className="page fade-in">
      <div className="page-title">🌿 Wellness</div>
      <div className="page-subtitle">Water, skincare & health habits</div>
      <WaterTracker />
      <div style={{ marginTop: 8 }}>
        <div className="section-title">✨ Skincare</div>
        <SkincareRoutine type="morning" />
        <SkincareRoutine type="night" />
      </div>
      <HealthHabits />
    </div>
  );
}
