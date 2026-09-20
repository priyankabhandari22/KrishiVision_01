import React from 'react';
import { Leaf } from 'lucide-react';

function DetectionActionCard({ title, description, actions = [], note }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_88%_8%,rgba(55,137,74,0.35),transparent_42%),linear-gradient(115deg,#0C3A26,#062A1C)] p-6 text-parchment shadow-[0_22px_55px_rgba(6,42,28,0.28)] sm:p-7 lg:p-10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-leaf/15" />
      <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-leaf/10" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-parchment/25 bg-white/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#A9D7A0]">
          <Leaf size={13} /> Instant scan
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-parchment sm:text-[32px] sm:leading-tight">{title}</h2>
        <p className="mx-auto mt-2.5 max-w-[56ch] text-sm leading-relaxed text-[#BFD5C3] sm:text-base">{description}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition sm:w-auto ${
                action.primary
                  ? 'bg-turmeric text-forestDeep shadow-[0_10px_24px_rgba(217,154,43,0.3)] hover:bg-[#E6AB3B]'
                  : 'border border-parchment/40 text-parchment hover:border-parchment hover:bg-white/10'
              }`}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
        {note && <p className="mt-4 text-xs text-[#A9D7A0]">{note}</p>}
      </div>
    </section>
  );
}

export default DetectionActionCard;