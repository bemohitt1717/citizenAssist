import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Icon from '../../ui/Icon/Icon';
import './Navbar.css';

/* Two links, because the citizen-facing product is two pages deep. A third
   was here ("Charges") and was removed: every charge already sits on its
   service card, and a page collecting them would restate the grid. Agent and
   admin routes live in the footer, not in a citizen's navigation. */
const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

export const TOP_SENTINEL_ID = 'ca-top-sentinel';

/**
 * In-page anchors have to become route links once we are off the landing page,
 * otherwise `#services` resolves against the current path and jumps nowhere.
 * On the home route the plain anchor is kept, so the browser handles the scroll
 * natively and no router work happens for a same-document jump.
 */
const SectionLink = ({ isHome, href, className, children, onClick }) => {
  if (isHome) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link className={className} to={`/${href}`} onClick={onClick}>
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isCondensed, setIsCondensed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = useLocation().pathname === '/';

  /* Observed rather than listened for: a scroll handler reflows on every
     frame, an IntersectionObserver fires twice for the whole page. */
  useEffect(() => {
    const sentinel = document.getElementById(TOP_SENTINEL_ID);
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCondensed(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`ca-nav ${isCondensed ? 'is-condensed' : ''}`.trim()}>
      <div className="ca-nav__bar">
        <Link className="ca-nav__brand" to="/" aria-label="Citizen Assist, home">
          <Logo />
        </Link>

        <nav className="ca-nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <SectionLink
              key={link.href}
              isHome={isHome}
              href={link.href}
              className="ca-nav__link"
            >
              <span className="ca-nav__link-text">{link.label}</span>
            </SectionLink>
          ))}
        </nav>

        <div className="ca-nav__actions">
          {/* Status is the thing a citizen returns for, so it sits in the bar
              rather than behind a login wall. */}
          <Link className="ca-pill ca-pill--outline ca-nav__track" to="/track">
            <Icon name="track" size={19} />
            <span className="ca-nav__track-text">Track request</span>
          </Link>

          <Link className="ca-pill ca-pill--solid ca-nav__login" to="/login">
            Log in
          </Link>

          <button
            type="button"
            className="ca-nav__toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="ca-nav-panel"
          >
            <span className={`ca-nav__burger ${isMenuOpen ? 'is-open' : ''}`.trim()}>
              <span />
              <span />
            </span>
            <span className="ca-sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="ca-nav-panel"
        className={`ca-nav__panel ${isMenuOpen ? 'is-open' : ''}`.trim()}
        hidden={!isMenuOpen}
      >
        <nav className="ca-nav__panel-links" aria-label="Primary, mobile">
          {NAV_LINKS.map((link, index) => (
            <span
              key={link.href}
              className="ca-nav__panel-item"
              style={{ '--ca-stagger': `${0.06 + index * 0.055}s` }}
            >
              <SectionLink
                isHome={isHome}
                href={link.href}
                className="ca-nav__panel-link"
                onClick={closeMenu}
              >
                {link.label}
                <Icon name="arrowUpRight" size={19} />
              </SectionLink>
            </span>
          ))}

          <span
            className="ca-nav__panel-item"
            style={{ '--ca-stagger': `${0.06 + NAV_LINKS.length * 0.055}s` }}
          >
            <Link className="ca-nav__panel-link" to="/track" onClick={closeMenu}>
              Track request
              <Icon name="track" size={19} />
            </Link>
          </span>
        </nav>

        <div className="ca-nav__panel-foot">
          <Link
            className="ca-pill ca-pill--solid ca-nav__panel-cta"
            to="/login"
            onClick={closeMenu}
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
