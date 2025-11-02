import React, { useEffect, useMemo, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import HeroCover from './components/HeroCover';
import StudyTimer from './components/StudyTimer';
import DashboardOverview from './components/DashboardOverview';
import CalendarLog from './components/CalendarLog';

// Local storage helpers
const LS_KEY = 'focusflow_data_v1';
const loadData = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const saveData = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('ff_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ff_theme', theme);
  }, [theme]);

  const [sessions, setSessions] = useState(() => loadData()?.sessions || []);
  const [weeklyGoal, setWeeklyGoal] = useState(() => loadData()?.weeklyGoal || 15);

  useEffect(() => {
    saveData({ sessions, weeklyGoal });
  }, [sessions, weeklyGoal]);

  const addSession = (s) => setSessions((prev) => [...prev, s]);
  const updateSession = (id, patch) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const deleteSession = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));

  const motivational = useMemo(() => {
    // Simple dynamic message
    const weekMinutes = sessions
      .filter((s) => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diffToMonday = (day + 6) % 7; // Monday = 0
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        return new Date(s.start) >= startOfWeek;
      })
      .reduce((sum, s) => sum + s.minutes, 0);
    const pct = Math.min(100, Math.round((weekMinutes / (weeklyGoal * 60 || 1)) * 100));
    if (pct >= 100) return 'Amazing! Goal complete — claim your flow badge.';
    if (pct >= 60) return 'Great momentum! You are well past the halfway mark.';
    if (pct >= 30) return 'Nice start! Keep your streak alive today.';
    return 'Every minute counts. Start a focused session now.';
  }, [sessions, weeklyGoal]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">F</div>
            <div>
              <div className="font-semibold leading-none">FocusFlow</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Study tracker & planner</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-neutral-500 dark:text-neutral-400">{motivational}</div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800">
              <button
                aria-label="Light mode"
                onClick={() => setTheme('light')}
                className={`p-1 rounded ${theme === 'light' ? 'bg-white text-neutral-900' : 'text-neutral-400'}`}
              >
                <Sun size={16} />
              </button>
              <button
                aria-label="Dark mode"
                onClick={() => setTheme('dark')}
                className={`p-1 rounded ${theme === 'dark' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <HeroCover />

        {/* Controls under hero */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <DashboardOverview sessions={sessions} weeklyGoal={weeklyGoal} />
          </div>
          <div className="order-1 lg:order-2">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5 mb-4">
              <label className="text-sm text-neutral-600 dark:text-neutral-300">Weekly goal (hours)</label>
              <input
                type="range"
                min={5}
                max={40}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-sm"><span className="font-medium">{weeklyGoal} hours</span> target this week</div>
            </div>
            <StudyTimer onSessionComplete={addSession} />
          </div>
        </div>

        {/* Planner */}
        <div className="mt-6">
          <CalendarLog
            sessions={sessions}
            onAddSession={addSession}
            onUpdateSession={updateSession}
            onDeleteSession={deleteSession}
          />
        </div>

        {/* Footer */}
        <div className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Built with care — stay consistent and the results will follow.
        </div>
      </div>
    </div>
  );
}
