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

  const headlineProgress = interpolate(frame, [46, 68], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sunProgress = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #163127 0%, #0D1B16 62%, #07110e 100%)',
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <SceneLabel frame={frame} text="Morning Logs" />
      <AccentBlob
        frame={frame}
        color="amber"
        size={280}
        top={190}
        right={-80}
        shape="blob"
      />
      <div
        style={{
          position: 'absolute',
          top: 250,
          right: 108,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fbbf24 0%, #2dd4a8 58%, transparent 70%)',
          opacity: sunProgress * 0.45,
          transform: `scale(${0.7 + sunProgress * 0.3})`,
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
        Meal, dose, glucose in seconds.
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
      <SceneLabel frame={frame} text="Breakfast ICR" />
      <AccentBlob
        frame={frame}
        color="amber"
        size={320}
        top={260}
        right={-150}
        shape="blob"
      />
      <div
        style={{
          position: 'absolute',
          top: 310,
          right: 120,
          width: 210,
          height: 210,
          borderRadius: '50%',
          border: '18px solid #fbbf2444',
          background: '#10251f',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 390,
          right: 198,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: '#2dd4a8',
          boxShadow: '0 0 28px rgba(45,212,168,0.5)',
        }}
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
          Learned from breakfast logs
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
          Learn what works by meal and time.
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
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #07111f 0%, #07110e 66%, #0D1B16 100%)',
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <SceneLabel frame={frame} text="Night Patterns" />
      <AccentBlob
        frame={frame}
        color="sky"
        size={280}
        top={-100}
        right={-80}
        shape="blob"
      />
      <div
        style={{
          position: 'absolute',
          top: 245,
          right: 120,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: '#e8f5f0',
          boxShadow: '0 0 44px rgba(232,245,240,0.3)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 220,
          right: 80,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: '#07111f',
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 250 + i * 55,
            left: 130 + i * 82,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#38bdf8',
            opacity: 0.45,
          }}
        />
      ))}
      <div style={{ marginTop: 285 }}>
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="critical"
          title="Low risk before sleep"
          description="Active insulin and trend suggest a snack check tonight."
          delay={10}
        />
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="info"
          title="Overnight pattern found"
          description="Three late workouts ended with a 2 a.m. dip."
          delay={28}
        />
        <AlertBadge
          frame={frame}
          fps={fps}
          severity="warning"
          title="Morning spike link"
          description="Late lows often rebound after breakfast."
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
        Spot the risks before sleep.
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

