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
import AlertBadge from './components/AlertBadge.jsx';
import ChatBubble from './components/ChatBubble.jsx';
import SceneLabel from './components/SceneLabel.jsx';
import StatCard from './components/StatCard.jsx';

const { fontFamily: playfair } = loadPlayfair('normal', {
  weights: ['500', '700'],
  ignoreTooManyRequestsWarning: true,
});
const { fontFamily: inter } = loadInter('normal', {
  weights: ['400', '700', '800', '900'],
  ignoreTooManyRequestsWarning: true,
});
const { fontFamily: jetbrains } = loadJetBrains('normal', {
  weights: ['500', '700', '800'],
  ignoreTooManyRequestsWarning: true,
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

function LogRow({ frame, delay, type, detail, value, color }) {
  const progress = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '190px 1fr auto',
        alignItems: 'center',
        gap: 24,
        borderRadius: 26,
        background: '#10251fcc',
        border: `2px solid ${color}55`,
        padding: '26px 30px',
        marginBottom: 22,
        opacity: progress,
        transform: `translateX(${-48 * (1 - progress)}px)`,
      }}
    >
      <div
        style={{
          color,
          fontFamily: fonts.sans,
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {type}
      </div>
      <div
        style={{
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {detail}
      </div>
      <div
        style={{
          color,
          fontFamily: fonts.mono,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LoggingScene() {
  const frame = useCurrentFrame();

  const headlineProgress = interpolate(frame, [54, 74], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scanY = interpolate(frame, [18, 92], [330, 690], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgDeep,
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <SceneLabel frame={frame} text="Meals. Insulin. Glucose." />
      <AccentBlob
        frame={frame}
        color="sky"
        size={260}
        bottom={-90}
        left={-90}
        shape="blob"
      />
      <div
        style={{
          position: 'absolute',
          top: scanY,
          left: 86,
          right: 86,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #2dd4a8, transparent)',
          boxShadow: '0 0 28px rgba(45,212,168,0.7)',
          opacity: 0.9,
        }}
      />
      <div style={{ marginTop: 300 }}>
        <LogRow
          frame={frame}
          delay={10}
          type="Meal"
          detail="Breakfast logged"
          value="42g"
          color="#2dd4a8"
        />
        <LogRow
          frame={frame}
          delay={26}
          type="Dose"
          detail="Rapid insulin saved"
          value="4.5u"
          color="#38bdf8"
        />
        <LogRow
          frame={frame}
          delay={42}
          type="Reading"
          detail="Dexcom value added"
          value="118"
          color="#10b981"
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 180,
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 72,
          fontWeight: 500,
          lineHeight: 1.05,
          opacity: headlineProgress,
          transform: `translateY(${24 * (1 - headlineProgress)}px)`,
        }}
      >
        Everything logged in seconds.
      </div>
    </AbsoluteFill>
  );
}

function ICRPredictorScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ratioProgress = interpolate(frame, [24, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const confidence = Math.round(
    interpolate(frame, [44, 82], [0, 91], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, padding: 80 }}>
      <SceneLabel frame={frame} text="ICR Predictor" />
      <AccentBlob
        frame={frame}
        color="teal"
        size={320}
        top={260}
        right={-150}
        shape="blob"
      />
      <div style={{ marginTop: 290 }}>
        <StatCard
          frame={frame}
          fps={fps}
          label="Suggested Breakfast ICR"
          value="9"
          unit=":1"
          color="#2dd4a8"
          delay={12}
        />
      </div>
      <div
        style={{
          marginTop: 36,
          borderRadius: 28,
          background: colors.card,
          border: '2px solid #2dd4a844',
          padding: 34,
        }}
      >
        <div
          style={{
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Learned from your real logs
        </div>
        <div
          style={{
            marginTop: 24,
            height: 18,
            borderRadius: 999,
            background: '#0a1713',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${ratioProgress * 84}%`,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #2dd4a8, #38bdf8)',
              boxShadow: '0 0 24px rgba(45,212,168,0.55)',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 28,
            color: colors.text,
            fontFamily: fonts.serif,
            fontSize: 60,
            lineHeight: 1.05,
          }}
        >
          Predict ratios by meal, time, and response.
        </div>
        <div
          style={{
            marginTop: 30,
            color: '#38bdf8',
            fontFamily: fonts.mono,
            fontSize: 42,
            fontWeight: 800,
          }}
        >
          {confidence}% confidence
        </div>
      </div>
    </AbsoluteFill>
  );
}

function PatternAlertsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep, padding: 80 }}>
      <SceneLabel frame={frame} text="Pattern Alerts" />
      <AccentBlob
        frame={frame}
        color="amber"
        size={260}
        top={-90}
        right={-70}
        shape="blob"
      />
      <div style={{ marginTop: 285 }}>
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="warning"
          title="Breakfast spike detected"
          description="Glucose rises 52 mg/dL after cereal on weekdays."
          delay={10}
        />
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="info"
          title="Evening correction improving"
          description="Last 6 corrections returned to range 24 minutes faster."
          delay={28}
        />
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="critical"
          title="Low risk before sleep"
          description="Active insulin and trend suggest a snack check tonight."
          delay={46}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 150,
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 70,
          lineHeight: 1.05,
        }}
      >
        Betatrace finds the patterns hiding in routine.
      </div>
    </AbsoluteFill>
  );
}

function AIChatbotScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, padding: 80 }}>
      <SceneLabel frame={frame} text="Ask Betatrace AI" />
      <div
        style={{
          marginTop: 285,
          borderRadius: 34,
          background: '#07110ecc',
          border: '2px solid #2dd4a844',
          padding: 34,
        }}
      >
        <ChatBubble
          frame={frame}
          delay={8}
          align="right"
          text="Why did I run high after lunch?"
          color="#183c32"
        />
        <ChatBubble
          frame={frame}
          delay={28}
          align="left"
          text="Your logs show 58g carbs, delayed bolus, and a fast rise 42 minutes later."
          color="#10251f"
          textColor={colors.text}
          fontSize={29}
        />
        <ChatBubble
          frame={frame}
          delay={54}
          align="left"
          text="Try logging the dose before eating and review your lunch ICR."
          color="#14372e"
          textColor="#dffcf3"
          fontSize={29}
        />
      </div>
      <AccentBlob
        frame={frame}
        color="teal"
        size={180}
        bottom={90}
        right={90}
      />
    </AbsoluteFill>
  );
}

function NightscoutSyncScene() {
  const frame = useCurrentFrame();
  const syncProgress = interpolate(frame, [18, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulse = interpolate(frame % 30, [0, 15, 30], [0.35, 1, 0.35]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep, padding: 80 }}>
      <SceneLabel frame={frame} text="Nightscout Sync" />
      <div
        style={{
          position: 'absolute',
          top: 430,
          left: 150,
          right: 150,
          height: 280,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 136,
            left: 130,
            right: 130,
            height: 6,
            background: '#2dd4a833',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 124,
            left: `${130 + syncProgress * 500}px`,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#2dd4a8',
            boxShadow: '0 0 32px rgba(45,212,168,0.75)',
          }}
        />
        {['Nightscout', 'Betatrace'].map((label, index) => (
          <div
            key={label}
            style={{
              position: 'absolute',
              top: 60,
              left: index === 0 ? 0 : 'auto',
              right: index === 1 ? 0 : 'auto',
              width: 260,
              height: 170,
              borderRadius: 32,
              background: colors.card,
              border: '2px solid #2dd4a855',
              color: colors.text,
              fontFamily: index === 0 ? fonts.sans : fonts.serif,
              fontSize: index === 0 ? 34 : 42,
              fontWeight: index === 0 ? 900 : 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: index === 0 ? 1 : 0.6 + pulse * 0.4,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 180,
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 72,
          lineHeight: 1.05,
        }}
      >
        Bring CGM history into the same decision layer.
      </div>
    </AbsoluteFill>
  );
}

function BrandStatementScene() {
  const frame = useCurrentFrame();
  const words = ['Log', 'Learn', 'Adjust'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: 80,
        justifyContent: 'center',
      }}
    >
      <AccentBlob
        frame={frame}
        color="teal"
        size={360}
        top={360}
        left={360}
        shape="blob"
      />
      <div
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 36,
        }}
      >
        Built for T1D decisions
      </div>
      <div
        style={{
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 96,
          lineHeight: 1.02,
        }}
      >
        Less guessing.
        <br />
        More signal.
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 56 }}>
        {words.map((word, index) => {
          const progress = interpolate(frame - index * 12, [12, 26], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={word}
              style={{
                borderRadius: 999,
                border: '2px solid #2dd4a855',
                color: '#2dd4a8',
                fontFamily: fonts.sans,
                fontSize: 28,
                fontWeight: 900,
                padding: '18px 28px',
                opacity: progress,
                transform: `translateY(${20 * (1 - progress)}px)`,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function EndCardScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const copyProgress = interpolate(frame, [28, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgDeep,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #4eedc4, #2dd4a8)',
          boxShadow: '0 0 72px rgba(45,212,168,0.55)',
          transform: `scale(${logoScale})`,
          marginBottom: 44,
        }}
      />
      <div
        style={{
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 112,
          fontWeight: 500,
          letterSpacing: -2,
        }}
      >
        Betatrace
      </div>
      <div
        style={{
          marginTop: 26,
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 34,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: 'center',
          opacity: copyProgress,
          transform: `translateY(${18 * (1 - copyProgress)}px)`,
        }}
      >
        Diabetes data that finally talks back.
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
      <Sequence from={180} durationInFrames={120}>
        <LoggingScene />
      </Sequence>
      <Sequence from={300} durationInFrames={100}>
        <ICRPredictorScene />
      </Sequence>
      <Sequence from={400} durationInFrames={100}>
        <PatternAlertsScene />
      </Sequence>
      <Sequence from={500} durationInFrames={100}>
        <AIChatbotScene />
      </Sequence>
      <Sequence from={600} durationInFrames={100}>
        <NightscoutSyncScene />
      </Sequence>
      <Sequence from={700} durationInFrames={100}>
        <BrandStatementScene />
      </Sequence>
      <Sequence from={800} durationInFrames={100}>
        <EndCardScene />
      </Sequence>
    </AbsoluteFill>
  );
}
