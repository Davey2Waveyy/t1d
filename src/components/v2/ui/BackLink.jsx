import { Link } from 'react-router-dom';

export default function BackLink({ to, label = 'Back' }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 w-fit -ml-1 pr-2 py-1 rounded-full text-text-secondary hover:text-text-primary active:scale-95 transition-all font-mono text-data-mono"
    >
      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      {label}
    </Link>
  );
}
