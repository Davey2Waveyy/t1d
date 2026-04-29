import { interpolate } from 'remotion';

export default function ChatBubble({
  frame,
  text,
  align = 'right',
  color = '#183c32',
  textColor = '#dffcf3',
  delay = 0,
  fontSize = 30,
}) {
  const progress = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        borderRadius: 22,
        background: color,
        padding: '22px 28px',
        marginBottom: 20,
        marginLeft: align === 'right' ? 80 : 0,
        marginRight: align === 'left' ? 80 : 0,
        opacity: progress,
        transform: `translateY(${20 * (1 - progress)}px)`,
        color: textColor,
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize,
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  );
}
