import React from 'react';

const TONE_STYLES = {
  default: 'bg-forest text-[#D4EA9A]',
  good: 'bg-[#e6f2e6] text-success',
  warn: 'bg-[#fdf0e2] text-rust',
};

function StatCard({ label, value, icon, tone = 'default', hint }) {
  return (
    <article className="flex h-full w-full min-w-0 items-start gap-3 rounded-2xl border border-[#e2e8dd] bg-white p-4 shadow-[0_8px_22px_rgba(31,61,43,0.06)] sm:p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TONE_STYLES[tone]}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wide text-soilMuted">{label}</span>
        <span className="mt-1 block font-serif text-3xl font-semibold leading-none text-soil">{value ?? 0}</span>
        {hint && <span className="mt-1.5 block text-xs text-soilMuted">{hint}</span>}
      </span>
    </article>
  );
}

export default StatCard;