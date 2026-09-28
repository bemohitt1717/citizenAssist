import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DetailPanel, {
  ServiceMissing,
} from '../features/serviceDetail/components/DetailPanel/DetailPanel';
import { getAllServices } from '../features/services/servicesApi';
import { SERVICES } from '../constants/services';
import { DOCUMENTS } from '../constants/documents';
import { SectionLoading } from '../components/ui/LoadingStates/LoadingStates';

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

const documentIdsByName = Object.fromEntries(
  Object.values(DOCUMENTS).map((document) => [document.name.toLocaleLowerCase(), document.id]),
);

const resolveServiceDocuments = (requiredDocuments, fallbackDocuments = []) => {
  if (!Array.isArray(requiredDocuments) || requiredDocuments.length === 0) {
    return fallbackDocuments;
  }

  const documentIds = requiredDocuments.map((document) => {
    if (typeof document !== 'string') return null;
    if (Object.hasOwn(DOCUMENTS, document)) return document;

    return documentIdsByName[document.trim().toLocaleLowerCase()] || null;
  });

  if (documentIds.every(Boolean)) {
    return [...new Set(documentIds)];
  }

  return fallbackDocuments.length ? fallbackDocuments : documentIds.filter(Boolean);
};

/**
 * Service detail page with real-time data.
 * Fetches service from database to show latest info updated by admin.
 * Falls back to constants for fields not in database (usedFor, issuedBy, validity).
 */
const mergeService = (serviceId, foundService) => {
  const constantService = SERVICES.find((service) => service.id === serviceId);
  const documents = resolveServiceDocuments(
    foundService.requiredDocuments,
    constantService?.documents || [],
  );

  return {
    id: foundService.serviceId,
    name: foundService.name,
    icon: SERVICE_ICONS[foundService.serviceId] || 'document',
    description: foundService.description,
    charge: foundService.charge,
    timeline: foundService.timeline,
    summary: foundService.summary,
    documents,
    documentCount: documents.length,
    usedFor: constantService?.usedFor || [],
    issuedBy: constantService?.issuedBy || 'Government Office',
    validity: constantService?.validity || 'As per government rules',
    tone: constantService?.tone || 'paper',
  };
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const [loadedService, setLoadedService] = useState(null);
  const fallbackService = fromStaticService(serviceId);
  const currentResult = loadedService?.serviceId === serviceId ? loadedService : null;
  const service = currentResult ? currentResult.service : fallbackService;
  const isLoading = !currentResult && !fallbackService;

  useEffect(() => {
    const controller = new AbortController();
    const fallbackService = fromStaticService(serviceId);
    getAllServices({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const services = response.data || [];
        const foundService = services.find((item) => item.serviceId === serviceId);
        setLoadedService({
          serviceId,
          service: foundService ? mergeService(serviceId, foundService) : services.length ? null : fallbackService,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadedService({ serviceId, service: fallbackService });
      });

    return () => controller.abort();
  }, [serviceId]);

  if (isLoading) {
    return <SectionLoading variant="service-detail" />;
  }

  return service ? <DetailPanel service={service} /> : <ServiceMissing />;
};

export default ServiceDetail;
