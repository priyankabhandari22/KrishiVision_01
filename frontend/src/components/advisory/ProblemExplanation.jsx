import React from 'react';
import { BookOpen } from 'lucide-react';
import ReportSection from './ReportSection';

export default function ProblemExplanation({ report, content }) {
  return (
    <ReportSection index={1} icon={<BookOpen size={16} />} title="Problem Explanation">
      <p className="report-lead">{report.explanation || content.displayTitle}</p>
      <ul className="report-key-points">
        {content.keyPoints.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </ReportSection>
  );
}