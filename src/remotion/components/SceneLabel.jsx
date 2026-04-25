import { interpolate } from 'remotion';

export default function SceneLabel({ frame, text, delay = 0 }) {
  const progress = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 90,
        left: 80,
        right: 80,
        color: '#fff',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 48,
        fontWeight: 900,
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: progress,
        transform: `translateY(${16 * (1 - progress)}px)`,
      }}
    >
      {text}
    </div>
  );
}
