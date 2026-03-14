import React from 'react';
import { useLocalStorage, getTodayKey, calculateStreak } from '../hooks/useLocalStorage';
import { prayerNames } from '../data/constants';

function MiniDonut({ pct, color, size = 80, strokeWidth = 8 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

function StatCard({ label, value, sub, color = 'var(--gold)', pct }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      {pct !== undefined ? (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <MiniDonut pct={pct} color={color} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color }}>
            {Math.round(pct)}%
          </div>
        </div>
      ) : (
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      )}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ values, colors, labels }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: '100%', height: `${(v / max) * 48}px`, background: colors?.[i] || 'var(--gold)', borderRadius: '3px 3px 0 0', minHeight: v > 0 ? 3 : 0, transition: 'height 0.6s ease' }} />
          {labels && <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const todayKey = getTodayKey();

  // Collect stats from localStorage
  const salahData = JSON.parse(localStorage.getItem(`salah_${todayKey}`) || '{}');
  const prayedCount = prayerNames.filter(n => salahData[n] === 'PRAYED' || salahData[n] === 'MASJID').length;
  const salahPct = (prayedCount / 5) * 100;

  const waterGoal = JSON.parse(localStorage.getItem('water_goal') || '2500');
  const water = JSON.parse(localStorage.getItem(`water_${todayKey}`) || '0');
  const waterPct = Math.min(100, (water / waterGoal) * 100);

  const tasks = JSON.parse(localStorage.getItem('tasks_all') || '[]');
  const doneTasks = JSON.parse(localStorage.getItem(`tasks_done_${todayKey}`) || '[]');
  const taskTotal = tasks.length + doneTasks.length;
  const taskPct = taskTotal > 0 ? (doneTasks.length / taskTotal) * 100 : 0;

  const morningDone = JSON.parse(localStorage.getItem(`skincare_morning_${todayKey}`) || '[]');
  const nightDone = JSON.parse(localStorage.getItem(`skincare_night_${todayKey}`) || '[]');
  const skincarePct = ((morningDone.length / 5) + (nightDone.length / 7)) / 2 * 100;

  const quranProgress = JSON.parse(localStorage.getItem('quran_progress') || '{}');
  const totalLearned = Object.values(quranProgress).reduce((sum, v) => sum + (v?.memorized || 0) + (v?.read || 0), 0);

  const dhikrHistory = JSON.parse(localStorage.getItem('dhikr_history') || '{}');
  const dhikrStreak = calculateStreak(dhikrHistory);

  const waterHistory = JSON.parse(localStorage.getItem('water_history') || '{}');
  const waterStreak = calculateStreak(waterHistory);

  // Score calculations
  const deenScore = Math.round((salahPct * 0.5) + (dhikrStreak > 0 ? 25 : 0) + Math.min(25, totalLearned * 0.5));
  const duniyaScore = Math.round(taskPct);
  const wellnessScore = Math.round((waterPct * 0.5) + (skincarePct * 0.5));
  const overallScore = Math.round((deenScore + duniyaScore + wellnessScore) / 3);

  // Last 7 days prayer completion (approximate)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem(`salah_${key}`) || '{}');
    return prayerNames.filter(n => data[n] === 'PRAYED' || data[n] === 'MASJID').length;
  });

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].slice();
  const today = new Date().getDay();
  const orderedLabels = Array.from({ length: 7 }, (_, i) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][(today - 6 + i + 7) % 7]);

  const getScoreMessage = () => {
    if (deenScore >= 80 && overallScore >= 70) return "You're living your best Deen & Duniya life 🌟";
    if (deenScore >= 80) return "MashaAllah! Your Deen is strong this week 🌙";
    if (deenScore < 40) return "Your salah is your anchor — let's bring it back 🤲";
    if (overallScore >= 60) return "Great progress! Keep going strong 💪";
    return "Every small step counts. Bismillah, let's go! 🌿";
  };

  return (
    <div className="page fade-in">
      <div className="page-title">📊 Statistics</div>
      <div className="page-subtitle">Your life at a glance</div>

      {/* Overall score */}
      <div className="card card-gold" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          {[
            { label: 'Deen', score: deenScore, color: 'var(--gold)' },
            { label: 'Overall', score: overallScore, color: 'var(--sky)', size: 100, strokeWidth: 10 },
            { label: 'Wellness', score: wellnessScore, color: 'var(--emerald)' },
          ].map(({ label, score, color, size = 70, strokeWidth = 7 }) => (
            <div key={label} style={{ position: 'relative' }}>
              <MiniDonut pct={score} color={color} size={size} strokeWidth={strokeWidth} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: size > 80 ? 22 : 16, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--cream)', lineHeight: 1.5 }}>
          {getScoreMessage()}
        </div>
      </div>

      {/* Deen stats */}
      <div className="section-title">🌙 Deen</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <StatCard label="Today's Prayers" value={`${prayedCount}/5`} pct={salahPct} color="var(--gold)" />
        <StatCard label="Dhikr Streak" value={`${dhikrStreak}d`} sub={dhikrStreak > 0 ? '🔥 Keep it up' : 'Start tonight!'} color="var(--purple)" />
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Salah — Last 7 Days</div>
        <MiniBar values={last7Days} colors={last7Days.map(v => v === 5 ? 'var(--emerald)' : v >= 3 ? 'var(--gold)' : v > 0 ? 'var(--sky)' : 'rgba(255,255,255,0.1)')} labels={orderedLabels} />
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>Prayers completed per day (out of 5)</div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quran Learned</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>{totalLearned}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>ayahs of 6,236</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
            <MiniDonut pct={(totalLearned / 6236) * 100} color="var(--gold)" size={64} strokeWidth={6} />
          </div>
        </div>
      </div>

      {/* Duniya stats */}
      <div className="section-title">✅ Duniya</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <StatCard label="Task Completion" pct={taskPct} color="var(--sky)" />
        <StatCard label="Done Today" value={doneTasks.length} sub={`of ${taskTotal} tasks`} color="var(--emerald)" />
      </div>
      {doneTasks.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Priority breakdown today</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['P1', 'P2', 'P3', 'P4'].map(p => {
              const count = doneTasks.filter(t => t.priority === p).length;
              if (!count) return null;
              return (
                <span key={p} className={`badge badge-${p.toLowerCase()}`}>{p}: {count}</span>
              );
            })}
          </div>
        </div>
      )}

      {/* Wellness stats */}
      <div className="section-title">🌿 Wellness</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <StatCard label="Hydration" pct={waterPct} color="var(--sky)" />
        <StatCard label="Water Streak" value={`${waterStreak}d`} sub={waterPct >= 100 ? '✅ Goal hit!' : `${Math.round(water/1000*10)/10}L today`} color="var(--sky)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatCard label="Morning Skincare" pct={(morningDone.length / 5) * 100} color="var(--purple)" />
        <StatCard label="Night Skincare" pct={(nightDone.length / 7) * 100} color="var(--purple)" />
      </div>
    </div>
  );
}
