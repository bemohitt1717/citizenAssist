import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DetailPanel, {
  ServiceMissing,
} from '../features/serviceDetail/components/DetailPanel/DetailPanel';
import { getAllServices } from '../features/services/servicesApi';
import { SERVICES } from '../constants/services';

// Icon mapping for each service
const SERVICE_ICONS = {
  'income-certificate': 'income',
  'caste-certificate': 'caste',
  'domicile-certificate': 'domicile',
  'birth-certificate': 'birth',
  'pan-services': 'pan',
  'aadhaar-services': 'aadhaar',
};

const fromStaticService = (serviceId) => {
  const service = SERVICES.find((item) => item.id === serviceId);
  return service ? { ...service, documentCount: service.documents.length } : null;
};

/**
 * Service detail page with real-time data.
 * Fetches service from database to show latest info updated by admin.
 * Falls back to constants for fields not in database (usedFor, issuedBy, validity).
 */
const ServiceDetail = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    setIsLoading(true);
    setService(null);
    try {
      const response = await getAllServices();
      const foundService = response.data?.find((s) => s.serviceId === serviceId);
      
      if (foundService) {
        // Get constant data for fields not in database
        const constantService = SERVICES.find((s) => s.id === serviceId);
        
        // Merge database + constant data
        setService({
          id: foundService.serviceId,
          name: foundService.name,
          icon: SERVICE_ICONS[foundService.serviceId] || 'document',
          description: foundService.description,
          charge: foundService.charge,
          timeline: foundService.timeline,
          summary: foundService.summary,
          documents: foundService.requiredDocuments || [],
          documentCount: foundService.requiredDocuments?.length || 0,
          // Fields from constants (not in database)
          usedFor: constantService?.usedFor || [],
          issuedBy: constantService?.issuedBy || 'Government Office',
          validity: constantService?.validity || 'As per government rules',
          tone: constantService?.tone || 'paper',
        });
      } else {
        setService(response.data?.length ? null : fromStaticService(serviceId));
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      setService(fromStaticService(serviceId));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--color-ink-muted)' 
      }}>
        Loading service...
      </div>
    );
  }

  return service ? <DetailPanel service={service} /> : <ServiceMissing />;
};

export default ServiceDetail;
