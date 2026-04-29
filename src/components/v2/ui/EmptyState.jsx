export default function EmptyState({ icon = 'database', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-xl px-md gap-md">
      <div className="w-16 h-16 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center text-text-muted">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-body text-title-lg text-text-primary">{title}</h3>
      {description && <p className="font-body text-body-base text-text-secondary max-w-xs">{description}</p>}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-sm bg-primary text-on-primary px-md py-sm rounded-full font-body text-body-base font-medium active:scale-95 transition-transform"
        >
          {action}
        </button>
      )}
    </div>
  );
}
