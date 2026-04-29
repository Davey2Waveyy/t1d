import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', icon: 'home', label: 'Home', end: true },
  { to: '/dashboard/glucose', icon: 'insights', label: 'Glucose' },
  { to: '/dashboard/meals', icon: 'restaurant', label: 'Meals' },
  { to: '/dashboard/more', icon: 'more_horiz', label: 'More' },
];

export default function BottomNav({ onPressLog }) {
  return (
    <nav className="z-40 w-full flex-shrink-0 pb-safe bg-surface-base/85 backdrop-blur-xl border-t border-border-subtle text-[10px] font-medium font-body uppercase tracking-wider flex justify-around items-center h-20 px-2">
      {items.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
      <button
        type="button"
        onClick={onPressLog}
        aria-label="Open log menu"
        className="flex flex-col items-center justify-center text-text-secondary active:scale-90 transition-all duration-200 w-16 h-full -mt-6"
      >
        <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[28px] icon-fill">add_circle</span>
        </div>
        <span className="mt-1">Log</span>
      </button>
      {items.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-90 transition-all duration-200 ${
          isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
        }`
      }
    >
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
