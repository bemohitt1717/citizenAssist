import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RequestFlowContext } from './requestFlowContext';
import { useAuth } from '../../context/authContext';

/** Shares request state between service cards, detail pages, and login. */
const RequestFlowProvider = ({ children }) => {
  const [activeServiceIdState, setActiveServiceId] = useState(null);
  const [pendingServiceId, setPendingServiceId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeServiceId = activeServiceIdState ?? (user?.role === 'citizen' ? pendingServiceId : null);
  const showLoginPrompt = Boolean(pendingServiceId && user?.role !== 'citizen');

  const openRequest = useCallback((serviceId) => {
    if (!user || user.role !== 'citizen') {
      setPendingServiceId(serviceId);
      return;
    }

    setPendingServiceId(null);
    setActiveServiceId(serviceId);
  }, [user]);

  const closeRequest = useCallback(() => {
    setActiveServiceId(null);
    setPendingServiceId(null);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    navigate('/login', { state: { returnTo, resumeServiceId: pendingServiceId, roleId: 'citizen' } });
  }, [location, navigate, pendingServiceId]);

  const closeLoginPrompt = useCallback(() => setPendingServiceId(null), []);

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
