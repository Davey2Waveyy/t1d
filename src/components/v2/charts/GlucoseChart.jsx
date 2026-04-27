import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceArea, Tooltip } from 'recharts';

export default function GlucoseChart({ readings, height = 160 }) {
  const data = (readings ?? []).map((reading) => ({
    t: new Date(reading.recorded_at).getTime(),
    value: reading.value,
  }));

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <ReferenceArea y1={70} y2={180} fill="#2DD4A8" fillOpacity={0.05} stroke="#2DD4A8" strokeOpacity={0.1} />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
            stroke="#4A6B60"
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'rgba(45,212,168,0.08)' }}
            tickLine={false}
          />
          <YAxis hide domain={[40, 250]} />
          <Tooltip
            contentStyle={{
              background: '#0D1B16',
              border: '1px solid rgba(45,212,168,0.15)',
              borderRadius: 8,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              color: '#E8F5F0',
            }}
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2DD4A8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#2DD4A8' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
