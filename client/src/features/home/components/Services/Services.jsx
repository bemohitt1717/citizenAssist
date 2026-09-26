import { useEffect, useState } from 'react';
import ServiceCard from '../ServiceCard/ServiceCard';
import useReveal from '../../../../hooks/useReveal';
import usePointerGlow from '../../../../hooks/usePointerGlow';
import { getAllServices } from '../../../services/servicesApi';
import { SERVICES } from '../../../../constants/services';
import { ServiceCardsLoading } from '../../../../components/ui/LoadingStates/LoadingStates';
import './Services.css';

// Icon mapping for each service (matches database serviceId)
const SERVICE_ICONS = {
  'income-certificate': 'income',
  'caste-certificate': 'caste',
  'domicile-certificate': 'domicile',
  'birth-certificate': 'birth',
  'pan-services': 'pan',
  'aadhaar-services': 'aadhaar',
};

// Tone pattern for visual variety (matches position in grid)
const SERVICE_TONES = ['primary', 'paper', 'warm', 'paper', 'cool', 'paper'];
const STATIC_SERVICES = SERVICES.map((service) => ({
  ...service,
  description: service.summary,
  documents: service.documents,
}));

/**
 * Services with real-time data from database.
 *
 * Six cards showing services managed by admin. When admin updates service info
 * (charge, timeline, summary), changes reflect here immediately.
 */
const Services = () => {
  const [services, setServices] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gridRef, isRevealed] = useReveal({ trigger: services.length });
  const glowRef = usePointerGlow();

  const fetchServices = async (signal) => {
    try {
      const response = await getAllServices({ signal });
      if (signal?.aborted) return;
      // Backend returns { status: "success", count: X, data: [...] }
      const servicesData = response.data || [];
      // Convert backend data to match frontend format
      const formattedServices = servicesData.map((service, index) => ({
        id: service.serviceId,
        name: service.name,
        description: service.description,
        charge: service.charge,
        timeline: service.timeline,
        summary: service.summary,
        documents: service.requiredDocuments,
        documentCount: service.requiredDocuments?.length || 0,
        icon: SERVICE_ICONS[service.serviceId] || 'document',
        tone: SERVICE_TONES[index] || 'paper',
      }));
      if (formattedServices.length) {
        setServices(formattedServices);
        setUsingFallback(false);
      } else {
        setServices(STATIC_SERVICES);
        setUsingFallback(true);
      }
    } catch {
      if (signal?.aborted) return;
      setServices(STATIC_SERVICES);
      setUsingFallback(true);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <section className="ca-services" id="services">
      <div className="ca-services__inner" ref={glowRef}>
        <header className="ca-services__head">
          <h2 className="ca-services__title">
            Six services, with every requirement written down first
          </h2>

          <p className="ca-services__lede">
            Choose a service to see the documents, fee and usual time before you apply.
          </p>
        </header>

        {usingFallback && (
          <p className="ca-services__notice" role="status">
            We could not load the latest details. The fees and times shown are estimates.
          </p>
        )}

        {isLoading ? (
          <ServiceCardsLoading />
        ) : (
          <div ref={gridRef} className={`ca-grid ${isRevealed ? 'is-revealed' : ''}`.trim()}>
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
