import React, { useState } from 'react';

export default function ActivityLineChart({
  data = [],
  mode = 'count', // 'count' | 'confidence'
  title = 'Activity over time',
  subtitle = 'Daily scan count',
  height = 220,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <span className="section-label">TREND</span>
            <h3 className="chart-title">{title}</h3>
            <p className="chart-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="chart-empty" style={{ height: `${height}px` }}>
          <span>No scan activity recorded yet</span>
        </div>
      </div>
    );
  }

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const width = 600; // SVG viewBox width

  const values = data.map((d) => (mode === 'confidence' ? (d.confidence || 0) * 100 : d.count || 0));
  const maxValue = mode === 'confidence' ? 100 : Math.max(...values, 5);
  const minValue = mode === 'confidence' ? Math.max(0, Math.min(...values, 50) - 10) : 0;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index) => {
    if (data.length === 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (data.length - 1)) * chartW;
  };

  const getY = (val) => {
    const range = maxValue - minValue || 1;
    return paddingTop + chartH - ((val - minValue) / range) * chartH;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(mode === 'confidence' ? (d.confidence || 0) * 100 : d.count || 0),
    val: mode === 'confidence' ? (d.confidence || 0) * 100 : d.count || 0,
    date: d.date,
  }));

  const pathD = points.length === 1
    ? `M ${points[0].x - 20},${points[0].y} L ${points[0].x + 20},${points[0].y}`
    : points.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '');

  const areaD = points.length === 1
    ? ''
    : `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  // Grid ticks
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minValue + (maxValue - minValue) * (1 - ratio);
    const y = paddingTop + chartH * ratio;
    return { val, y };
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <span className="section-label">{mode === 'confidence' ? 'CONFIDENCE TREND' : 'SCAN ACTIVITY'}</span>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
        <div className="chart-legend">
          <span className="legend-indicator" style={{ background: mode === 'confidence' ? '#e77b35' : '#257542' }} />
          <span>{mode === 'confidence' ? 'Avg Confidence (%)' : 'Scans Count'}</span>
        </div>
      </div>

      <div className="chart-svg-container" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={`lineGrad-${mode}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mode === 'confidence' ? '#e77b35' : '#257542'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={mode === 'confidence' ? '#e77b35' : '#257542'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={`ytick-${i}`}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#e2e8df"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#66726b"
                fontFamily="sans-serif"
              >
                {mode === 'confidence' ? `${Math.round(tick.val)}%` : Math.round(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#lineGrad-${mode})`} />}

          {/* Line path */}
          <path
            d={pathD}
            fill="none"
            stroke={mode === 'confidence' ? '#e77b35' : '#257542'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={`pt-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === i ? 6 : 4}
                fill="#ffffff"
                stroke={mode === 'confidence' ? '#e77b35' : '#257542'}
                strokeWidth="2.5"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* X-axis date labels */}
              {(data.length <= 7 || i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#66726b"
                  fontFamily="sans-serif"
                >
                  {p.date}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(points[hoveredPoint].x / width) * 100}%`,
              top: `${(points[hoveredPoint].y / height) * 100}%`,
            }}
          >
            <strong>{points[hoveredPoint].date}</strong>
            <span>
              {mode === 'confidence'
                ? `${points[hoveredPoint].val.toFixed(1)}% Avg Confidence`
                : `${points[hoveredPoint].val} ${points[hoveredPoint].val === 1 ? 'Scan' : 'Scans'}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
