import { useLocation, useNavigate } from 'react-router-dom';
import Sheet from '../ui/Sheet';

const actions = [
  { to: '/dashboard/glucose/log', icon: 'water_drop', label: 'Glucose', description: 'Add a blood glucose reading', tone: 'text-glucose-normal bg-glucose-normal/10 border-glucose-normal/30' },
  { to: '/dashboard/meals/log', icon: 'restaurant', label: 'Meal', description: 'Log carbs, protein, fat, and timing', tone: 'text-chart-carbs bg-chart-carbs/10 border-chart-carbs/30' },
  { to: '/dashboard/insulin/log', icon: 'vaccines', label: 'Insulin', description: 'Record bolus or basal dose', tone: 'text-chart-insulin bg-chart-insulin/10 border-chart-insulin/30' },
];

export default function LogActionSheet({ open, onOpenChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const choose = (to) => {
    onOpenChange(false);
    navigate(to, { state: { background: location.pathname } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Log entry">
      <div className="flex flex-col gap-sm">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => choose(action.to)}
            className="w-full flex items-center gap-md p-md bg-surface-raised border border-border-subtle rounded-xl text-left transition-all duration-200 hover:border-border-default hover:bg-surface-overlay/60 active:scale-[0.98]"
          >
            <span className={`w-11 h-11 rounded-full border flex items-center justify-center ${action.tone}`}>
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
