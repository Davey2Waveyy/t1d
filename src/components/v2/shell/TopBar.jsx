import { Link } from 'react-router-dom';

export default function TopBar({ user }) {
  return (
    <header className="fixed top-0 w-full max-w-[480px] z-40 bg-surface-base/80 backdrop-blur-xl flex items-center justify-between px-md h-16 pt-safe lg:static lg:max-w-none lg:col-span-2">
      <Link to="/dashboard" className="flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full border border-border-default bg-surface-raised flex items-center justify-center text-primary text-xs font-mono">
          {user?.email?.[0]?.toUpperCase() ?? 'B'}
        </div>
      </Link>
      <div className="text-lg font-bold tracking-widest text-text-primary font-body">GLUCOSE</div>
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center text-primary rounded-full active:scale-95 transition-transform"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
