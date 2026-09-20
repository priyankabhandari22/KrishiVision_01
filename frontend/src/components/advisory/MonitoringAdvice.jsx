import React from 'react';
import { Eye } from 'lucide-react';
import ReportSection from './ReportSection';

export default function MonitoringAdvice({ report, content }) {
  const ltp = report.long_term_prevention || {};

  return (
    <ReportSection index={6} icon={<Eye size={16} />} title="Monitoring Advice">
      {ltp.inspection_guidance ? (
        <p className="report-guidance">{ltp.inspection_guidance}</p>
      ) : null}
      <p className="report-lead">What to observe from week to week:</p>
      <ul className="report-bullets">
        {content.monitoring.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </ReportSection>
  );
}