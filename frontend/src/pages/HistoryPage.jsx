import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, CircleAlert, Search } from 'lucide-react';
import PageIntro from '../components/PageIntro';
import { API, apiFetch } from '../api';

function HistoryPage({ history, setHistory, setReport, navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openHistoryReport = (item) => {
    const savedReport = item.full_advisory || item;
    setReport({
      ...savedReport,
      crop: savedReport.crop || item.crop,
      disease: savedReport.disease || item.disease,
      status: savedReport.status || item.status,
      confidence: savedReport.confidence ?? item.confidence,
      is_confident: savedReport.is_confident ?? item.is_confident,
      heatmap_path: savedReport.heatmap_path || item.heatmap_path,
      timestamp: item.timestamp,
      preview: '',
    });
    navigate('farmer');
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { response, data } = await apiFetch('/history?limit=100');
      if (!response.ok) throw new Error(data?.detail || 'Failed to load history.');
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || 'Could not load detection history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="w-full min-w-0">
      <PageIntro
        back={() => navigate('dashboard')}
        icon={<BookOpen />}
        title="Detection history"
        copy="The leaf scans saved to your account, newest first. Open a record to see the full report - your records stay private to you."
      />
      <div className="dashboard-actions">
        <div className="integration-note">
          <CircleAlert size={16} />
          <span>Only predictions recorded to your account are shown here.</span>
        </div>
        <button className="button button-primary" onClick={load}>
          {loading ? 'Refreshing...' : 'Refresh history'} <ArrowRight size={16} />
        </button>
      </div>
      {error && (
        <div className="error-box">
          <CircleAlert size={17} /> {error}
        </div>
      )}
      <section className="history-section">
        <div className="section-heading">
          <div>
            <span className="section-label">PREDICTION HISTORY</span>
            <h2>Recent field reports</h2>
          </div>
          <Search size={19} />
        </div>
        <div className="history-table">
          {loading ? (
            <p className="table-empty">Loading your detection history…</p>
          ) : history.length ? (
            history.map((item) => {
              const report = item.full_advisory || item;
              const crop = report.crop || item.crop;
              const disease = report.disease || item.disease;
              const status = report.status || item.status;
              const confidence = report.confidence ?? item.confidence;
              return (
                <button
                  className="history-row"
                  key={item.id || item.timestamp}
                  onClick={() => openHistoryReport(item)}
                >
                  <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                  <strong>{crop || 'Unknown crop'} · {disease || 'Unknown disease'}</strong>
                  <span>{confidence != null ? `${Math.round(confidence * 100)}% confidence` : 'Confidence unavailable'}</span>
                  <span className={status === 'healthy' ? 'good' : 'warn'}>{status || 'Unknown status'}</span>
                  <ArrowRight size={15} />
                </button>
              );
            })
          ) : (
            <p className="table-empty">
              {error ? 'Could not load detection history.' : 'Run a farmer prediction to populate this table.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default HistoryPage;