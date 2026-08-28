import { useEffect, useRef, useState } from 'react';

/**
 * Measures whatever is currently rendered inside `contentRef` and returns its
 * height, so a container can transition between steps of different sizes
 * instead of snapping.
 *
 * A ResizeObserver rather than a one-off measurement, because a step's height
 * changes after mount too — a validation message appearing, a file name landing
 * in an upload slot, or the font finishing loading.
 *
 * @param {unknown} key Changes when the step changes, forcing a re-measure.
 * @returns {[React.RefObject<HTMLElement>, number|null]}
 */
const useAutoHeight = (key) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return undefined;

    const measure = () => setHeight(node.offsetHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [key]);

  return [contentRef, height];
};

export default useAutoHeight;
