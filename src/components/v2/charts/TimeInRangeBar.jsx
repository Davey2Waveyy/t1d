const ROWS = [
  {
    key: 'high',
    label: 'HIGH',
    textClass: 'text-glucose-high',
    barClass: 'bg-glucose-high',
  },
  {
    key: 'inRange',
    label: 'TARGET',
    textClass: 'text-glucose-normal',
    barClass: 'bg-glucose-normal',
  },
  {
    key: 'low',
    label: 'LOW',
    textClass: 'text-glucose-low',
    barClass: 'bg-glucose-low',
  },
];

function calculatePercentages(readings, thresholds) {
  const total = readings?.length ?? 0;

  if (total === 0) {
    return { high: 0, inRange: 0, low: 0 };
  }

  const counts = {
    high: readings.filter((reading) => Number(reading.value) > thresholds.high).length,
    inRange: readings.filter((reading) => {
      const value = Number(reading.value);
      return value >= thresholds.low && value <= thresholds.high;
    }).length,
    low: readings.filter((reading) => Number(reading.value) < thresholds.low).length,
  };

  const exact = ROWS.map((row) => ({
    key: row.key,
    value: (counts[row.key] / total) * 100,
  }));
  const floored = exact.map((item) => ({
    ...item,
    percent: Math.floor(item.value),
    remainder: item.value % 1,
  }));
  let remaining = 100 - floored.reduce((sum, item) => sum + item.percent, 0);

  return floored
    .sort((a, b) => b.remainder - a.remainder)
    .reduce((result, item) => {
      result[item.key] = item.percent + (remaining > 0 ? 1 : 0);
      remaining -= remaining > 0 ? 1 : 0;
      return result;
    }, {});
}

export default function TimeInRangeBar({ readings, thresholds = { low: 70, high: 180 } }) {
  const percentages = calculatePercentages(readings, thresholds);

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col gap-md">
      <h3 className="font-body text-title-lg text-text-primary">Time in Range</h3>
      <div className="flex flex-col gap-sm">
        {ROWS.map((row) => {
          const value = percentages[row.key];

          return (
            <div key={row.key} className="flex items-center gap-md">
              <span className={`w-12 text-label-caps ${row.textClass} uppercase tracking-widest`}>
                {row.label}
              </span>
              <div className="flex-1 h-2 bg-surface-input rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.barClass} rounded-full transition-[width] duration-300 ease-out-strong`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-data-mono text-text-secondary">
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
