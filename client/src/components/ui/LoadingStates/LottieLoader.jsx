import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import animationData from '../../../assets/animations/home-progress.json';

const LottieLoader = ({ speed = 1.74 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
    animation.setSpeed(speed);

    return () => animation.destroy();
  }, [speed]);

  return <span className="ca-opening__progress-lottie" ref={containerRef} aria-hidden="true" />;
};

export default LottieLoader;
