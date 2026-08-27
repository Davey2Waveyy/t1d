import { WEBMCP_STATUS } from '../../../hooks/useWebMcpTools';

const LABELS = {
  [WEBMCP_STATUS.READY]: { text: 'WebMCP ready', tone: 'glucose-normal', icon: 'bolt' },
  [WEBMCP_STATUS.UNSUPPORTED]: { text: 'Manual mode — WebMCP unavailable', tone: 'text-muted', icon: 'touch_app' },
  [WEBMCP_STATUS.ERROR]: { text: 'WebMCP registration failed', tone: 'glucose-high', icon: 'error' },
};

export default function WebMcpStatusPill({ status }) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 self-start rounded-full border border-border-subtle bg-surface-overlay px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-${label.tone}`}
      role="status"
    >
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{label.icon}</span>
      {label.text}
    </span>
  );
}
