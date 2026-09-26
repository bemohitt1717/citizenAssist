import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import catAnimation from '../assets/animations/404-cat.json';

const NotFoundAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: !prefersReducedMotion,
      autoplay: !prefersReducedMotion,
      animationData: catAnimation,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
      },
    });

    return () => animation.destroy();
  }, []);

  return <div className="ca-oops__cat" ref={containerRef} aria-hidden="true" />;
};

export default NotFoundAnimation;
