import { interpolate } from 'remotion';

const palette = {
  teal: '#2dd4a8',
  emerald: '#10b981',
  violet: '#a78bfa',
  rose: '#fb7185',
  amber: '#fbbf24',
  sky: '#38bdf8',
};

export default function AccentBlob({
  frame,
  color = 'teal',
  size = 160,
  top,
  left,
  right,
  bottom,
  delay = 0,
  shape = 'circle',
}) {
  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const borderRadius =
    shape === 'blob' ? '60% 40% 55% 45% / 45% 55% 40% 60%' : '50%';
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius,
        background: `${palette[color]}22`,
        border: `3px solid ${palette[color]}44`,
        opacity: progress * 0.85,
        transform: `scale(${0.6 + progress * 0.4})`,
      }}
    />
  );
}
