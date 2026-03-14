import React, { useState, useEffect } from 'react';
import { useLocalStorage, getTodayKey } from '../hooks/useLocalStorage';
import { motivationalQuotes } from '../data/constants';

const PRIORITIES = {
  P1: { label: 'P1', color: 'var(--coral)', bg: 'var(--coral-dim)', border: 'rgba(255,107,107,0.3)' },
  P2: { label: 'P2', color: 'var(--purple)', bg: 'var(--purple-dim)', border: 'rgba(167,139,250,0.3)' },
  P3: { label: 'P3', color: 'var(--sky)', bg: 'var(--sky-dim)', border: 'rgba(56,189,248,0.3)' },
  P4: { label: 'P4', color: 'var(--mint)', bg: 'var(--emerald-dim)', border: 'rgba(110,231,183,0.3)' },
};

let confettiColors = ['#D4AF37', '#10B981', '#FF6B6B', '#38BDF8', '#A78BFA', '#F0D060'];

function spawnConfetti() {
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-20px';
    el.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

function getQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

export default function DuniyaPage() {
  const todayKey = getTodayKey();
  const [tasks, setTasks] = useLocalStorage('tasks_all', []);
  const [completed, setCompleted] = useLocalStorage(`tasks_done_${todayKey}`, []);
  const [showAdd, setShowAdd] = useState(false);
  const [quote, setQuote] = useState(getQuote());
  const [toast, setToast] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('P2');
  const [duration, setDuration] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const addTask = () => {
    if (!name.trim()) return;
    const task = {
      id: Date.now().toString(),
      name: name.trim(),
      desc: desc.trim(),
      priority,
      duration: duration || null,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    setName(''); setDesc(''); setPriority('P2'); setDuration('');
    setShowAdd(false);
    showToast('✨ Task added!');
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setCompleted(prev => [...prev, { ...task, completedAt: new Date().toISOString() }]);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    spawnConfetti();
    setQuote(getQuote());
    showToast('✅ Task completed!');
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('🗑️ Task removed');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const order = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return order[a.priority] - order[b.priority];
  });

  const topTask = sortedTasks[0];

  return (
    <div className="page fade-in">
      <div className="page-title">✅ Duniya</div>
      <div className="page-subtitle">Tasks & productivity</div>

      {/* Focus Banner */}
      {topTask && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(56,189,248,0.06))',
          border: `1px solid ${PRIORITIES[topTask.priority].border}`,
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ⚡ Active Focus
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>
            {topTask.name}
          </div>
          {topTask.desc && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{topTask.desc}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className={`badge badge-${topTask.priority.toLowerCase()}`}>{topTask.priority}</span>
            {topTask.duration && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>~{topTask.duration} min</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>
            "{quote.text}" <span style={{ color: 'var(--text-dim)', fontStyle: 'normal' }}>— {quote.source}</span>
          </div>
          <button className="btn btn-emerald" style={{ width: '100%', padding: '12px' }} onClick={() => completeTask(topTask.id)}>
            ✅ Mark as Done
          </button>
        </div>
      )}

      {/* Add task button */}
      <button className="btn btn-gold" style={{ width: '100%', marginBottom: 16, padding: '13px' }} onClick={() => setShowAdd(true)}>
        + Add New Task
      </button>

      {/* Task queue */}
      {sortedTasks.length > 0 ? (
        <div>
          <div className="section-title">📋 Task Queue ({sortedTasks.length})</div>
          {sortedTasks.map((task, i) => (
            <div key={task.id} className="card fade-in" style={{
              borderColor: PRIORITIES[task.priority].border,
              animationDelay: `${i * 0.05}s`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <button
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${PRIORITIES[task.priority].color}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}
                  onClick={() => completeTask(task.id)}
                  title="Mark done"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--cream)', marginBottom: 2 }}>{task.name}</div>
                  {task.desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{task.desc}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    {task.duration && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>⏱ {task.duration}m</span>}
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
                  onClick={() => deleteTask(task.id)}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="emoji">🎯</span>
          No tasks! Add something to focus on.
        </div>
      )}

      {/* Done today */}
      {completed.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="section-title">✅ Done Today ({completed.length})</div>
          {completed.map(task => (
            <div key={task.id} className="card" style={{ opacity: 0.5, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--emerald)', fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 14, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.name}</span>
                <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ marginLeft: 'auto' }}>{task.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add task modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--navy-3)', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginBottom: 18 }}>+ New Task</div>

            <div style={{ marginBottom: 12 }}>
              <input className="input" placeholder="Task name *" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea className="input" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Priority</label>
                <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                  {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p} — {p === 'P1' ? 'Critical' : p === 'P2' ? 'High' : p === 'P3' ? 'Medium' : 'Low'}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Duration (min)</label>
                <input className="input" type="number" placeholder="e.g. 30" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={addTask} disabled={!name.trim()}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
