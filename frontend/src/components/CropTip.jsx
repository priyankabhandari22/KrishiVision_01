import React from 'react';
import { Sprout } from 'lucide-react';

const DEFAULT_TIP =
  'Regularly inspect leaves for unusual spots, discoloration, or visible damage. ' +
  'Early detection can help you take timely action.';

function CropTip({ tip = DEFAULT_TIP }) {
  return (
    <aside className="rounded-3xl bg-forest p-6 text-parchment shadow-[0_18px_45px_rgba(31,61,43,0.18)]">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-turmeric text-forestDeep">
        <Sprout size={22} />
      </span>
      <h2 className="mt-4 font-serif text-[18px] font-semibold">Crop Health Tip</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#BFD5C3]">{tip}</p>
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-[#A9D7A0]">General guidance only.</p>
    </aside>
  );
}

export default CropTip;