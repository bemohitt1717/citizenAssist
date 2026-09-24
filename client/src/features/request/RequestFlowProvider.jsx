import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RequestFlowContext } from './requestFlowContext';
import { useAuth } from '../../context/authContext';

/**
 * Holds which service, if any, currently has its request flow open.
 *
 * Lifted to the application root because the flow is opened from two different
 * places — the cards on the landing grid and the service detail page — and
 * neither should own the other's state.
 * 
 * Now includes authentication check: redirects to login if user not logged in.
 */
const RequestFlowProvider = ({ children }) => {
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [pendingServiceId, setPendingServiceId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!pendingServiceId || !user) return;
    if (user.role !== 'citizen') {
      setShowLoginPrompt(true);
      return;
    }
    setActiveServiceId(pendingServiceId);
    setPendingServiceId(null);
  }, [user, pendingServiceId]);

  const openRequest = useCallback((serviceId) => {
    // Check if user is logged in
    if (!user || user.role !== 'citizen') {
      setPendingServiceId(serviceId);
      setShowLoginPrompt(true);
      return;
    }

    console.log('✅ [REQUEST] User logged in, opening request flow for:', serviceId);
    setActiveServiceId(serviceId);
  }, [user]);

  const closeRequest = useCallback(() => setActiveServiceId(null), []);

  const handleLoginRedirect = useCallback(() => {
    setShowLoginPrompt(false);
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    navigate('/login', { state: { returnTo, resumeServiceId: pendingServiceId, roleId: 'citizen' } });
  }, [location, navigate, pendingServiceId]);

  const closeLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
    setPendingServiceId(null);
  }, []);

  const value = useMemo(
    () => ({ 
      activeServiceId, 
      openRequest, 
      closeRequest,
      showLoginPrompt,
      handleLoginRedirect,
      closeLoginPrompt,
    }),
    [activeServiceId, openRequest, closeRequest, showLoginPrompt, handleLoginRedirect, closeLoginPrompt],
  );

  return <RequestFlowContext.Provider value={value}>{children}</RequestFlowContext.Provider>;
};

export default RequestFlowProvider;
