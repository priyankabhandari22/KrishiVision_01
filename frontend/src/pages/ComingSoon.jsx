import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import PageIntro from '../components/PageIntro';

function ComingSoonPage({ title, navigate }) {
  return (
    <main className="w-full min-w-0">
      <PageIntro
        back={() => navigate('dashboard')}
        icon={<Construction />}
        title={title}
        copy="This section is on its way. Head back to your dashboard while we build it."
      />
      <div className="rounded-3xl border border-[#e2e8dd] bg-white p-8 text-center shadow-[0_12px_35px_rgba(31,61,43,0.08)] sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fdf0e2] text-rust">
          <Construction size={28} />
        </span>
        <p className="mt-5 font-serif text-xl font-semibold text-soil sm:text-2xl">{title} is coming soon</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-sm text-soilMuted">
          This section is on its way. Head back to your dashboard while we build it.
        </p>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-forestDeep"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </main>
  );
}

export default ComingSoonPage;