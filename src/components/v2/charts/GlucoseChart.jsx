import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Scatter, XAxis, YAxis, ReferenceArea, Tooltip } from 'recharts';
import { toDisplayGlucose } from '../../../lib/glucoseUnits';
import { buildGlucoseChartData, buildMealMarkerData } from './glucoseChartData';

function MealMarker({ cx, cy, payload }) {
  const label = `${payload.mealName}, ${payload.carbs} grams of carbs, ${new Date(payload.loggedAt).toLocaleString()}, source ${payload.source}`;

  return (
    <g role="img" tabIndex="0" aria-label={label}>
      <line x1={cx} y1={cy - 13} x2={cx} y2={cy + 6} stroke="var(--chart-carbs)" strokeWidth="2" />
      <path d={`M ${cx} ${cy - 17} l 6 6 l -6 6 l -6 -6 z`} fill="var(--chart-carbs)" stroke="var(--surface-base)" strokeWidth="1.5" />
    </g>
  );
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  const item = payload.find((entry) => entry.payload?.kind === 'meal')?.payload ?? payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-surface-overlay border border-border-default rounded-xl px-3 py-2 font-mono text-xs text-text-primary shadow-pop">
      <p>{new Date(item.loggedAt ?? label).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
      {item.kind === 'meal' ? (
        <>
          <p className="mt-1 text-chart-carbs">{item.mealName} - {item.carbs}g</p>
          <p className="text-text-muted capitalize">{item.mealType} - {item.source}</p>
        </>
      ) : (
        <p className="mt-1 text-primary">{item.value} {unit}</p>
      )}
    </div>
  );
}

export default function GlucoseChart({ readings, meals = [], height = 180, unit = 'mg/dL', thresholds = { low: 70, high: 180 } }) {
  const data = useMemo(() => buildGlucoseChartData(readings, unit), [readings, unit]);
  const low = toDisplayGlucose(thresholds.low, unit);
  const high = toDisplayGlucose(thresholds.high, unit);
  const domain = unit === 'mmol/L' ? [2.2, 14] : [40, 250];
  const mealY = domain[0] + (unit === 'mmol/L' ? 0.4 : 8);
  const mealData = useMemo(() => buildMealMarkerData(meals, readings, mealY), [meals, readings, mealY]);
  const spanMs = data.length > 1 ? data.at(-1).t - data[0].t : 0;
  const formatTick = (timestamp) => spanMs > 48 * 60 * 60 * 1000
    ? new Date(timestamp).toLocaleDateString([], { weekday: 'short' })
    : new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', hour12: true });

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-2xl p-4 shadow-raise" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
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
            tickFormatter={formatTick}
            stroke="var(--text-muted)"
            tick={{ fontSize: 10, fontFamily: 'Spline Sans Mono' }}
            axisLine={{ stroke: 'rgba(45,212,168,0.1)' }}
            tickLine={false}
            minTickGap={42}
          />
          <YAxis hide domain={domain} />
          <Tooltip
            cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }}
            content={<ChartTooltip unit={unit} />}
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
          {mealData.length > 0 && (
            <Scatter data={mealData} dataKey="mealY" name="Meals" shape={<MealMarker />} isAnimationActive={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <ul className="sr-only" aria-label="Meals shown on glucose chart">
        {mealData.map((meal) => (
          <li key={`${meal.t}-${meal.mealName}`}>
            {meal.mealName}, {meal.carbs} grams of carbs, {new Date(meal.loggedAt).toLocaleString()}, source {meal.source}
          </li>
        ))}
      </ul>
    </div>
  );
}
