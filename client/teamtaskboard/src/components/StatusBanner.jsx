import React from 'react';

export default function StatusBanner({ status }) {
  if (!status?.message) return null;

  const base = 'mt-3 rounded-xl px-3 py-3 text-sm border';
  const styles =
    status.type === 'success'
      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600'
      : 'border-rose-400/40 bg-rose-500/10 text-rose-600';

  return <div className={`${base} ${styles}`}>{status.message}</div>;
}

