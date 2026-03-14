import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage, getTodayKey, formatTime, timeUntil, formatCountdown, calculateStreak, getStreakBadge } from '../hooks/useLocalStorage';
import { prayerVerses, prayerNames, prayerStatuses, eveningAdhkar, nightAdhkar, surahs } from '../data/constants';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

// ── Salah Section ──
function SalahTracker({ settings }) {
  const todayKey = getTodayKey();
  const { times, loading, error } = usePrayerTimes(settings);
  const [salahData, setSalahData] = useLocalStorage(`salah_${todayKey}`, {});
  const [now, setNow] = useState(new Date());
  const [showModal, setShowModal] = useState(null); // prayer name

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getNextPrayer = useCallback(() => {
    if (!times) return null;
    let nearest = null;
    let nearestMin = Infinity;
    for (const name of prayerNames) {
      const t = timeUntil(times[name]);
      if (t && !t.isPast && t.totalMinutes < nearestMin) {
        nearestMin = t.totalMinutes;
        nearest = { name, ...t };
      }
    }
    return nearest;
  }, [times, now]);

  const nextPrayer = getNextPrayer();

  const markPrayer = (name, status) => {
    setSalahData(prev => ({ ...prev, [name]: status }));
    setShowModal(null);
  };

  const allPrayed = prayerNames.every(n => salahData[n] === 'PRAYED' || salahData[n] === 'MASJID');

  return (
    <div>
      <div className="section-title">🕌 Salah</div>

      {/* Next Prayer Banner */}
      {nextPrayer && (
        <div className="card card-gold" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {nextPrayer.totalMinutes <= 30 ? '⚠️ Coming soon' : '🌙 Next Prayer'}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>
                {nextPrayer.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {times && formatTime(times[nextPrayer.name])}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: nextPrayer.totalMinutes <= 15 ? 'var(--coral)' : 'var(--gold)' }}>
                {formatCountdown(nextPrayer)}
              </div>
              {nextPrayer.totalMinutes <= 15 && (
                <div style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 600, animation: 'glow 1.5s infinite' }}>
                  🕌 Prepare for salah
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {allPrayed && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(212,175,55,0.4)', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--gold)', fontWeight: 700 }}>MashaAllah!</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All 5 prayers completed today</div>
        </div>
      )}

      {loading && <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px' }}>Fetching prayer times...</div>}
      {error && <div style={{ color: 'var(--coral)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {/* Prayer cards */}
      {prayerNames.map((name, i) => {
        const timeStr = times?.[name];
        const status = salahData[name] || 'PENDING';
        const t = timeUntil(timeStr);
        const isNext = nextPrayer?.name === name;
        const statusInfo = prayerStatuses[status];
        const verse = prayerVerses[name]?.[i % 3];

        return (
          <div
            key={name}
            className={`card ${isNext ? 'card-gold' : ''}`}
            style={{ cursor: 'pointer', borderColor: isNext ? 'rgba(212,175,55,0.4)' : undefined }}
            onClick={() => setShowModal(name)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: isNext ? 'var(--gold)' : 'var(--cream)' }}>
                    {name}
                  </div>
                  {isNext && <span className="badge badge-gold" style={{ fontSize: 10 }}>Next</span>}
                </div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-arabic)', color: 'var(--gold)', opacity: 0.7, marginTop: 2 }}>
                  {name === 'Fajr' ? 'الفجر' : name === 'Dhuhr' ? 'الظهر' : name === 'Asr' ? 'العصر' : name === 'Maghrib' ? 'المغرب' : 'العشاء'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {timeStr ? formatTime(timeStr) : '--'}
                  {t && !t.isPast && ` · in ${formatCountdown(t)}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{statusInfo.emoji}</div>
                <div style={{ fontSize: 11, color: statusInfo.color }}>{statusInfo.label}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prayer status modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(6px)'
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: 'var(--navy-3)', borderRadius: '20px 20px 0 0',
              padding: '24px 20px 32px', width: '100%', maxWidth: 480,
              border: '1px solid var(--glass-border)', animation: 'fadeInUp 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--gold)' }}>
              {showModal}
            </div>
            {times?.[showModal] && (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {formatTime(times[showModal])}
              </div>
            )}

            {/* Verse */}
            {prayerVerses[showModal]?.[0] && (
              <div style={{ background: 'var(--gold-dim)', borderRadius: 12, padding: '14px', marginBottom: 20, border: '1px solid var(--glass-border)' }}>
                <div className="arabic" style={{ fontSize: 18, color: 'var(--gold)', marginBottom: 8 }}>
                  {prayerVerses[showModal][0].arabic}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{prayerVerses[showModal][0].english}" — {prayerVerses[showModal][0].ref}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(prayerStatuses).filter(([k]) => k !== 'PENDING').map(([key, info]) => (
                <button
                  key={key}
                  className="btn"
                  style={{
                    padding: '14px',
                    background: salahData[showModal] === key ? 'rgba(212,175,55,0.2)' : 'var(--glass)',
                    borderColor: salahData[showModal] === key ? 'var(--gold)' : 'var(--glass-border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                  }}
                  onClick={() => markPrayer(showModal, key)}
                >
                  <span style={{ fontSize: 20 }}>{info.emoji}</span>
                  <span style={{ fontSize: 12, color: info.color }}>{info.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dhikr Section ──
function DhikrTracker() {
  const todayKey = getTodayKey();
  const [dhikrData, setDhikrData] = useLocalStorage(`dhikr_${todayKey}`, { evening: {}, night: {} });
  const [activeSession, setActiveSession] = useState(null); // 'evening' | 'night'
  const [dhikrHistory, setDhikrHistory] = useLocalStorage('dhikr_history', {});
  
  const markDone = (session) => {
    setDhikrHistory(prev => ({ ...prev, [getTodayKey() + '_' + session]: true }));
    setActiveSession(null);
  };

  const updateCount = (session, index, delta) => {
    setDhikrData(prev => {
      const sessionData = prev[session] || {};
      const list = session === 'evening' ? eveningAdhkar : nightAdhkar;
      const max = list[index].count;
      const cur = sessionData[index] || 0;
      return {
        ...prev,
        [session]: { ...sessionData, [index]: Math.min(max, Math.max(0, cur + delta)) }
      };
    });
  };

  const isComplete = (session) => {
    const list = session === 'evening' ? eveningAdhkar : nightAdhkar;
    return list.every((d, i) => (dhikrData[session]?.[i] || 0) >= d.count);
  };

  const streak = calculateStreak(dhikrHistory);

  return (
    <div>
      <div className="section-title">📿 Dhikr</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { session: 'evening', label: 'Evening Dhikr', time: '7:00 PM', emoji: '🌅', subtitle: "Azkar Al-Masa'" },
          { session: 'night', label: 'Night Dhikr', time: '11:00 PM', emoji: '🌙', subtitle: 'Pre-Sleep Azkar' }
        ].map(({ session, label, time, emoji, subtitle }) => (
          <div key={session} className={`card ${isComplete(session) ? 'card-emerald' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setActiveSession(session)}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: isComplete(session) ? 'var(--emerald)' : 'var(--cream)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{subtitle}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{time}</div>
            {isComplete(session) && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>✅ Done</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="streak">{getStreakBadge(streak)} {streak} day streak</span>
      </div>

      {/* Dhikr session modal */}
      {activeSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--navy-3)', borderRadius: '20px 20px 0 0', padding: '20px', width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '85vh', overflow: 'auto', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
                {activeSession === 'evening' ? '🌅 Evening Dhikr' : '🌙 Night Dhikr'}
              </div>
              <button className="btn btn-sm" onClick={() => setActiveSession(null)}>Close</button>
            </div>
            {(activeSession === 'evening' ? eveningAdhkar : nightAdhkar).map((d, i) => {
              const cur = dhikrData[activeSession]?.[i] || 0;
              const done = cur >= d.count;
              return (
                <div key={i} className={`card ${done ? 'card-emerald' : ''}`} style={{ marginBottom: 10 }}>
                  <div className="arabic" style={{ fontSize: 20, color: 'var(--gold)', marginBottom: 6 }}>{d.arabic}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontStyle: 'italic' }}>{d.transliteration}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>{d.translation}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className={`progress-fill ${done ? 'progress-emerald' : 'progress-gold'}`} style={{ width: `${Math.min(100, (cur / d.count) * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: 13, color: done ? 'var(--emerald)' : 'var(--gold)', fontWeight: 700, minWidth: 50, textAlign: 'right' }}>
                      {cur}/{d.count}
                    </div>
                    <button
                      className="btn btn-gold btn-sm"
                      disabled={done}
                      onClick={() => updateCount(activeSession, i, 1)}
                      style={{ minWidth: 44, opacity: done ? 0.5 : 1 }}
                    >
                      {done ? '✓' : '+1'}
                    </button>
                  </div>
                </div>
              );
            })}
            {isComplete(activeSession) && (
              <button className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: 15 }} onClick={() => markDone(activeSession)}>
                ✅ Alhamdulillah — Complete!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quran Tracker ──
function QuranTracker() {
  const [progress, setProgress] = useLocalStorage('quran_progress', {});
  const [todayLog, setTodayLog] = useLocalStorage(`quran_log_${getTodayKey()}`, []);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(1);
  const [mode, setMode] = useState('read'); // read | memorize | review

  const surahObj = surahs.find(s => s.number === parseInt(selectedSurah));
  const totalLearned = Object.values(progress).reduce((sum, v) => sum + (v?.memorized || 0) + (v?.read || 0), 0);

  const addEntry = () => {
    const entry = { surah: parseInt(selectedSurah), from: parseInt(fromAyah), to: parseInt(toAyah), mode, date: getTodayKey() };
    setTodayLog(prev => [...prev, entry]);
    setProgress(prev => {
      const key = `s${selectedSurah}`;
      const existing = prev[key] || { read: 0, memorized: 0 };
      const count = Math.abs(parseInt(toAyah) - parseInt(fromAyah)) + 1;
      return { ...prev, [key]: { ...existing, [mode === 'memorize' ? 'memorized' : 'read']: (existing[mode === 'memorize' ? 'memorized' : 'read'] || 0) + count } };
    });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="section-title">📖 Quran</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Ayahs Learned</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 700, color: 'var(--gold)' }}>{totalLearned}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>of 6,236</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="progress-bar" style={{ width: 100 }}>
              <div className="progress-fill progress-gold" style={{ width: `${(totalLearned / 6236) * 100}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              {((totalLearned / 6236) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {todayLog.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>Today's sessions:</div>
            {todayLog.map((log, i) => {
              const s = surahs.find(s => s.number === log.surah);
              return (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                  {s?.english} {log.from}:{log.to} · {log.mode}
                </div>
              );
            })}
          </div>
        )}

        <button className="btn btn-gold" style={{ width: '100%', marginTop: 12 }} onClick={() => setShowAdd(true)}>
          + Log Today's Learning
        </button>
      </div>

      {/* Surah grid mini */}
      <div className="card">
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Quran Map</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(19, 1fr)', gap: 2 }}>
          {surahs.map(s => {
            const p = progress[`s${s.number}`];
            const total = (p?.read || 0) + (p?.memorized || 0);
            const pct = total / s.ayahs;
            let bg = 'rgba(255,255,255,0.06)';
            if (pct >= 1) bg = 'var(--emerald)';
            else if (pct > 0) bg = 'var(--sky)';
            return (
              <div key={s.number} title={`${s.english} (${s.ayahs} ayahs)`}
                style={{ width: '100%', paddingBottom: '100%', background: bg, borderRadius: 2, cursor: 'pointer' }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          {[['rgba(255,255,255,0.06)', 'Not started'], ['var(--sky)', 'In progress'], ['var(--emerald)', 'Complete']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-dim)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
          <div style={{ background: 'var(--navy-3)', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginBottom: 16 }}>📖 Log Learning</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Surah</label>
              <select className="input" value={selectedSurah} onChange={e => { setSelectedSurah(e.target.value); setFromAyah(1); setToAyah(1); }}>
                {surahs.map(s => <option key={s.number} value={s.number}>{s.number}. {s.english} ({s.ayahs} ayahs)</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>From Ayah</label>
                <input className="input" type="number" min={1} max={surahObj?.ayahs || 286} value={fromAyah} onChange={e => setFromAyah(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>To Ayah</label>
                <input className="input" type="number" min={fromAyah} max={surahObj?.ayahs || 286} value={toAyah} onChange={e => setToAyah(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Mode</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['read', '📖 Read'], ['memorize', '🧠 Memorize'], ['review', '🔄 Review']].map(([val, label]) => (
                  <button key={val} className={`chip ${mode === val ? 'active' : ''}`} onClick={() => setMode(val)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={addEntry}>Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fast Tracker ──
function FastTracker({ prayerTimes }) {
  const todayKey = getTodayKey();
  const [fastData, setFastData] = useLocalStorage(`fast_${todayKey}`, { type: null });
  const [ramadanMode, setRamadanMode] = useLocalStorage('ramadan_mode', false);
  const [fastHistory, setFastHistory] = useLocalStorage('fast_history', {});

  const setFastType = (type) => {
    setFastData({ type });
    if (type && type !== 'none') {
      setFastHistory(prev => ({ ...prev, [todayKey]: type }));
    }
  };

  const fastTypes = [
    { key: 'fard', label: 'Fard', sub: 'Obligatory', emoji: '🌙' },
    { key: 'sunnah', label: 'Sunnah', sub: 'Mon/Thu', emoji: '☀️' },
    { key: 'nafl', label: 'Nafl', sub: 'Voluntary', emoji: '⭐' },
    { key: 'none', label: 'Not Fasting', sub: '', emoji: '🍽️' },
  ];

  const maghribTime = prayerTimes?.Maghrib;
  const fajrTime = prayerTimes?.Fajr;
  const iftarIn = maghribTime ? timeUntil(maghribTime) : null;
  const sehriUntil = fajrTime ? timeUntil(fajrTime) : null;

  return (
    <div>
      <div className="section-title">🌙 Fasting</div>
      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Ramadan Mode</span>
          <label className="toggle">
            <input type="checkbox" checked={ramadanMode} onChange={e => setRamadanMode(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>

        {ramadanMode && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: 'var(--gold-dim)', borderRadius: 10, padding: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🌙 Sehri ends</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--gold)', fontWeight: 700 }}>
                {fajrTime ? formatTime(fajrTime) : '--'}
              </div>
              {sehriUntil && !sehriUntil.isPast && (
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>in {formatCountdown(sehriUntil)}</div>
              )}
            </div>
            <div style={{ background: 'rgba(255,107,107,0.1)', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,107,107,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🌅 Iftar</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--coral)', fontWeight: 700 }}>
                {maghribTime ? formatTime(maghribTime) : '--'}
              </div>
              {iftarIn && !iftarIn.isPast && (
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>in {formatCountdown(iftarIn)}</div>
              )}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Today's fast:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {fastTypes.map(ft => (
            <button
              key={ft.key}
              className="btn"
              style={{
                padding: '12px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: fastData.type === ft.key ? 'var(--gold-dim)' : 'var(--glass)',
                borderColor: fastData.type === ft.key ? 'var(--gold)' : 'var(--glass-border)'
              }}
              onClick={() => setFastType(ft.key)}
            >
              <span style={{ fontSize: 18 }}>{ft.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: fastData.type === ft.key ? 'var(--gold)' : 'var(--text-primary)' }}>{ft.label}</span>
              {ft.sub && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{ft.sub}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Deen Page ──
export default function DeenPage({ settings }) {
  const { times } = usePrayerTimes(settings);

  return (
    <div className="page fade-in">
      <div className="page-title">🌙 Deen</div>
      <div className="page-subtitle">Your spiritual practice tracker</div>
      <SalahTracker settings={settings} />
      <DhikrTracker />
      <QuranTracker />
      <FastTracker prayerTimes={times} />
    </div>
  );
}
