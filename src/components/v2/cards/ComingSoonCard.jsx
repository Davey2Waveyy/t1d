export default function ComingSoonCard({ icon, label, description }) {
  return (
    <div className="flex items-center gap-md p-md bg-surface-overlay/40 border border-border-subtle/50 rounded-lg opacity-60 cursor-not-allowed">
      <div className="w-10 h-10 rounded-full bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <span className="font-body text-body-base text-text-primary font-medium truncate">{label}</span>
        {description && <span className="font-mono text-[11px] text-text-muted truncate">{description}</span>}
      </div>
      <span className="text-label-caps text-text-muted bg-surface-raised border border-border-subtle px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
        Coming Soon
      </span>
    </div>
  );
}
