import { useEffect, useState } from 'react';
import ServiceCard from '../ServiceCard/ServiceCard';
import useReveal from '../../../../hooks/useReveal';
import usePointerGlow from '../../../../hooks/usePointerGlow';
import { getAllServices } from '../../../services/servicesApi';
import { SERVICES } from '../../../../constants/services';
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

/**
 * Services with real-time data from database.
 *
 * Six cards showing services managed by admin. When admin updates service info
 * (charge, timeline, summary), changes reflect here immediately.
 */
const Services = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [gridRef, isRevealed] = useReveal({ trigger: services.length });
  const glowRef = usePointerGlow();

  const fetchServices = async () => {
    try {
      console.log('🏠 [HOME-SERVICES] Fetching services from API...');
      const response = await getAllServices();
      
      console.log('📦 [HOME-SERVICES] API Response:', response);
      
      // Backend returns { status: "success", count: X, data: [...] }
      const servicesData = response.data || [];
      
      console.log(`✅ [HOME-SERVICES] Found ${servicesData.length} services`);
      
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
      
      console.log('🎨 [HOME-SERVICES] Formatted services:', formattedServices);
      if (formattedServices.length) {
        setServices(formattedServices);
      } else {
        setServices(SERVICES.map((service) => ({
          ...service,
          description: service.summary,
          documents: service.documents,
        })));
        setUsingFallback(true);
      }
    } catch (error) {
      console.error('Failed to load live services:', error.response?.data || error.message);
      setServices(SERVICES.map((service) => ({
        ...service,
        description: service.summary,
        documents: service.documents,
      })));
      setUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (isLoading) {
    return (
      <section className="ca-services" id="services">
        <div className="ca-services__inner">
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
            Loading services...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="ca-services" id="services">
      <div className="ca-services__inner" ref={glowRef}>
        <header className="ca-services__head">
          <h2 className="ca-services__title">
            Six services, with every requirement written down first
          </h2>

          <p className="ca-services__lede">
            Pick the one you need. Each card tells you what the document is actually for, what our
            assistance costs, how long it usually takes, and how many papers you will have to
            gather — before you commit to anything.
          </p>
        </header>

        {usingFallback && (
          <p className="ca-services__notice" role="status">
            Live service information is temporarily unavailable. These standard prices and
            timelines are indicative.
          </p>
        )}

        <div ref={gridRef} className={`ca-grid ${isRevealed ? 'is-revealed' : ''}`.trim()}>
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
