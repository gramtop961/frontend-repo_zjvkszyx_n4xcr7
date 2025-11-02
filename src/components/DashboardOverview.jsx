import React, { useMemo } from 'react';
import { Target, Flame, Activity } from 'lucide-react';

const ProgressRing = ({ progress, size = 88, stroke = 10, color = '#2563EB' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={stroke}
        fill="none"
        className="dark:stroke-neutral-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  );
};

const DashboardOverview = ({ sessions, weeklyGoal }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7; // Monday = 0
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const weekMinutes = sessions
      .filter((s) => new Date(s.start) >= startOfWeek)
      .reduce((sum, s) => sum + (s.minutes || 0), 0);

    // simple daily streak: days with any session back-to-back until a gap
    const daysWithStudy = new Set(
      sessions.map((s) => new Date(s.start).toDateString())
    );
    let streak = 0;
    const probe = new Date();
    probe.setHours(0, 0, 0, 0);
    while (daysWithStudy.has(probe.toDateString())) {
      streak += 1;
      probe.setDate(probe.getDate() - 1);
    }

    // subjects breakdown
    const bySubject = sessions.reduce((acc, s) => {
      acc[s.subject] = (acc[s.subject] || 0) + s.minutes;
      return acc;
    }, {});

    const avgSession = sessions.length
      ? Math.round(totalMinutes / sessions.length)
      : 0;

    return {
      totalMinutes,
      weekMinutes,
      streak,
      bySubject,
      avgSession,
    };
  }, [sessions]);

  const progress = weeklyGoal > 0 ? stats.weekMinutes / (weeklyGoal * 60) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5 flex items-center gap-4">
        <ProgressRing progress={progress} />
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">This week</div>
          <div className="text-2xl font-semibold">
            {Math.floor(stats.weekMinutes / 60)}h {stats.weekMinutes % 60}m
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Target size={16} /> Goal: {weeklyGoal}h
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5 flex items-center gap-4">
        <div className="size-16 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
          <Activity />
        </div>
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Total time</div>
          <div className="text-2xl font-semibold">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </div>
          <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Avg session: {stats.avgSession}m</div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <Flame size={16} /> Current streak
        </div>
        <div className="mt-2 text-3xl font-semibold">{stats.streak} day{stats.streak === 1 ? '' : 's'}</div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-full rounded-full ${i < Math.min(7, stats.streak) ? 'bg-amber-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}
            />
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Time by subject</h4>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">minutes</span>
        </div>
        <div className="mt-4 space-y-3">
          {Object.keys(stats.bySubject).length === 0 && (
            <div className="text-sm text-neutral-500 dark:text-neutral-400">No data yet. Start a timer or add a session.</div>
          )}
          {Object.entries(stats.bySubject).map(([subject, mins]) => (
            <div key={subject} className="flex items-center gap-3">
              <div className="w-28 text-sm text-neutral-700 dark:text-neutral-300">{subject}</div>
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, (mins / Math.max(60, mins)) * 100)}%` }}
                />
              </div>
              <div className="w-16 text-right text-sm tabular-nums">{mins}m</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
