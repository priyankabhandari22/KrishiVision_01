import React, { useState } from 'react';

export default function HealthDonutChart({
  healthyCount = 0,
  diseasedCount = 0,
  title = 'Health Distribution',
  subtitle = 'Healthy vs Diseased ratio',
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const total = healthyCount + diseasedCount;
  const healthyPct = total > 0 ? (healthyCount / total) * 100 : 0;
  const diseasedPct = total > 0 ? (diseasedCount / total) * 100 : 0;

  if (total === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <span className="section-label">RATIO</span>
            <h3 className="chart-title">{title}</h3>
            <p className="chart-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="chart-empty" style={{ height: '200px' }}>
          <span>No scan health data recorded</span>
        </div>
      </div>
    );
  }

  // SVG Donut calculation using stroke-dasharray & stroke-dashoffset
  const radius = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  const healthyDash = (healthyPct / 100) * circumference;
  const diseasedDash = (diseasedPct / 100) * circumference;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <span className="section-label">HEALTH RATIO</span>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="donut-chart-layout">
        <div className="donut-svg-wrap" style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#e5eae1"
              strokeWidth={strokeWidth}
            />

            {/* Healthy arc (Green) */}
            {healthyCount > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#2e7d32"
                strokeWidth={hoveredSlice === 'healthy' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${healthyDash} ${circumference}`}
                strokeDashoffset={0}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('healthy')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            )}

            {/* Diseased arc (Amber/Coral) */}
            {diseasedCount > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#d97706"
                strokeWidth={hoveredSlice === 'diseased' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${diseasedDash} ${circumference}`}
                strokeDashoffset={-healthyDash}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('diseased')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            )}
          </svg>

          {/* Donut Center Display */}
          <div className="donut-center-info">
            <strong>{total}</strong>
            <small>Scans</small>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          <div
            className={`legend-item ${hoveredSlice === 'healthy' ? 'active' : ''}`}
            onMouseEnter={() => setHoveredSlice('healthy')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="legend-item-left">
              <span className="donut-dot healthy" />
              <span>Healthy</span>
            </div>
            <strong>{healthyCount} <small>({healthyPct.toFixed(1)}%)</small></strong>
          </div>

          <div
            className={`legend-item ${hoveredSlice === 'diseased' ? 'active' : ''}`}
            onMouseEnter={() => setHoveredSlice('diseased')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="legend-item-left">
              <span className="donut-dot diseased" />
              <span>Diseased</span>
            </div>
            <strong>{diseasedCount} <small>({diseasedPct.toFixed(1)}%)</small></strong>
          </div>
        </div>
      </div>
    </div>
  );
}
