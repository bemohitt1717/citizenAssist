import RequestFlow from './components/RequestFlow/RequestFlow';
import { useRequestFlow } from './requestFlowContext';
import { getServiceById } from '../../constants/services';

/**
 * Renders the request dialog when a service has been opened. Kept separate from
 * the provider so the provider stays state-only and can be consumed without
 * pulling the dialog's markup into every tree that needs it.
 */
const RequestFlowHost = () => {
  const { activeServiceId, closeRequest } = useRequestFlow();
  if (!activeServiceId) return null;

  const service = getServiceById(activeServiceId);
  if (!service) return null;

  /* Keyed on the service so switching services starts a clean flow rather than
     carrying the previous one's form state across. */
  return <RequestFlow key={service.id} service={service} onClose={closeRequest} />;
};

export default RequestFlowHost;
