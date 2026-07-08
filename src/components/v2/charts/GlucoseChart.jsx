import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceArea, Tooltip } from 'recharts';
import { toDisplayGlucose } from '../../../lib/glucoseUnits';

export default function GlucoseChart({ readings, height = 180, unit = 'mg/dL', thresholds = { low: 70, high: 180 } }) {
  const data = (readings ?? []).map((reading) => ({
    t: new Date(reading.recorded_at).getTime(),
    value: toDisplayGlucose(reading.value, unit),
  }));
  const low = toDisplayGlucose(thresholds.low, unit);
  const high = toDisplayGlucose(thresholds.high, unit);
  const domain = unit === 'mmol/L' ? [2.2, 14] : [40, 250];

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-2xl p-4 shadow-raise" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="glucoseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceArea y1={low} y2={high} fill="var(--glucose-normal)" fillOpacity={0.05} stroke="var(--glucose-normal)" strokeOpacity={0.14} strokeDasharray="3 5" />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
            stroke="var(--text-muted)"
            tick={{ fontSize: 10, fontFamily: 'Spline Sans Mono' }}
            axisLine={{ stroke: 'rgba(45,212,168,0.1)' }}
            tickLine={false}
            minTickGap={42}
          />
          <YAxis hide domain={domain} />
          <Tooltip
            cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }}
            contentStyle={{
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              fontFamily: 'Spline Sans Mono',
              fontSize: 12,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-pop)',
            }}
            labelFormatter={(t) => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
            formatter={(value) => [`${value} ${unit}`, 'Glucose']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#glucoseFill)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', stroke: 'var(--surface-base)', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
