import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Leaf,
  ShieldCheck,
  Upload,
  WifiOff,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DetectionActionCard from '../components/DetectionActionCard';
import CropTip from '../components/CropTip';
import RecentDetection from '../components/RecentDetection';
import { useAuth } from '../context/AuthContext';
import { API, apiFetch } from '../api';

function Dashboard({ navigate, setReport }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let failed = false;
      try {
        const [aRes, hRes] = await Promise.all([
          apiFetch('/analytics'),
          apiFetch('/history?limit=5'),
        ]);
        if (!cancelled) {
          const a = aRes.response.ok ? aRes.data : null;
          const h = hRes.response.ok ? hRes.data : null;
          setAnalytics(a);
          setHistory(h?.history || []);
          failed = !aRes.response.ok && !hRes.response.ok;
        }
      } catch {
        if (!cancelled) {
          setAnalytics(null);
          setHistory([]);
          failed = true;
        }
      } finally {
        if (!cancelled) {
          setApiError(failed);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.name?.trim() || 'Farmer';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();

  const total = analytics?.total_predictions ?? 0;
  const healthy = analytics?.healthy_count ?? 0;
  const diseased = analytics?.diseased_count ?? 0;

  const openDetection = (item) => {
    const saved = item.full_advisory || item;
    setReport({
      ...saved,
      crop: saved.crop || item.crop,
      disease: saved.disease || item.disease,
      status: saved.status || item.status,
      confidence: saved.confidence ?? item.confidence,
      is_confident: saved.is_confident ?? item.is_confident,
      heatmap_path: saved.heatmap_path || item.heatmap_path,
      timestamp: item.timestamp,
      preview: '',
    });
    navigate('farmer');
  };

  return (
    <main className="w-full min-w-0">
      <section className="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-5 sm:mb-10">
        <div className="min-w-0 flex-1 basis-72">
          <p className="eyebrow">Farmer dashboard</p>
          <h1 className="font-serif text-[26px] font-semibold leading-tight text-soil sm:text-[32px]">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 max-w-[58ch] text-sm text-soilMuted">
            Check your grove&apos;s health, run a new scan, and review past detections from one place.
          </p>
        </div>
        <div className="flex w-full max-w-full shrink-0 items-center gap-3 rounded-2xl border border-[#dce3d7] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(31,61,43,0.05)] sm:w-auto">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-[#D4EA9A]">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[220px] truncate text-sm font-semibold leading-tight text-soil">{displayName}</span>
            <span className="block max-w-[220px] truncate text-xs text-soilMuted">{user?.email || 'Farmer account'}</span>
          </span>
        </div>
      </section>

      <DetectionActionCard
        title="Check Your Crop Health"
        description="Open your camera to photograph a leaf, or upload an image to identify possible crop diseases."
        note="Choose a well-lit leaf and fill the frame - camera photos run through the same trusted prediction pipeline."
        actions={[
          {
            label: 'Take Photo',
            icon: <Camera size={18} />,
            primary: true,
            onClick: () => navigate('camera'),
          },
          {
            label: 'Upload Image',
            icon: <Upload size={18} />,
            primary: false,
            onClick: () => navigate('farmer'),
          },
        ]}
      />

      <section className="mt-8 sm:mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-[20px] font-semibold text-soil">Your grove at a glance</h2>
          {loading && <span className="text-xs text-soilMuted">Loading live data&hellip;</span>}
          {!loading && apiError && (
            <span className="inline-flex items-center gap-1.5 text-xs text-rust">
              <WifiOff size={13} /> Stats unavailable — is the service running?
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Scans"
            value={total}
            icon={<ClipboardList size={20} />}
            hint={total === 0 ? 'No scans yet' : 'Your all-time scans'}
          />
          <StatCard
            label="Healthy"
            value={healthy}
            icon={<ShieldCheck size={20} />}
            tone="good"
            hint={healthy === 0 ? 'No healthy leaves yet' : 'Your healthy leaves'}
          />
          <StatCard
            label="Diseases Detected"
            value={diseased}
            icon={<CircleAlert size={20} />}
            tone="warn"
            hint={diseased === 0 ? 'No diseases found yet' : 'Your diseased leaves'}
          />
        </div>
        {analytics?.last_scan_confidence != null && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce3d7] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(31,61,43,0.05)]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest/10 text-forest">
                <Activity size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-soilMuted">Latest scan</p>
                <p className="break-words text-sm font-semibold text-soil">
                  {Math.round(analytics.last_scan_confidence * 100)}% confidence
                  {analytics.last_scan_at
                    ? ` · ${new Date(analytics.last_scan_at).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-turmericDeep hover:text-rust"
            >
              View history <ChevronRight size={15} />
            </button>
          </div>
        )}
      </section>

      <section className="mt-8 grid grid-cols-1 items-start gap-6 sm:mt-10 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-[20px] font-semibold text-soil">Recent detections</h2>
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-turmericDeep hover:text-rust"
            >
              View all history <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#c7d3c3] bg-white/60 p-6 text-sm text-soilMuted">
              Loading your recent detections&hellip;
            </div>
          ) : history.length > 0 ? (
            <div className="grid gap-3">
              {history.slice(0, 5).map((item) => (
                <RecentDetection key={item.id} detection={item} apiBase={API} onOpen={openDetection} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c7d3c3] bg-white/60 p-7 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest/10 text-forest">
                <Leaf size={22} />
              </span>
              <p className="mt-3 text-sm font-semibold text-soil">
                {apiError ? 'Could not load detection history' : 'No detections yet'}
              </p>
              <p className="mx-auto mt-1 max-w-[42ch] text-sm text-soilMuted">
                {apiError
                  ? 'Check that the KrishiVision service is running, then refresh the page.'
                  : 'Run your first leaf scan and your results will appear here.'}
              </p>
              {!apiError && (
                <button
                  type="button"
                  onClick={() => navigate('farmer')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-forestDeep"
                >
                  Detect Disease <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        <CropTip />
      </section>
    </main>
  );
}

export default Dashboard;