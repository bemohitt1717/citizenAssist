import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Icon from '../../ui/Icon/Icon';
import { useAuth } from '../../../context/authContext';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isHome = useLocation().pathname === '/';
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!event.target.closest('.ca-nav__profile-wrapper')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  // Get display name for profile button (name or default "User")
  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (user?.role === 'citizen') return '/citizen';
    if (user?.role === 'agent') return '/agent';
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

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
          {/* Show profile button if logged in, else show login button */}
          {user ? (
            <div className="ca-nav__profile-wrapper">
              <button
                type="button"
                className="ca-pill ca-pill--solid ca-nav__profile-btn"
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-expanded={isProfileOpen}
              >
                <Icon name="shieldCheck" size={16} />
                {displayName}
              </button>

              {isProfileOpen && (
                <div className="ca-nav__profile-dropdown">
                  <div className="ca-nav__profile-header">
                    <span className="ca-nav__profile-name">
                      {user.name || 'User'}
                    </span>
                    <span className="ca-nav__profile-phone">{user.phone}</span>
                    <span className="ca-nav__profile-role">{user.role}</span>
                  </div>

                  <div className="ca-nav__profile-links">
                    <Link
                      to={getDashboardRoute()}
                      className="ca-nav__profile-link"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Icon name="track" size={16} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      className="ca-nav__profile-link"
                      onClick={handleLogout}
                    >
                      <Icon name="arrowRight" size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link className="ca-pill ca-pill--solid ca-nav__login" to="/login">
              Log in
            </Link>
          )}

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
        </nav>

        <div className="ca-nav__panel-foot">
          {user ? (
            <div className="ca-nav__panel-user">
              <div className="ca-nav__panel-user-info">
                <span className="ca-nav__panel-user-name">
                  {user.name || 'User'}
                </span>
                <span className="ca-nav__panel-user-phone">{user.phone}</span>
              </div>

              <Link
                className="ca-pill ca-pill--outline"
                to={getDashboardRoute()}
                onClick={closeMenu}
              >
                Dashboard
              </Link>

              <button
                type="button"
                className="ca-pill ca-pill--solid"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              className="ca-pill ca-pill--solid ca-nav__panel-cta"
              to="/login"
              onClick={closeMenu}
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
