import { useCallback, useMemo, useState } from 'react';
import { RequestFlowContext } from './requestFlowContext';

/**
 * Holds which service, if any, currently has its request flow open.
 *
 * Lifted to the application root because the flow is opened from two different
 * places — the cards on the landing grid and the service detail page — and
 * neither should own the other's state.
 */
const RequestFlowProvider = ({ children }) => {
  const [activeServiceId, setActiveServiceId] = useState(null);

  const openRequest = useCallback((serviceId) => setActiveServiceId(serviceId), []);
  const closeRequest = useCallback(() => setActiveServiceId(null), []);

  const value = useMemo(
    () => ({ activeServiceId, openRequest, closeRequest }),
    [activeServiceId, openRequest, closeRequest],
  );

  return <RequestFlowContext.Provider value={value}>{children}</RequestFlowContext.Provider>;
};

export default RequestFlowProvider;
