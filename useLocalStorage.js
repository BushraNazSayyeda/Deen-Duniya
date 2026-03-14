import { useState, useEffect, useCallback } from 'react';

// Generic localStorage hook
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' ? newValue(prev) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch (e) {
        console.error('localStorage error:', e);
      }
      return resolved;
    });
  }, [key]);

  return [value, setStoredValue];
}

// Today's date key
export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Streak calculator
export function calculateStreak(completionHistory) {
  if (!completionHistory) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (completionHistory[key]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// Streak badge
export function getStreakBadge(streak) {
  if (streak >= 30) return '⭐';
  if (streak >= 14) return '🔥🔥🔥';
  if (streak >= 7) return '🔥🔥';
  if (streak >= 1) return '🔥';
  return '';
}

// Format time
export function formatTime(timeStr) {
  if (!timeStr) return '--:--';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

// Time until (returns {hours, minutes, totalMinutes, isPast})
export function timeUntil(timeStr) {
  if (!timeStr) return null;
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  const diff = target - now;
  if (diff < 0) return { hours: 0, minutes: 0, totalMinutes: -1, isPast: true };
  const totalMinutes = Math.floor(diff / 60000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes,
    isPast: false
  };
}

// Format countdown
export function formatCountdown(timeUntilObj) {
  if (!timeUntilObj || timeUntilObj.isPast) return null;
  const { hours, minutes } = timeUntilObj;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
