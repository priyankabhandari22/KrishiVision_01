import React from 'react';
import { Leaf } from 'lucide-react';

export default function ReportHeader({ crop, displayDisease, confidence, status, timestamp, reportId }) {
  return (
    <header className="report-header">
      <div className="report-header-brand">
        <span className="report-brand-mark"><Leaf size={18} /></span>
        <div>
          <h2>KrishiVision AI Advisory Report</h2>
          <p>Inference-first crop intelligence - single-leaf diagnosis with verified guidance</p>
        </div>
      </div>
      <div className="report-header-summary">
        <div className="report-summary-item"><span>Crop</span><strong>{crop || 'Not available'}</strong></div>
        <div className="report-summary-item"><span>Condition</span><strong>{displayDisease}</strong></div>
        <div className="report-summary-item"><span>Confidence</span><strong>{confidence == null ? 'N/A' : `${confidence}%`}</strong></div>
        <div className="report-summary-item"><span>Status</span><strong className={status === 'healthy' ? 'tone-good' : 'tone-warn'}>{status || 'Not available'}</strong></div>
        <div className="report-summary-item"><span>Generated</span><strong>{timestamp}</strong></div>
        {reportId ? <div className="report-summary-item"><span>Report ID</span><strong className="report-id">{reportId}</strong></div> : null}
      </div>
    </header>
  );
}