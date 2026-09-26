import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BrandedOpening, HomeRefreshOpening } from './LoadingStates';

const HOME_INTRO_KEY = 'citizen-assist-home-intro-seen';
const HomeReadyContext = createContext(() => {});

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

export const useMarkHomeReady = () => useContext(HomeReadyContext);

const HomeIntroGate = ({ children }) => {
  const { pathname } = useLocation();
  const [openingMode, setOpeningMode] = useState(() => getOpeningMode(pathname));
  const [homeReady, setHomeReady] = useState(false);
  const [isRefreshLeaving, setIsRefreshLeaving] = useState(false);
  const refreshStartedAt = useRef(window.performance?.now?.() ?? Date.now());
  const markHomeReady = useCallback(() => setHomeReady(true), []);
  const finishIntro = useCallback(() => setOpeningMode(null), []);

  useLayoutEffect(() => {
    if (pathname !== '/') {
      if (openingMode) setOpeningMode(null);
      return undefined;
    }

    if (openingMode === 'intro') {
      document.documentElement.classList.add('ca-home-intro-active');
      try {
        window.sessionStorage.setItem(HOME_INTRO_KEY, 'seen');
      } catch {
        // The opener still works if storage is unavailable.
      }

      return () => document.documentElement.classList.remove('ca-home-intro-active');
    }

    if (openingMode === 'refresh') {
      document.documentElement.classList.add('ca-home-refresh-active');
      return () => document.documentElement.classList.remove('ca-home-refresh-active');
    }

    return undefined;
  }, [openingMode, pathname]);

  useEffect(() => {
    if (openingMode !== 'refresh') return undefined;

    const fallbackTimer = window.setTimeout(() => setHomeReady(true), 15000);
    return () => window.clearTimeout(fallbackTimer);
  }, [openingMode]);

  useEffect(() => {
    if (openingMode !== 'refresh' || !homeReady) return undefined;

    const elapsed = (window.performance?.now?.() ?? Date.now()) - refreshStartedAt.current;
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
      {openingMode === 'intro' && <BrandedOpening onComplete={finishIntro} />}
      {openingMode === 'refresh' && <HomeRefreshOpening isLeaving={isRefreshLeaving} />}
    </HomeReadyContext.Provider>
  );
};

export default HomeIntroGate;