function A1CEstimatorScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const a1cValue = interpolate(frame, [18, 96], [0, 6.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringProgress = interpolate(frame, [18, 110], [0, 0.78], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textOpacity = interpolate(frame, [0, 22, 128, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringToOrb = interpolate(frame, [142, 172], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dropProgress = spring({
    frame: frame - 166,
    fps,
    config: { damping: 9, stiffness: 82, mass: 0.9 },
  });
  const impactSquash = interpolate(frame, [204, 214, 230], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordmarkProgress = interpolate(frame, [218, 246], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const linksProgress = interpolate(frame, [250, 282], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const circumference = 2 * Math.PI * 140;
  const orbSize = interpolate(ringToOrb, [0, 1], [340, 150]);
  const orbTop = interpolate(dropProgress, [0, 1], [240, 500]);
  const orbLeft = interpolate(ringToOrb, [0, 1], [370, 465]);
  const orbScaleX = 1 + impactSquash * 0.1;
  const orbScaleY = 1 - impactSquash * 0.13;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bgDeep,
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <div style={{ opacity: textOpacity }}>
        <SceneLabel frame={frame} text="A1C over time" />
      </div>
      <AccentBlob
        frame={frame}
        color="emerald"
        size={260}
        top={-95}
        left={-95}
        shape="blob"
      />
      <div
        style={{
          position: 'absolute',
          top: orbTop,
          left: orbLeft,
          width: orbSize,
          height: orbSize,
          transform: `scale(${orbScaleX}, ${orbScaleY})`,
          transformOrigin: 'center bottom',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 35%, #4eedc4, #2dd4a8)',
              boxShadow: '0 0 72px rgba(45,212,168,0.55)',
              opacity: ringToOrb,
            }}
          />
          <svg
            viewBox="0 0 320 320"
            style={{
              width: '100%',
              height: '100%',
              opacity: 1 - ringToOrb,
            }}
          >
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="#10251f"
              strokeWidth="22"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="url(#a1cGrad)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ringProgress)}
              transform="rotate(-90 160 160)"
            />
            <defs>
              <linearGradient id="a1cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4a8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: textOpacity * (1 - ringToOrb),
            }}
          >
            <div
              style={{
                color: colors.text,
                fontFamily: fonts.mono,
                fontSize: 80,
                fontWeight: 800,
              }}
            >
              {a1cValue.toFixed(1)}%
            </div>
            <div
              style={{
                color: colors.muted,
                fontFamily: fonts.sans,
                fontSize: 22,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              Estimated A1C
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 680,
          left: 80,
          right: 80,
          borderRadius: 24,
          background: colors.card,
          border: '2px solid #10b98144',
          padding: '28px 32px',
          opacity: textOpacity,
          transform: `translateY(${24 * (1 - textOpacity)}px)`,
        }}
      >
        <div
          style={{
            color: colors.text,
            fontFamily: fonts.serif,
            fontSize: 52,
            lineHeight: 1.1,
          }}
        >
          A 90-day signal from your readings.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 685,
          left: 80,
          right: 80,
          textAlign: 'center',
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 112,
          fontWeight: 500,
          letterSpacing: -2,
          opacity: wordmarkProgress,
          transform: `translateY(${26 * (1 - wordmarkProgress)}px)`,
        }}
      >
        Betatrace
      </div>
      <div
        style={{
          position: 'absolute',
          top: 815,
          left: 80,
          right: 80,
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 34,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: 'center',
          opacity: wordmarkProgress,
          transform: `translateY(${18 * (1 - wordmarkProgress)}px)`,
        }}
      >
        Diabetes data that finally talks back.
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: linksProgress,
          transform: `translateY(${14 * (1 - linksProgress)}px)`,
        }}
      >
        <div
          style={{
            color: colors.teal,
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          github.com/Davey2Waveyy/t1d
        </div>
        <div
          style={{
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          linkedin.com/in/david-cilliers
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CorrectionFactorScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { label: 'Current BG', value: '218', unit: 'mg/dL', color: '#fb7185' },
    { label: 'Target BG', value: '110', unit: 'mg/dL', color: '#2dd4a8' },
    { label: 'Correction', value: '2.2', unit: 'u', color: '#38bdf8' },
  ];

  const arrowProgress = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep, padding: 80 }}>
      <SceneLabel frame={frame} text="Lunch Correction" />
      <AccentBlob
        frame={frame}
        color="rose"
        size={200}
        bottom={-70}
        right={-70}
      />
      <div style={{ marginTop: 290 }}>
        {steps.map((s, i) => (
          <div key={s.label}>
            <StatCard
              frame={frame}
              fps={fps}
              label={s.label}
              value={s.value}
              unit={` ${s.unit}`}
              color={s.color}
              delay={i * 14}
            />
            {i < steps.length - 1 && (
              <div
                style={{
                  textAlign: 'center',
                  color: colors.muted,
                  fontSize: 36,
                  padding: '8px 0',
                  opacity: arrowProgress,
                }}
              >
                {'>>>'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 150,
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 62,
          lineHeight: 1.05,
        }}
      >
        From high to target with less math.
      </div>
    </AbsoluteFill>
  );
}

function DexcomImportScene() {
  const frame = useCurrentFrame();

  const readings = [132, 128, 119, 124, 138, 145, 151, 142, 136, 127, 118, 112];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <SceneLabel frame={frame} text="Dexcom Import" />
      <AccentBlob
        frame={frame}
        color="sky"
        size={240}
        top={-100}
        right={-100}
        shape="blob"
      />
      <div
        style={{
          marginTop: 280,
          borderRadius: 28,
          background: colors.card,
          border: '2px solid #38bdf844',
          padding: 34,
        }}
      >
        <div
          style={{
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Live CGM Feed
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 260 }}>
          {readings.map((val, i) => {
            const barProgress = interpolate(frame - i * 5, [8, 28], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const height = ((val - 90) / 80) * 220;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  background: val < 120 ? '#10b981' : val > 140 ? '#fbbf24' : '#2dd4a8',
                  height: height * barProgress,
                  opacity: barProgress,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            color: colors.muted,
            fontFamily: fonts.mono,
            fontSize: 18,
          }}
        >
          <span>12h ago</span>
          <span>Now</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 180,
          color: colors.text,
          fontFamily: fonts.serif,
          fontSize: 68,
          lineHeight: 1.05,
        }}
      >
        Pull CGM data in, automatically.
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
  const linksProgress = interpolate(frame, [56, 78], [0, 1], {
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
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: linksProgress,
          transform: `translateY(${14 * (1 - linksProgress)}px)`,
        }}
      >
        <div
          style={{
            color: colors.teal,
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          github.com/Davey2Waveyy/t1d
        </div>
        <div
          style={{
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          linkedin.com/in/david-cilliers
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default function BetaTraceAd() {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Audio
        src={staticFile('remotion/betatrace-pulse.mp3')}
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
      <Sequence from={0} durationInFrames={55}>
        <ColdOpen />
      </Sequence>
      <Sequence from={55} durationInFrames={95}>
        <LoggingScene />
      </Sequence>
      <Sequence from={150} durationInFrames={100}>
        <ICRPredictorScene />
      </Sequence>
      <Sequence from={250} durationInFrames={100}>
        <CorrectionFactorScene />
      </Sequence>
      <Sequence from={350} durationInFrames={110}>
        <AIChatbotScene />
      </Sequence>
      <Sequence from={460} durationInFrames={120}>
        <PatternAlertsScene />
      </Sequence>
      <Sequence from={580} durationInFrames={320}>
        <A1CEstimatorScene />
      </Sequence>
    </AbsoluteFill>
  );
}
