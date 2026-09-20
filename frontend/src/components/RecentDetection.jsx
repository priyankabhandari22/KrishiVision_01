import React from 'react';
import { Check, ChevronRight, CircleAlert, Leaf } from 'lucide-react';

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function RecentDetection({ detection, apiBase, onOpen }) {
  const crop = detection.crop ? detection.crop.charAt(0).toUpperCase() + detection.crop.slice(1) : 'Crop';
  const disease = detection.disease || 'Unknown';
  const isHealthy = detection.status === 'healthy';
  const confidence = Number.isFinite(detection.confidence) ? Math.round((detection.confidence || 0) * 100) : 0;
  const timestamp = formatTimestamp(detection.timestamp);
  const thumb = detection.heatmap_path ? `${apiBase}${detection.heatmap_path}` : null;

  return (
    <button
      type="button"
      onClick={() => onOpen(detection)}
      className="group flex w-full items-center gap-3 rounded-2xl border border-[#e2e8dd] bg-white p-4 text-left shadow-[0_6px_18px_rgba(31,61,43,0.05)] transition hover:-translate-y-0.5 hover:border-[#6FA85C] hover:shadow-[0_12px_28px_rgba(31,61,43,0.12)]"
    >
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef2ea] text-[#8aa08f] sm:h-14 sm:w-14">
        <Leaf size={24} />
        {thumb && (
          <img
            src={thumb}
            alt="Detection visual"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="break-words text-sm font-semibold text-soil">
            {crop} · {disease}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isHealthy ? 'bg-[#e6f2e6] text-success' : 'bg-[#fdf0e2] text-rust'
            }`}
          >
            {isHealthy ? <Check size={11} /> : <CircleAlert size={11} />}
            {isHealthy ? 'Healthy' : 'Diseased'}
          </span>
        </span>
        <span className="mt-1 block text-xs text-soilMuted">{timestamp}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-lg font-bold text-forest">{confidence}%</span>
        <span className="block text-[10px] uppercase tracking-wide text-soilMuted">Confidence</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-soilMuted group-hover:text-forest" />
    </button>
  );
}

export default RecentDetection;