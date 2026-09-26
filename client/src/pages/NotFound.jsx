import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo/Logo';
import Icon from '../components/ui/Icon/Icon';
import NotFoundAnimation from './NotFoundAnimation';
import './NotFound.css';

/* The links that help most people recover from a mistyped page. */
const WAYS_OUT = [
  { label: 'Track a request', to: '/track', icon: 'clock' },
  { label: 'Sign in', to: '/login', icon: 'phone' },
  { label: 'Apply as an agent', to: '/become-an-agent', icon: 'shieldCheck' },
];

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="ca-oops">
      <div className="ca-oops__bar">
        <Link to="/" aria-label="Citizen Assist, home">
          <Logo size={28} />
        </Link>
      </div>

      <main className="ca-oops__body ca-oops__body--not-found" key={location.pathname}>
        <section className="ca-oops__copy" aria-labelledby="not-found-title">
          <p className="ca-label ca-oops__code">
            <Icon name="close" size={13} />
            404 · Page not found
          </p>

          <h1 className="ca-oops__title" id="not-found-title">We can’t find that page</h1>

          <p className="ca-oops__text">
            The link may be old, or the address may have a mistake. Choose a page below to continue.
          </p>

          <div className="ca-oops__actions">
            <Link className="ca-pill ca-pill--solid ca-oops__action" to="/#services">
              View services
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </Link>
          </div>

          <nav className="ca-oops__nav" aria-label="More pages">
            <ul className="ca-oops__links">
              {WAYS_OUT.map((way) => (
                <li key={way.label}>
                  <Link className="ca-oops__link" to={way.to}>
                    <Icon name={way.icon} size={15} />
                    {way.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <div className="ca-oops__art" role="img" aria-label="A friendly cat illustration">
          <NotFoundAnimation />
        </div>
      </main>
    </div>
  );
};

export default NotFound;
