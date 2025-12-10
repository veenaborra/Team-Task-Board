import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import StatusBanner from '../components/StatusBanner.jsx';
import SessionBar from '../components/SessionBar.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const initialState = { email: '', username: '', password: '' };

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
      const payload =
        mode === 'signup'
          ? {
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
            }
          : {
              emailOrUsername: (form.email || form.username).trim(),
              password: form.password,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Request failed');

      if (mode === 'signup') {
        setStatus({ type: 'success', message: 'Sign-up successful. You can log in now.' });
        setMode('login');
        setForm(initialState);
      } else {
        setStatus({ type: 'success', message: 'Logged in successfully.' });
        const displayName = form.username?.trim() || form.email?.trim() || 'You';
        const nextSession = { userId: data.userId, role: data.role, name: displayName };
        setSession(nextSession);
        localStorage.setItem('session', JSON.stringify(nextSession));
        navigate('/tasks');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Logout failed');
      }
      setSession(null);
      localStorage.removeItem('session');
      setForm(initialState);
      setStatus({ type: 'success', message: 'Logged out.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-7 shadow-md">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Team Task Board</h1>
          <p className="mt-1 text-sm text-slate-600">Authenticate to continue</p>
        </header>

        <AuthForm
          mode={mode}
          onModeChange={setMode}
          form={form}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <StatusBanner status={status} />
        <SessionBar session={session} onLogout={handleLogout} loading={loading} />

        <footer className="mt-4 text-center text-sm text-slate-500">
          <small>JWT-based auth with role support (Admin/Member)</small>
        </footer>
      </div>
    </div>
  );
}

