import { Composition } from 'remotion';
import BetaTraceAd from './BetaTraceAd.jsx';

export default function RemotionRoot() {
  return (
    <Composition
      id="BetaTraceAd"
      component={BetaTraceAd}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}

