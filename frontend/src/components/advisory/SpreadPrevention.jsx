import React from 'react';
import { ShieldCheck } from 'lucide-react';
import ReportSection from './ReportSection';

export default function SpreadPrevention({ report, content }) {
  const steps = Array.isArray(report.spread_prevention) && report.spread_prevention.length
    ? report.spread_prevention
    : ['Avoid moving infected plant material between trees.', 'Disinfect tools between plants.'];

  return (
    <ReportSection index={3} icon={<ShieldCheck size={16} />} title="Disease Spread Prevention">
      <p className="report-lead">These habits stop the condition from moving to healthy plants.</p>
      <ul className="report-bullets">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </ReportSection>
  );
}