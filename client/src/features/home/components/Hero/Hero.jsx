import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { PORTALS } from '../../../../constants/portals';
import capsuleImage from '../../../../assets/images/customer-care.jpg';
import './Hero.css';

/**
 * Renders a portal's artwork, falling back to its name as text if the file is
 * not present. The name is always the accessible label either way, so the
 * strip means the same thing to a screen reader as it does on screen.
 */
const PortalMark = ({ portal }) => {
  const [hasLogo, setHasLogo] = useState(Boolean(portal.logo));

  if (!hasLogo) {
    return <span className="ca-hero__portal-name">{portal.name}</span>;
  }

  return (
    <img
      className="ca-hero__portal-mark"
      src={portal.logo}
      alt={portal.name}
      loading="lazy"
      decoding="async"
      onError={() => setHasLogo(false)}
    />
  );
};

const Hero = () => (
  <section className="ca-hero" id="top">
    <div className="ca-hero__inner">
      <h1 className="ca-hero__headline">
        <span className="ca-hero__line ca-hero__line--1">Government paperwork,</span>

        <span className="ca-hero__line ca-hero__line--2">
          <span className="ca-hero__word">handled</span>

          <span className="ca-hero__capsule" aria-hidden="true">
            <img
              className="ca-hero__capsule-img"
              src={capsuleImage}
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          </span>

          <span className="ca-hero__word">with you</span>
        </span>
      </h1>

      <p className="ca-hero__lede">
        Six certificate and ID services, each with its documents, charges and timeline written down
        before you begin. A verified agent does the running about — the certificate itself is still
        issued by the government office that issues it.
      </p>

      <div className="ca-hero__actions">
        <a className="ca-pill ca-pill--solid ca-hero__action" href="#services">
          Browse services
          <span className="ca-pill__disc">
            <Icon name="arrowRight" size={16} />
          </span>
        </a>

        <Link className="ca-pill ca-pill--outline ca-hero__action" to="/become-an-agent">
          Become an agent
          <span className="ca-pill__disc">
            <Icon name="arrowUpRight" size={16} />
          </span>
        </Link>
      </div>
    </div>

    <div className="ca-hero__strip">
      <p className="ca-label ca-hero__strip-label">Portals we help you navigate</p>

      <ul className="ca-hero__portals">
        {PORTALS.map((portal) => (
          <li key={portal.id} className="ca-hero__portal">
            <PortalMark portal={portal} />
          </li>
        ))}
      </ul>

      <a className="ca-hero__scroll" href="#services">
        <span className="ca-label">Scroll</span>
        <span className="ca-hero__scroll-dot">
          <Icon name="arrowDown" size={17} />
        </span>
      </a>

      {/* Required, not decorative: these are third-party marks shown for
          recognition. Removing this line turns the row into an implied
          endorsement. The full non-affiliation statement lives in the footer;
          this one only has to cover the marks it sits beside. */}
      <p className="ca-hero__disclaimer">
        Names and marks belong to their respective authorities. Citizen Assist is not affiliated
        with any of them.
      </p>
    </div>
  </section>
);

export default Hero;
