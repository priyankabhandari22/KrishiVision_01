import React from 'react';

export default function ReportSection({ index, icon, title, children, tone }) {
  return (
    <section className={`report-section${tone ? ` report-${tone}` : ''}`}>
      <header className="report-section-head">
        {index ? <span className="report-section-index">{index}</span> : null}
        {icon ? <span className="report-section-icon">{icon}</span> : null}
        <h3>{title}</h3>
      </header>
      <div className="report-section-body">{children}</div>
    </section>
  );
}