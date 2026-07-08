export default function EmptyState({ icon = 'database', title, description, action, onAction }) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-xl px-md gap-md overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised/40">
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="relative w-16 h-16 rounded-2xl bg-surface-overlay border border-border-default flex items-center justify-center text-primary shadow-raise">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </div>
      <h3 className="relative font-body text-title-lg text-text-primary">{title}</h3>
      {description && <p className="relative font-body text-body-base text-text-secondary max-w-xs">{description}</p>}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="relative mt-sm bg-primary text-on-primary px-lg py-sm rounded-full font-body text-body-base font-medium shadow-[0_10px_24px_-10px_rgba(75,224,180,0.5)] hover:scale-[1.03] active:scale-95 transition-transform duration-200 ease-out-strong"
        >
          {action}
        </button>
      )}
    </div>
  );
}
