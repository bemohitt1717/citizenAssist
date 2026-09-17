import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import capsuleImage from '../../../../assets/images/customer-care.jpg';
import { useAuth } from '../../../../context/authContext';
import './Hero.css';

/**
 * The hero.
 *
 * The portal strip that used to sit at the floor of this section is gone. It named
 * DigiLocker, UIDAI, NSDL and the rest, which meant carrying third-party
 * government marks and a non-affiliation line to cover them. Dropping the row
 * removed both the clutter and the implied-endorsement risk at once.
 */
const Hero = () => {
  const { user } = useAuth();
  
  return (
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

        {/* Only show "Become an agent" button if user is NOT an agent */}
        {user?.role !== 'agent' && (
          <Link className="ca-pill ca-pill--outline ca-hero__action" to="/become-an-agent">
            Become an agent
            <span className="ca-pill__disc">
              <Icon name="arrowUpRight" size={16} />
            </span>
          </Link>
        )}
      </div>
    </div>
  </section>
);
};

export default Hero;
