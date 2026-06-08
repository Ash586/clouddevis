'use client';

interface AdminMetricCardProps {
  value: string;
  label: string;
  trend?: string;
  trendColor?: string;
  color: string;
}

export function AdminMetricCard({ value, label, trend, trendColor, color }: AdminMetricCardProps) {
  return (
    <div
      style={{
        background: '#282c38',
        borderRadius: 7,
        padding: '9px 11px',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, color }}>
        {value}
      </div>
      <div style={{ fontSize: 9.5, color: '#656a73' }}>
        {label}
      </div>
      {trend && (
        <div style={{ fontSize: 9, marginTop: 2, color: trendColor || color }}>
          {trend}
        </div>
      )}
    </div>
  );
}
