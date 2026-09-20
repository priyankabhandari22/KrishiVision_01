import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CircleAlert,
  ClipboardList,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import PageIntro from '../components/PageIntro';
import Kpi from '../components/Kpi';
import { apiFetch } from '../api';

function AnalyticsPage({ navigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { response, data } = await apiFetch('/analytics');
      if (!response.ok) throw new Error(data?.detail || 'Failed to load analytics.');
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Could not load analytics.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distribution = analytics?.disease_distribution || [];
  const cropDistribution = analytics?.crop_distribution || {};
  const benchmarks = analytics?.model_benchmarks?.comparison || [];

  return (
    <main className="w-full min-w-0">
      <PageIntro
        back={() => navigate('dashboard')}
        icon={<BarChart3 />}
        title="Analytics"
        copy="A personal breakdown of your recorded scans - health mix, confidence, disease spread, and the model behind your results."
      />

      {error && !analytics && (
        <div className="empty-dashboard">
          <WifiOff size={26} />
          <h2>Could not load analytics</h2>
          <p>{error} Use the refresh action below to try again.</p>
          <button className="button button-primary" onClick={load}>
            <Activity size={16} /> Retry
          </button>
        </div>
      )}

      <div className="dashboard-actions">
        <div className="integration-note">
          <Activity size={16} />
          <span>Live summary computed from your scan records only.</span>
        </div>
        <button className="button button-primary" onClick={load}>
          {loading ? 'Refreshing...' : 'Refresh analytics'} <ArrowRight size={16} />
        </button>
      </div>

      {analytics && (
        <>
          <div className="kpi-grid">
            <Kpi label="Total predictions" value={analytics.total_predictions} icon={<ClipboardList />} />
            <Kpi label="Healthy leaves" value={analytics.healthy_count} icon={<ShieldCheck />} tone="good" />
            <Kpi label="Diseased leaves" value={analytics.diseased_count} icon={<CircleAlert />} tone="warn" />
            <Kpi label="Average confidence" value={`${Math.round((analytics.average_confidence || 0) * 100)}%`} icon={<Activity />} />
            <Kpi
              label="Last scan confidence"
              value={analytics.last_scan_confidence != null ? `${Math.round(analytics.last_scan_confidence * 100)}%` : '—'}
              icon={<Activity />}
            />
            <Kpi label="Low-confidence flags" value={analytics.low_confidence_count} icon={<CircleAlert />} tone="warn" />
          </div>

          <section className="history-section">
            <div className="section-heading">
              <div>
                <span className="section-label">DISEASE DISTRIBUTION</span>
                <h2>What your scans found</h2>
              </div>
              <BarChart3 size={19} />
            </div>
            {distribution.length ? (
              <div className="history-table">
                {distribution.map((item) => (
                  <div className="history-row" key={item.label}>
                    <span>{item.crop}</span>
                    <strong>{item.disease}</strong>
                    <span className={item.status === 'healthy' ? 'good' : 'warn'}>{item.status}</span>
                    <strong>{item.count} {item.count === 1 ? 'scan' : 'scans'}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="table-empty">No disease distribution yet - run a few scan predictions first.</p>
            )}
          </section>

          <section className="history-section">
            <div className="section-heading">
              <div>
                <span className="section-label">CROP BREAKDOWN</span>
                <h2>Scans by crop</h2>
              </div>
            </div>
            <div className="history-table">
              {Object.entries(cropDistribution).map(([crop, count]) => (
                <div className="history-row" key={crop}>
                  <span>{crop}</span>
                  <strong>{count} {count === 1 ? 'scan' : 'scans'}</strong>
                </div>
              ))}
            </div>
          </section>

          {benchmarks.length > 0 && (
            <section className="history-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">MODEL BENCHMARKS</span>
                  <h2>Evaluated candidates</h2>
                </div>
              </div>
              <div className="history-table">
                {benchmarks.map((model) => (
                  <div className="history-row" key={model.name}>
                    <span>{model.status}</span>
                    <strong>{model.name}</strong>
                    <strong>{model.accuracy}% accuracy</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default AnalyticsPage;