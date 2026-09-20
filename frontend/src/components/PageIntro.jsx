import React from 'react';
import { ChevronLeft } from 'lucide-react';

function PageIntro({ back, icon, title, copy }) {
  return (
    <div className="mb-7 page-intro">
      <button
        type="button"
        onClick={back}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-soilMuted transition hover:text-forest"
      >
        <ChevronLeft size={14} /> Home
      </button>
      <div className="flex items-center gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fdf0e2] text-rust">
          {icon}
        </span>
        <h1 className="font-serif text-[26px] font-semibold leading-tight text-soil sm:text-[32px]">{title}</h1>
      </div>
      {copy && <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-soilMuted">{copy}</p>}
    </div>
  );
}

export default PageIntro;