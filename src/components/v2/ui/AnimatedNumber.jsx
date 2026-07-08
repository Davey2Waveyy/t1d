import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'framer-motion';

// Counts toward `value` whenever it changes. Non-numeric values render as-is.
// Decimals are inferred from the value unless passed explicitly.
export default function AnimatedNumber({ value, decimals: decimalsProp, duration = 0.9 }) {
  const ref = useRef(null);
  const numeric = Number(value);
  const isNumber = value !== null && value !== undefined && value !== '' && Number.isFinite(numeric);
  const decimals = decimalsProp ?? (isNumber && Math.abs(numeric % 1) > 0.0001 ? 1 : 0);
  const motionValue = useMotionValue(isNumber ? numeric : 0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!isNumber) return undefined;
    if (reduced) {
      if (ref.current) ref.current.textContent = numeric.toFixed(decimals);
      return undefined;
    }

    const controls = animate(motionValue, numeric, {
      duration,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = latest.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [numeric, isNumber, decimals, duration, motionValue, reduced]);

  if (!isNumber) return <span>{value ?? '—'}</span>;

  return <span ref={ref}>{numeric.toFixed(decimals)}</span>;
}
