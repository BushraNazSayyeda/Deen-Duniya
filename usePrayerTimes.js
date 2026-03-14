import { useState, useEffect, useCallback } from 'react';
import { getTodayKey } from './useLocalStorage';

const STORAGE_KEY = 'prayerTimes_cache';

export function usePrayerTimes(settings) {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const fetchTimes = useCallback(async (lat, lng, method = 2, school = 0) => {
    setLoading(true);
    setError(null);
    try {
      const today = getTodayKey();
      const cacheKey = `${STORAGE_KEY}_${today}_${lat}_${lng}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTimes(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
      );
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        const result = {
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
          Sunrise: t.Sunrise,
          fetchedAt: new Date().toISOString(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(result));
        setTimes(result);
      } else {
        throw new Error('API error');
      }
    } catch (e) {
      setError('Could not fetch prayer times. Using estimates.');
      // Fallback times
      setTimes({
        Fajr: '05:00', Dhuhr: '12:30', Asr: '15:45',
        Maghrib: '18:30', Isha: '20:00', Sunrise: '06:15'
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check for manual city override
    const manualCity = settings?.manualCity;
    if (manualCity) {
      // Use geocoding fallback with hardcoded cities
      const cityCoords = getCityCoords(manualCity);
      if (cityCoords) {
        setLocation(cityCoords);
        fetchTimes(cityCoords.lat, cityCoords.lng, settings?.method || 2, settings?.school || 0);
        return;
      }
    }

    // Try geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          fetchTimes(loc.lat, loc.lng, settings?.method || 2, settings?.school || 0);
        },
        () => {
          // Default to Mecca if denied
          setLocation({ lat: 21.3891, lng: 39.8579 });
          fetchTimes(21.3891, 39.8579, settings?.method || 2, settings?.school || 0);
        },
        { timeout: 5000 }
      );
    } else {
      fetchTimes(21.3891, 39.8579, settings?.method || 2, settings?.school || 0);
    }
  }, [fetchTimes, settings?.method, settings?.school, settings?.manualCity]);

  return { times, loading, error, location, refetch: fetchTimes };
}

function getCityCoords(city) {
  const cities = {
    'mecca': { lat: 21.3891, lng: 39.8579 },
    'medina': { lat: 24.4672, lng: 39.6151 },
    'cairo': { lat: 30.0444, lng: 31.2357 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'karachi': { lat: 24.8607, lng: 67.0011 },
    'lahore': { lat: 31.5497, lng: 74.3436 },
    'islamabad': { lat: 33.6844, lng: 73.0479 },
    'dhaka': { lat: 23.8103, lng: 90.4125 },
    'istanbul': { lat: 41.0082, lng: 28.9784 },
    'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'riyadh': { lat: 24.7136, lng: 46.6753 },
    'toronto': { lat: 43.6532, lng: -79.3832 },
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'gurugram': { lat: 28.4595, lng: 77.0266 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
  };
  const lower = city.toLowerCase();
  return cities[lower] || null;
}
