import { Minus, Plus } from 'lucide-react';
import './NumberInput.css';

export default function NumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max, 
  step = 1, 
  id, 
  placeholder = '0',
  disabled = false,
}) {
  const handleIncrement = () => {
    const newValue = parseFloat(value || 0) + parseFloat(step);
    if (max !== undefined && newValue > max) return;
    onChange({ target: { value: newValue.toString() } });
  };

  const handleDecrement = () => {
    const newValue = parseFloat(value || 0) - parseFloat(step);
    if (min !== undefined && newValue < min) return;
    onChange({ target: { value: newValue.toString() } });
  };

  return (
    <div className={`number-input-wrapper ${disabled ? 'disabled' : ''}`}>
      <button 
        type="button" 
        className="number-btn decrement" 
        onClick={handleDecrement}
        disabled={disabled}
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        id={id}
        className="form-input number-field"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step="any"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button 
        type="button" 
        className="number-btn increment" 
        onClick={handleIncrement}
        disabled={disabled}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
