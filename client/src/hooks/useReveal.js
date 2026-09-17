import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const supportsObserver = () => typeof IntersectionObserver !== 'undefined';

/**
 * Reveals a container once, the first time it enters the viewport.
 *
 * Observed rather than listened for — a scroll handler reflows on every frame,
 * this fires once per element. Children stagger off the container's revealed
 * state in CSS, so the whole group is one orchestrated moment rather than a
 * pile of independent fades.
 *
 * Two cases start revealed rather than waiting on an observer that will never
 * report: reduced-motion users, and any environment without
 * IntersectionObserver. Both are resolved in the initial state instead of by
 * setting state from inside the effect, which would cost a second render pass
 * to reach a value already knowable at mount.
 *
 * @param {object}  [options]
 * @param {number}  [options.threshold]  Fraction visible before revealing.
 * @param {string}  [options.rootMargin] Fires early so the motion is already
 *                                       settling by the time it is read.
 * @param {unknown} [options.trigger] Reattaches observation when the target is
 *                                    mounted after the first render.
 * @returns {[React.RefObject<HTMLElement>, boolean]}
 */
const useReveal = ({ threshold = 0.12, rootMargin = '0px 0px -8% 0px', trigger } = {}) => {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(() => prefersReducedMotion() || !supportsObserver());

  useEffect(() => {
    if (isRevealed) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsRevealed(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isRevealed, threshold, rootMargin, trigger]);

  return [ref, isRevealed];
};

export default useReveal;
