import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceArea, Tooltip } from 'recharts';
import { toDisplayGlucose } from '../../../lib/glucoseUnits';

export default function GlucoseChart({ readings, height = 160, unit = 'mg/dL', thresholds = { low: 70, high: 180 } }) {
  const data = (readings ?? []).map((reading) => ({
    t: new Date(reading.recorded_at).getTime(),
    value: toDisplayGlucose(reading.value, unit),
  }));
  const low = toDisplayGlucose(thresholds.low, unit);
  const high = toDisplayGlucose(thresholds.high, unit);
  const domain = unit === 'mmol/L' ? [2.2, 14] : [40, 250];

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <ReferenceArea y1={low} y2={high} fill="var(--glucose-normal)" fillOpacity={0.06} stroke="var(--glucose-normal)" strokeOpacity={0.12} />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
            stroke="var(--text-muted)"
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'rgba(45,212,168,0.08)' }}
            tickLine={false}
          />
          <YAxis hide domain={domain} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
            labelFormatter={(t) => new Date(t).toLocaleString()}
            formatter={(value) => [`${value} ${unit}`, 'Glucose']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
