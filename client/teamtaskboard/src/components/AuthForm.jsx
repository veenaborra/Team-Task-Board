import React from 'react';

export default function AuthForm({
  mode,
  onModeChange,
  form,
  onFieldChange,
  onSubmit,
  loading,
}) {
  const tabBase =
    'rounded-xl border border-white/10 bg-transparent px-3 py-2 text-slate-200 transition';
  const tabActive = 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-900 font-semibold';

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
        <button
          className={`${tabBase} ${mode === 'login' ? tabActive : ''}`}
          onClick={() => onModeChange('login')}
          disabled={loading}
        >
          Login
        </button>
        <button
          className={`${tabBase} ${mode === 'signup' ? tabActive : ''}`}
          onClick={() => onModeChange('signup')}
          disabled={loading}
        >
          Register
        </button>
      </div>

      <form className="grid gap-3 mt-2" onSubmit={onSubmit}>
        {mode === 'signup' && (
          <label className="grid gap-1.5">
            <span className="text-sm text-slate-300">Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => onFieldChange('username', e.target.value)}
              required
              placeholder="jane_doe"
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0"
            />
          </label>
        )}

        <label className="grid gap-1.5">
          <span className="text-sm text-slate-300">
            {mode === 'signup' ? 'Email' : 'Email or Username'}
          </span>
          <input
            type={mode === 'signup' ? 'email' : 'text'}
            value={mode === 'signup' ? form.email : form.email || form.username}
            onChange={(e) => onFieldChange('email', e.target.value)}
            required
            placeholder={mode === 'signup' ? 'jane@example.com' : 'jane@example.com or jane_doe'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-0"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
            minLength={6}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-0"
          />
        </label>

        <button
          className="w-full rounded-xl border border-sky-500 bg-sky-500 px-3 py-3 font-semibold text-white shadow transition hover:-translate-y-[1px] hover:shadow-sky-200/40 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Login'}
        </button>
      </form>
    </>
  );
}

