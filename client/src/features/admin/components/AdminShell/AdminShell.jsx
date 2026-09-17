import { Link, NavLink } from 'react-router-dom';
import Logo from '../../../../components/common/Logo/Logo';
import UserMenu from '../../../../components/common/UserMenu/UserMenu';
import Icon from '../../../../components/ui/Icon/Icon';
import { ADMIN_SECTIONS } from '../../adminData';
import { useAuth } from '../../../../context/authContext';
import './AdminShell.css';

/**
 * The administrator dashboard frame with real user data.
 *
 * Separate from the agent shell on purpose: the two dashboards are different
 * features with different rails, and one file that branched on role would mean
 * every agent change risked the admin layout.
 */
const AdminShell = ({ activeId, children }) => {
  const { user } = useAuth();
  const section = ADMIN_SECTIONS.find((item) => item.id === activeId) ?? ADMIN_SECTIONS[0];

  /* The landing section greets by name; every other section is titled after
     itself. Repeating a greeting on Requests or Agents would just push the
     content down for nothing. */
  const isHome = section.id === 'dashboard';
  const adminName = user?.name || 'Platform Admin';
  const title = isHome ? `Welcome back, ${adminName}` : section.label;

  return (
    <div className="ca-admindash">
      <nav className="ca-admindash__rail" aria-label="Administrator sections">
        <div className="ca-admindash__rail-top">
          <Link className="ca-admindash__brand" to="/" aria-label="Citizen Assist, home">
            <Logo size={26} />
          </Link>

          {/* No role badge here. Which dashboard you are in is already stated by
              the identity chip's menu and by the URL, so a third copy was just
              taking up the strip. */}

          {/* Mobile placement. Hidden from 62rem, where the copy in the page bar
              takes over. */}
          <div className="ca-admindash__rail-menu">
            <UserMenu
              name={adminName}
              roleLabel="Administrator"
              profileTo="/admin"
            />
          </div>
        </div>

        <ul className="ca-admindash__nav">
          {ADMIN_SECTIONS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/admin/${item.id}`}
                className={({ isActive }) =>
                  `ca-admindash__link ${isActive ? 'is-active' : ''}`.trim()
                }
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ca-admindash__main">
        <div className="ca-admindash__bar">
          <div className="ca-admindash__heading">
            <h1 className="ca-admindash__title">{title}</h1>
            <p className="ca-admindash__blurb">{section.blurb}</p>
          </div>

          {/* Desktop placement. Hidden below 62rem, where the copy in the sticky
              rail takes over. */}
          <div className="ca-admindash__bar-menu">
            <UserMenu
              name={adminName}
              roleLabel="Administrator"
              profileTo="/admin"
            />
          </div>
        </div>

        <div className="ca-admindash__panel">{children}</div>
      </div>
    </div>
  );
};

export default AdminShell;
