import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router does not restore hash targets on navigation, so arriving at
 * `/#services` from the detail page would land at the top of the document with
 * the anchor silently ignored. This performs the scroll the browser would have
 * done for a same-document jump, and clears it on a plain route change so a new
 * page always opens at its start.
 *
 * Honours `prefers-reduced-motion`: smooth scrolling is a motion effect.
 */
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    /* Deferred a frame so the destination route has committed and the target
       actually exists in the document. */
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(hash);
      target?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;
