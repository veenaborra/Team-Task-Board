import React from 'react';

export default function SessionBar({ session, onLogout, loading }) {
  if (!session) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-slate-200">
      {/* <div>
        Logged in as <strong>{session.userId}</strong> ({session.role})
      </div> */}
      <button
        className="border-none bg-transparent font-semibold text-cyan-300 hover:text-cyan-200"
        onClick={onLogout}
        disabled={loading}
      >
        Logout
      </button>
    </div>
  );
}

