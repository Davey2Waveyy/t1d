import { useNavigate } from 'react-router-dom';
import Sheet from '../ui/Sheet';

const actions = [
  { to: '/dashboard/glucose/log', icon: 'water_drop', label: 'Glucose', description: 'Add a blood glucose reading' },
  { to: '/dashboard/meals/log', icon: 'restaurant', label: 'Meal', description: 'Log carbs, protein, fat, and timing' },
  { to: '/dashboard/insulin/log', icon: 'vaccines', label: 'Insulin', description: 'Record bolus or basal dose' },
];

export default function LogActionSheet({ open, onOpenChange }) {
  const navigate = useNavigate();

  const choose = (to) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Log entry">
      <div className="flex flex-col gap-sm">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => choose(action.to)}
            className="w-full flex items-center gap-md p-md bg-surface-raised border border-border-subtle rounded-xl text-left active:scale-[0.98] transition-transform"
          >
            <span className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">{action.icon}</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-text-primary font-body font-semibold">{action.label}</span>
              <span className="block text-text-secondary text-[13px] leading-snug">{action.description}</span>
            </span>
            <span className="material-symbols-outlined text-text-muted">chevron_right</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
