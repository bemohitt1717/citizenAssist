import { useParams } from 'react-router-dom';
import DetailPanel, {
  ServiceMissing,
} from '../features/serviceDetail/components/DetailPanel/DetailPanel';
import { getServiceById } from '../constants/services';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = getServiceById(serviceId);

  return service ? <DetailPanel service={service} /> : <ServiceMissing />;
};

export default ServiceDetail;
