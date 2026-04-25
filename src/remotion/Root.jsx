import { Composition } from 'remotion';
import BetaTraceAd from './BetaTraceAd.jsx';

export default function RemotionRoot() {
  return (
    <Composition
      id="BetaTraceAd"
      component={BetaTraceAd}
      durationInFrames={1260}
      fps={42}
      width={1080}
      height={1920}
    />
  );
}

