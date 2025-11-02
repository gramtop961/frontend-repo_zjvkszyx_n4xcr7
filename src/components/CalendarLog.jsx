import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';

const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysInMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

const CalendarLog = ({ sessions, onAddSession, onUpdateSession, onDeleteSession }) => {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({ subject: 'General', minutes: 60 });
  const [editingId, setEditingId] = useState(null);

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const startWeekday = (start.getDay() + 6) % 7; // Mon=0
    const totalDays = daysInMonth(cursor);
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const monthSessions = useMemo(() => {
    return sessions.filter((s) => {
      const d = new Date(s.start);
      return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
    });
  }, [sessions, cursor]);

  const sessionsByDate = useMemo(() => {
    const map = {};
    monthSessions.forEach((s) => {
      const key = new Date(s.start).toDateString();
      map[key] = map[key] || [];
      map[key].push(s);
    });
    return map;
  }, [monthSessions]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdateSession(editingId, { ...form });
      setEditingId(null);
    } else {
      const date = new Date(selectedDate);
      const nowIso = new Date().toISOString();
      onAddSession({
        id: crypto.randomUUID(),
        subject: form.subject,
        minutes: Number(form.minutes),
        start: new Date(date.setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(date.setHours(11, 0, 0, 0)).toISOString(),
        createdAt: nowIso,
      });
    }
    setForm({ subject: 'General', minutes: 60 });
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({ subject: s.subject, minutes: s.minutes });
    setSelectedDate(new Date(s.start));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Planner & Log</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Add and edit sessions on the calendar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            ←
          </button>
          <div className="text-sm font-medium w-36 text-center">
            {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-2">
        {grid.map((date, idx) => {
          const key = date ? date.toDateString() : `empty-${idx}`;
          const items = date ? sessionsByDate[key] || [] : [];
          const isSelected = date && selectedDate.toDateString() === date.toDateString();
          return (
            <button
              key={key}
              className={`min-h-20 rounded-lg p-2 text-left ring-1 ring-black/5 dark:ring-white/10 bg-neutral-50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                isSelected ? 'outline outline-2 outline-blue-500' : ''
              }`}
              onClick={() => date && setSelectedDate(date)}
            >
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {date ? date.getDate() : ''}
              </div>
              <div className="mt-1 space-y-1">
                {items.slice(0, 3).map((s) => (
                  <div key={s.id} className="truncate text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {s.subject}: {s.minutes}m
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-[10px] text-neutral-500">+{items.length - 3} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Date</label>
          <input
            type="date"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={new Date(selectedDate).toISOString().slice(0,10)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Subject</label>
          <select
            className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          >
            <option>General</option>
            <option>Math</option>
            <option>Science</option>
            <option>History</option>
            <option>Language</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Minutes</label>
          <input
            type="number"
            min={1}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.minutes}
            onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) }))}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ subject: 'General', minutes: 60 });
              }}
              className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4">
        <h4 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Entries on {selectedDate.toLocaleDateString()}</h4>
        <div className="mt-2 space-y-2">
          {(sessions.filter((s) => new Date(s.start).toDateString() === selectedDate.toDateString())).map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 ring-1 ring-black/5 dark:ring-white/10">
              <div className="text-sm">
                <span className="font-medium">{s.subject}</span> · {s.minutes}m
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(s)} className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-sm">Edit</button>
                <button onClick={() => onDeleteSession(s.id)} className="px-3 py-1 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 text-sm inline-flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarLog;
