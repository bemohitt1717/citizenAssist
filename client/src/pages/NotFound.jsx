import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo/Logo';
import Icon from '../components/ui/Icon/Icon';
import './NotFound.css';

/* Every real destination, so a wrong URL is one click from being right. */
const WAYS_OUT = [
  { label: 'All six services', to: '/', hash: '#services', icon: 'document' },
  { label: 'How it works', to: '/', hash: '#how-it-works', icon: 'track' },
  { label: 'Track a request', to: '/track', icon: 'clock' },
  { label: 'Become an agent', to: '/become-an-agent', icon: 'shieldCheck' },
  { label: 'Sign in', to: '/login', icon: 'phone' },
];

/**
 * The not-found page.
 *
 * Names the path that failed, because half of these are a typo the visitor can
 * see and correct themselves. Then lists the real destinations — a page that only
 * offers "go home" makes someone start their journey again from scratch.
 */
const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <div className="ca-oops">
      <div className="ca-oops__bar">
        <Link to="/" aria-label="Citizen Assist, home">
          <Logo size={28} />
        </Link>
      </div>

      <div className="ca-oops__body">
        <p className="ca-label ca-oops__code">
          <Icon name="close" size={13} />
          Error 404
        </p>

        <h1 className="ca-oops__title">This page does not exist</h1>

        <p className="ca-oops__text">
          Nothing lives at <strong>{pathname}</strong>. The link may be out of date, or the address
          may have a typo in it. Nothing has gone wrong with your account or any request you have
          placed.
        </p>

        <div className="ca-oops__actions">
          <Link className="ca-pill ca-pill--solid ca-oops__action" to="/">
            Back to home
            <span className="ca-pill__disc">
              <Icon name="arrowRight" size={15} />
            </span>
          </Link>
        </div>

        <ul className="ca-oops__links">
          {WAYS_OUT.map((way) => (
            <li key={way.label}>
              <Link className="ca-oops__link" to={`${way.to}${way.hash ?? ''}`}>
                <Icon name={way.icon} size={15} />
                {way.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotFound;
