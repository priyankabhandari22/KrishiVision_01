import React from 'react';

function Kpi({ label, value, icon, tone }) {
  return (
    <article className={`kpi ${tone || ''}`}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value ?? '—'}</strong>
    </article>
  );
}

export default Kpi;