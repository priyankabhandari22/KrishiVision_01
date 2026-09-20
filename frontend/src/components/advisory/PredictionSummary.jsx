import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { API } from '../../api';

export default function PredictionSummary({ report, displayTitle, percent }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const heatmapUrl = report.heatmap_path ? `${API}${report.heatmap_path}` : '';
  const showHeatmapImage = showHeatmap && heatmapUrl;
  const showOriginal = !showHeatmap && report.preview;
  const figureCount = (report.preview ? 1 : 0) + (heatmapUrl && report.preview ? 1 : 0);

  return (
    <section className="report-section prediction-summary">
      <header className="report-section-head">
        <span className="report-section-index">02</span>
        <span className="report-section-icon"><ScanLine size={16} /></span>
        <h3>Prediction result</h3>
      </header>
      <div className="result-banner">
        <div className="result-banner-copy">
          <span className="result-kicker">Uploaded leaf classified as</span>
          <h4>{displayTitle}</h4>
          <p>
            This report describes only this uploaded leaf and does not represent the{' '}
            whole farm or orchard. The leaf was classified by the ResNet50 model with a
            Grad-CAM explanation.
          </p>
        </div>
        <div className="confidence-badge">
          <strong>{percent == null ? '—' : `${percent}%`}</strong>
          <span>confidence</span>
        </div>
      </div>
      <div className={`evidence-grid${figureCount === 1 ? ' evidence-grid-single' : ''}`}>
        {report.preview ? (
          <figure className="evidence-figure">
            <figcaption>Uploaded leaf</figcaption>
            <img src={report.preview} alt="Uploaded leaf" />
          </figure>
        ) : null}
        {heatmapUrl && report.preview ? (
          <button
            type="button"
            className="evidence-figure evidence-toggle"
            onClick={() => setShowHeatmap((value) => !value)}
          >
            <figcaption>{showHeatmap ? 'Grad-CAM heatmap' : 'Uploaded leaf'}</figcaption>
            {showHeatmapImage || showOriginal ? (
              <img src={showHeatmapImage || showOriginal} alt={showHeatmap ? 'Grad-CAM heatmap' : 'Uploaded leaf'} />
            ) : null}
            <span className="evidence-switch">Click to {showHeatmap ? 'hide heatmap' : 'show heatmap'}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}