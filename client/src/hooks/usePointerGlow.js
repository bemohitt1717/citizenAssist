import { useCallback, useEffect, useRef } from 'react';

/**
 * Tracks the pointer across a container and writes its position, in percent,
 * onto whichever `[data-glow]` descendant is under it. A stylesheet can then
 * place a highlight at `var(--ca-mx) var(--ca-my)`.
 *
 * One delegated listener for the whole group rather than one per card, and
 * writes are batched into a single animation frame, so moving across a grid of
 * cards costs one style write per frame instead of one per event.
 *
 * Skipped entirely for coarse pointers and for reduced-motion users, where a
 * cursor-following highlight is either impossible or unwelcome.
 */
const usePointerGlow = () => {
  const containerRef = useRef(null);
  const frameRef = useRef(0);
  const pendingRef = useRef(null);

  const flush = useCallback(() => {
    frameRef.current = 0;
    const pending = pendingRef.current;
    if (!pending) return;

    pending.target.style.setProperty('--ca-mx', `${pending.x}%`);
    pending.target.style.setProperty('--ca-my', `${pending.y}%`);
    pendingRef.current = null;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === 'undefined') return undefined;

    const isCoarse = window.matchMedia?.('(pointer: coarse)').matches;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || reduced) return undefined;

    const onPointerMove = (event) => {
      const target = event.target.closest?.('[data-glow]');
      if (!target || !node.contains(target)) return;

      const rect = target.getBoundingClientRect();
      pendingRef.current = {
        target,
        x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
      };

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(flush);
      }
    };

    node.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      node.removeEventListener('pointermove', onPointerMove);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      pendingRef.current = null;
    };
  }, [flush]);

  return containerRef;
};

export default usePointerGlow;
