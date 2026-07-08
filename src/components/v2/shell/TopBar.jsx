import { Link } from 'react-router-dom';

export default function TopBar({ user, isGuest, hasGuestNotification, onPressNotifications }) {
  return (
    <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-xl flex items-center justify-between px-md h-16 pt-safe flex-shrink-0 border-b border-border-subtle/50">
      <Link
        to="/dashboard"
        aria-label="Betatrace home"
        className="flex items-center gap-sm active:scale-95 transition-transform"
      >
        <div className="w-8 h-8 rounded-full border border-border-default bg-surface-raised flex items-center justify-center text-primary text-xs font-mono">
          {user?.email?.[0]?.toUpperCase() ?? 'B'}
        </div>
      </Link>

      <Link to="/dashboard" className="font-display text-[19px] text-text-primary tracking-tight" style={{ fontWeight: 470 }}>
        Betatrace
      </Link>

      <button
        type="button"
        onClick={onPressNotifications}
        className="relative w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full active:scale-95 transition-all"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {isGuest && hasGuestNotification && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-glucose-high shadow-[0_0_0_3px_var(--surface-base)]" />
        )}
      </button>
    </header>
  );
}
