import { interpolate, spring } from 'remotion';

export default function StatCard({
  frame,
  fps = 30,
  label,
  value,
  unit = '',
  color = '#2dd4a8',
  delay = 0,
}) {
  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const numValue = parseFloat(value);
  const displayValue = isNaN(numValue)
    ? value
    : Math.round(
        interpolate(frame - delay, [0, 25], [0, numValue], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      );

  return (
    <div
      style={{
        borderRadius: 24,
        background: '#10251f',
        border: `2px solid ${color}44`,
        padding: '28px 32px',
        opacity: appear,
        transform: `translateY(${28 * (1 - appear)}px)`,
      }}
    >
      <div
        style={{
          color: '#6b8a80',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontSize: 58,
          fontWeight: 800,
          marginTop: 8,
        }}
      >
        {displayValue}
        {unit}
      </div>
    </div>
  );
}
