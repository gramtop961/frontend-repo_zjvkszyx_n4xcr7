import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const StudyTimer = ({ onSessionComplete }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const tickRef = useRef(null);
  const [subject, setSubject] = useState('General');

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      tickRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 250);
    }
    return () => tickRef.current && clearInterval(tickRef.current);
  }, [running]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const handleSave = () => {
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60000));
    onSessionComplete({
      id: crypto.randomUUID(),
      subject,
      minutes,
      start: new Date(Date.now() - elapsed).toISOString(),
      end: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setElapsed(0);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Focus Timer</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Track your session in real time</p>
          </div>
        </div>
        <select
          className="text-sm px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option>General</option>
          <option>Math</option>
          <option>Science</option>
          <option>History</option>
          <option>Language</option>
        </select>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="font-mono text-4xl md:text-5xl lg:text-6xl tracking-tight tabular-nums">
          {formatTime(elapsed)}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {!running ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Play size={16} /> Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              <Pause size={16} /> Pause
            </button>
          )}

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            onClick={handleSave}
            disabled={elapsed < 60000}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
