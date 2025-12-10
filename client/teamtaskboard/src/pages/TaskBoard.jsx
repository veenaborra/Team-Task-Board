import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const STATUSES = ['To Do', 'Doing', 'Done'];

export default function TaskBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('session');
    return stored ? JSON.parse(stored) : null;
  });

  // Ensure we have a display name even if older sessions lack it
  useEffect(() => {
    if (session && !session.name) {
      const updated = { ...session, name: 'You' };
      setSession(updated);
      localStorage.setItem('session', JSON.stringify(updated));
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/tasks`, { credentials: 'include' });
      if (res.status === 401) {
        navigate('/');
        return;
      }
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setError('');
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `Failed to update task (${res.status})`);
      }
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      setError('');
    } catch (err) {
      setError(err.message);
      // fallback: sync with server in case the change actually applied
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('session');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between px-6 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow">
        <div>
          <h1 className="text-xl font-semibold">Team Task Board</h1>
         
        </div>
        <div className="flex items-center gap-3">
          {session && <span className="text-sm">{session.name || 'You'}</span>}
          <button
            onClick={logout}
            className="rounded-lg bg-white/15 px-3 py-1 text-sm font-semibold text-white hover:bg-white/25 border border-white/20"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-4 py-6 md:px-6 lg:px-10 max-w-6xl mx-auto">
        <form
          onSubmit={addTask}
          className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Add Task</h2>
            {error && <div className="text-sm text-rose-600">{error}</div>}
          </div>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 px-3 py-2 font-semibold text-white shadow-sm hover:bg-sky-600"
          >
            Create
          </button>
        </form>

        {loading ? (
          <div className="text-slate-600">Loading tasks…</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
            {STATUSES.map((column) => (
              <div key={column} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{column}</h3>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                    {tasks.filter((t) => t.status === column).length} items
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status === column)
                    .map((task) => (
                      <div
                        key={task._id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-900"
                      >
                        <div className="font-semibold">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-slate-700 mt-1">{task.description}</div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {STATUSES.filter((s) => s !== task.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(task._id, s)}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                            >
                              Move to {s}
                            </button>
                          ))}
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="rounded border border-rose-300 bg-white px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="mt-2 text-[11px] text-black-500 space-y-1">
                          <div>
                            Created by{' '}
                            {task.creator?._id === session?.userId
                              ? 'you'
                              : task.creator?.username ||
                                task.creator?.email ||
                                (typeof task.creator === 'string' ? task.creator : 'teammate')}
                            {' · '}
                            {new Date(task.createdAt).toLocaleString()}
                          </div>
                          <div>
                            Last moved by{' '}
                            {task.lastMovedBy
                              ? task.lastMovedBy?._id === session?.userId
                                ? 'you'
                                : task.lastMovedBy?.username ||
                                  task.lastMovedBy?.email ||
                                  (typeof task.lastMovedBy === 'string'
                                    ? task.lastMovedBy
                                    : 'teammate')
                              : task.creator?._id === session?.userId
                              ? 'you'
                              : task.creator?.username ||
                                task.creator?.email ||
                                (typeof task.creator === 'string' ? task.creator : 'teammate')}
                            {task.lastMovedAt
                              ? ` · ${new Date(task.lastMovedAt).toLocaleString()}`
                              : ` · ${new Date(task.updatedAt || task.createdAt).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t) => t.status === column).length === 0 && (
                    <div className="rounded border border-dashed border-slate-200 p-3 text-sm text-slate-500 bg-slate-50">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

