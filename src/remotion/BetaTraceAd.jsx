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
    </AbsoluteFill>
  );
}
