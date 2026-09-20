import React from 'react';
import { ExternalLink } from 'lucide-react';
import ReportSection from './ReportSection';
import { RESOURCES } from '../../data/diseaseContent';

export default function HelpfulResources({ content }) {
  const resources = content.resources.map((key) => RESOURCES[key]).filter(Boolean);

  return (
    <ReportSection index={8} icon={<ExternalLink size={16} />} title="Helpful Resources">
      <p className="report-lead">Verified sources for further reading. Each link opens in a new tab.</p>
      <div className="resource-list">
        {resources.map((resource) => (
          <a
            className="resource-card"
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            key={resource.url}
          >
            <span className="resource-icon"><ExternalLink size={15} /></span>
            <span className="resource-text">
              <strong>{resource.title}</strong>
              <small>{resource.note}</small>
            </span>
          </a>
        ))}
      </div>
    </ReportSection>
  );
}