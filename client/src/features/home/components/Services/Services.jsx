import { SERVICES } from '../../../../constants/services';
import ServiceCard from '../ServiceCard/ServiceCard';
import Icon from '../../../../components/ui/Icon/Icon';
import useReveal from '../../../../hooks/useReveal';
import usePointerGlow from '../../../../hooks/usePointerGlow';
import './Services.css';

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

        <div
          ref={gridRef}
          className={`ca-grid ${isRevealed ? 'is-revealed' : ''}`.trim()}
        >
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}

          {/* Sits inside the grid rather than under it, because the boundary is
              part of the offer, not a footnote to it. */}
          <aside className="ca-note" style={{ '--ca-i': SERVICES.length }}>
            <div className="ca-note__head">
              <span className="ca-note__icon">
                <Icon name="shieldCheck" size={22} />
              </span>

              <h3 className="ca-note__title">What we do, and what we do not</h3>
            </div>

            <div className="ca-note__body">
              <p className="ca-note__text">
                We prepare your file, check it against the requirement list the office is currently
                using, and follow it through to a decision. The certificate itself is issued and
                signed by the government authority — never by us.
              </p>

              <p className="ca-note__text">
                The amounts above are our assistance charge, shown as a range and separate from any
                official government fee. Your agent confirms the exact figure with you before any
                work begins.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Services;
