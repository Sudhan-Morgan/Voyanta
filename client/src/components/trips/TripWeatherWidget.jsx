import React, { useState, useEffect } from 'react';
import { weatherService } from '../../services/weatherService';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud,
  Wind,
  Droplets,
  Umbrella,
  Sparkles,
  Calendar,
  MapPin,
  Compass,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

const WEATHER_ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  cloud: Cloud
};

const WEATHER_COLORS = {
  sun: {
    bg: 'from-amber-500/10 to-orange-500/10 border-amber-200/80',
    iconBg: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  'cloud-sun': {
    bg: 'from-blue-500/10 to-amber-500/10 border-blue-200/80',
    iconBg: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  'cloud-rain': {
    bg: 'from-sky-500/10 to-indigo-500/10 border-sky-200/80',
    iconBg: 'bg-sky-100 text-sky-600',
    badge: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  'cloud-lightning': {
    bg: 'from-purple-500/10 to-indigo-500/10 border-purple-200/80',
    iconBg: 'bg-purple-100 text-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  cloud: {
    bg: 'from-slate-500/10 to-slate-600/10 border-slate-200/80',
    iconBg: 'bg-slate-100 text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export default function TripWeatherWidget({ tripId, destination, startDate, endDate }) {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await weatherService.getTripWeather(tripId);
        if (isMounted && res.success && res.data) {
          setWeatherData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Weather fetch warning:', err);
          setError('Weather forecast unavailable at the moment');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (tripId) {
      fetchWeather();
    }
    return () => {
      isMounted = false;
    };
  }, [tripId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weatherData || !weatherData.dailyForecast || weatherData.dailyForecast.length === 0) {
    return null;
  }

  const { dailyForecast, avgTemp, rainyDaysCount, bestDay, packingTips } = weatherData;
  const currentDay = dailyForecast[selectedDayIdx] || dailyForecast[0];
  const CurrentIcon = WEATHER_ICONS[currentDay.icon] || Sun;
  const theme = WEATHER_COLORS[currentDay.icon] || WEATHER_COLORS.sun;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            Trip Dates Weather Forecast
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{weatherData.destination}</span>
            <span className="text-xs font-semibold text-slate-400">
              ({weatherData.totalDays} {weatherData.totalDays === 1 ? 'Day' : 'Days'} Plan)
            </span>
          </h3>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-200/80 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-indigo-500" />
            Avg {avgTemp}°C
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-200/80 flex items-center gap-1.5">
            <Umbrella className="w-3.5 h-3.5 text-sky-500" />
            {rainyDaysCount > 0 ? `${rainyDaysCount} Rainy ${rainyDaysCount === 1 ? 'Day' : 'Days'}` : 'Clear Skies'}
          </span>
          {bestDay && (
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-emerald-600" />
              Best Day: Day {bestDay.dayNumber} ({bestDay.date})
            </span>
          )}
        </div>
      </div>

      {/* Day Selector Strip - E.g. Day 1, Day 2, Day 3 with dates & temperatures */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {dailyForecast.map((day, idx) => {
          const IconComponent = WEATHER_ICONS[day.icon] || Sun;
          const isSelected = selectedDayIdx === idx;
          const dayTheme = WEATHER_COLORS[day.icon] || WEATHER_COLORS.sun;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                  Day {day.dayNumber}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {day.formattedDate}
                </span>
              </div>

              {/* Weather icon & temp */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${dayTheme.iconBg} flex items-center justify-center shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900 leading-tight">
                    {day.tempMax}° / <span className="text-xs font-semibold text-slate-400">{day.tempMin}°</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {day.condition}
                  </div>
                </div>
              </div>

              {/* Rain indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/50">
                <span className="flex items-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-sky-500" /> {day.rainChance}% rain
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-2.5 h-2.5 text-slate-400" /> {day.windSpeed} km/h
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detailed Weather Spotlight Card */}
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${theme.bg} border space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-xs`}>
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  Day {currentDay.dayNumber} — {currentDay.dayName}, {currentDay.formattedDate}
                </h4>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${theme.badge}`}>
                  {currentDay.condition}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentDay.advice}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {currentDay.tempMax}°C
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Low: {currentDay.tempMin}°C
            </span>
          </div>
        </div>

        {/* Weather metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Rain Chance
            </span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              {currentDay.rainChance}%
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Humidity
            </span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-indigo-500" />
              {currentDay.humidity}%
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Wind Speed
            </span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-500" />
              {currentDay.windSpeed} km/h
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Location
            </span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{weatherData.locationName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Smart Packing & Prep Tips */}
      {packingTips && packingTips.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Smart Packing Advice for Trip Weather
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {packingTips.map((tip, idx) => (
              <div key={idx} className="text-xs text-slate-600 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs">
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

