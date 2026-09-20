import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import ReportSection from './ReportSection';

export default function ImmediateAction({ report, content }) {
  const actions = Array.isArray(report.immediate_actions) && report.immediate_actions.length
    ? report.immediate_actions
    : ['Confirm the diagnosis with a local agricultural expert before making changes in the field.'];

  return (
    <ReportSection index={2} icon={<Zap size={16} />} title="Immediate Action" tone="alert">
      <p className="report-lead">Start with these steps right away. They focus on containment and hygiene first.</p>
      <ol className="report-check-list">
        {actions.map((action, index) => (
          <li key={index}>
            <CheckCircle2 size={16} />
            <span>{action}</span>
          </li>
        ))}
      </ol>
    </ReportSection>
  );
}