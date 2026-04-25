import { Audio } from '@remotion/media';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import AccentBlob from './components/AccentBlob.jsx';
import SceneLabel from './components/SceneLabel.jsx';
import StatCard from './components/StatCard.jsx';

const { fontFamily: playfair } = loadPlayfair('normal', {
  weights: ['500', '700'],
});
const { fontFamily: inter } = loadInter('normal', {
  weights: ['400', '700', '800', '900'],
});
const { fontFamily: jetbrains } = loadJetBrains('normal', {
  weights: ['500', '700', '800'],
});

const colors = {
  bg: '#0D1B16',
  bgDeep: '#07110e',
  card: '#10251f',
  text: '#e8f5f0',
  muted: '#6b8a80',
  teal: '#2dd4a8',
};

const fonts = {
  serif: `${playfair}, Georgia, serif`,
  sans: `${inter}, Arial, sans-serif`,
  mono: `${jetbrains}, Consolas, monospace`,
};

export { fonts, colors };

function GlucoseTrace({ progress = 1 }) {
  const dashLength = 1450;
  return (
    <svg
      viewBox="0 0 900 360"
      style={{ width: '100%', height: 220, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4a8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M20 250 C95 230 110 90 190 122 C266 152 280 282 354 236 C432 188 412 72 502 96 C592 120 570 270 666 226 C746 190 766 88 880 112"
        fill="none"
        stroke="url(#traceGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={dashLength}
        strokeDashoffset={dashLength * (1 - progress)}
      />
    </svg>
  );
}

function ColdOpen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const orbScale = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80 },
  });
  const wordmarkProgress = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordmarkY = interpolate(frame, [18, 30], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 35%, #4eedc4, #2dd4a8)',
          boxShadow: '0 0 60px rgba(45,212,168,0.5)',
          transform: `scale(${orbScale})`,
          marginBottom: 48,
        }}
      />
      <div
        style={{
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 110,
          fontWeight: 500,
          letterSpacing: -2,
          opacity: wordmarkProgress,
          transform: `translateY(${wordmarkY}px)`,
        }}
      >
        Betatrace
      </div>
    </AbsoluteFill>
  );
}

function CommandCenter() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { label: 'Glucose', value: '142', unit: ' mg/dL', color: '#2dd4a8' },
    { label: 'Time in Range', value: '72', unit: '%', color: '#10b981' },
    { label: 'Active Insulin', value: '2.4', unit: 'u', color: '#38bdf8' },
    { label: 'Carbs Today', value: '68', unit: 'g', color: '#fbbf24' },
  ];

  const traceCardOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const traceProgress = interpolate(frame, [50, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, padding: 80 }}>
      <SceneLabel frame={frame} text="One workspace." />
      <AccentBlob
        frame={frame}
        color="teal"
        size={200}
        top={-60}
        right={-60}
        delay={5}
      />
      <div
        style={{
          marginTop: 200,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
      >
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            frame={frame}
            fps={fps}
            delay={i * 12}
            {...s}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 36,
          borderRadius: 24,
          background: colors.card,
          border: '2px solid #2dd4a844',
          padding: '28px 32px',
          opacity: traceCardOpacity,
        }}
      >
        <div
          style={{
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 22,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          48h Glucose Trace
        </div>
        <GlucoseTrace progress={traceProgress} />
      </div>
    </AbsoluteFill>
  );
}

export default function BetaTraceAd() {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Audio
        src={staticFile('remotion/betatrace-pulse.wav')}
        volume={(audioFrame) =>
          interpolate(
            audioFrame,
            [0, fps, durationInFrames - fps, durationInFrames],
            [0, 0.55, 0.55, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )
        }
      />
      <Sequence from={0} durationInFrames={60}>
        <ColdOpen />
      </Sequence>
      <Sequence from={60} durationInFrames={120}>
        <CommandCenter />
      </Sequence>
    </AbsoluteFill>
  );
}
