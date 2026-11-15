import React, { useState } from 'react';

export function MonthlyAppointmentsChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.appointments), 350);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (idx) => paddingX + (idx / (data.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val) => chartHeight - paddingY - ((val / maxVal) * (chartHeight - paddingY * 2));

  // Build SVG Path
  const points = data.map((d, i) => `${getX(i)},${getY(d.appointments)}`).join(' ');
  const areaPoints = `${getX(0)},${chartHeight - paddingY} ` + points + ` ${getX(data.length - 1)},${chartHeight - paddingY}`;

  return (
    <div className="w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 100, 200, 300].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#chartGrad)" />

          {/* Line */}
          <polyline fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Data Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.appointments);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                <text x={cx} y={chartHeight - 4} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
                  {d.month}
                </text>
                {isHovered && (
                  <g>
                    <rect x={cx - 45} y={cy - 38} width="90" height="28" rx="6" fill="#0f172a" />
                    <text x={cx} y={cy - 24} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                      {d.appointments} Appts
                    </text>
                    <text x={cx} y={cy - 14} textAnchor="middle" fontSize="9" fill="#38bdf8">
                      ₹{(d.revenue / 1000).toFixed(0)}k Rev
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function DepartmentDistributionChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const colors = ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];

  return (
    <div className="space-y-3">
      {/* Segmented multi-colored bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
        {data.map((dept, i) => {
          const pct = ((dept.count / total) * 100).toFixed(1);
          return (
            <div
              key={dept.name}
              style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
              title={`${dept.name}: ${dept.count} (${pct}%)`}
              className="h-full hover:opacity-80 transition cursor-pointer"
            />
          );
        })}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
        {data.map((dept, i) => {
          const pct = ((dept.count / total) * 100).toFixed(0);
          return (
            <div key={dept.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
              <div className="text-xs truncate">
                <span className="font-bold text-slate-800 block truncate">{dept.name}</span>
                <span className="text-slate-500 text-[10px]">{dept.count} patients ({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
