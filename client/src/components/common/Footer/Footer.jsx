import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Icon from '../../ui/Icon/Icon';
import { SERVICES } from '../../../constants/services';
import { useAuth } from '../../../context/authContext';
import './Footer.css';

/* PLACEHOLDERS — replace before any real deployment. No live helpline or
   inbox exists yet, and shipping these as though they do would leave a
   citizen calling a number that nobody answers. */
const SUPPORT = {
  phone: '1800 123 4567',
  email: 'support@citizenassist.in',
  hours: 'Mon to Sat, 9am – 7pm',
};

/* `to` marks a real route; `href` is still an in-page anchor awaiting one. */
const PLATFORM_LINKS = [
  { label: 'About Citizen Assist', href: '#about' },
  { label: 'Track a request', to: '/track' },
  { label: 'Log in', to: '/login' },
  { label: 'Become an agent', to: '/become-an-agent', hideForAgent: true },
];

/* No social row. There are no accounts to link to yet, and a row of icons
   pointing at "#" is decoration pretending to be a footer. */
const Footer = () => {
  const { user } = useAuth();
  
  return (
  <footer className="ca-footer">
    <div className="ca-footer__inner">
      <div className="ca-footer__brand">
        <Logo className="ca-footer__logo" />

        <p className="ca-footer__blurb">
          Assistance with government certificates and documentation, through agents an
          administrator has verified. Charges stated before the work begins.
        </p>
      </div>

      <nav className="ca-footer__col ca-footer__col--services" aria-label="Services">
        <h2 className="ca-label ca-footer__col-title">Services</h2>
        <ul className="ca-footer__list">
          {SERVICES.map((service) => (
            <li key={service.id}>
              <Link className="ca-footer__link" to={`/services/${service.id}`}>
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="ca-footer__col ca-footer__col--platform" aria-label="Platform">
        <h2 className="ca-label ca-footer__col-title">Platform</h2>
        <ul className="ca-footer__list">
          {PLATFORM_LINKS.map((link) => {
            // Hide "Become an agent" if user is already an agent
            if (link.hideForAgent && user?.role === 'agent') {
              return null;
            }
            
            return (
              <li key={link.to ?? link.href}>
                {link.to ? (
                  <Link className="ca-footer__link" to={link.to}>
                    {link.label}
                  </Link>
                ) : (
                  <a className="ca-footer__link" href={link.href}>
                    {link.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="ca-footer__col ca-footer__col--support">
        <h2 className="ca-label ca-footer__col-title">Support</h2>
        <ul className="ca-footer__list">
          <li>
            <a
              className="ca-footer__link ca-footer__link--icon"
              href={`tel:+91${SUPPORT.phone.replace(/\s/g, '')}`}
            >
              <Icon name="phone" size={16} />
              <span data-numeric>{SUPPORT.phone}</span>
            </a>
          </li>
          <li>
            <a className="ca-footer__link" href={`mailto:${SUPPORT.email}`}>
              {SUPPORT.email}
            </a>
          </li>
          <li className="ca-footer__hours">{SUPPORT.hours}</li>
        </ul>
      </div>
    </div>

    <div className="ca-footer__base">
      {/* Cut from four sentences to one. This is the only place on the site that
          states we are not a government body and do not issue certificates —
          with a name like Citizen Assist and pages about Aadhaar and caste
          certificates, a visitor can reasonably assume the opposite. */}
      <p className="ca-footer__legal">
        Not a government body. Certificates are issued by the competent authority; we assist with
        the process.
      </p>

      <p className="ca-footer__copy">
        <span data-numeric>&copy; 2026</span> Citizen Assist
      </p>
    </div>
  </footer>
);
};

export default Footer;
