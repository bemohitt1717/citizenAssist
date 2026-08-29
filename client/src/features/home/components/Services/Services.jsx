import { SERVICES } from '../../../../constants/services';
import ServiceCard from '../ServiceCard/ServiceCard';
import useReveal from '../../../../hooks/useReveal';
import usePointerGlow from '../../../../hooks/usePointerGlow';
import './Services.css';

/**
 * Services.
 *
 * Six cards and nothing else. The "what we do, and what we do not" band that used
 * to close this grid is gone; the boundary it stated now lives where it is
 * actually needed — the hero lede says the certificate is issued by the government
 * office, and the request dialog spells out that the charge is our fee only, on
 * the step before a citizen commits to anything.
 */
const Services = () => {
  const [gridRef, isRevealed] = useReveal();
  /* Attached one level above the grid so it does not collide with the grid's
     own reveal ref. */
  const glowRef = usePointerGlow();

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

        <div ref={gridRef} className={`ca-grid ${isRevealed ? 'is-revealed' : ''}`.trim()}>
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
