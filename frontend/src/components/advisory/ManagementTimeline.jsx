import React from 'react';
import { CalendarClock } from 'lucide-react';
import ReportSection from './ReportSection';

export default function ManagementTimeline({ content, note }) {
  return (
    <ReportSection index={5} icon={<CalendarClock size={16} />} title="Expected Management Timeline">
      <p className="report-lead">An estimated management schedule, not a promise of recovery dates.</p>
      <div className="timeline-stack">
        {content.timeline.map((entry) => (
          <div className="timeline-entry" key={entry.period}>
            <span className="timeline-period">{entry.period}</span>
            <div className="timeline-entry-copy">
              <strong>{entry.title}</strong>
              <p>{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="report-note">{note}</p>
    </ReportSection>
  );
}