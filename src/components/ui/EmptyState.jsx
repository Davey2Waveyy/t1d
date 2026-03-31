import { Plus } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction
}) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={32} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
