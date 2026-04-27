import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeals } from '../../../lib/dataService';
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

export default function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getMeals(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        setMeals(data ?? []);
        setError(error ?? null);
      })
      .catch((error) => {
        if (!cancelled) {
          setMeals([]);
          setError(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    if (!meals) return [];

    const grouped = meals.reduce((acc, meal) => {
      const date = meal.logged_at ?? meal.created_at;
      const dayKey = new Date(date).toDateString();

      if (!acc.has(dayKey)) acc.set(dayKey, []);
      acc.get(dayKey).push(meal);
      return acc;
    }, new Map());

    return [...grouped.entries()];
  }, [meals]);

  if (meals === null) {
    return <div className="p-md text-text-secondary">Loading...</div>;
  }

  if (meals.length === 0) {
    return (
      <EmptyState
        icon="restaurant"
        title="No meals logged"
        description="Track what you eat to see how it affects your glucose."
        action="Log a meal"
        onAction={() => navigate('/dashboard/meals/log')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Meals</h1>
        <p className="font-body text-body-base text-text-secondary">A day-by-day view of recent carbs.</p>
      </div>

      {error && <p className="text-glucose-low text-body-base">Some meals could not load.</p>}

      {groups.map(([day, items]) => (
        <section key={day} className="flex flex-col gap-sm">
          <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">{formatDay(day)}</h2>
          <div className="flex flex-col gap-2">
            {items.map((meal) => (
              <ActivityRow
                key={meal.id ?? meal.logged_at}
                type="meal"
                title={meal.meal_type ?? 'Meal'}
                subtitle={meal.food_name ?? meal.notes ?? 'Logged meal'}
                value={meal.carbs ?? 0}
                unit="g"
                time={formatTime(meal.logged_at ?? meal.created_at)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
