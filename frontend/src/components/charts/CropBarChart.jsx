import React, { useState } from 'react';

export default function CropBarChart({
  items = [], // [{ label: string, count: number, color?: string, sublabel?: string }]
  title = 'Crop Analysis',
  subtitle = 'Distribution by crop',
  height = 220,
}) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <span className="section-label">COMPARISON</span>
            <h3 className="chart-title">{title}</h3>
            <p className="chart-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="chart-empty" style={{ height: `${height}px` }}>
          <span>No categorical scan data available</span>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...items.map((i) => i.count || 0), 1);
  const totalScans = items.reduce((sum, i) => sum + (i.count || 0), 0);

  const defaultColors = ['#e77b35', '#257542', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <span className="section-label">COMPARISON</span>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
        <div className="chart-total-badge">
          <strong>{totalScans}</strong>
          <span>Total Scans</span>
        </div>
      </div>

      <div className="bar-chart-body" style={{ minHeight: `${height - 70}px` }}>
        {items.map((item, index) => {
          const count = item.count || 0;
          const percentage = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : '0.0';
          const barWidthPercent = maxVal > 0 ? (count / maxVal) * 100 : 0;
          const barColor = item.color || defaultColors[index % defaultColors.length];

          return (
            <div
              key={item.label || index}
              className="bar-chart-row"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="bar-row-label">
                <span className="bar-color-indicator" style={{ background: barColor }} />
                <span className="bar-label-text">{item.label}</span>
                {item.sublabel && <small className="bar-sublabel">{item.sublabel}</small>}
              </div>

              <div className="bar-track-wrap">
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.max(barWidthPercent, count > 0 ? 4 : 0)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <span className="bar-row-value">
                  {count} <small>({percentage}%)</small>
                </span>
              </div>

              {hoveredBar === index && (
                <div className="bar-tooltip">
                  <strong>{item.label}</strong>
                  <span>{count} scans ({percentage}%)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
