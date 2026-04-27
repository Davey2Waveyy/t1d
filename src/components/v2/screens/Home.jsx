import { useNavigate } from 'react-router-dom';
import GlucoseHero from '../cards/GlucoseHero';
import StatCard from '../cards/StatCard';
import ActivityRow from '../cards/ActivityRow';
import GlucoseChart from '../charts/GlucoseChart';
import EmptyState from '../ui/EmptyState';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useAuth } from '../../../contexts/AuthContext';

function relTime(iso) {
  if (!iso) return null;

  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function formatClock(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, error, stats, glucose, meals, insulin, recentActivity } = useDashboardData();

  if (loading) return <div className="p-md text-text-secondary">Loading...</div>;

  const lastReading = glucose[glucose.length - 1];
  const isEmpty = !lastReading && meals.length === 0 && insulin.length === 0;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Good {greeting()}, {user?.email?.split('@')[0] ?? 'friend'}</h1>
        <p className="font-body text-body-base text-text-secondary">Here is your daily snapshot.</p>
      </div>

      {error && <p className="text-glucose-low text-body-base">Some dashboard data could not load.</p>}

      {isEmpty ? (
        <EmptyState
          icon="data_object"
          title="No data yet"
          description="Log your first reading to see your dashboard come to life."
          action="Log a reading"
          onAction={() => navigate('/dashboard/glucose/log')}
        />
      ) : (
        <>
          <GlucoseHero
            value={stats?.currentGlucose}
            trend={stats?.glucoseTrend}
            updatedAt={relTime(lastReading?.recorded_at)}
          />

          <div className="grid grid-cols-2 gap-sm">
            <StatCard label="Today's Carbs" value={stats?.carbsToday} unit="g" unitTone="chart-carbs" />
            <StatCard label="Last Insulin" value={insulin[0]?.units} unit="u" unitTone="chart-insulin" />
            <StatCard label="Time in Range" value={stats?.timeInRange} unit="%" />
            <StatCard label="A1C Est." value={stats?.estimatedA1C} unit="%" />
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-end">
              <h2 className="font-body text-[18px] font-semibold text-text-primary">24h Trend</h2>
              <button onClick={() => navigate('/dashboard/glucose')} className="font-mono text-data-mono text-primary flex items-center gap-1">
                Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
            <GlucoseChart readings={glucose} />
          </div>

          {recentActivity.length > 0 && (
            <div className="flex flex-col gap-sm">
              <h2 className="font-body text-[18px] font-semibold text-text-primary">Recent Activity</h2>
              <div className="flex flex-col gap-2">
                {recentActivity.map((activity) => (
                  <ActivityRow
                    {...activity}
                    key={activity.key}
                    time={formatClock(activity.occurredAt)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
