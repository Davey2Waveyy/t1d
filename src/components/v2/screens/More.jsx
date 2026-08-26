import { useState } from 'react';
import { Link } from 'react-router-dom';
import ComingSoonCard from '../cards/ComingSoonCard';
import ResetDemoDataSheet from '../sheets/ResetDemoDataSheet';
import { useAuth } from '../../../contexts/AuthContext';

const live = [
  { to: 'insulin', icon: 'vaccines', label: 'Insulin', description: 'History' },
  { to: 'settings', icon: 'settings', label: 'Settings', description: 'Targets, ICR, preferences' },
];

const sandbox = [
  { icon: 'science', label: 'ICR Predictor', description: 'Estimate ratios from meal and dose history' },
  { icon: 'auto_awesome', label: 'Pattern Alerts', description: 'Highlight recurring highs and lows' },
];

export default function More() {
  const { isGuest } = useAuth();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">More</h1>
        <p className="font-body text-body-base text-text-secondary">Tools and preferences.</p>
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

      {isGuest && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">Demo</h2>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex items-center gap-md p-md bg-surface-overlay border border-border-subtle rounded-lg active:scale-[0.97] transition-transform text-left"
          >
            <div className="w-10 h-10 rounded-full bg-glucose-low/15 text-glucose-low flex items-center justify-center">
              <span className="material-symbols-outlined">restart_alt</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body text-body-base text-text-primary truncate">Reset demo data</div>
              <div className="font-mono text-[11px] text-text-secondary truncate">Clear added entries, restore the seeded demo</div>
            </div>
            <span className="material-symbols-outlined text-text-muted">chevron_right</span>
          </button>
          <ResetDemoDataSheet open={resetOpen} onOpenChange={setResetOpen} />
        </section>
      )}

      <section className="flex flex-col gap-sm">
        <h2 className="text-label-caps text-text-secondary uppercase tracking-widest">Coming soon</h2>
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
