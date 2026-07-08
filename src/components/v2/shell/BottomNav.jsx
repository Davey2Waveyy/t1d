import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const items = [
  { to: '/dashboard', icon: 'home', label: 'Home', end: true },
  { to: '/dashboard/glucose', icon: 'insights', label: 'Glucose' },
  { to: '/dashboard/meals', icon: 'restaurant', label: 'Meals' },
  { to: '/dashboard/more', icon: 'more_horiz', label: 'More' },
];

export default function BottomNav({ onPressLog }) {
  return (
    <nav className="z-40 w-full flex-shrink-0 pb-safe bg-surface-base/85 backdrop-blur-xl border-t border-border-subtle text-[10px] font-medium font-body flex justify-around items-center h-20 px-2">
      {items.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
      <button
        type="button"
        onClick={onPressLog}
        aria-label="Open log menu"
        className="group flex flex-col items-center justify-center text-text-secondary w-16 h-full -mt-7"
      >
        <div className="w-[52px] h-[52px] bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_10px_26px_-8px_rgba(75,224,180,0.6)] transition-transform duration-200 ease-out-strong group-hover:scale-105 group-active:scale-90">
          <span className="material-symbols-outlined text-[26px]">add</span>
        </div>
        <span className="mt-1.5 uppercase tracking-wider">Log</span>
      </button>
      {items.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ to, icon, label, end }) {
  // Match nested paths (e.g. /dashboard/more/settings keeps More lit)
  const { pathname } = useLocation();
  const active = end ? pathname === to : pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      end={end}
      className={`relative flex flex-col items-center justify-center w-16 h-full gap-1 uppercase tracking-wider active:scale-90 transition-all duration-200 ${
        active ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute top-3 h-[30px] w-[52px] rounded-full bg-primary/10 border border-primary/20"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <span className={`material-symbols-outlined text-[22px] relative ${active ? 'icon-fill' : ''}`}>{icon}</span>
      <span className="relative">{label}</span>
    </NavLink>
  );
}
