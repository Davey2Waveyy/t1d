import { Link } from 'react-router-dom';
import ComingSoonCard from '../cards/ComingSoonCard';

const live = [
  { to: 'insulin', icon: 'vaccines', label: 'Insulin', description: 'History' },
  { to: 'settings', icon: 'settings', label: 'Settings', description: 'Targets, ICR, preferences' },
];

const soon = [
  { icon: 'science', label: 'ICR Predictor', description: 'Insulin-to-carb ratio' },
  { icon: 'percent', label: 'A1C Estimator', description: 'From glucose data' },
  { icon: 'auto_awesome', label: 'Pattern Alerts', description: 'Insights and predictions' },
  { icon: 'forum', label: 'AI Chat', description: 'Ask questions about your data' },
  { icon: 'medication', label: 'AI Dose Assistant', description: 'Suggested doses' },
  { icon: 'sync', label: 'Dexcom Import', description: 'Pull readings from Dexcom' },
  { icon: 'tune', label: 'Correction Factor', description: 'Calculator' },
];

export default function More() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">More</h1>
        <p className="font-body text-body-base text-text-secondary">Tools, preferences, and upcoming helpers.</p>
      </div>

      <section className="flex flex-col gap-sm">
        <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">Tools</h2>
        <div className="flex flex-col gap-2">
          {live.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-md p-md bg-surface-overlay border border-border-subtle rounded-lg active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-body-base text-text-primary truncate">{item.label}</div>
                <div className="font-mono text-[11px] text-text-secondary truncate">{item.description}</div>
              </div>
              <span className="material-symbols-outlined text-text-muted">chevron_right</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">On the roadmap</h2>
        <div className="flex flex-col gap-2">
          {soon.map((item) => <ComingSoonCard key={item.label} {...item} />)}
        </div>
      </section>
    </div>
  );
}
