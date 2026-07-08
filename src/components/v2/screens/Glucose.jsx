import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateStats, getGlucoseReadings } from '../../../lib/dataService';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useSettings } from '../../../contexts/SettingsContext';
import { getThresholds, toDisplayGlucose } from '../../../lib/glucoseUnits';
import ActivityRow from '../cards/ActivityRow';
import StatCard from '../cards/StatCard';
import GlucoseChart from '../charts/GlucoseChart';
import TimeInRangeBar from '../charts/TimeInRangeBar';
import EmptyState from '../ui/EmptyState';
import ScreenSkeleton from '../ui/Skeleton';

const RANGES = [
  { key: '24H', label: '24H', hours: 24 },
  { key: '7D', label: '7D', hours: 24 * 7 },
  { key: '30D', label: '30D', hours: 24 * 30 },
  { key: '90D', label: '90D', hours: 24 * 90 },
];

function formatClock(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSubtitle(reading, thresholds) {
  const date = new Date(reading.recorded_at);
  const label = Number(reading.value) > thresholds.high ? 'Above range' : Number(reading.value) < thresholds.low ? 'Below range' : 'In target';

  return `${label} - ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

export default function Glucose() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const dashboardData = useDashboardData();
  const [range, setRange] = useState(RANGES[0]);
  const [rangeReadings, setRangeReadings] = useState([]);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState(null);

  const handleRangeChange = (item) => {
    setRange(item);
    if (item.hours !== 24) {
      setRangeLoading(true);
      setRangeError(null);
    }
  };

  useEffect(() => {
    if (range.hours === 24) {
      return;
    }

    let cancelled = false;
    getGlucoseReadings(range.hours)
      .then(({ data, error }) => {
        if (cancelled) return;
        setRangeReadings(data ?? []);
        setRangeError(error ?? null);
      })
      .catch((error) => {
        if (!cancelled) setRangeError(error);
      })
      .finally(() => {
        if (!cancelled) setRangeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const readings = range.hours === 24 ? dashboardData.glucose : rangeReadings;
  const loading = range.hours === 24 ? dashboardData.loading : rangeLoading;
  const error = range.hours === 24 ? dashboardData.error : rangeError;
  const stats = useMemo(
    () => (range.hours === 24 ? dashboardData.stats : calculateStats(readings, [], [], getThresholds(settings))),
    [dashboardData.stats, range.hours, readings, settings],
  );
  const thresholds = getThresholds(settings);

  if (loading) {
    return <ScreenSkeleton rows={2} />;
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Glucose Trends</h1>
        <p className="font-body text-body-base text-text-secondary">
          Review patterns, range balance, and recent readings.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-sm bg-surface-input rounded-lg p-1">
        {RANGES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleRangeChange(item)}
            className={`py-sm rounded font-mono text-data-mono transition-colors ${
              range.key === item.key ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="text-glucose-low text-body-base">Some glucose data could not load.</p>}

      {readings.length === 0 ? (
        <EmptyState
          icon="show_chart"
          title="No glucose data in this range"
          description="Try a different time range or log your first reading."
          action="Log a reading"
          onAction={() => navigate('/dashboard/glucose/log', { state: { background: '/dashboard/glucose' } })}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-sm">
            <StatCard label="Avg Glucose" value={toDisplayGlucose(stats?.avgGlucose, settings.glucoseUnit)} unit={settings.glucoseUnit} />
            <StatCard label="GMI" value={stats?.estimatedA1C} unit="%" />
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-end">
              <h2 className="font-body text-[18px] font-semibold text-text-primary">Trend</h2>
              <span className="font-mono text-data-mono text-text-muted">Last {range.label}</span>
            </div>
            <GlucoseChart readings={readings} height={220} unit={settings.glucoseUnit} thresholds={thresholds} />
          </div>

          <TimeInRangeBar readings={readings} thresholds={thresholds} />

          <div className="flex flex-col gap-sm">
            <h2 className="font-body text-[18px] font-semibold text-text-primary">Recent Logs</h2>
            <div className="flex flex-col gap-2">
              {[...readings].reverse().slice(0, 5).map((reading) => (
                <ActivityRow
                  key={reading.id ?? reading.recorded_at}
                  type="glucose"
                  title={reading.notes || 'Glucose reading'}
                  subtitle={formatSubtitle(reading, thresholds)}
                  value={toDisplayGlucose(reading.value, settings.glucoseUnit)}
                  unit={` ${settings.glucoseUnit}`}
                  time={formatClock(reading.recorded_at)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
