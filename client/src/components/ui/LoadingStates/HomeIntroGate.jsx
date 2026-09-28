import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BrandedOpening, HomeRefreshOpening } from './LoadingStates';
import { HomeReadyContext } from './homeReadyContext';

const HOME_INTRO_KEY = 'citizen-assist-home-intro-seen';

const shouldSkipMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const getOpeningMode = (pathname) => {
  if (pathname !== '/' || shouldSkipMotion()) return null;

  try {
    if (window.sessionStorage.getItem(HOME_INTRO_KEY) !== 'seen') return 'intro';
  } catch {
    return 'intro';
  }

  const navigation = window.performance?.getEntriesByType?.('navigation')?.[0];
  return navigation?.type === 'reload' ? 'refresh' : null;
};

const HomeIntroGate = ({ children }) => {
  const { pathname } = useLocation();
  const [openingMode, setOpeningMode] = useState(() => getOpeningMode(pathname));
  const [homeReady, setHomeReady] = useState(false);
  const [isRefreshLeaving, setIsRefreshLeaving] = useState(false);
  const hasLeftHome = useRef(false);
  const refreshStartedAt = useRef(0);
  const markHomeReady = useCallback(() => setHomeReady(true), []);
  const finishIntro = useCallback(() => setOpeningMode(null), []);
  const visibleOpeningMode = pathname === '/' && !hasLeftHome.current ? openingMode : null;

  useLayoutEffect(() => {
    if (pathname !== '/') {
      hasLeftHome.current = true;
      document.documentElement.classList.remove('ca-home-intro-active', 'ca-home-refresh-active');
      return undefined;
    }

    if (visibleOpeningMode === 'intro') {
      document.documentElement.classList.add('ca-home-intro-active');
      try {
        window.sessionStorage.setItem(HOME_INTRO_KEY, 'seen');
      } catch {
        // The opener still works if storage is unavailable.
      }

      return () => document.documentElement.classList.remove('ca-home-intro-active');
    }

    if (visibleOpeningMode === 'refresh') {
      document.documentElement.classList.add('ca-home-refresh-active');
      refreshStartedAt.current = window.performance.now();
      return () => document.documentElement.classList.remove('ca-home-refresh-active');
    }

    return undefined;
  }, [openingMode, pathname, visibleOpeningMode]);

  useEffect(() => {
    if (openingMode !== 'refresh') return undefined;

    const fallbackTimer = window.setTimeout(() => setHomeReady(true), 15000);
    return () => window.clearTimeout(fallbackTimer);
  }, [openingMode]);

  useEffect(() => {
    if (openingMode !== 'refresh' || !homeReady) return undefined;

    const elapsed = window.performance.now() - refreshStartedAt.current;
    const waitForMinimum = Math.max(0, 500 - elapsed);
    let exitTimer;
    const minimumTimer = window.setTimeout(() => {
      setIsRefreshLeaving(true);
      exitTimer = window.setTimeout(() => setOpeningMode(null), 160);
    }, waitForMinimum);

    return () => {
      window.clearTimeout(minimumTimer);
      if (exitTimer) window.clearTimeout(exitTimer);
    };
  }, [homeReady, openingMode]);

  return (
    <HomeReadyContext.Provider value={markHomeReady}>
      {children}
      {visibleOpeningMode === 'intro' && <BrandedOpening onComplete={finishIntro} />}
      {visibleOpeningMode === 'refresh' && <HomeRefreshOpening isLeaving={isRefreshLeaving} />}
    </HomeReadyContext.Provider>
  );
};

export default HomeIntroGate;
