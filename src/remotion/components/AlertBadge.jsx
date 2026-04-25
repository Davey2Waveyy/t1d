import { spring } from 'remotion';

const severityColors = {
  critical: '#fb7185',
  warning: '#fbbf24',
  info: '#2dd4a8',
};

export default function AlertBadge({
  frame,
  fps = 30,
  severity = 'info',
  title,
  description,
  delay = 0,
}) {
  const color = severityColors[severity];
  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  return (
    <div
      style={{
        borderRadius: 20,
        background: '#10251f',
        border: `2px solid ${color}55`,
        padding: '24px 30px',
        marginBottom: 20,
        opacity: appear,
        transform: `translateY(${40 * (1 - appear)}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            color: '#e8f5f0',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            color,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {severity}
        </div>
      </div>
      <div
        style={{
          color: '#6b8a80',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 24,
          marginTop: 10,
          paddingLeft: 26,
        }}
      >
        {description}
      </div>
    </div>
  );
}
