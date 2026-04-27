import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInsulinDoses } from '../../../lib/dataService';
import ActivityRow from '../cards/ActivityRow';
import EmptyState from '../ui/EmptyState';

function formatDay(dateValue) {
  const date = new Date(dateValue);
  const today = new Date();
  const day = new Date(date);

  today.setHours(0, 0, 0, 0);
  day.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - day) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MoreInsulin() {
  const navigate = useNavigate();
  const [doses, setDoses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getInsulinDoses(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        setDoses(data ?? []);
        setError(error ?? null);
      })
      .catch((error) => {
        if (!cancelled) {
          setDoses([]);
          setError(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    if (!doses) return [];

    const grouped = doses.reduce((acc, dose) => {
      const date = dose.logged_at ?? dose.created_at;
      const dayKey = new Date(date).toDateString();

      if (!acc.has(dayKey)) acc.set(dayKey, []);
      acc.get(dayKey).push(dose);
      return acc;
    }, new Map());

    return [...grouped.entries()];
  }, [doses]);

  if (doses === null) {
    return <div className="p-md text-text-secondary">Loading...</div>;
  }

  if (doses.length === 0) {
    return (
      <EmptyState
        icon="vaccines"
        title="No insulin logged"
        description="Log doses to keep your history close to your glucose and meals."
        action="Log insulin"
        onAction={() => navigate('/dashboard/insulin/log')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Insulin</h1>
        <p className="font-body text-body-base text-text-secondary">Recent bolus, basal, and correction doses.</p>
      </div>

      {error && <p className="text-glucose-low text-body-base">Some insulin doses could not load.</p>}

      {groups.map(([day, items]) => (
        <section key={day} className="flex flex-col gap-sm">
          <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">{formatDay(day)}</h2>
          <div className="flex flex-col gap-2">
            {items.map((dose) => (
              <ActivityRow
                key={dose.id ?? dose.logged_at}
                type="insulin"
                title={dose.insulin_type ?? 'Insulin'}
                subtitle={dose.brand ?? dose.injection_site ?? 'Dose'}
                value={dose.units ?? 0}
                unit="u"
                time={formatTime(dose.logged_at ?? dose.created_at)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
