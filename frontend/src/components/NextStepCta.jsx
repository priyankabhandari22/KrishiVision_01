import React from 'react';
import { ArrowRight } from 'lucide-react';

const NEXT_STEPS = {
  dashboard: {
    label: 'Start Disease Detection',
    target: 'farmer',
    step: 'Step 2 of 6',
    subtitle: 'Upload a leaf image for real-time model diagnosis & advisory',
  },
  farmer: {
    label: 'View Detection History',
    target: 'admin',
    step: 'Step 3 of 6',
    subtitle: 'Review past crop scans, diagnostic reports and Grad-CAM evidence',
  },
  admin: {
    label: 'View Analytics',
    target: 'analytics',
    step: 'Step 4 of 6',
    subtitle: 'Inspect prediction trends, disease distribution & system metrics',
  },
  analytics: {
    label: 'Explore Crop Guide',
    target: 'crop-guide',
    step: 'Step 5 of 6',
    subtitle: 'Browse verified agricultural treatment & preventive management guidelines',
  },
  'crop-guide': {
    label: 'View Research',
    target: 'research',
    step: 'Step 6 of 6',
    subtitle: 'Examine benchmark metrics & confusion matrix for candidate models',
  },
  research: {
    label: 'Back to Dashboard',
    target: 'dashboard',
    step: 'Step 1 of 6',
    subtitle: 'Return to main workspace overview & key metrics summary',
  },
};

function NextStepCta({ screen, navigate }) {
  const config = NEXT_STEPS[screen];
  if (!config) return null;

  return (
    <nav aria-label="Workflow next step navigation" className="mt-12 w-full min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-line bg-panel/90 p-5 sm:p-6 shadow-sm transition-all hover:border-orange/60 hover:shadow-md">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-muted">
            NEXT STEP IN WORKFLOW · {config.step}
          </span>
          <span className="text-xs text-soilMuted font-medium truncate sm:whitespace-normal">
            {config.subtitle}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(config.target)}
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-parchment shadow transition-all hover:bg-forestDeep hover:text-turmeric focus:outline-none focus:ring-2 focus:ring-turmeric active:scale-[0.98]"
        >
          <span>{config.label}</span>
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1 text-turmeric" />
        </button>
      </div>
    </nav>
  );
}

export default NextStepCta;
