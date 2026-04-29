import { Link } from 'react-router-dom';

export default function TopBar({ user, isGuest, hasGuestNotification, onPressNotifications }) {
  return (
    <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-xl flex items-center justify-between px-md h-16 pt-safe flex-shrink-0">
      <Link to="/dashboard" className="flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full border border-border-default bg-surface-raised flex items-center justify-center text-primary text-xs font-mono">
          {user?.email?.[0]?.toUpperCase() ?? 'B'}
        </div>
      </Link>
      <div className="text-lg font-bold tracking-widest text-text-primary font-body">GLUCOSE</div>
      <button
        type="button"
        onClick={onPressNotifications}
        className="w-10 h-10 flex items-center justify-center text-primary rounded-full active:scale-95 transition-transform"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {isGuest && hasGuestNotification && <span className="absolute mt-[-18px] ml-[18px] h-2.5 w-2.5 rounded-full bg-glucose-high shadow-[0_0_0_3px_rgba(13,27,22,0.9)]" />}
      </button>
    </header>
  );
}
