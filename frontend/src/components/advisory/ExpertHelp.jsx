import React from 'react';
import { PhoneCall } from 'lucide-react';
import ReportSection from './ReportSection';

export default function ExpertHelp({ content }) {
  return (
    <ReportSection index={7} icon={<PhoneCall size={16} />} title="When to Contact an Expert">
      <p className="report-lead">
        Contact your local agricultural department or extension officer if any of the following apply:
      </p>
      <ul className="report-bullets">
        {content.expertHelp.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </ReportSection>
  );
}