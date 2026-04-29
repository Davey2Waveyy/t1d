import { Link } from 'react-router-dom';
import ComingSoonCard from '../cards/ComingSoonCard';

const live = [
  { to: 'insulin', icon: 'vaccines', label: 'Insulin', description: 'History' },
  { to: 'settings', icon: 'settings', label: 'Settings', description: 'Targets, ICR, preferences' },
  { to: 'settings?focus=nightscout', icon: 'terminal', label: 'Connect Nightscout', description: 'Import glucose readings' },
];

const sandbox = [
  { icon: 'science', label: 'ICR Predictor', description: 'Estimate ratios from meal and dose history' },
  { icon: 'percent', label: 'A1C Estimator', description: 'Show longer-term glucose estimates' },
  { icon: 'auto_awesome', label: 'Pattern Alerts', description: 'Highlight recurring highs and lows' },
  { icon: 'medication', label: 'Dose Assistant', description: 'Preview dose context, not medical advice' },
  { icon: 'sync', label: 'Dexcom Import', description: 'Optional connected data source' },
  { icon: 'tune', label: 'Correction Factor', description: 'Personalized correction planning' },
];

const assistantMessages = [
  ['user', 'Why did I go high after dinner?'],
  ['assistant', 'Dinner had the largest carb entry today, and the rise started soon after the meal. Check whether the bolus was timed close enough to eating.'],
  ['user', 'What should I adjust first?'],
  ['assistant', 'Start by reviewing your dinner ICR and recent correction factor. If this pattern repeats, bring those logs to your clinician before changing doses.'],
];

export default function More() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">More</h1>
        <p className="font-body text-body-base text-text-secondary">Tools, preferences, and assistant previews.</p>
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
        <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">AI assistant demo</h2>
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-md flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div className="min-w-0">
              <div className="font-body text-body-base font-semibold text-text-primary">AI assistant demo</div>
              <div className="font-mono text-[11px] text-text-secondary">Example pattern chat</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {assistantMessages.map(([role, text]) => (
              <div
                key={text}
                className={`max-w-[88%] rounded-lg px-sm py-2 font-body text-[13px] leading-relaxed ${
                  role === 'user'
                    ? 'ml-auto bg-primary text-on-primary'
                    : 'bg-surface-overlay text-text-primary'
                }`}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {sandbox.map((item) => <ComingSoonCard key={item.label} {...item} badgeLabel="Optional" />)}
        </div>
      </section>

      <a
        href="https://www.linkedin.com/in/david-cilliers/"
        target="_blank"
        rel="noreferrer"
        className="group flex items-center justify-between rounded-lg border border-border-subtle bg-surface-raised p-md transition-colors active:scale-[0.98]"
      >
        <div className="flex items-center gap-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="min-w-0">
            <div className="font-body text-body-base font-semibold text-text-primary">Created by David Cilliers</div>
            <div className="font-mono text-[11px] text-text-secondary">View LinkedIn profile</div>
          </div>
        </div>
        <span className="material-symbols-outlined text-text-muted transition-transform group-hover:translate-x-0.5">open_in_new</span>
      </a>
    </div>
  );
}
