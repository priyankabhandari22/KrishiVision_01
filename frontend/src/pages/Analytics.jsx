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
import ActivityLineChart from '../components/charts/ActivityLineChart';
import CropBarChart from '../components/charts/CropBarChart';
import HealthDonutChart from '../components/charts/HealthDonutChart';
import { apiFetch } from '../api';

function computeDailyActivity(history = []) {
  if (!history.length) return [];
  const countsByDate = {};
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  sorted.forEach((item) => {
    if (!item.timestamp) return;
    const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
  });
  return Object.entries(countsByDate).map(([date, count]) => ({ date, count }));
}

function computeDailyConfidence(history = []) {
  if (!history.length) return [];
  const confByDate = {};
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  sorted.forEach((item) => {
    if (!item.timestamp || item.confidence == null) return;
    const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!confByDate[dateStr]) confByDate[dateStr] = { sum: 0, count: 0 };
    confByDate[dateStr].sum += item.confidence;
    confByDate[dateStr].count += 1;
  });
  return Object.entries(confByDate).map(([date, { sum, count }]) => ({
    date,
    confidence: sum / count,
  }));
}

function AnalyticsPage({ navigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [aRes, hRes] = await Promise.all([
        apiFetch('/analytics'),
        apiFetch('/history?limit=100'),
      ]);
      if (!aRes.response.ok) throw new Error(aRes.data?.detail || 'Failed to load analytics.');
      setAnalytics(aRes.data);
      setHistory(hRes.response.ok ? hRes.data?.history || [] : []);
    } catch (err) {
      setError(err.message || 'Could not load analytics.');
      setAnalytics(null);
      setHistory([]);
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

  const activityData = computeDailyActivity(history);
  const confidenceData = computeDailyConfidence(history);

  const cropBarItems = [
    { label: 'Citrus', count: cropDistribution.citrus || 0, color: '#e77b35' },
    { label: 'Guava', count: cropDistribution.guava || 0, color: '#257542' },
  ];

  const diseaseBarItems = distribution.map((item, i) => ({
    label: `${item.crop} - ${item.disease}`,
    count: item.count,
    sublabel: item.status,
    color: item.status === 'healthy' ? '#2e7d32' : '#d97706',
  }));

  return (
    <main className="w-full min-w-0">
      <PageIntro
        back={() => navigate('dashboard')}
        icon={<BarChart3 />}
        title="Analytics & Data Visualizations"
        copy="Detailed breakdown of your recorded leaf scans - scan activity trends, confidence over time, disease distribution, and crop analysis."
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
          <span>Live analytics computed dynamically from your authenticated scan records.</span>
        </div>
        <button className="button button-primary" onClick={load}>
          {loading ? 'Refreshing...' : 'Refresh analytics'} <ArrowRight size={16} />
        </button>
      </div>

      {analytics && (
        <>
          <div className="kpi-grid mb-8">
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

          {/* Section 1: Line Charts */}
          <section className="mb-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ActivityLineChart
                data={activityData}
                mode="count"
                title="1. Prediction Activity Over Time"
                subtitle="Date vs Number of analyzed leaf scans"
                height={240}
              />
              <ActivityLineChart
                data={confidenceData}
                mode="confidence"
                title="5. Average Prediction Confidence Over Time"
                subtitle="Date vs Average confidence score (%)"
                height={240}
              />
            </div>
          </section>

          {/* Section 2: Bar Charts & Donut Chart */}
          <section className="mb-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <CropBarChart
                  items={cropBarItems}
                  title="2. Guava vs Citrus Analysis"
                  subtitle="Total scans by crop type"
                  height={220}
                />
              </div>
              <div className="lg:col-span-2">
                <CropBarChart
                  items={diseaseBarItems}
                  title="3. Disease-Wise Prediction Count"
                  subtitle="Scans count per disease class"
                  height={220}
                />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <HealthDonutChart
                  healthyCount={analytics.healthy_count || 0}
                  diseasedCount={analytics.diseased_count || 0}
                  title="4. Healthy vs Diseased Distribution"
                  subtitle="Health ratio of all analyzed leaves"
                />
              </div>

              {/* Table view of disease distribution */}
              <div className="lg:col-span-2 history-section m-0">
                <div className="section-heading">
                  <div>
                    <span className="section-label">DISEASE FREQUENCY</span>
                    <h2>Detailed scan findings</h2>
                  </div>
                  <BarChart3 size={19} />
                </div>
                {distribution.length ? (
                  <div className="history-table">
                    {distribution.map((item) => (
                      <div className="history-row" key={`${item.crop}-${item.disease}`}>
                        <span>{item.crop}</span>
                        <strong>{item.disease}</strong>
                        <span className={item.status === 'healthy' ? 'good' : 'warn'}>{item.status}</span>
                        <strong>{item.count} {item.count === 1 ? 'scan' : 'scans'}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="table-empty">No disease distribution recorded yet - run predictions first.</p>
                )}
              </div>
            </div>
          </section>

          {benchmarks.length > 0 && (
            <section className="history-section mt-8">
              <div className="section-heading">
                <div>
                  <span className="section-label">MODEL BENCHMARKS</span>
                  <h2>Evaluated model accuracy</h2>
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