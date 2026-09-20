import React from 'react';
import { Sprout } from 'lucide-react';
import ReportSection from './ReportSection';

export default function LongTermPrevention({ report, content }) {
  const ltp = report.long_term_prevention || {};
  const hygiene = Array.isArray(ltp.universal_hygiene_practices) ? ltp.universal_hygiene_practices : [];
  const monitoring = Array.isArray(ltp.long_term_monitoring) ? ltp.long_term_monitoring : [];

  return (
    <ReportSection index={4} icon={<Sprout size={16} />} title="Long-Term Prevention">
      {ltp.inspection_frequency ? (
        <p className="report-lead">
          Inspection frequency: <strong>{ltp.inspection_frequency}</strong>
        </p>
      ) : null}
      {hygiene.length ? (
        <>
          <h4 className="report-sub-title">Recurring hygiene habits</h4>
          <ul className="report-bullets">
            {hygiene.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </>
      ) : null}
      {monitoring.length ? (
        <>
          <h4 className="report-sub-title">Ongoing monitoring routine</h4>
          <ul className="report-bullets">
            {monitoring.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </>
      ) : null}
    </ReportSection>
  );
}